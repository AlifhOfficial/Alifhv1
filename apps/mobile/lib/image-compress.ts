/**
 * Client-Side Image Compression — Mobile
 *
 * Uses expo-image-manipulator for Expo Go compatibility.
 * Implements ITERATIVE compression to hit target file sizes
 * while maintaining maximum quality.
 *
 * Output Targets:
 * - Thumb: 480px max, 25KB max
 * - Full: 1400px max, 80KB max (balanced quality)
 * - Avatar: 512px square, 25KB max
 * - Showroom: Various sizes per asset type
 *
 * @module lib/image-compress
 */

import * as ImageManipulator from 'expo-image-manipulator';
import { Platform } from 'react-native';

// ============================================================================
// Types
// ============================================================================

export type ImageUploadType = 'listing' | 'avatar' | 'showroom';

export type ShowroomAssetType =
  | 'hero-image'
  | 'founder-image'
  | 'gallery'
  | 'team-member';

export interface CompressionConfig {
  maxWidth: number;
  maxHeight: number;
  maxSizeKB: number;    // Target max file size in KB
  initialQuality: number; // Starting quality (0-1)
  minQuality: number;     // Don't go below this quality
}

export interface CompressedImage {
  uri: string;
  width: number;
  height: number;
  size: number; // bytes
  mimeType: string;
}

export interface ListingImagePair {
  thumb: CompressedImage;
  full: CompressedImage;
}

// ============================================================================
// Compression Configs — Realistic targets for quality/size balance
// ============================================================================

/** Listing thumbs: 480px, max 50KB - crisp previews */
const LISTING_THUMB_CONFIG: CompressionConfig = {
  maxWidth: 480,
  maxHeight: 480,
  maxSizeKB: 50,
  initialQuality: 0.9,
  minQuality: 0.7,
};

/** Listing full: 1400px, max 150KB - sharp detail */
const LISTING_FULL_CONFIG: CompressionConfig = {
  maxWidth: 1400,
  maxHeight: 1400,
  maxSizeKB: 150,
  initialQuality: 0.88,
  minQuality: 0.65,
};

/** Avatar: 512px square, max 50KB */
const AVATAR_CONFIG: CompressionConfig = {
  maxWidth: 512,
  maxHeight: 512,
  maxSizeKB: 50,
  initialQuality: 0.88,
  minQuality: 0.6,
};

/** Showroom configs by asset type */
const SHOWROOM_CONFIGS: Record<ShowroomAssetType, CompressionConfig> = {
  'hero-image': { maxWidth: 1920, maxHeight: 1080, maxSizeKB: 250, initialQuality: 0.8, minQuality: 0.55 },
  'founder-image': { maxWidth: 800, maxHeight: 1000, maxSizeKB: 120, initialQuality: 0.8, minQuality: 0.5 },
  'gallery': { maxWidth: 1600, maxHeight: 1200, maxSizeKB: 180, initialQuality: 0.8, minQuality: 0.5 },
  'team-member': { maxWidth: 600, maxHeight: 600, maxSizeKB: 80, initialQuality: 0.8, minQuality: 0.5 },
};

// ============================================================================
// Core Compression Function
// ============================================================================

/**
 * Resize an image to fit within max dimensions while preserving aspect ratio.
 * Returns the resized URI or original if already small enough.
 */
async function resizeImage(
  uri: string,
  maxWidth: number,
  maxHeight: number,
): Promise<{ uri: string; width: number; height: number }> {
  // Get original dimensions
  const original = await ImageManipulator.manipulateAsync(uri, []);
  const { width: origW, height: origH } = original;
  
  // Skip if already within bounds
  if (origW <= maxWidth && origH <= maxHeight) {
    return { uri: original.uri, width: origW, height: origH };
  }
  
  // Calculate target dimensions preserving aspect ratio
  const aspectRatio = origW / origH;
  let targetWidth: number;
  let targetHeight: number;
  
  if (aspectRatio > maxWidth / maxHeight) {
    // Constrain by width
    targetWidth = maxWidth;
    targetHeight = Math.round(maxWidth / aspectRatio);
  } else {
    // Constrain by height
    targetHeight = maxHeight;
    targetWidth = Math.round(maxHeight * aspectRatio);
  }
  
  // Resize
  const resized = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: targetWidth } }],
    { format: ImageManipulator.SaveFormat.JPEG }
  );
  
  return { uri: resized.uri, width: resized.width, height: resized.height };
}

/**
 * Compress an image ITERATIVELY to hit target file size.
 * Starts at initial quality and reduces until target met.
 * If still too large at minQuality, reduces dimensions too.
 *
 * @param uri - Local file URI (file:///...)
 * @param config - Compression settings with size targets
 * @returns Compressed image with metadata
 */
