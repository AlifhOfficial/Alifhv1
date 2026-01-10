/**
 * KYC Image Sync Module
 * 
 * Downloads images from Didit's temporary S3 URLs and uploads them
 * to our permanent R2 private storage bucket.
 * 
 * Security:
 * - Images are stored in a private R2 bucket (not publicly accessible)
 * - Access requires signed URLs with short expiration times
 * - Images are compressed but quality preserved for verification purposes
 */

import { R2PrivateStorageProvider } from '@/lib/storage/private-provider';
import sharp from 'sharp';

// Singleton storage provider
let storageProvider: R2PrivateStorageProvider | null = null;
function getStorageProvider(): R2PrivateStorageProvider {
  if (!storageProvider) storageProvider = new R2PrivateStorageProvider();
  return storageProvider;
}

// KYC images need good quality for verification but should be optimized for storage
const KYC_IMAGE_CONFIG = {
  maxWidth: 2000,        // Max dimension - enough for ID document clarity
  maxHeight: 2000,
  quality: 85,           // High quality for ID verification
  format: 'webp' as const, // Modern format with good compression
};

interface ImageSyncResult {
  documentFrontUrl?: string;
  documentBackUrl?: string;
  selfieUrl?: string;
  faceSourceImage?: string;
  faceTargetImage?: string;
  livenessReferenceImage?: string;
}

interface DiditImageUrls {
  documentFrontUrl?: string | null;
  documentBackUrl?: string | null;
  selfieUrl?: string | null;
  faceSourceImage?: string | null;
  faceTargetImage?: string | null;
  livenessReferenceImage?: string | null;
}

/**
 * Downloads an image from a URL, compresses it, and uploads to R2 private storage
 */
async function downloadAndUploadImage(
  sourceUrl: string,
  r2Key: string
): Promise<string | null> {
  try {
    const response = await fetch(sourceUrl, {
      headers: { 'User-Agent': 'Alifh-KYC-Sync/1.0' },
    });

    if (!response.ok) return null;

    const arrayBuffer = await response.arrayBuffer();
    const originalBuffer = Buffer.from(arrayBuffer);

    const processedBuffer = await sharp(originalBuffer)
      .resize(KYC_IMAGE_CONFIG.maxWidth, KYC_IMAGE_CONFIG.maxHeight, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: KYC_IMAGE_CONFIG.quality })
      .toBuffer();

    const webpKey = r2Key.replace(/\.(jpg|jpeg|png)$/i, '.webp');

    const result = await getStorageProvider().upload({
      key: webpKey,
      data: processedBuffer,
      contentType: 'image/webp',
      metadata: {
        source: 'didit-kyc',
        syncedAt: new Date().toISOString(),
      },
    });

    return result.key;
  } catch {
    return null;
  }
}

/**
 * Syncs all KYC images from Didit's temporary S3 URLs to our R2 private bucket.
 * Returns the R2 keys for each image.
 * 
 * @param userId - The user ID for organizing files
 * @param sessionId - The Didit session ID
 * @param urls - Object containing all Didit image URLs
 */
export async function syncKycImagesToR2(
  userId: string,
  sessionId: string,
  urls: DiditImageUrls
): Promise<ImageSyncResult> {
  const result: ImageSyncResult = {};
  const basePath = `kyc/${userId}/${sessionId}`;
  
  const tasks: Promise<void>[] = [];

  if (urls.documentFrontUrl) {
    tasks.push(
      downloadAndUploadImage(urls.documentFrontUrl, `${basePath}/document-front.jpg`)
        .then(key => { if (key) result.documentFrontUrl = key; })
    );
  }

  if (urls.documentBackUrl) {
    tasks.push(
      downloadAndUploadImage(urls.documentBackUrl, `${basePath}/document-back.jpg`)
        .then(key => { if (key) result.documentBackUrl = key; })
    );
  }

  if (urls.selfieUrl) {
    tasks.push(
      downloadAndUploadImage(urls.selfieUrl, `${basePath}/selfie.jpg`)
        .then(key => { if (key) result.selfieUrl = key; })
    );
  }

  if (urls.faceSourceImage) {
    tasks.push(
      downloadAndUploadImage(urls.faceSourceImage, `${basePath}/face-source.jpg`)
        .then(key => { if (key) result.faceSourceImage = key; })
    );
  }

  if (urls.faceTargetImage) {
    tasks.push(
      downloadAndUploadImage(urls.faceTargetImage, `${basePath}/face-target.jpg`)
        .then(key => { if (key) result.faceTargetImage = key; })
    );
  }

  if (urls.livenessReferenceImage) {
    tasks.push(
      downloadAndUploadImage(urls.livenessReferenceImage, `${basePath}/liveness-reference.jpg`)
        .then(key => { if (key) result.livenessReferenceImage = key; })
    );
  }

  await Promise.all(tasks);
  return result;
}

/**
 * Generate a signed URL for a KYC image stored in R2
 */
export async function getKycImageSignedUrl(
  r2Key: string,
  expiresIn: number = 3600
): Promise<string | null> {
  try {
    return await getStorageProvider().getSignedUrl(r2Key, { expiresIn });
  } catch {
    return null;
  }
}
