/**
 * Shared Image Processing Utilities
 * 
 * Provides HEIC detection/conversion and optimized Sharp processing
 * Used by all storage upload routes for consistent image handling
 * 
 * Features:
 * - Magic-byte format detection (more reliable than MIME)
 * - HEIC → JPEG conversion before Sharp processing
 * - Auto-rotate based on EXIF orientation
 * - Metadata stripped by default (EXIF, GPS, etc. removed for privacy/size)
 * - Advanced unsharp mask sharpening for crisp output
 * - Lanczos3 kernel for best downscale quality
 * - Subtle color boost to compensate for compression
 * - Dual output: thumb (480w) + full (2000w)
 * - Safety guardrails: max file size, max megapixels
 * 
 * Note: GIF animations are NOT preserved - converted to single-frame WebP.
 * This is intentional for car listings where animation is not needed.
 */

import sharp from "sharp";
import convert from "heic-convert";

// ============================================================================
// Safety Guardrails - Prevent crashes from oversized uploads
// ============================================================================

/** Maximum file size in bytes (20MB) */
export const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024;

/** Maximum megapixels allowed (40MP) - prevents memory issues */
export const MAX_MEGAPIXELS = 40;

/** Maximum input pixels for Sharp (enforced at decode level) */
const SHARP_LIMIT_INPUT_PIXELS = MAX_MEGAPIXELS * 1_000_000;

export class ImageValidationError extends Error {
  constructor(message: string, public code: 'FILE_TOO_LARGE' | 'TOO_MANY_PIXELS' | 'INVALID_FORMAT' | 'PROCESSING_ERROR') {
    super(message);
    this.name = 'ImageValidationError';
  }
}

/**
 * Validate image buffer before processing
 * Throws ImageValidationError if validation fails
 */
export async function validateImage(buffer: Buffer): Promise<{ width: number; height: number; format: string }> {
  // Check file size
  if (buffer.length > MAX_FILE_SIZE_BYTES) {
    throw new ImageValidationError(
      `File size ${(buffer.length / 1024 / 1024).toFixed(1)}MB exceeds maximum ${MAX_FILE_SIZE_BYTES / 1024 / 1024}MB`,
      'FILE_TOO_LARGE'
    );
  }

  // Detect format
  const format = detectImageFormat(buffer);
  if (!isValidImageFormat(format)) {
    throw new ImageValidationError(
      `Invalid image format: ${format}. Supported: JPEG, PNG, WebP, HEIC, GIF`,
      'INVALID_FORMAT'
    );
  }

  // For HEIC, we can't easily get dimensions without converting first
  // So we'll check megapixels after conversion in processImage
  if (format === 'heic') {
    return { width: 0, height: 0, format };
  }

  // Get image metadata to check dimensions
  // limitInputPixels enforces megapixel limit at Sharp decode level
  try {
    const metadata = await sharp(buffer, { limitInputPixels: SHARP_LIMIT_INPUT_PIXELS }).metadata();
    const width = metadata.width || 0;
    const height = metadata.height || 0;

    return { width, height, format };
  } catch (error) {
    if (error instanceof ImageValidationError) throw error;
    // Sharp throws when limitInputPixels is exceeded
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    if (errorMsg.includes('Input image exceeds pixel limit')) {
      throw new ImageValidationError(
        `Image exceeds maximum ${MAX_MEGAPIXELS}MP`,
        'TOO_MANY_PIXELS'
      );
    }
    throw new ImageValidationError(
      `Failed to read image metadata: ${errorMsg}`,
      'PROCESSING_ERROR'
    );
  }
}

// ============================================================================
// Format Detection - Magic bytes (more reliable than MIME type)
// ============================================================================

/** HEIC/HEIF brand identifiers */
const HEIC_BRANDS = ['heic', 'heix', 'mif1', 'msf1', 'hevc', 'hevx'];

/**
 * Check if buffer contains HEIC ftyp box at given offset
 */
