/**
 * Unified Presigned Upload API
 * POST /api/storage/presigned
 * 
 * Single endpoint for presigned R2 uploads.
 * Bypasses Vercel's 4.5MB serverless body limit.
 * 
 * Upload Types:
 * - listing: Car listing photos → processed to thumb (480w) + full (2000w)
 * - avatar: Profile photos → processed to 512x512 square
 * - partner: Partner logo/hero → logo: 512x512, hero: 1920x600
 * - showroom: Black tier showroom assets (images & videos)
 * 
 * Flow:
 * 1. POST here → get presigned uploadUrl + rawKey
 * 2. PUT directly to uploadUrl (client → R2, instant)
 * 3. POST /api/storage/process with rawKey → get processed CDN URL(s)
 * 
 * For showroom VIDEOS: No processing needed, goes direct to CDN.
 */

import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { getSessionUser } from '@/lib/auth/session-context';
import { createId } from '@paralleldrive/cuid2';

export const runtime = 'nodejs';

// ============================================================================
// Configuration
// ============================================================================

type UploadType = 'listing' | 'avatar' | 'partner' | 'showroom';

const ALLOWED_IMAGE_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/heic': 'heic',
  'image/heif': 'heif',
};

const ALLOWED_VIDEO_TYPES: Record<string, string> = {
  'video/mp4': 'mp4',
  'video/webm': 'webm',
  'video/quicktime': 'mp4',
};

// Max raw upload sizes (generous - processing will compress)
const MAX_SIZES: Record<UploadType, number> = {
  listing: 30 * 1024 * 1024,   // 30MB - phone photos can be large
  avatar: 15 * 1024 * 1024,    // 15MB
  partner: 20 * 1024 * 1024,   // 20MB
  showroom: 100 * 1024 * 1024, // 100MB for videos
};

// Showroom video types (direct upload, no processing)
const SHOWROOM_VIDEO_TYPES = ['hero-video', 'brand-story-video', 'showroom-tour-video'];

// Showroom asset types (Black tier only)
const SHOWROOM_ASSET_TYPES = [
  'hero-video', 'hero-image', 'founder-image', 'gallery',
  'team-member', 'brand-story-video', 'showroom-tour-video',
];

// ============================================================================
// Key Generation
// ============================================================================

function generateRawKey(type: UploadType, userId: string, ext: string, meta: Record<string, string>, isVideo: boolean = false): string {
  const ts = Date.now();
  const id = createId();
  
  if (type === 'listing') {
    // raw/listing/{userId}/{vin}/{ts}-{id}.{ext}
    return `raw/listing/${userId.slice(0, 8)}/${meta.vin || 'unknown'}/${ts}-${id}.${ext}`;
  }
  if (type === 'avatar') {
    // raw/avatar/{userId}/{ts}-{id}.{ext}
    return `raw/avatar/${userId}/${ts}-${id}.${ext}`;
  }
  if (type === 'partner') {
    // raw/partner/{partnerId}/{imageType}/{ts}-{id}.{ext}
    return `raw/partner/${meta.partnerId}/${meta.imageType || 'logo'}/${ts}-${id}.${ext}`;
  }
  
  // Showroom assets
  const now = new Date();
  const datePath = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')}`;
  
  if (isVideo) {
    // Videos go DIRECT to final location (no processing needed)
    return `brands/${meta.partnerId}/showroom/${datePath}/${meta.assetType}-${ts}-${id}.${ext}`;
  }
  
  // Showroom IMAGES go to raw/ prefix for processing (compression, WebP conversion)
  return `raw/showroom/${meta.partnerId}/${meta.assetType}/${ts}-${id}.${ext}`;
}

// ============================================================================
// Route Handler
// ============================================================================

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { type, contentType, vin, partnerId, imageType, assetType } = body;

    // Validate type
    if (!type || !['listing', 'avatar', 'partner', 'showroom'].includes(type)) {
      return NextResponse.json({ error: 'Invalid type. Use: listing, avatar, partner, showroom' }, { status: 400 });
    }

    // Determine if video (showroom only)
    const isVideo = type === 'showroom' && SHOWROOM_VIDEO_TYPES.includes(assetType);
    
    // Validate content type
    const allowedTypes = isVideo ? ALLOWED_VIDEO_TYPES : ALLOWED_IMAGE_TYPES;
    if (!contentType || !allowedTypes[contentType]) {
      const allowed = Object.keys(allowedTypes).join(', ');
      return NextResponse.json({ error: `Invalid contentType. Allowed: ${allowed}` }, { status: 400 });
    }

    // Type-specific validation
    if (type === 'listing' && (!vin || vin.length < 11)) {
      return NextResponse.json({ error: 'Valid VIN required for listing uploads' }, { status: 400 });
    }
    
    if (type === 'partner') {
      if (!partnerId) return NextResponse.json({ error: 'partnerId required' }, { status: 400 });
      if (!imageType || !['logo', 'hero'].includes(imageType)) {
        return NextResponse.json({ error: 'imageType must be logo or hero' }, { status: 400 });
      }
    }
    
    if (type === 'showroom') {
      if (!partnerId) return NextResponse.json({ error: 'partnerId required' }, { status: 400 });
      if (!assetType || !SHOWROOM_ASSET_TYPES.includes(assetType)) {
        return NextResponse.json({ error: `Invalid assetType. Use: ${SHOWROOM_ASSET_TYPES.join(', ')}` }, { status: 400 });
      }
      // Must be Black tier partner
      const membership = user.partnerMemberships?.find(m => m.partnerId === partnerId);
      if (!membership || membership.partnerTier !== 'black') {
        return NextResponse.json({ error: 'Showroom requires Black tier' }, { status: 403 });
      }
      if (!['owner', 'admin'].includes(membership.staffRole)) {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
      }
    }

    // R2 config
    const bucketName = process.env.R2_BUCKET_NAME;
    const accessKeyId = process.env.R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
    const accountId = process.env.R2_ACCOUNT_ID;
    const endpoint = process.env.R2_ENDPOINT || `https://${accountId}.r2.cloudflarestorage.com`;

    if (!bucketName || !accessKeyId || !secretAccessKey || !endpoint) {
      console.error('[presigned] R2 not configured');
      return NextResponse.json({ error: 'Storage not configured' }, { status: 500 });
    }

    const client = new S3Client({
      region: 'auto',
      endpoint,
      credentials: { accessKeyId, secretAccessKey },
    });

    const ext = allowedTypes[contentType];
    const rawKey = generateRawKey(type as UploadType, user.id, ext, { vin, partnerId, imageType, assetType }, isVideo);
    
    // For showroom videos, go direct with heavy caching
    // For everything else, raw upload → process later
    const cacheControl = (type === 'showroom' && isVideo)
      ? 'public, max-age=31536000, immutable'
      : undefined;

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: rawKey,
      ContentType: contentType,
      ...(cacheControl && { CacheControl: cacheControl }),
    });

    const uploadUrl = await getSignedUrl(client, command, { expiresIn: 600 });

    return NextResponse.json({
      uploadUrl,
      rawKey,
      expiresIn: 600,
      maxSize: MAX_SIZES[type as UploadType],
      requiresProcessing: !isVideo, // Videos go direct, images need processing
    });

  } catch (error) {
    console.error('[storage/presigned] Error:', error);
    return NextResponse.json({ error: 'Failed to generate upload URL' }, { status: 500 });
  }
}
