/**
 * API: Showroom Asset Upload
 * POST /api/storage/upload-showroom-asset
 * 
 * Purpose: Upload images and videos for Black tier showroom pages
 * Authentication: Required (must be Black tier partner admin/owner)
 * 
 * Request Body (multipart/form-data):
 * - file: Image file (JPEG, PNG, WebP, HEIC) or Video file (MP4, WebM, MOV)
 * - type: Asset type (hero-image, hero-video, founder-image, gallery, team-member, etc.)
 * - partnerId: Partner ID
 * - mediaType?: 'image' | 'video' (defaults to 'image')
 * - index?: Optional index for array-type assets (gallery, team, etc.)
 * 
 * Processing:
 * - Images: Auto-detects HEIC, converts to WebP, resizes, compresses
 * - Videos: Validates format and size (max 20MB), uploads to R2
 * - Stores under brands/{partnerId}/showroom/
 * 
 * Returns: { key, url, etag }
 */

import { NextRequest, NextResponse } from 'next/server';
import { uploadFile, deleteFile } from '@/lib/storage';
import { generateShowroomAssetKey, type ShowroomAssetType } from '@/lib/storage/keys';
import { processSingleImage, ImageValidationError, detectImageFormat, isValidImageFormat } from '@/lib/storage/image-processing';
import { getSessionUser } from '@/lib/auth/session-context';

export const runtime = 'nodejs';

// Allow up to 60MB body size for video uploads
export const maxDuration = 60; // 60 seconds timeout for large uploads

const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-m4v'];
const MAX_IMAGE_SIZE = 15 * 1024 * 1024; // 15MB for high-quality showroom images
const MAX_VIDEO_SIZE = 20 * 1024 * 1024; // 20MB for hero videos


// Asset type configurations (for images - videos are passed through without processing)
const ASSET_CONFIG: Record<ShowroomAssetType, { width: number; height: number; fit: 'cover' | 'inside'; quality: number }> = {
  'hero-video-thumb': { width: 1920, height: 1080, fit: 'cover', quality: 85 },
  'hero-image': { width: 1920, height: 1080, fit: 'cover', quality: 90 }, // Full HD hero
  'hero-video': { width: 1920, height: 1080, fit: 'cover', quality: 85 }, // Match hero-image dimensions
  'brand-story-video-thumb': { width: 1280, height: 720, fit: 'cover', quality: 85 },
  'brand-story-video': { width: 1280, height: 720, fit: 'cover', quality: 85 }, // Match brand-story-video-thumb
  'showroom-tour-video': { width: 1600, height: 1200, fit: 'inside', quality: 85 }, // Match gallery dimensions
  'founder-image': { width: 800, height: 800, fit: 'cover', quality: 85 }, // Square headshot
  'gallery': { width: 1600, height: 1200, fit: 'inside', quality: 85 }, // High-res gallery
  'exterior': { width: 1600, height: 1200, fit: 'inside', quality: 85 },
  'team-member': { width: 600, height: 600, fit: 'cover', quality: 85 }, // Square profile
  'achievement': { width: 400, height: 400, fit: 'inside', quality: 80 }, // Badge/trophy
  'client-logo': { width: 400, height: 200, fit: 'inside', quality: 80 }, // Logo (preserve aspect)
  'testimonial': { width: 400, height: 400, fit: 'cover', quality: 85 }, // Customer photo
  'press-logo': { width: 300, height: 100, fit: 'inside', quality: 80 }, // Publication logo
  'seo-image': { width: 1200, height: 630, fit: 'cover', quality: 85 }, // OG image standard
};

const VALID_ASSET_TYPES: ShowroomAssetType[] = [
  'hero-video-thumb',
  'hero-image',
  'hero-video',
  'brand-story-video-thumb',
  'brand-story-video',
  'showroom-tour-video',
  'founder-image',
  'gallery',
  'exterior',
  'team-member',
  'achievement',
  'client-logo',
  'testimonial',
  'press-logo',
  'seo-image',
];

// Video asset types
const VIDEO_ASSET_TYPES: ShowroomAssetType[] = [
  'hero-video',
  'brand-story-video',
  'showroom-tour-video',
];

