/**
 * Image Upload Client
 * 
 * Fast client-side compression + direct R2 upload.
 * Bypasses Vercel's 4.5MB limit and eliminates server processing.
 * 
 * Architecture:
 * 1. Client compresses image (browser-image-compression)
 * 2. Get presigned URL from /api/storage/direct
 * 3. PUT directly to R2 (instant, no server bottleneck)
 * 4. CDN URL immediately available
 * 
 * All images served via cdn.revvup.ae with 1-year caching.
 */

// ============================================================================
// Types
// ============================================================================

export interface ListingUploadResult {
  thumbKey: string;
  thumbUrl: string;
  fullKey: string;
  fullUrl: string;
}

export interface SingleUploadResult {
  key: string;
  url: string;
  width?: number;
  height?: number;
}

// ============================================================================
// Video Upload (Showroom only - no compression needed)
// ============================================================================

/**
 * Upload a showroom video. Direct to CDN (no processing).
 * Uses XHR for progress tracking.
 */
export async function uploadShowroomVideo(
  file: File,
  partnerId: string,
  assetType: string,
  onProgress?: (percent: number) => void
): Promise<SingleUploadResult> {
  // Step 1: Get presigned URL
  onProgress?.(5);
  
  const presignedRes = await fetch('/api/storage/presigned', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'showroom',
      contentType: file.type,
      partnerId,
      assetType,
    }),
  });

  if (!presignedRes.ok) {
    const error = await presignedRes.json();
    throw new Error(error.error || 'Failed to get upload URL');
  }

  const { uploadUrl, rawKey, maxSize } = await presignedRes.json();

  if (file.size > maxSize) {
    const maxMB = Math.round(maxSize / 1024 / 1024);
    throw new Error(`Video too large. Maximum ${maxMB}MB allowed.`);
  }

  // Step 2: Upload directly to R2 with progress tracking
  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        const percent = 5 + Math.round((e.loaded / e.total) * 95);
        onProgress?.(percent);
      }
    });
    
    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new Error('Upload failed'));
      }
    });
    
    xhr.addEventListener('error', () => reject(new Error('Upload failed')));
    xhr.open('PUT', uploadUrl);
    xhr.setRequestHeader('Content-Type', file.type);
    xhr.send(file);
  });

  // Videos go direct to CDN - no processing needed
  const cdnUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || '';
  return {
    key: rawKey,
    url: `${cdnUrl}/${rawKey}`,
  };
}

// ============================================================================
// Direct Upload Functions (Client-Side Compression, No Server Processing)
// ============================================================================

export interface DirectListingUploadResult {
  thumbKey: string;
  thumbUrl: string;
  fullKey: string;
  fullUrl: string;
}

export interface DirectSingleUploadResult {
  key: string;
  url: string;
}

/**
 * Get presigned URLs for direct listing image upload.
 * Client must pre-compress images before calling this.
 */
async function getListingUploadUrls(vin: string): Promise<{
  thumbUploadUrl: string;
  thumbKey: string;
  thumbUrl: string;
  fullUploadUrl: string;
  fullKey: string;
  fullUrl: string;
}> {
  const res = await fetch('/api/storage/direct', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'listing', vin }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to get upload URLs');
  }

  return res.json();
}

/**
 * Upload a pre-compressed file to a presigned URL.
 */
async function uploadToPresigned(uploadUrl: string, file: File | Blob): Promise<void> {
  const res = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': 'image/jpeg' },
    body: file,
  });

  if (!res.ok) {
    throw new Error('Upload failed. Please try again.');
  }
}

/**
 * Direct upload pre-compressed listing images (thumb + full).
 * 
 * Flow:
 * 1. Compress client-side using image-compress.ts
 * 2. Call this function with compressed files
 * 3. Get presigned URLs and upload both in parallel
 * 4. URLs are immediately CDN-ready
 * 
 * @param thumbFile - Pre-compressed thumbnail file (~20-25KB)
 * @param fullFile - Pre-compressed full-size file (~45-55KB)
 * @param vin - VIN string for folder organization
 * @returns CDN URLs for both images
 */
export async function uploadListingImageDirect(
  thumbFile: File | Blob,
  fullFile: File | Blob,
  vin: string,
): Promise<DirectListingUploadResult> {
  const urls = await getListingUploadUrls(vin);

  // Upload both in parallel
  await Promise.all([
    uploadToPresigned(urls.thumbUploadUrl, thumbFile),
    uploadToPresigned(urls.fullUploadUrl, fullFile),
  ]);

  return {
    thumbKey: urls.thumbKey,
    thumbUrl: urls.thumbUrl,
    fullKey: urls.fullKey,
    fullUrl: urls.fullUrl,
  };
}

/**
 * Get presigned URL for direct avatar upload.
 */
async function getAvatarUploadUrl(): Promise<{ uploadUrl: string; key: string; url: string }> {
  const res = await fetch('/api/storage/direct', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'avatar' }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to get upload URL');
  }

  return res.json();
}

/**
 * Direct upload a pre-compressed avatar.
 * 
 * @param file - Pre-compressed avatar file (~15-20KB)
 * @returns CDN URL
 */
export async function uploadAvatarDirect(file: File | Blob): Promise<DirectSingleUploadResult> {
  const urls = await getAvatarUploadUrl();
  await uploadToPresigned(urls.uploadUrl, file);

  return {
    key: urls.key,
    url: urls.url,
  };
}

/**
 * Get presigned URL for direct partner image upload.
 */
