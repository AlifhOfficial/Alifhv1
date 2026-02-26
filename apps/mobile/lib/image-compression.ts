/**
 * Client-Side Image Compression — Mobile
 * 
 * Compresses images before upload using expo-image-manipulator.
 * Reduces 10-20MB iPhone photos to ~1-2MB for fast uploads.
 * 
 * Server still processes for final WebP output, but with much less work.
 */

import * as ImageManipulator from 'expo-image-manipulator';
import { CLIENT_CONFIG } from '@alifh/image-config';

// ============================================================================
// Types
// ============================================================================

export interface CompressedImage {
  uri: string;
  width: number;
  height: number;
}

export interface CompressionOptions {
  /** Override max width */
  maxWidth?: number;
  /** Override max height */
  maxHeight?: number;
  /** Override quality (0.0-1.0) */
  quality?: number;
}

// ============================================================================
// Compression
// ============================================================================

/**
 * Compress an image for upload.
 * 
 * Uses expo-image-manipulator for fast, native compression.
 * Outputs JPEG for maximum compatibility with server processing.
 * 
 * @example
 * const compressed = await compressImageForUpload(asset.uri);
 * // compressed.uri is ready for upload (~1-2MB instead of 10-20MB)
 */
export async function compressImageForUpload(
  uri: string,
  options?: CompressionOptions
): Promise<CompressedImage> {
  const maxWidth = options?.maxWidth ?? CLIENT_CONFIG.maxWidth;
  const maxHeight = options?.maxHeight ?? CLIENT_CONFIG.maxHeight;
  const quality = options?.quality ?? CLIENT_CONFIG.quality;

  // Resize (width only to preserve aspect ratio) + compress to JPEG
  const result = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: maxWidth } }],
    {
      compress: quality,
      format: ImageManipulator.SaveFormat.JPEG,
    }
  );

  return {
    uri: result.uri,
    width: result.width,
    height: result.height,
  };
}

/**
 * Batch compress multiple images for upload.
 * 
 * @param uris Array of image URIs
 * @param onProgress Callback for progress updates
 * @returns Compressed images with progress tracking
 */
export async function compressImagesForUpload(
  uris: string[],
  onProgress?: (completed: number, total: number) => void
): Promise<CompressedImage[]> {
  const results: CompressedImage[] = [];
  
  for (let i = 0; i < uris.length; i++) {
    const compressed = await compressImageForUpload(uris[i]);
    results.push(compressed);
    onProgress?.(i + 1, uris.length);
  }
  
  return results;
}
