/**
 * Shared Image Processing Utilities
 * 
 * Provides HEIC detection/conversion and optimized Sharp processing
 * Used by all storage upload routes for consistent image handling
 */

import sharp from "sharp";
import convert from "heic-convert";

/**
 * Detect image format from magic bytes (first few bytes of file)
 * More reliable than MIME type since mobile apps often mislabel HEIC as JPEG
 */
export function detectImageFormat(buffer: Buffer): 'heic' | 'jpeg' | 'png' | 'webp' | 'gif' | 'unknown' {
  // Check minimum buffer size
  if (buffer.length < 12) return 'unknown';
  
  // HEIC/HEIF: Check for ftyp box with heic/heix/mif1/msf1 brand
  // Format: [4 bytes size][ftyp][4 bytes brand]
  if (buffer.length >= 12) {
    const ftypOffset = buffer.indexOf('ftyp');
    if (ftypOffset >= 4 && ftypOffset <= 8) {
      const brand = buffer.slice(ftypOffset + 4, ftypOffset + 8).toString('ascii').toLowerCase();
      if (['heic', 'heix', 'mif1', 'msf1', 'hevc', 'hevx'].includes(brand)) {
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
  if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46) {
    return 'gif';
  }
  
  return 'unknown';
}

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
}

const DEFAULT_OPTIONS: Required<ProcessImageOptions> = {
  maxWidth: 2048,
  maxHeight: 2048,
  fit: 'inside',
  position: 'center',
  quality: 82,
  effort: 2,
  convertHeic: true,
};

/**
 * Process image buffer: detect format, convert HEIC if needed, resize, convert to WebP
 * Optimized for speed while maintaining quality
 */
export async function processImage(
  inputBuffer: Buffer,
  options: ProcessImageOptions
): Promise<{ buffer: Buffer; originalFormat: string }> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  // Detect format
  const originalFormat = detectImageFormat(inputBuffer);
  
  // Convert HEIC to JPEG first if needed
  let buffer = inputBuffer;
  if (opts.convertHeic && originalFormat === 'heic') {
    buffer = await convertHeicToJpeg(inputBuffer);
  }
  
  // Process with Sharp (optimized settings)
  const processedBuffer = await sharp(buffer, {
    failOnError: false,     // Don't fail on minor image issues
    sequentialRead: true,   // Faster for single-pass processing
  })
    .rotate() // Auto-rotate based on EXIF orientation
    .resize(opts.maxWidth, opts.maxHeight, {
      fit: opts.fit,
      position: opts.position,
      withoutEnlargement: true, // Don't upscale smaller images
      fastShrinkOnLoad: true,   // Use shrink-on-load for faster processing
    })
    .webp({
      quality: opts.quality,
      effort: opts.effort,
      smartSubsample: true,     // Better chroma subsampling
    })
    .toBuffer();
  
  return {
    buffer: processedBuffer,
    originalFormat,
  };
}

/**
 * Check if a detected format is valid for image processing
 */
export function isValidImageFormat(format: string): boolean {
  return ['heic', 'jpeg', 'png', 'webp', 'gif'].includes(format);
}