export async function POST(req: NextRequest) {
  try {
    // Require authentication
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Must be a partner staff member
    if (!user.partnerMemberships?.length) {
      return NextResponse.json({ error: 'Not a partner member' }, { status: 403 });
    }
    
    const membership = user.partnerMemberships[0];
    
    // Must be Black tier
    if (membership.partnerTier !== 'black') {
      return NextResponse.json({ 
        error: 'Showroom assets are exclusive to Black tier partners' 
      }, { status: 403 });
    }
    
    // Must be owner or admin
    if (!['owner', 'admin'].includes(membership.staffRole)) {
      return NextResponse.json({ 
        error: 'Insufficient permissions' 
      }, { status: 403 });
    }
    
    
    const formData = await req.formData();
    const file = formData.get('file');
    const assetType = formData.get('type') as string;
    const partnerId = formData.get('partnerId') as string;
    const indexStr = formData.get('index') as string | null;
    const previousKey = formData.get('previousKey') as string | null;
    
    // Validate required fields
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    
    if (!assetType || !VALID_ASSET_TYPES.includes(assetType as ShowroomAssetType)) {
      return NextResponse.json({ 
        error: `Invalid asset type. Must be one of: ${VALID_ASSET_TYPES.join(', ')}` 
      }, { status: 400 });
    }
    
    if (!partnerId) {
      return NextResponse.json({ error: 'Partner ID required' }, { status: 400 });
    }
    
    // Verify partnerId matches session
    if (partnerId !== membership.partnerId) {
      return NextResponse.json({ error: 'Partner ID mismatch' }, { status: 403 });
    }
    
    // Determine if this is a video upload
    const mediaType = formData.get('mediaType') as string | null;
    const isVideo = mediaType === 'video' || VIDEO_ASSET_TYPES.includes(assetType as ShowroomAssetType);
    
    // Validate file size first
    if (isVideo) {
      if (file.size > MAX_VIDEO_SIZE) {
        return NextResponse.json({ 
          error: 'Video too large. Maximum 20MB allowed' 
        }, { status: 400 });
      }
    } else {
      if (file.size > MAX_IMAGE_SIZE) {
        return NextResponse.json({ 
          error: 'File too large. Maximum 15MB allowed' 
        }, { status: 400 });
      }
    }
    
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Validate file type (use magic bytes for images, MIME type for videos)
    if (isVideo) {
      if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
        return NextResponse.json({ 
          error: 'Invalid video type. Allowed: MP4, WebM, MOV' 
        }, { status: 400 });
      }
    } else {
      // Detect actual format from magic bytes (mobile often mislabels HEIC as JPEG)
      const detectedFormat = detectImageFormat(buffer);
      if (!isValidImageFormat(detectedFormat)) {
        return NextResponse.json({ 
          error: 'Invalid file type. Allowed: JPEG, PNG, WebP, HEIC' 
        }, { status: 400 });
      }
    }
    
    let processedBuffer: Buffer;
    let contentType: string;
    let fileExtension: string;
    
    if (isVideo) {
      // For videos, we store as-is (no server-side compression to keep it simple)
      // Client should compress before upload if needed
      processedBuffer = buffer;
      
      // Determine content type and extension
      switch (file.type) {
        case 'video/mp4':
          contentType = 'video/mp4';
          fileExtension = 'mp4';
          break;
        case 'video/webm':
          contentType = 'video/webm';
          fileExtension = 'webm';
          break;
        case 'video/quicktime':
        case 'video/x-m4v':
          contentType = 'video/mp4';
          fileExtension = 'mp4';
          break;
        default:
          contentType = 'video/mp4';
          fileExtension = 'mp4';
      }
    } else {
      // Process image with validation, HEIC conversion, sharpening and WebP output
      const config = ASSET_CONFIG[assetType as ShowroomAssetType];
      const { buffer: processed } = await processSingleImage(buffer, {
        maxWidth: config.width,
        maxHeight: config.height,
        fit: config.fit,
        position: 'center',
        quality: config.quality,
        sharpen: 0.5,
      });
      processedBuffer = processed;
      
      contentType = 'image/webp';
      fileExtension = 'webp';
    }
    
    // Generate unique storage key
    const index = indexStr ? parseInt(indexStr, 10) : undefined;
    const key = generateShowroomAssetKey({
      partnerId,
      type: assetType as ShowroomAssetType,
      index,
      extension: fileExtension,
    });
    
    // Upload to R2
    const result = await uploadFile({
      data: processedBuffer,
      contentType,
      key,
      cacheControl: isVideo 
        ? 'public, max-age=604800' // 1 week for videos
        : 'public, max-age=31536000, immutable', // 1 year for images
    });
    
    // Delete old image if provided (async, don't block response)
    if (previousKey?.startsWith('brands/')) {
      deleteFile(previousKey).catch((err) => {
        console.warn(`[upload-showroom-asset] Failed to delete old image: ${previousKey}`, err);
      });
    }
    
    return NextResponse.json({
      key: result.key,
      url: result.url,
      etag: result.etag,
      type: assetType,
      index,
    });
    
  } catch (error) {
    // Handle validation errors with appropriate status codes
    if (error instanceof ImageValidationError) {
      const status = error.code === 'FILE_TOO_LARGE' ? 413 
        : error.code === 'TOO_MANY_PIXELS' ? 413 
        : 400;
      return NextResponse.json({ error: error.message }, { status });
    }
    console.error('[storage/upload-showroom-asset] POST failed', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