async function compressImage(
  uri: string,
  config: CompressionConfig,
): Promise<CompressedImage> {
  // First resize to max dimensions (preserving aspect ratio)
  const resized = await resizeImage(uri, config.maxWidth, config.maxHeight);
  
  const maxBytes = config.maxSizeKB * 1024;
  let quality = config.initialQuality;
  let currentUri = resized.uri;
  let currentDims = { width: resized.width, height: resized.height };
  let result: ImageManipulator.ImageResult;
  let blob: Blob;
  let attempts = 0;
  const maxAttempts = 8;
  
  // Iteratively compress until we hit target size or min quality
  while (attempts < maxAttempts) {
    attempts++;
    
    result = await ImageManipulator.manipulateAsync(
      currentUri,
      [], // Already resized
      {
        compress: quality,
        format: ImageManipulator.SaveFormat.JPEG,
      }
    );
    
    // Get file size
    const response = await fetch(result.uri);
    blob = await response.blob();
    
    // Check if within target
    if (blob.size <= maxBytes) {
      break;
    }
    
    // If at min quality but still too large, reduce dimensions
    if (quality <= config.minQuality && blob.size > maxBytes) {
      const scale = 0.85; // Reduce by 15%
      const newWidth = Math.round(currentDims.width * scale);
      const newHeight = Math.round(currentDims.height * scale);
      
      // Don't go below reasonable minimum
      if (newWidth < 200 || newHeight < 200) {
        break; // Accept what we have
      }
      
      const smaller = await ImageManipulator.manipulateAsync(
        resized.uri,
        [{ resize: { width: newWidth } }],
        { format: ImageManipulator.SaveFormat.JPEG }
      );
      currentUri = smaller.uri;
      currentDims = { width: smaller.width, height: smaller.height };
      quality = config.initialQuality; // Reset quality for new dimensions
      continue;
    }
    
    // Reduce quality for next iteration (larger steps for faster convergence)
    quality = Math.max(config.minQuality, quality - 0.08);
  }
  
  return {
    uri: result!.uri,
    width: result!.width,
    height: result!.height,
    size: blob!.size,
    mimeType: 'image/jpeg',
  };
}

// ============================================================================
// Public API — Listing Images
// ============================================================================

/**
 * Compress a listing image into thumb + full pair.
 * Both compressions run in parallel for speed.
 *
 * @param uri - Original image URI from picker
 * @returns Both compressed versions
 *
 * @example
 * const { thumb, full } = await compressListingImage(pickerAsset.uri);
 * // thumb.size ~= 20-25KB
 * // full.size ~= 45-55KB
 */
export async function compressListingImage(uri: string): Promise<ListingImagePair> {
  const [thumb, full] = await Promise.all([
    compressImage(uri, LISTING_THUMB_CONFIG),
    compressImage(uri, LISTING_FULL_CONFIG),
  ]);

  return { thumb, full };
}

/**
 * Compress multiple listing images in parallel.
 * Uses Promise.all for maximum speed.
 *
 * @param uris - Array of image URIs
 * @param onProgress - Progress callback (completed, total)
 * @returns Array of thumb+full pairs
 */
export async function compressListingImages(
  uris: string[],
  onProgress?: (completed: number, total: number) => void,
): Promise<ListingImagePair[]> {
  let completed = 0;
  const total = uris.length;

  const results = await Promise.all(
    uris.map(async (uri) => {
      const result = await compressListingImage(uri);
      completed++;
      onProgress?.(completed, total);
      return result;
    }),
  );

  return results;
}

// ============================================================================
// Public API — Avatar
// ============================================================================

/**
 * Compress an avatar image to 512px square.
 *
 * @param uri - Original image URI
 * @returns Compressed avatar (~15-20KB)
 */
export async function compressAvatar(uri: string): Promise<CompressedImage> {
  return compressImage(uri, AVATAR_CONFIG);
}

// ============================================================================
// Public API — Showroom Assets
// ============================================================================

/**
 * Compress a showroom image based on asset type.
 *
 * @param uri - Original image URI
 * @param assetType - Type of showroom asset
 * @returns Compressed image with appropriate dimensions
 */
export async function compressShowroomImage(
  uri: string,
  assetType: ShowroomAssetType,
): Promise<CompressedImage> {
  const config = SHOWROOM_CONFIGS[assetType];
  if (!config) {
    throw new Error(`Unknown showroom asset type: ${assetType}`);
  }
  return compressImage(uri, config);
}

/**
 * Compress multiple showroom images in parallel.
 */
export async function compressShowroomImages(
  uris: string[],
  assetType: ShowroomAssetType,
  onProgress?: (completed: number, total: number) => void,
): Promise<CompressedImage[]> {
  let completed = 0;
  const total = uris.length;

  const results = await Promise.all(
    uris.map(async (uri) => {
      const result = await compressShowroomImage(uri, assetType);
      completed++;
      onProgress?.(completed, total);
      return result;
    }),
  );

  return results;
}

// ============================================================================
// Utilities
// ============================================================================

/**
 * Get compression config for a given type.
 * Useful for displaying expected file sizes to users.
 */
export function getCompressionConfig(
  type: ImageUploadType,
  assetType?: ShowroomAssetType,
): { thumb?: CompressionConfig; full?: CompressionConfig; single?: CompressionConfig } {
  if (type === 'listing') {
    return { thumb: LISTING_THUMB_CONFIG, full: LISTING_FULL_CONFIG };
  }
  if (type === 'avatar') {
    return { single: AVATAR_CONFIG };
  }
  if (type === 'showroom' && assetType) {
    return { single: SHOWROOM_CONFIGS[assetType] };
  }
  return {};
}

/**
 * Estimate compressed file size based on dimensions and quality.
 * Rough estimate for UI purposes.
 */
export function estimateCompressedSize(width: number, height: number, quality: number): number {
  // JPEG typically compresses to ~0.5-1.5 bytes per pixel at q75-80
  const pixels = width * height;
  const bytesPerPixel = 0.08 * quality; // Rough estimate
  return Math.round(pixels * bytesPerPixel);
}
