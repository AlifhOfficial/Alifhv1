/**
 * Image Upload Utility — User Inventory Management
 *
 * Pipeline (mirrors web architecture):
 * 1. preshrinkForUpload()            → 1600px JPEG, ~100-200KB  (client)
 * 2. POST /api/storage/upload-token  → HMAC token + uploadUrl   (Vercel edge)
 * 3. POST uploadUrl per image        → Sharp → R2, CDN keys     (Fly/pre.revvup.ae)
 *
 * All images in a batch share one token (5 min TTL).
 * Upload requests fire in parallel (concurrency 5).
 */

import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { Alert, Platform } from 'react-native';
import {
  uploadListingImageDirect,
  getListingUploadToken,
  deleteListingImage,
  type DirectListingUploadResult,
} from '@/lib/sell-car-user-api';
import { preshrinkForUpload } from '@/lib/image-compress';
import { CDN_BASE, API_BASE } from '@/lib/config';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface PickAndUploadOptions {
  /** VIN string (min 11 chars, used for R2 folder structure) */
  vin: string;
  /**
   * Allow multiple images at once.
   * iOS 14+ & Android 13+ support multi-select.
   * @default false
   */
  allowMultiple?: boolean;
  /** Max number of images when allowMultiple=true. @default 30 */
  maxImages?: number;
  /** Callback for progress tracking (phase, completed, total) */
  onProgress?: (phase: 'compressing' | 'uploading', completed: number, total: number) => void;
  /** Concurrent upload limit. @default 5 */
  concurrency?: number;
  /**
   * Fired immediately after the picker closes, BEFORE any preshrink/upload.
   * Use to add images to the grid optimistically (local file:// URIs).
   */
  onImagesPicked?: (localUris: string[]) => void;
  /**
   * Fired as each image finishes uploading successfully.
   * Use to swap the optimistic local URI for the confirmed CDN key.
   */
  onImageUploaded?: (localUri: string, result: ImageUploadResult) => void;
  /**
   * Fired if an individual image fails preshrink or upload.
   * Use to remove the optimistic placeholder from the grid.
   */
  onImageFailed?: (localUri: string, error: string) => void;
}

export interface ImageUploadResult {
  url: string;       // Full-size CDN key
  absoluteUrl: string; // Full URL for native <Image/>
  thumbUrl: string;  // Thumbnail CDN URL
}

export interface PickAndUploadResult {
  success: boolean;
  /** Successfully uploaded image results */
  images: ImageUploadResult[];
  /** Errors for any images that failed */
  errors: string[];
}

// ─── Permissions ─────────────────────────────────────────────────────────────

async function requestMediaPermission(): Promise<boolean> {
  if (Platform.OS === 'web') return true;

  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert(
      'Permission Required',
      'Please allow photo library access to upload listing images.',
      [{ text: 'OK' }],
    );
    return false;
  }
  return true;
}

// ─── Parallel Execution with Concurrency Limit ───────────────────────────────

/**
 * Execute async tasks in parallel with a concurrency limit.
 * Returns results in the same order as input.
 */
async function parallelLimit<T, R>(
  items: T[],
  limit: number,
  fn: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let currentIndex = 0;

  const worker = async () => {
    while (currentIndex < items.length) {
      const index = currentIndex++;
      results[index] = await fn(items[index], index);
    }
  };

  // Start `limit` workers
  const workers = Array.from({ length: Math.min(limit, items.length) }, () => worker());
  await Promise.all(workers);

  return results;
}

// ─── Pick & Upload ───────────────────────────────────────────────────────────

/**
 * Opens the image picker, compresses images client-side,
 * uploads in parallel to R2, and returns CDN URLs.
 *
 * Speed: ~3-5 seconds for 10 images (vs ~45s with server processing)
 *
 * Usage:
 * ```ts
 * const result = await pickAndUploadListingImage({
 *   vin: 'WBAPH5C55BA237842',
 *   allowMultiple: true,
 *   onProgress: (phase, done, total) => {
 *     setStatus(phase === 'compressing' ? 'Optimizing...' : 'Uploading...');
 *     setProgress(done / total);
 *   },
 * });
 * if (result.success) {
 *   setImages(prev => [...prev, ...result.images]);
 * }
 * ```
 */
