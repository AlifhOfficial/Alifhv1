/**
 * Image Upload Utility — User Inventory Management
 *
 * WhatsApp-like speed using:
 * 1. Client-side native compression (react-native-compressor)
 * 2. Parallel uploads (5 concurrent)
 * 3. Direct R2 storage (no server processing)
 *
 * Targets:
 * - Thumb: 480px, ~20-25KB
 * - Full: 1400px, ~45-55KB
 * - Total time: ~3-5s for 10 images
 */

import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { Alert, Platform } from 'react-native';
import {
  uploadListingImageDirect,
  deleteListingImage,
  type DirectListingUploadResult,
} from '@/lib/sell-car-user-api';
import { compressListingImage, type ListingImagePair } from '@/lib/image-compress';
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
    quality: 1, // Full quality - we compress client-side
    exif: false,
  });

  if (pickerResult.canceled || !pickerResult.assets?.length) {
    return { success: false, images: [], errors: [] };
  }

  const assets = pickerResult.assets;
  const uploaded: ImageUploadResult[] = [];
  const errors: string[] = [];

  // 3. Compress all images in parallel (native C++, fast)
  let compressedCount = 0;
  const compressed: Array<{ uri: string; pair: ListingImagePair } | { uri: string; error: string }> = [];

  try {
    const compressionResults = await Promise.all(
      assets.map(async (asset) => {
        try {
          const pair = await compressListingImage(asset.uri);
          compressedCount++;
          onProgress?.('compressing', compressedCount, assets.length);
          return { uri: asset.uri, pair };
        } catch (err: any) {
          compressedCount++;
          onProgress?.('compressing', compressedCount, assets.length);
          return { uri: asset.uri, error: err.message || 'Compression failed' };
        }
      }),
    );
    compressed.push(...compressionResults);
  } catch (err: any) {
    return { success: false, images: [], errors: ['Compression failed: ' + (err.message || 'Unknown error')] };
  }

  // 4. Filter successful compressions
  const toUpload = compressed.filter((c): c is { uri: string; pair: ListingImagePair } => 'pair' in c);
  const compressionErrors = compressed.filter((c): c is { uri: string; error: string } => 'error' in c);
  compressionErrors.forEach((c, i) => errors.push(`Image ${i + 1}: ${c.error}`));

  if (toUpload.length === 0) {
    return { success: false, images: [], errors };
  }

  // 5. Upload in parallel with concurrency limit
  let uploadedCount = 0;

  const uploadResults = await parallelLimit(
    toUpload,
    concurrency,
    async (item, index) => {
      try {
        const result = await uploadListingImageDirect(
          item.pair.thumb.uri,
          item.pair.full.uri,
          vin,
        );
        uploadedCount++;
        onProgress?.('uploading', uploadedCount, toUpload.length);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        return { success: true as const, result };
      } catch (err: any) {
        uploadedCount++;
        onProgress?.('uploading', uploadedCount, toUpload.length);
        return { success: false as const, error: err.message || `Upload failed` };
      }
    },
  );

  // 6. Collect results
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

