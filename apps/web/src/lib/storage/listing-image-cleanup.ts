/**
 * Listing Image Cleanup Utility
 * 
 * Handles cleanup of images from R2 storage when listings are deleted.
 * Supports both soft delete (mark for cleanup) and hard delete (immediate cleanup).
 * 
 * @module lib/storage/listing-image-cleanup
 */

import { deleteFile } from './service';

/**
 * Extract storage key from URL or return as-is if already a key
 */
function extractKeyFromUrl(urlOrKey: string): string {
  if (!urlOrKey) return '';
  
  if (urlOrKey.startsWith('http://') || urlOrKey.startsWith('https://')) {
    try {
      const url = new URL(urlOrKey);
      return url.pathname.replace(/^\//, '');
    } catch {
      return urlOrKey;
    }
  }
  
  return urlOrKey;
}

/**
 * Delete a single image from R2 storage
 * Silent failure - logs error but doesn't throw
 */
async function deleteImageSilently(imageUrlOrKey: string): Promise<boolean> {
  try {
    const key = extractKeyFromUrl(imageUrlOrKey);
    if (!key || !key.startsWith('listings/')) {
      console.warn('[image-cleanup] Skipping non-listing image:', key);
      return false;
    }
    
    await deleteFile(key);
    return true;
  } catch (error) {
    console.warn('[image-cleanup] Failed to delete image:', imageUrlOrKey, error);
    return false;
  }
}

/**
 * Delete all images associated with a listing
 * 
 * @param images - Array of image URLs or storage keys
 * @returns Object with success count and failed count
 */
export async function deleteListingImages(images: string[]): Promise<{
  total: number;
  deleted: number;
  failed: number;
}> {
  if (!images || images.length === 0) {
    return { total: 0, deleted: 0, failed: 0 };
  }

  console.warn(`[image-cleanup] Deleting ${images.length} images...`);
  
  const results = await Promise.allSettled(
    images.map(img => deleteImageSilently(img))
  );
  
  const deleted = results.filter(
    (r) => r.status === 'fulfilled' && r.value === true
  ).length;
  
  const failed = images.length - deleted;
  
  console.warn(`[image-cleanup] Complete: ${deleted}/${images.length} deleted, ${failed} failed`);
  
  return {
    total: images.length,
    deleted,
    failed,
  };
}

/**
 * Delete images for multiple listings (batch cleanup)
 * Useful for bulk delete operations
 * 
 * @param listingsImages - Array of image arrays (one per listing)
 */
export async function deleteMultipleListingsImages(
  listingsImages: string[][]
): Promise<{
  totalListings: number;
  totalImages: number;
  deleted: number;
  failed: number;
}> {
  const allImages = listingsImages.flat();
  const result = await deleteListingImages(allImages);
  
  return {
    totalListings: listingsImages.length,
    totalImages: result.total,
    deleted: result.deleted,
    failed: result.failed,
  };
}