export async function pickAndUploadListingImage(
  options: PickAndUploadOptions,
): Promise<PickAndUploadResult> {
  const { vin, allowMultiple = false, maxImages = 30, onProgress, concurrency = 5 } = options;

  // 1. Request permission
  const granted = await requestMediaPermission();
  if (!granted) {
    return { success: false, images: [], errors: ['Permission denied'] };
  }

  // 2. Launch picker
  const pickerResult = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsMultipleSelection: allowMultiple,
    selectionLimit: maxImages,
    quality: 1, // Full quality — server handles final compression
    exif: false,
  });

  if (pickerResult.canceled || !pickerResult.assets?.length) {
    return { success: false, images: [], errors: [] };
  }

  const assets = pickerResult.assets;
  const uploaded: ImageUploadResult[] = [];
  const errors: string[] = [];

  // Optimistic: notify caller with local URIs immediately so grid shows them now
  options.onImagesPicked?.(assets.map((a) => a.uri));

  let token: string;
  let uploadUrl: string;
  try {
    ({ token, uploadUrl } = await getListingUploadToken(vin));
  } catch (err: any) {
    return { success: false, images: [], errors: [err.message || 'Failed to get upload token'] };
  }

  // 4. Preshrink images in batches to cap upload payload size (~150KB each)
  let preshrunkCount = 0;
  const preshrunk: Array<{ uri: string; preshrunkUri: string } | { uri: string; error: string }> = [];
  const preshrinkBatchSize = 3;

  try {
    for (let i = 0; i < assets.length; i += preshrinkBatchSize) {
      const batch = assets.slice(i, i + preshrinkBatchSize);
      const batchResults = await Promise.all(
        batch.map(async (asset) => {
          try {
            const preshrunkUri = await preshrinkForUpload(asset.uri);
            preshrunkCount++;
            onProgress?.('compressing', preshrunkCount, assets.length);
            return { uri: asset.uri, preshrunkUri };
          } catch (err: any) {
            preshrunkCount++;
            onProgress?.('compressing', preshrunkCount, assets.length);
            return { uri: asset.uri, error: err.message || 'Preshrink failed' };
          }
        }),
      );
      preshrunk.push(...batchResults);
    }
  } catch (err: any) {
    return { success: false, images: [], errors: ['Preshrink failed: ' + (err.message || 'Unknown error')] };
  }

  // 5. Filter successful preshrinks
  const toUpload = preshrunk.filter((c): c is { uri: string; preshrunkUri: string } => 'preshrunkUri' in c);
  const preshrinkErrors = preshrunk.filter((c): c is { uri: string; error: string } => 'error' in c);
  preshrinkErrors.forEach((c, i) => {
    errors.push(`Image ${i + 1}: ${c.error}`);
    options.onImageFailed?.(c.uri, c.error);
  });

  if (toUpload.length === 0) {
    return { success: false, images: [], errors };
  }

  // 6. Upload to preprocessing server in parallel (all share the same token)
  let uploadedCount = 0;

  const uploadResults = await parallelLimit(
    toUpload,
    concurrency,
    async (item, index) => {
      try {
        const result = await uploadListingImageDirect(item.preshrunkUri, token, uploadUrl);
        uploadedCount++;
        onProgress?.('uploading', uploadedCount, toUpload.length);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        const imgResult: ImageUploadResult = {
          url: result.fullKey,
          absoluteUrl: result.fullUrl,
          thumbUrl: result.thumbUrl,
        };
        options.onImageUploaded?.(item.uri, imgResult);
        return { success: true as const, result };
      } catch (err: any) {
        uploadedCount++;
        onProgress?.('uploading', uploadedCount, toUpload.length);
        options.onImageFailed?.(item.uri, err.message || 'Upload failed');
        return { success: false as const, error: err.message || `Upload failed` };
      }
    },
  );

  // 7. Collect results
  uploadResults.forEach((res, i) => {
    if (res.success) {
      uploaded.push({
        url: res.result.fullKey,
        absoluteUrl: res.result.fullUrl,
        thumbUrl: res.result.thumbUrl,
      });
    } else {
      errors.push(`Image ${i + 1}: ${res.error}`);
    }
  });

  // Show alert if some failed
  if (errors.length > 0 && uploaded.length > 0) {
    Alert.alert(
      'Partial Upload',
      `${uploaded.length} images uploaded, ${errors.length} failed.`,
      [{ text: 'OK' }],
    );
  } else if (errors.length > 0 && uploaded.length === 0) {
    Alert.alert(
      'Upload Failed',
      'Could not upload images. Please check your connection and try again.',
      [{ text: 'OK' }],
    );
  }

  return {
    success: uploaded.length > 0,
    images: uploaded,
    errors,
  };
}

// ─── Delete by URL ───────────────────────────────────────────────────────────

/**
 * Delete a listing image given its full URL (CDN or API-relative).
 * Also deletes the corresponding thumb if it's a _full image.
 *
 * Usage:
 * ```ts
 * await deleteListingImageByUrl('https://cdn.revvup.ae/listings/2026/02/xxx_full.jpg');
 * ```
 */
export async function deleteListingImageByUrl(url: string): Promise<void> {
  let key = url;

  // Strip CDN domain
  if (key.startsWith(CDN_BASE)) {
    key = key.replace(`${CDN_BASE}/`, '');
  }
  // Strip API base
  if (key.startsWith(API_BASE)) {
    key = key.replace(`${API_BASE}/`, '');
  }
  // Strip leading slash
  if (key.startsWith('/')) {
    key = key.slice(1);
  }
  // Strip query params
  if (key.includes('?')) {
    key = key.split('?')[0];
  }

  // Delete both full and thumb versions
  const deletePromises = [deleteListingImage(key)];
  
  // If this is a _full image, also delete the corresponding _thumb
  if (key.includes('_full.')) {
    const thumbKey = key.replace('_full.', '_thumb.');
    deletePromises.push(deleteListingImage(thumbKey).catch(() => {})); // Ignore if thumb doesn't exist
  }

  await Promise.all(deletePromises);
}

