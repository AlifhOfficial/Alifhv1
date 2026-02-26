/**
 * Client-Side Image Compression — Web
 *
 * Uses browser-image-compression for fast client-side compression.
 * Canvas-based, runs in web worker for non-blocking compression.
 *
 * Output Targets (matched with mobile):
 * - Thumb: 480px max, 25KB max
 * - Full: 1400px max, 80KB max (balanced quality)
 * - Avatar: 512px square, 25KB max
 * - Showroom: Various sizes per asset type
 *
 * @module lib/storage/image-compress
 */

import imageCompression from 'browser-image-compression';

// ============================================================================
// Types
// ============================================================================

export type ImageUploadType = 'listing' | 'avatar' | 'showroom' | 'partner';

export type PartnerImageType = 'logo' | 'hero';

export type ShowroomAssetType =
  | 'hero-image'
  | 'founder-image'
  | 'gallery'
  | 'team-member';

export interface CompressionConfig {
  maxWidth: number;
  maxHeight: number;
  maxSizeKB: number;
  quality?: number; // 0-1, for JPEG quality hint
}

export interface CompressedImage {
  file: File;
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
// Compression Configs — Matched with mobile, realistic targets
// ============================================================================

/** Listing thumbs: 600px, max 70KB - crisp on retina */
const LISTING_THUMB_CONFIG: CompressionConfig = {
  maxWidth: 600,
  maxHeight: 600,
  maxSizeKB: 70,
  quality: 0.92,
};

/** Listing full: 1400px, max 120KB - sharp detail */
const LISTING_FULL_CONFIG: CompressionConfig = {
  maxWidth: 1400,
  maxHeight: 1400,
  maxSizeKB: 120,
  quality: 0.78,
};

/** Avatar: 512px square, max 50KB */
const AVATAR_CONFIG: CompressionConfig = {
  maxWidth: 512,
  maxHeight: 512,
  maxSizeKB: 50,
  quality: 0.88,
};

/** Partner image configs */
const PARTNER_CONFIGS: Record<PartnerImageType, CompressionConfig> = {
  'logo': { maxWidth: 512, maxHeight: 512, maxSizeKB: 40, quality: 0.75 },
  'hero': { maxWidth: 1920, maxHeight: 600, maxSizeKB: 120, quality: 0.7 },
};

/** Showroom configs by asset type */
const SHOWROOM_CONFIGS: Record<ShowroomAssetType, CompressionConfig> = {
  'hero-image': { maxWidth: 1920, maxHeight: 1080, maxSizeKB: 250, quality: 0.8 },
  'founder-image': { maxWidth: 800, maxHeight: 1000, maxSizeKB: 120, quality: 0.8 },
  'gallery': { maxWidth: 1600, maxHeight: 1200, maxSizeKB: 180, quality: 0.8 },
  'team-member': { maxWidth: 600, maxHeight: 600, maxSizeKB: 80, quality: 0.8 },
};

// ============================================================================
// Core Compression Function
// ============================================================================

/**
 * Compress a single image using browser-image-compression.
 * Iteratively compresses to hit maxSizeKB target.
 *
 * @param file - File object from input[type=file]
 * @param config - Compression settings
 * @returns Compressed image with metadata
 */
async function compressImage(
  file: File,
  config: CompressionConfig,
): Promise<CompressedImage> {
  const options = {
    maxSizeMB: config.maxSizeKB / 1024,
    maxWidthOrHeight: Math.max(config.maxWidth, config.maxHeight),
    useWebWorker: true,
    fileType: 'image/jpeg' as const, // JPEG for max compatibility
    initialQuality: config.quality ?? 0.75,
    alwaysKeepResolution: false,
  };

  const compressedFile = await imageCompression(file, options);

  // Get dimensions from compressed image
  const dimensions = await getImageDimensions(compressedFile);

  return {
    file: compressedFile,
    width: dimensions.width,
    height: dimensions.height,
    size: compressedFile.size,
    mimeType: compressedFile.type,
  };
}

/**
 * Get image dimensions from a File/Blob.
 */
async function getImageDimensions(file: File | Blob): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.width, height: img.height });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };
    img.src = url;
  });
}

// ============================================================================
// Public API — Listing Images
// ============================================================================

/**
 * Compress a listing image into thumb + full pair.
 * Both compressions run in parallel for speed.
 *
 * @param file - Original image File from input
 * @returns Both compressed versions
 *
 * @example
 * const { thumb, full } = await compressListingImage(inputFile);
 * // thumb.size ~= 20-25KB
 * // full.size ~= 45-55KB
 */
export async function compressListingImage(file: File): Promise<ListingImagePair> {
  const [thumb, full] = await Promise.all([
    compressImage(file, LISTING_THUMB_CONFIG),
    compressImage(file, LISTING_FULL_CONFIG),
  ]);

  return { thumb, full };
}

/**
 * Compress multiple listing images in parallel.
 * Uses Promise.all for maximum speed.
 *
 * @param files - Array of File objects
 * @param onProgress - Progress callback (completed, total)
 * @returns Array of thumb+full pairs
 */
export async function compressListingImages(
  files: File[],
  onProgress?: (completed: number, total: number) => void,
): Promise<ListingImagePair[]> {
  let completed = 0;
  const total = files.length;

  const results = await Promise.all(
    files.map(async (file) => {
      const result = await compressListingImage(file);
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
 * @param file - Original image File
 * @returns Compressed avatar (~15-20KB)
 */
export async function compressAvatar(file: File): Promise<CompressedImage> {
  return compressImage(file, AVATAR_CONFIG);
}

// ============================================================================
// Public API — Partner Images
// ============================================================================

/**
 * Compress a partner image (logo or hero banner).
 *
 * @param file - Original image File
 * @param imageType - 'logo' or 'hero'
 * @returns Compressed image
 */
export async function compressPartnerImage(
  file: File,
  imageType: PartnerImageType,
): Promise<CompressedImage> {
  const config = PARTNER_CONFIGS[imageType];
  if (!config) {
    throw new Error(`Unknown partner image type: ${imageType}`);
  }
  return compressImage(file, config);
}

// ============================================================================
// Public API — Showroom Assets
// ============================================================================

/**
 * Compress a showroom image based on asset type.
 *
 * @param file - Original image File
 * @param assetType - Type of showroom asset
 * @returns Compressed image with appropriate dimensions
 */
export async function compressShowroomImage(
  file: File,
  assetType: ShowroomAssetType,
): Promise<CompressedImage> {
  const config = SHOWROOM_CONFIGS[assetType];
  if (!config) {
    throw new Error(`Unknown showroom asset type: ${assetType}`);
  }
  return compressImage(file, config);
}

/**
 * Compress multiple showroom images in parallel.
 */
export async function compressShowroomImages(
  files: File[],
  assetType: ShowroomAssetType,
  onProgress?: (completed: number, total: number) => void,
): Promise<CompressedImage[]> {
  let completed = 0;
  const total = files.length;

  const results = await Promise.all(
    files.map(async (file) => {
      const result = await compressShowroomImage(file, assetType);
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
 * Validate that a file is an image and within size limits.
 */
export function validateImageFile(file: File, maxMB: number = 30): { valid: boolean; error?: string } {
  // Check type
  if (!file.type.startsWith('image/')) {
    return { valid: false, error: 'File must be an image' };
  }

  // Check size
  const maxBytes = maxMB * 1024 * 1024;
  if (file.size > maxBytes) {
    return { valid: false, error: `File must be less than ${maxMB}MB` };
  }

  return { valid: true };
}
