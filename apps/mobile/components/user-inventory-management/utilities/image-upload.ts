/**
 * Image Upload Utility — User Inventory Management
 *
 * Wraps expo-image-picker + sellCarUserApi.uploadImage / deleteImage
 * into a single-call convenience function for the create & edit flows.
 *
 * All images are uploaded to R2 via the server which converts to WebP.
 * The returned URL is a CDN-served public path.
 */

import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { Alert, Platform } from 'react-native';
import {
  uploadListingImage,
  deleteListingImage,
  type ImageUploadResult,
} from '@/lib/sell-car-user-api';
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
  /** Max number of images when allowMultiple=true. @default 20 */
  maxImages?: number;
  /** Callback for progress tracking (index, total) */
  onProgress?: (uploaded: number, total: number) => void;
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

// ─── Pick & Upload ───────────────────────────────────────────────────────────

/**
 * Opens the image picker, lets the user select image(s),
 * uploads each to R2 via the listing-image endpoint,
 * and returns the resulting CDN URLs.
 *
 * Usage:
 * ```ts
 * const result = await pickAndUploadListingImage({
 *   vin: 'WBAPH5C55BA237842',
 *   allowMultiple: true,
 *   onProgress: (done, total) => setProgress(`${done}/${total}`),
 * });
 * if (result.success) {
 *   setImages(prev => [...prev, ...result.images]);
 * }
 * ```
 */
export async function pickAndUploadListingImage(
  options: PickAndUploadOptions,
): Promise<PickAndUploadResult> {
  const { vin, allowMultiple = false, maxImages = 20, onProgress } = options;

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
    quality: 0.9,
    exif: false,
  });

  if (pickerResult.canceled || !pickerResult.assets?.length) {
    return { success: false, images: [], errors: [] };
  }

  const assets = pickerResult.assets;
  const uploaded: ImageUploadResult[] = [];
  const errors: string[] = [];

  // 3. Upload sequentially (avoids overwhelming the server)
  for (let i = 0; i < assets.length; i++) {
    const asset = assets[i];
    try {
      const result = await uploadListingImage(asset.uri, vin, asset.fileName ?? undefined);
      uploaded.push(result);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (err: any) {
      errors.push(err.message ?? `Failed to upload image ${i + 1}`);
    }
    onProgress?.(i + 1, assets.length);
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
 * Extracts the R2 key from the URL and calls the delete API.
 *
 * Usage:
 * ```ts
 * await deleteListingImageByUrl('https://cdn.alifh.ae/listings/VIN/photo.webp');
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

  await deleteListingImage(key);
}
