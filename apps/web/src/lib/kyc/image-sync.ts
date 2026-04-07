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

function isPrivateIpv4(hostname: string): boolean {
  const parts = hostname.split('.').map(n => Number(n));
  if (parts.length !== 4 || parts.some(n => Number.isNaN(n) || n < 0 || n > 255)) return false;

  const [a, b] = parts;
  if (a === 10) return true;
  if (a === 127) return true;
  if (a === 0) return true;
  if (a === 169 && b === 254) return true;
  if (a === 192 && b === 168) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 100 && b >= 64 && b <= 127) return true;
  return false;
}

function isLocalOrPrivateHost(hostname: string): boolean {
  const lower = hostname.toLowerCase();
  if (lower === 'localhost' || lower.endsWith('.localhost')) return true;
  if (lower === '::1') return true;
  if (/^\d+\.\d+\.\d+\.\d+$/.test(lower)) return isPrivateIpv4(lower);
  if (lower.includes(':')) {
    if (lower.startsWith('fe80:')) return true; // link-local
    if (lower.startsWith('fc') || lower.startsWith('fd')) return true; // ULA
  }
  return false;
}

function getAllowedImageUrl(rawUrl: string): URL | null {
  try {
    const url = new URL(rawUrl);
    if (url.protocol !== 'https:') return null;
    if (isLocalOrPrivateHost(url.hostname)) return null;

    const configuredHosts = (process.env.DIDIT_IMAGE_HOSTS || process.env.DIDIT_IMAGE_HOST || '')
      .split(',')
      .map(h => h.trim().toLowerCase())
      .filter(Boolean);

    // Default to known Didit domains only; any broader hosts (for example S3 buckets)
    // must be explicitly configured via environment variables.
    const defaultAllowSuffixes = ['didit.me', 'didit.ai'];
    const allowedHosts = configuredHosts.length > 0 ? configuredHosts : defaultAllowSuffixes;

    // Find hostname match from allowlist only
    // This ensures hostname selection comes from allowlist, not user input
    let allowedHostname: string | null = null;
    for (const host of allowedHosts) {
      if (url.hostname === host || url.hostname.endsWith(`.${host}`)) {
        allowedHostname = host;
        break;
      }
    }

    if (!allowedHostname) return null;

    // Basic path traversal protection: reject any ".." segment in the path
    const pathSegments = url.pathname.split('/');
    if (pathSegments.some(segment => segment === '..')) return null;

    // Simple additional sanity check on the path to avoid obviously malformed URLs
    if (!url.pathname.startsWith('/')) return null;
    
    // Extract path and search from user input
    const pathAndSearch = url.pathname + url.search;
    
    // Construct URL using allowlist hostname with user-provided path
    // Hostname and protocol come from allowlist, only path/search from user input
    const safeUrl = new URL(`https://${allowedHostname}${pathAndSearch}`);
    
    return safeUrl;
  } catch {
    return null;
  }
}

/**
 * Downloads an image from a URL, compresses it, and uploads to R2 private storage
 */
async function downloadAndUploadImage(
  sourceUrl: string,
  r2Key: string
): Promise<string | null> {
  try {
    const allowedUrl = getAllowedImageUrl(sourceUrl);
    if (!allowedUrl) return null;

    const response = await fetch(allowedUrl.toString(), {
      headers: { 'User-Agent': 'Revvup-KYC-Sync/1.0' },
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
