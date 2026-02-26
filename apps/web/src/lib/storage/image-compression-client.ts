/**
 * Client-Side Image Compression — Web
 * 
 * Compresses images before upload using browser-image-compression.
 * Reduces large photos to ~1-2MB for fast uploads.
 * 
 * Key features:
 * - Web Worker based (non-blocking UI)
 * - EXIF orientation fix
 * - Automatic format handling (HEIC converted by browser)
 * 
 * Server still processes for final WebP output at consistent quality.
 */

import imageCompression from 'browser-image-compression';
import { CLIENT_CONFIG } from '@alifh/image-config';

// ============================================================================
// Types
// ============================================================================

export interface CompressionOptions {
  /** Override max width */
  maxWidth?: number;
  /** Override max height */
  maxHeight?: number;
  /** Override max size in MB */
  maxSizeMB?: number;
  /** Progress callback (0-100) */
  onProgress?: (percent: number) => void;
}

// ============================================================================
// Compression
// ============================================================================

/**
 * Compress an image file for upload.
 * 
 * Uses browser-image-compression with Web Workers for non-blocking compression.
 * Outputs a compressed File object ready for upload.
 * 
 * @example
 * const compressed = await compressImageForUpload(file);
 * // compressed is a File ready for fetch/upload (~1-2MB instead of 10-20MB)
 */
export async function compressImageForUpload(
  file: File,
  options?: CompressionOptions
): Promise<File> {
  const maxWidthOrHeight = Math.max(
    options?.maxWidth ?? CLIENT_CONFIG.maxWidth,
    options?.maxHeight ?? CLIENT_CONFIG.maxHeight
  );
  const maxSizeMB = options?.maxSizeMB ?? CLIENT_CONFIG.maxSizeMB;

  // Skip compression if already small enough
  const fileSizeMB = file.size / 1024 / 1024;
  if (fileSizeMB <= maxSizeMB) {
    return file;
  }

  const compressed = await imageCompression(file, {
    maxSizeMB,
    maxWidthOrHeight,
    useWebWorker: CLIENT_CONFIG.useWebWorker,
    // Preserve some quality - server will optimize further
    initialQuality: CLIENT_CONFIG.quality,
    // Fix EXIF orientation
    exifOrientation: undefined, // auto-fix
    // Progress callback
    onProgress: options?.onProgress,
    // Output as JPEG for broad compatibility
    fileType: 'image/jpeg',
  });

  return compressed;
}

/**
 * Compress multiple files for upload.
 * 
 * @param files Array of files to compress
 * @param onProgress Callback for overall progress (0-100)
 */
export async function compressImagesForUpload(
  files: File[],
  onProgress?: (percent: number) => void
): Promise<File[]> {
  const results: File[] = [];
  
  for (let i = 0; i < files.length; i++) {
    const fileProgress = (progress: number) => {
      const basePercent = (i / files.length) * 100;
      const filePercent = (progress / files.length);
      onProgress?.(Math.round(basePercent + filePercent));
    };
    
    const compressed = await compressImageForUpload(files[i], {
      onProgress: fileProgress,
    });
    results.push(compressed);
  }
  
  onProgress?.(100);
  return results;
}

/**
 * Check if a file needs compression.
 */
export function needsCompression(file: File): boolean {
  return file.size > CLIENT_CONFIG.maxSizeMB * 1024 * 1024;
}

/**
 * Format file size for display.
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
}
