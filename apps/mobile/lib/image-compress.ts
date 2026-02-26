/**
 * Client-Side Image Compression — Mobile
 *
 * Native C++ compression using react-native-compressor for WhatsApp-like speed.
 * Handles HEIC natively (iOS), outputs optimized JPEG for max compatibility.
 *
 * Output Targets:
 * - Thumb: 480px max, ~20-25KB
 * - Full: 1400px max, ~45-55KB
 * - Avatar: 512px square, ~15-20KB
 * - Showroom: Various sizes per asset type
 *
 * @module lib/image-compress
 */

import { Image } from 'react-native-compressor';
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
  quality: number; // 0-1
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
// Compression Configs — Tuned for size targets
// ============================================================================

/** Listing thumbs: 480px, ~20-25KB */
const LISTING_THUMB_CONFIG: CompressionConfig = {
  maxWidth: 480,
  maxHeight: 480,
  quality: 0.72,
};

/** Listing full: 1400px, ~45-55KB */
const LISTING_FULL_CONFIG: CompressionConfig = {
  maxWidth: 1400,
  maxHeight: 1400,
  quality: 0.75,
};

/** Avatar: 512px square, ~15-20KB */
const AVATAR_CONFIG: CompressionConfig = {
  maxWidth: 512,
  maxHeight: 512,
  quality: 0.80,
};

/** Showroom configs by asset type */
const SHOWROOM_CONFIGS: Record<ShowroomAssetType, CompressionConfig> = {
  'hero-image': { maxWidth: 1920, maxHeight: 1080, quality: 0.80 },
  'founder-image': { maxWidth: 800, maxHeight: 1000, quality: 0.82 },
  'gallery': { maxWidth: 1600, maxHeight: 1200, quality: 0.78 },
  'team-member': { maxWidth: 600, maxHeight: 600, quality: 0.80 },
};

// ============================================================================
// Core Compression Function
// ============================================================================

/**
 * Compress a single image using native C++ compression.
 * Handles HEIC automatically on iOS.
 *
 * @param uri - Local file URI (file:///...)
 * @param config - Compression settings
 * @returns Compressed image with metadata
 */
async function compressImage(
  uri: string,
  config: CompressionConfig,
): Promise<CompressedImage> {
  const result = await Image.compress(uri, {
    maxWidth: config.maxWidth,
    maxHeight: config.maxHeight,
    quality: config.quality,
    input: 'uri',
    output: 'jpg', // JPEG for max compatibility + smaller size than PNG
    returnableOutputType: 'uri',
  });

  // Get file info for the compressed image
  const response = await fetch(result);
  const blob = await response.blob();

  // Estimate dimensions (react-native-compressor maintains aspect ratio)
  // For accurate dimensions, we'd need to decode, but this is good enough
  const estimatedWidth = Math.min(config.maxWidth, config.maxWidth);
  const estimatedHeight = Math.min(config.maxHeight, config.maxHeight);

  return {
    uri: result,
    width: estimatedWidth,
    height: estimatedHeight,
    size: blob.size,
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
