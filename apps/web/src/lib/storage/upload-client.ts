/**
 * Image Upload Client — Preprocessing Pipeline
 *
 * New flow (replaces browser-image-compression + presigned URL):
 *   1. POST /api/storage/upload-token  → short-lived HMAC token + Fly service URL
 *   2. POST token + raw files → Fly preprocessing service (no Vercel body limit)
 *   3. Fly runs Sharp server-side → uploads WebP to R2 → returns CDN URLs
 *
 * Video uploads (showroom only) are unchanged — they bypass this pipeline.
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

// Alias kept for backward compat with existing call sites
export type DirectListingUploadResult = ListingUploadResult;

export interface SingleUploadResult {
  key: string;
  url: string;
}

export type DirectSingleUploadResult = SingleUploadResult;

// ============================================================================
// Internal helpers
// ============================================================================

interface UploadTokenResponse {
  token: string;
  expiresAt: number;
  uploadUrl: string;
}

async function getUploadToken(body: Record<string, string>): Promise<UploadTokenResponse> {
  const res = await fetch('/api/storage/upload-token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const e = await res.json().catch(() => ({})) as Record<string, string>;
    throw new Error(e.error ?? 'Failed to get upload token');
  }

  return res.json();
}

/**
 * Client-side preshrink via Canvas.
 * Target: ≤1600px longest side, JPEG q82 → ~120-180KB regardless of source size.
 * Sharp on Fly receives a clean JPEG and does final WebP output (no quality lost).
 * Canvas drawImage is GPU-accelerated — ~20-40ms per image, non-blocking feel.
 */
async function preshrink(file: File, maxDim = 1600): Promise<File> {
  // Skip non-images and files already under 200KB (already small enough)
  if (!file.type.startsWith('image/') || file.size < 200_000) return file;

  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const { naturalWidth: w, naturalHeight: h } = img;
      const scale = Math.min(1, maxDim / Math.max(w, h));
      const canvas = document.createElement('canvas');
      canvas.width  = Math.round(w * scale);
      canvas.height = Math.round(h * scale);
      canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        resolve(blob ? new File([blob], file.name, { type: 'image/jpeg' }) : file);
      }, 'image/jpeg', 0.82);
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(file); };
    img.src = url;
  });
}

/** POST one batch of raw files to the preprocessing service. Returns raw results array. */
async function postToPreprocessing(files: File[], token: string, uploadUrl: string): Promise<any[]> {
  const fd = new FormData();
  for (const f of files) fd.append('file', f);

  const res = await fetch(uploadUrl, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: fd,
  });

  if (!res.ok) {
    const e = await res.json().catch(() => ({})) as Record<string, string>;
    throw new Error(e.error ?? 'Upload failed');
  }

  const data = await res.json();
  return data.results ?? [];
}

// ============================================================================
// Video Upload (Showroom only — unchanged, XHR for progress)
// ============================================================================

export async function uploadShowroomVideo(
  file: File,
  partnerId: string,
  assetType: string,
  onProgress?: (percent: number) => void,
): Promise<SingleUploadResult> {
  onProgress?.(5);

  const presignedRes = await fetch('/api/storage/presigned', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'showroom', contentType: file.type, partnerId, assetType }),
  });

  if (!presignedRes.ok) {
    const error = await presignedRes.json();
    throw new Error(error.error || 'Failed to get upload URL');
  }

  const { uploadUrl, rawKey, maxSize } = await presignedRes.json();

  if (file.size > maxSize) {
    throw new Error(`Video too large. Maximum ${Math.round(maxSize / 1024 / 1024)}MB allowed.`);
  }

  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) onProgress?.(5 + Math.round((e.loaded / e.total) * 95));
    });
    xhr.addEventListener('load', () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error('Upload failed'))));
    xhr.addEventListener('error', () => reject(new Error('Upload failed')));
    xhr.open('PUT', uploadUrl);
    xhr.setRequestHeader('Content-Type', file.type);
    xhr.send(file);
  });

  const cdnUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || '';
  return { key: rawKey, url: `${cdnUrl}/${rawKey}` };
}

// ============================================================================
// Listing Images
// ============================================================================

/**
 * Upload multiple listing images.
 * Preshrinks all files in parallel (canvas, ~20ms each), then fires
 * one request per file simultaneously — no batching needed when files are ~150KB.
 */
export async function compressAndUploadListingImages(
  files: File[],
  vin: string,
  onProgress?: (completed: number, total: number) => void,
): Promise<ListingUploadResult[]> {
  const { token, uploadUrl } = await getUploadToken({ type: 'listing', vin });

  // Canvas-preshrink all at once (GPU-accelerated, non-blocking)
  const shrunk = await Promise.all(files.map(f => preshrink(f)));

  // Fire every file individually and in parallel — each is ~150KB so no bandwidth pileup
  let completed = 0;
  const results = await Promise.all(
    shrunk.map(async (file) => {
      const res = await postToPreprocessing([file], token, uploadUrl);
      onProgress?.(++completed, shrunk.length);
      const r = res[0];
      if (r?.error) throw new Error(r.error);
      return { thumbKey: r.thumbKey, thumbUrl: r.thumbUrl, fullKey: r.fullKey, fullUrl: r.fullUrl };
    })
  );

  return results;
}

// ============================================================================
// Avatar
// ============================================================================

export async function compressAndUploadAvatar(
  file: File,
  onProgress?: (percent: number) => void,
): Promise<SingleUploadResult> {
  onProgress?.(5);
  const small = await preshrink(file);
  onProgress?.(10);
  const { token, uploadUrl } = await getUploadToken({ type: 'avatar' });
  onProgress?.(30);

  const results = await postToPreprocessing([small], token, uploadUrl);
  onProgress?.(100);

  const r = results[0];
  if (r?.error) throw new Error(r.error);
  return { key: r.key, url: r.url };
}

// ============================================================================
// Partner Images (logo, hero)
// ============================================================================

export async function compressAndUploadPartnerImage(
  file: File,
  partnerId: string,
  imageType: 'logo' | 'hero',
  onProgress?: (percent: number) => void,
): Promise<SingleUploadResult> {
  onProgress?.(5);
  const small = await preshrink(file);
  onProgress?.(10);
  const { token, uploadUrl } = await getUploadToken({ type: 'partner', partnerId, imageType });
  onProgress?.(30);

  const results = await postToPreprocessing([small], token, uploadUrl);
  onProgress?.(100);

  const r = results[0];
  if (r?.error) throw new Error(r.error);
  return { key: r.key, url: r.url };
}

// ============================================================================
// Showroom Images
// ============================================================================

export async function compressAndUploadShowroomImage(
  file: File,
  partnerId: string,
  assetType: 'hero-image' | 'founder-image' | 'gallery' | 'team-member' | 'seo-image',
  onProgress?: (percent: number) => void,
): Promise<SingleUploadResult> {
  onProgress?.(5);
  const small = await preshrink(file);
  onProgress?.(10);
  const { token, uploadUrl } = await getUploadToken({ type: 'showroom', partnerId, assetType });
  onProgress?.(30);

  const results = await postToPreprocessing([small], token, uploadUrl);
  onProgress?.(100);

  const r = results[0];
  if (r?.error) throw new Error(r.error);
  return { key: r.key, url: r.url };
}

// ============================================================================
// Types
// ============================================================================
