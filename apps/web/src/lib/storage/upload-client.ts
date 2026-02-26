/**
 * Unified Image Upload Client
 * 
 * Simple, fast image uploads via presigned URLs.
 * Bypasses Vercel's 4.5MB limit by uploading directly to R2.
 * 
 * Pipeline:
 * 1. Compress client-side (10-20MB → ~1-2MB) via browser-image-compression
 * 2. Get presigned URL from /api/storage/presigned
 * 3. PUT directly to R2 (instant, no server bottleneck)
 * 4. Process via /api/storage/process → get CDN URL(s)
 * 
 * Target sizes after server processing:
 * - Thumbnail: ~20KB (480w, q55)
 * - Full: ~50KB (1400w, q58)
 * 
 * All images served via cdn.revvup.ae with 1-year caching.
 */

import { compressImageForUpload } from './image-compression-client';

// ============================================================================
// Types
// ============================================================================

export type UploadType = 'listing' | 'avatar' | 'partner' | 'showroom';

export interface UploadOptions {
  /** Upload type */
  type: UploadType;
  /** File to upload */
  file: File;
  /** VIN - required for listing uploads */
  vin?: string;
  /** Partner ID - required for partner and showroom uploads */
  partnerId?: string;
  /** Image type for partner uploads: 'logo' | 'hero' */
  imageType?: 'logo' | 'hero';
  /** Asset type for showroom uploads */
  assetType?: string;
  /** Progress callback (0-100) */
  onProgress?: (percent: number) => void;
}

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

export type UploadResult = ListingUploadResult | SingleUploadResult;

// ============================================================================
// Main Upload Function
// ============================================================================

/**
 * Upload an image using the presigned URL pipeline.
 * 
 * @example Listing image (returns thumb + full)
 * const result = await uploadImage({
 *   type: 'listing',
 *   file: imageFile,
 *   vin: '1HGCM82633A123456',
 * });
 * console.log(result.thumbUrl, result.fullUrl);
 * 
 * @example Avatar
 * const result = await uploadImage({
 *   type: 'avatar',
 *   file: imageFile,
 * });
 * console.log(result.url);
 * 
 * @example Partner logo
 * const result = await uploadImage({
 *   type: 'partner',
 *   file: imageFile,
 *   partnerId: 'abc123',
 *   imageType: 'logo',
 * });
 */
export async function uploadImage(options: UploadOptions): Promise<UploadResult> {
  const { type, file, vin, partnerId, imageType, assetType, onProgress } = options;

  // Step 1: Client-side compression (10-20MB → ~1-2MB)
  onProgress?.(2);
  const compressedFile = await compressImageForUpload(file, {
    onProgress: (p) => onProgress?.(2 + Math.round(p * 0.18)), // 2-20%
  });
  
  // Step 2: Get presigned URL
  onProgress?.(22);
  
  const presignedRes = await fetch('/api/storage/presigned', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type,
      contentType: compressedFile.type,
      vin,
      partnerId,
      imageType,
      assetType,
    }),
  });

  if (!presignedRes.ok) {
    const error = await presignedRes.json();
    throw new Error(error.error || 'Failed to get upload URL');
  }

  const { uploadUrl, rawKey, maxSize, requiresProcessing } = await presignedRes.json();

  // Validate file size (should always pass after compression)
  if (compressedFile.size > maxSize) {
    const maxMB = Math.round(maxSize / 1024 / 1024);
    throw new Error(`File too large. Maximum ${maxMB}MB allowed.`);
  }

  // Step 3: Upload directly to R2
  onProgress?.(25);
  
  const uploadRes = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': compressedFile.type },
    body: compressedFile,
  });

  if (!uploadRes.ok) {
    throw new Error('Upload failed. Please try again.');
  }

  onProgress?.(70);

  // Step 3: Process the image (if needed)
  if (!requiresProcessing) {
    // Video uploads go direct - no processing needed
    const cdnUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || '';
    return {
      key: rawKey,
      url: `${cdnUrl}/${rawKey}`,
    } as SingleUploadResult;
  }

  const processRes = await fetch('/api/storage/process', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rawKey }),
  });

  onProgress?.(95);

  if (!processRes.ok) {
    const error = await processRes.json();
    throw new Error(error.error || 'Processing failed');
  }

  const result = await processRes.json();
  onProgress?.(100);

  return result;
}

// ============================================================================
// Convenience Functions
// ============================================================================

/**
 * Upload a listing image. Returns thumb + full URLs.
 */
export async function uploadListingImage(
  file: File,
  vin: string,
  onProgress?: (percent: number) => void
): Promise<ListingUploadResult> {
  return uploadImage({ type: 'listing', file, vin, onProgress }) as Promise<ListingUploadResult>;
}

/**
 * Upload an avatar image. Returns single URL.
 */
export async function uploadAvatar(
  file: File,
  onProgress?: (percent: number) => void
): Promise<SingleUploadResult> {
  return uploadImage({ type: 'avatar', file, onProgress }) as Promise<SingleUploadResult>;
}

/**
 * Upload a partner image (logo or hero). Returns single URL.
 */
export async function uploadPartnerImage(
  file: File,
  partnerId: string,
  imageType: 'logo' | 'hero',
  onProgress?: (percent: number) => void
): Promise<SingleUploadResult> {
  return uploadImage({ type: 'partner', file, partnerId, imageType, onProgress }) as Promise<SingleUploadResult>;
}

/**
 * Upload a showroom image. Returns single URL.
 */
export async function uploadShowroomImage(
  file: File,
  partnerId: string,
  assetType: string,
  onProgress?: (percent: number) => void
): Promise<SingleUploadResult> {
  return uploadImage({ type: 'showroom', file, partnerId, assetType, onProgress }) as Promise<SingleUploadResult>;
}

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