async function getPartnerUploadUrl(
  partnerId: string,
  imageType: 'logo' | 'hero',
): Promise<{ uploadUrl: string; key: string; url: string }> {
  const res = await fetch('/api/storage/direct', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'partner', partnerId, imageType }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to get upload URL');
  }

  return res.json();
}

/**
 * Direct upload a pre-compressed partner image.
 * 
 * @param file - Pre-compressed partner image (logo or hero)
 * @param partnerId - Partner ID
 * @param imageType - 'logo' or 'hero'
 * @returns CDN URL
 */
export async function uploadPartnerImageDirect(
  file: File | Blob,
  partnerId: string,
  imageType: 'logo' | 'hero',
): Promise<DirectSingleUploadResult> {
  const urls = await getPartnerUploadUrl(partnerId, imageType);
  await uploadToPresigned(urls.uploadUrl, file);

  return {
    key: urls.key,
    url: urls.url,
  };
}

/**
 * Get presigned URL for direct showroom image upload.
 */
async function getShowroomUploadUrl(
  partnerId: string,
  assetType: string,
): Promise<{ uploadUrl: string; key: string; url: string }> {
  const res = await fetch('/api/storage/direct', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'showroom', partnerId, assetType }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to get upload URL');
  }

  return res.json();
}

/**
 * Direct upload a pre-compressed showroom image.
 * 
 * @param file - Pre-compressed showroom image
 * @param partnerId - Partner ID
 * @param assetType - Type of showroom asset
 * @returns CDN URL
 */
export async function uploadShowroomImageDirect(
  file: File | Blob,
  partnerId: string,
  assetType: string,
): Promise<DirectSingleUploadResult> {
  const urls = await getShowroomUploadUrl(partnerId, assetType);
  await uploadToPresigned(urls.uploadUrl, file);

  return {
    key: urls.key,
    url: urls.url,
  };
}

// ============================================================================
// High-Level Convenience Functions (Compress + Upload in one call)
// ============================================================================

import { 
  compressListingImage, 
  compressAvatar as compressAvatarImage, 
  compressPartnerImage,
  compressShowroomImage 
} from './image-compress';

/**
 * Compress and upload a listing image in one call.
 * Handles compression + parallel upload automatically.
 * 
 * @param file - Original image file from input
 * @param vin - VIN string
 * @param onProgress - Progress callback (0-100)
 * @returns CDN URLs for thumb + full
 * 
 * @example
 * const result = await compressAndUploadListingImage(file, vin, (p) => setProgress(p));
 * console.log(result.thumbUrl, result.fullUrl);
 */
export async function compressAndUploadListingImage(
  file: File,
  vin: string,
  onProgress?: (percent: number) => void,
): Promise<DirectListingUploadResult> {
  onProgress?.(5);
  
  // Compress (parallel thumb + full)
  const { thumb, full } = await compressListingImage(file);
  onProgress?.(40);
  
  // Upload (parallel)
  const result = await uploadListingImageDirect(thumb.file, full.file, vin);
  onProgress?.(100);
  
  return result;
}

/**
 * Compress and upload multiple listing images in parallel.
 * 
 * @param files - Array of image files
 * @param vin - VIN string
 * @param onProgress - Progress callback (completed, total)
 * @param concurrency - Max concurrent uploads (default: 5)
 * @returns Array of upload results
 */
export async function compressAndUploadListingImages(
  files: File[],
  vin: string,
  onProgress?: (completed: number, total: number) => void,
  concurrency: number = 5,
): Promise<DirectListingUploadResult[]> {
  let completed = 0;

  // Process a single file: compress + upload
  const processFile = async (file: File): Promise<DirectListingUploadResult> => {
    const { thumb, full } = await compressListingImage(file);
    const result = await uploadListingImageDirect(thumb.file, full.file, vin);
    completed++;
    onProgress?.(completed, files.length);
    return result;
  };

  // Process in batches for controlled concurrency
  const results: DirectListingUploadResult[] = [];
  
  for (let i = 0; i < files.length; i += concurrency) {
    const batch = files.slice(i, i + concurrency);
    const batchResults = await Promise.all(batch.map(processFile));
    results.push(...batchResults);
  }

  return results;
}

/**
 * Compress and upload an avatar image.
 */
export async function compressAndUploadAvatar(
  file: File,
  onProgress?: (percent: number) => void,
): Promise<DirectSingleUploadResult> {
  onProgress?.(10);
  
  const compressed = await compressAvatarImage(file);
  onProgress?.(50);
  
  const result = await uploadAvatarDirect(compressed.file);
  onProgress?.(100);
  
  return result;
}

/**
 * Compress and upload a partner image (logo or hero).
 */
export async function compressAndUploadPartnerImage(
  file: File,
  partnerId: string,
  imageType: 'logo' | 'hero',
  onProgress?: (percent: number) => void,
): Promise<DirectSingleUploadResult> {
  onProgress?.(10);
  
  const compressed = await compressPartnerImage(file, imageType);
  onProgress?.(50);
  
  const result = await uploadPartnerImageDirect(compressed.file, partnerId, imageType);
  onProgress?.(100);
  
  return result;
}

/**
 * Compress and upload a showroom image.
 */
export async function compressAndUploadShowroomImage(
  file: File,
  partnerId: string,
  assetType: 'hero-image' | 'founder-image' | 'gallery' | 'team-member' | 'seo-image',
  onProgress?: (percent: number) => void,
): Promise<DirectSingleUploadResult> {
  onProgress?.(10);
  
  const compressed = await compressShowroomImage(file, assetType);
  onProgress?.(50);
  
  const result = await uploadShowroomImageDirect(compressed.file, partnerId, assetType);
  onProgress?.(100);
  
  return result;
}