function checkHeicAtOffset(buffer: Buffer, offset: number): boolean {
  if (buffer.length < offset + 8) return false;
  const ftyp = buffer.slice(offset, offset + 4).toString('ascii');
  if (ftyp !== 'ftyp') return false;
  const brand = buffer.slice(offset + 4, offset + 8).toString('ascii').toLowerCase();
  return HEIC_BRANDS.includes(brand);
}

/**
 * Detect image format from magic bytes (first few bytes of file)
 * More reliable than MIME type since mobile apps often mislabel HEIC as JPEG
 * 
 * HEIC detection:
 * - First checks exact position (offset 4) for standard HEIC files
 * - Falls back to scanning first 64 bytes for edge cases
 * - Avoids scanning entire file to prevent false positives
 */
export function detectImageFormat(buffer: Buffer): 'heic' | 'jpeg' | 'png' | 'webp' | 'gif' | 'unknown' {
  // Check minimum buffer size
  if (buffer.length < 12) return 'unknown';
  
  // HEIC/HEIF: Standard position is [4 bytes size][ftyp][brand]
  // Check exact offset 4 first (most common), then scan small window
  if (checkHeicAtOffset(buffer, 4)) {
    return 'heic';
  }
  
  // Some HEIF files have ftyp at different offsets (rare but real)
  // Scan first 64 bytes as fallback
  const scanLimit = Math.min(64, buffer.length - 8);
  for (let i = 0; i < scanLimit; i++) {
    if (buffer[i] === 0x66 && buffer[i + 1] === 0x74 && 
        buffer[i + 2] === 0x79 && buffer[i + 3] === 0x70) { // 'ftyp'
      const brand = buffer.slice(i + 4, i + 8).toString('ascii').toLowerCase();
      if (HEIC_BRANDS.includes(brand)) {
        return 'heic';
      }
    }
  }
  
  // JPEG: FFD8FF
  if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
    return 'jpeg';
  }
  
  // PNG: 89504E47
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
    return 'png';
  }
  
  // WebP: RIFF....WEBP
  if (buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 &&
      buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50) {
    return 'webp';
  }
  
  // GIF: GIF87a or GIF89a
  // WARNING: Animated GIFs are converted to single-frame WebP (intentional for car listings)
  if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46) {
    return 'gif';
  }
  
  return 'unknown';
}

// ============================================================================
// HEIC Conversion
// ============================================================================

/**
 * Convert HEIC buffer to JPEG buffer using heic-convert
 * This is a pure JS implementation that works everywhere (no native deps)
 */
export async function convertHeicToJpeg(inputBuffer: Buffer): Promise<Buffer> {
  const outputBuffer = await convert({
    buffer: inputBuffer as unknown as ArrayBuffer,
    format: 'JPEG',
    quality: 0.95, // High quality since we'll compress with WebP later
  });
  return Buffer.from(outputBuffer);
}

/**
 * Check if buffer is HEIC format and convert if needed
 * Returns the original buffer if not HEIC
 */
export async function ensureNonHeic(buffer: Buffer): Promise<Buffer> {
  const format = detectImageFormat(buffer);
  if (format === 'heic') {
    return convertHeicToJpeg(buffer);
  }
  return buffer;
}

// ============================================================================
// Image Processing Options & Defaults
// ============================================================================

export interface ProcessImageOptions {
  /** Max width in pixels */
  maxWidth: number;
  /** Max height in pixels */
  maxHeight: number;
  /** Resize fit mode */
  fit?: 'inside' | 'cover' | 'contain' | 'fill';
  /** Center position for cover/contain */
  position?: 'center' | 'top' | 'bottom' | 'left' | 'right';
  /** WebP quality (1-100) */
  quality?: number;
  /** Compression effort (0-6, lower = faster) */
  effort?: number;
  /** Whether to auto-convert HEIC */
  convertHeic?: boolean;
  /** Sharpening sigma (0 = none, 0.5-1.0 = subtle, 1.0-2.0 = strong) */
  sharpenSigma?: number;
  /** Saturation boost (1.0 = none, 1.02 = subtle, 1.05 = noticeable) */
  saturationBoost?: number;
  // Note: Metadata (EXIF, GPS, etc.) is always stripped for privacy/size.
  // Sharp doesn't preserve metadata unless explicitly asked.
}

