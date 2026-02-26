/**
 * Shared Image Configuration
 * 
 * Single source of truth for image compression settings.
 * Used by both mobile (expo-image-manipulator) and web (browser-image-compression).
 * 
 * Target Sizes:
 * - Thumbnail: ~20KB (for grid cards, carousels)
 * - Full: ~50KB (for detail pages)
 * 
 * Strategy:
 * 1. Client compresses to CLIENT_MAX_* before upload (fast upload)
 * 2. Server processes to THUMB_* and FULL_* for CDN (consistent output)
 * 
 * This eliminates:
 * - Uploading 10-20MB iPhone photos
 * - Server processing massive files
 * - Inconsistent quality between platforms
 */

// ============================================================================
// Client-Side Compression (Before Upload)
// ============================================================================

/**
 * Client compression settings - applied before upload to reduce transfer size.
 * Target: 1-2MB upload instead of 10-20MB raw.
 */
export const CLIENT_CONFIG = {
  /** Max width for client-side resize (server will resize further) */
  maxWidth: 2000,
  /** Max height for client-side resize */
  maxHeight: 2000,
  /** JPEG quality for client compression (0.0-1.0) */
  quality: 0.7,
  /** Target file size in MB (soft limit for browser-image-compression) */
  maxSizeMB: 2,
  /** Use web worker for non-blocking compression (web only) */
  useWebWorker: true,
} as const;

// ============================================================================
// Server-Side Processing (Final Output)
// ============================================================================

/**
 * Thumbnail settings - for grid cards, carousels, previews.
 * Target: ~20KB per image.
 */
export const THUMB_CONFIG = {
  /** Max width (maintains aspect ratio) */
  maxWidth: 480,
  /** Max height (maintains aspect ratio) */
  maxHeight: 480,
  /** WebP quality (0-100) - very aggressive for tiny size */
  quality: 35,
  /** Compression effort (0-6, higher = slower but smaller) */
  effort: 6,
  /** Sharpening sigma (compensate for aggressive compression) */
  sharpenSigma: 1.0,
  /** Saturation boost (compensate for quality loss) */
  saturationBoost: 1.05,
} as const;

/**
 * Full-size settings - for detail pages, zoom views.
 * Target: ~50KB per image.
 */
export const FULL_CONFIG = {
  /** Max width (maintains aspect ratio) */
  maxWidth: 1200,
  /** Max height (maintains aspect ratio) */
  maxHeight: 1200,
  /** WebP quality (0-100) - aggressive for small size */
  quality: 42,
  /** Compression effort (0-6, higher = slower but smaller) */
  effort: 6,
  /** Sharpening sigma */
  sharpenSigma: 0.8,
  /** Saturation boost */
  saturationBoost: 1.04,
} as const;

// ============================================================================
// Validation Limits
// ============================================================================

/**
 * Maximum allowed upload size (after client compression).
 * Rejects files larger than this to prevent abuse.
 */
export const MAX_UPLOAD_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

/**
 * Maximum megapixels to prevent memory issues.
 */
export const MAX_MEGAPIXELS = 40;

/**
 * Allowed MIME types for upload.
 */
export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
] as const;

/**
 * File extension to MIME type mapping.
 */
export const MIME_TYPE_MAP: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  heic: 'image/heic',
  heif: 'image/heif',
};

// ============================================================================
// Type Exports
// ============================================================================

export type ImageMimeType = (typeof ALLOWED_IMAGE_TYPES)[number];

export interface CompressionConfig {
  maxWidth: number;
  maxHeight: number;
  quality: number;
}

export interface ServerProcessingConfig extends CompressionConfig {
  effort: number;
  sharpenSigma: number;
  saturationBoost: number;
}
