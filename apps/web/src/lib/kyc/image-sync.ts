/**
 * KYC Image Sync Module
 * 
 * Downloads images from Didit's temporary S3 URLs and uploads them
 * to our permanent R2 private storage bucket.
 */

import { R2PrivateStorageProvider } from '@/lib/storage/private-provider';

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
 * Downloads an image from a URL and uploads it to R2 private storage
 */
async function downloadAndUploadImage(
  storage: R2PrivateStorageProvider,
  sourceUrl: string,
  r2Key: string
): Promise<string | null> {
  try {
    console.log(`[KYC/ImageSync] Downloading from: ${sourceUrl.substring(0, 100)}...`);
    
    // Download the image from Didit's S3
    const response = await fetch(sourceUrl, {
      headers: {
        'User-Agent': 'Alifh-KYC-Sync/1.0',
      },
    });

    if (!response.ok) {
      console.error(`[KYC/ImageSync] Failed to download image: ${response.status} ${response.statusText}`);
      return null;
    }

    // Get content type from response
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    
    // Get the image data as ArrayBuffer
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    console.log(`[KYC/ImageSync] Downloaded ${buffer.length} bytes, uploading to R2: ${r2Key}`);

    // Upload to R2 private bucket
    const result = await storage.upload({
      key: r2Key,
      data: buffer,
      contentType,
      metadata: {
        source: 'didit-kyc',
        syncedAt: new Date().toISOString(),
      },
    });

    console.log(`[KYC/ImageSync] Uploaded to R2: ${result.key}`);
    
    // Return the R2 key (not a URL - private bucket uses signed URLs)
    return result.key;
  } catch (error) {
    console.error(`[KYC/ImageSync] Error syncing image:`, error);
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
  
  try {
    const storage = new R2PrivateStorageProvider();
    const basePath = `kyc/${userId}/${sessionId}`;
    
    // Process all images in parallel for speed
    const tasks: Promise<void>[] = [];

    if (urls.documentFrontUrl) {
      tasks.push(
        downloadAndUploadImage(storage, urls.documentFrontUrl, `${basePath}/document-front.jpg`)
          .then(key => { if (key) result.documentFrontUrl = key; })
      );
    }

    if (urls.documentBackUrl) {
      tasks.push(
        downloadAndUploadImage(storage, urls.documentBackUrl, `${basePath}/document-back.jpg`)
          .then(key => { if (key) result.documentBackUrl = key; })
      );
    }

    if (urls.selfieUrl) {
      tasks.push(
        downloadAndUploadImage(storage, urls.selfieUrl, `${basePath}/selfie.jpg`)
          .then(key => { if (key) result.selfieUrl = key; })
      );
    }

    if (urls.faceSourceImage) {
      tasks.push(
        downloadAndUploadImage(storage, urls.faceSourceImage, `${basePath}/face-source.jpg`)
          .then(key => { if (key) result.faceSourceImage = key; })
      );
    }

    if (urls.faceTargetImage) {
      tasks.push(
        downloadAndUploadImage(storage, urls.faceTargetImage, `${basePath}/face-target.jpg`)
          .then(key => { if (key) result.faceTargetImage = key; })
      );
    }

    if (urls.livenessReferenceImage) {
      tasks.push(
        downloadAndUploadImage(storage, urls.livenessReferenceImage, `${basePath}/liveness-reference.jpg`)
          .then(key => { if (key) result.livenessReferenceImage = key; })
      );
    }

    // Wait for all uploads to complete
    await Promise.all(tasks);

    console.log(`[KYC/ImageSync] Synced ${Object.keys(result).length} images for user ${userId}`);
    
    return result;
  } catch (error) {
    console.error(`[KYC/ImageSync] Error during image sync:`, error);
    return result;
  }
}

/**
 * Generate a signed URL for a KYC image stored in R2
 * Use this when displaying KYC images in the admin panel
 */
export async function getKycImageSignedUrl(
  r2Key: string,
  expiresIn: number = 3600 // 1 hour default
): Promise<string | null> {
  try {
    const storage = new R2PrivateStorageProvider();
    return await storage.getSignedUrl(r2Key, { expiresIn });
  } catch (error) {
    console.error(`[KYC/ImageSync] Error generating signed URL:`, error);
    return null;
  }
}