/** Default options for full-size images */
const DEFAULT_FULL_OPTIONS: Required<ProcessImageOptions> = {
  maxWidth: 2000,
  maxHeight: 2000,
  fit: 'inside',
  position: 'center',
  quality: 78,
  effort: 4,           // Balanced: fast + good compression (6 is ~30% slower)
  convertHeic: true,
  sharpenSigma: 0.6,   // Subtle sharpening for full images
  saturationBoost: 1.02, // Slight boost to counter compression flatness
};

/** Default options for thumbnail images */
const DEFAULT_THUMB_OPTIONS: Required<ProcessImageOptions> = {
  maxWidth: 480,
  maxHeight: 480,
  fit: 'inside',
  position: 'center',
  quality: 72,
  effort: 4,           // Balanced: fast + good compression
  convertHeic: true,
  sharpenSigma: 0.8,   // Stronger sharpening for thumbs (more downscaled = more detail loss)
  saturationBoost: 1.03, // Slightly more boost for small images
};

// ============================================================================
// Core Processing Functions
// ============================================================================

/**
 * Process image buffer: detect format, convert HEIC if needed, resize, convert to WebP
 * Optimized for speed while maintaining quality
 * 
 * Features:
 * - Auto-rotate based on EXIF orientation (then stripped)
 * - Metadata automatically stripped (Sharp default, no withMetadata call)
 * - Light sharpening for crisp output
 * - Smart subsampling for better compression
 * - Single decode for output dimensions (resolveWithObject)
 */
export async function processImage(
  inputBuffer: Buffer,
  options: ProcessImageOptions
): Promise<{ buffer: Buffer; originalFormat: string; width: number; height: number }> {
  const opts = { ...DEFAULT_FULL_OPTIONS, ...options };
  
  // Detect format
  const originalFormat = detectImageFormat(inputBuffer);
  
  // Convert HEIC to JPEG first if needed
  let buffer = inputBuffer;
  if (opts.convertHeic && originalFormat === 'heic') {
    buffer = await convertHeicToJpeg(inputBuffer);
    
    // Validate megapixels after HEIC conversion using limitInputPixels
    try {
      await sharp(buffer, { limitInputPixels: SHARP_LIMIT_INPUT_PIXELS }).metadata();
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : '';
      if (errorMsg.includes('Input image exceeds pixel limit')) {
        throw new ImageValidationError(
          `HEIC image exceeds maximum ${MAX_MEGAPIXELS}MP`,
          'TOO_MANY_PIXELS'
        );
      }
      throw error;
    }
  }
  
  // Build Sharp pipeline with limitInputPixels for safety
  let pipeline = sharp(buffer, {
    failOnError: false,           // Don't fail on minor image issues
    sequentialRead: true,         // Faster for single-pass processing
    limitInputPixels: SHARP_LIMIT_INPUT_PIXELS, // Enforce megapixel limit at decode
  })
    .rotate() // Auto-rotate based on EXIF orientation (metadata stripped by default)
    .resize(opts.maxWidth, opts.maxHeight, {
      fit: opts.fit,
      position: opts.position,
      withoutEnlargement: true,   // Don't upscale smaller images
      fastShrinkOnLoad: true,     // Use shrink-on-load for faster processing
      kernel: 'lanczos3',         // Best quality downscaling kernel
    });
  
  // Apply advanced unsharp mask sharpening (better than simple sharpen)
  // sigma: blur radius, m1/m2: flat/jagged thresholds, x1/y2/y3: slope params
  if (opts.sharpenSigma && opts.sharpenSigma > 0) {
    pipeline = pipeline.sharpen({
      sigma: opts.sharpenSigma,
      m1: 0,    // Flat areas: no sharpening (avoids noise amplification)
      m2: 3,    // Jagged areas: moderate sharpening
      x1: 2,    // Threshold for flat detection
      y2: 10,   // Max sharpening for mid-contrast
      y3: 5,    // Sharpening for high-contrast edges
    });
  }
  
  // Subtle saturation boost to counter compression flatness
  // Makes cars look more vibrant without being oversaturated
  if (opts.saturationBoost && opts.saturationBoost > 1) {
    pipeline = pipeline.modulate({ saturation: opts.saturationBoost });
  }
  
  // Note: Metadata (EXIF, GPS, etc.) is automatically stripped by Sharp
  // unless withMetadata() is called. We intentionally don't call it.
  
  // Convert to WebP with optimized settings for size
  pipeline = pipeline.webp({
    quality: opts.quality,
    effort: opts.effort,
    preset: 'photo',       // Optimized for photographic images
    smartSubsample: true,  // Better chroma subsampling
  });
  
  // Use resolveWithObject to get dimensions without re-decoding
  const { data, info } = await pipeline.toBuffer({ resolveWithObject: true });
  
  return {
    buffer: data,
    originalFormat,
    width: info.width,
    height: info.height,
  };
}

// ============================================================================
// Listing Image Processing - Dual Output (Thumb + Full)
// ============================================================================

export interface ListingImageResult {
  thumb: {
    buffer: Buffer;
    width: number;
    height: number;
  };
  full: {
    buffer: Buffer;
    width: number;
    height: number;
  };
  originalFormat: string;
}

/**
 * Process a listing image and generate both thumb and full versions
 * 
 * This is the main entry point for listing image uploads.
 * Validates the image, converts HEIC if needed, and outputs:
 * - thumb: 480w max, quality 72, ~15-20KB (for grid cards)
 * - full: 2000w max, quality 78, ~100-200KB (for detail page)
 * 
 * @param inputBuffer - Raw image buffer from upload
 * @returns Both processed versions ready for storage
 * @throws ImageValidationError if image is invalid or too large
 * 
 * @example
 * const { thumb, full } = await processListingImages(buffer);
 * // Store as: photo_001_thumb.webp, photo_001_full.webp
 */
export async function processListingImages(inputBuffer: Buffer): Promise<ListingImageResult> {
  // Validate before processing
  const validation = await validateImage(inputBuffer);
  
  // Normalize: convert HEIC to JPEG if needed (do this once, reuse for both)
  const normalizedBuffer = await ensureNonHeic(inputBuffer);
  
  // Process both variants in parallel
  const [thumbResult, fullResult] = await Promise.all([
    processImage(normalizedBuffer, {
      ...DEFAULT_THUMB_OPTIONS,
      convertHeic: false, // Already converted
    }),
    processImage(normalizedBuffer, {
      ...DEFAULT_FULL_OPTIONS,
      convertHeic: false, // Already converted
    }),
  ]);
  
  return {
    thumb: {
      buffer: thumbResult.buffer,
      width: thumbResult.width,
      height: thumbResult.height,
    },
    full: {
      buffer: fullResult.buffer,
      width: fullResult.width,
      height: fullResult.height,
    },
    originalFormat: validation.format,
  };
}

/**
 * Process a single image (avatar, logo, etc.) - not listings
 * Uses full-size defaults but can be customized
 */
export async function processSingleImage(
  inputBuffer: Buffer, 
  options?: Partial<ProcessImageOptions>
): Promise<{ buffer: Buffer; width: number; height: number; originalFormat: string }> {
  // Validate before processing
  await validateImage(inputBuffer);
  
  return processImage(inputBuffer, {
    ...DEFAULT_FULL_OPTIONS,
    ...options,
  });
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Check if a detected format is valid for image processing
 */
export function isValidImageFormat(format: string): boolean {
  return ['heic', 'jpeg', 'png', 'webp', 'gif'].includes(format);
}

/**
 * Get human-readable file size string
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
}
