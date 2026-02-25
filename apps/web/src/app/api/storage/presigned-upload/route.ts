/**
 * API: Presigned Upload URL
 * POST /api/storage/presigned-upload
 * 
 * Purpose: Generate presigned PUT URLs for direct R2 uploads from browser
 * This bypasses Vercel's 4.5MB body size limit for serverless functions.
 * 
 * Authentication: Required (must be Black tier partner admin/owner for showroom assets)
 * 
 * Request Body (JSON):
 * - type: Asset type (hero-video, brand-story-video, etc.)
 * - partnerId: Partner ID
 * - contentType: MIME type of the file
 * - extension: File extension (mp4, webm, etc.)
 * - previousKey?: Optional key of file to delete after upload
 * 
 * Returns: { uploadUrl, key, expiresIn }
 * 
 * Client Usage:
 * 1. POST to this endpoint to get uploadUrl and key
 * 2. PUT the file directly to uploadUrl with Content-Type header
 * 3. Save the key to the database via PATCH /api/partner/showroom
 */

import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { getSessionUser } from '@/lib/auth/session-context';
import { generateShowroomAssetKey, type ShowroomAssetType } from '@/lib/storage/keys';
import { deleteFile } from '@/lib/storage';

export const runtime = 'nodejs';

const VALID_ASSET_TYPES: ShowroomAssetType[] = [
  'hero-video',
  'hero-video-thumb',
  'brand-story-video',
  'brand-story-video-thumb',
  'showroom-tour-video',
];

const ALLOWED_VIDEO_TYPES: Record<string, string> = {
  'video/mp4': 'mp4',
  'video/webm': 'webm',
  'video/quicktime': 'mp4',
  'video/x-m4v': 'mp4',
};

// 50MB limit to control CDN bandwidth costs
// Users should compress to 720p/1080p before upload
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB

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
    
    const body = await req.json();
    const { type, partnerId, contentType, previousKey } = body;
    
    // Validate required fields
    if (!type || !VALID_ASSET_TYPES.includes(type as ShowroomAssetType)) {
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
    
    if (!contentType || !ALLOWED_VIDEO_TYPES[contentType]) {
      return NextResponse.json({ 
        error: 'Invalid content type. Allowed: MP4, WebM, MOV' 
      }, { status: 400 });
    }
    
    // Get R2 configuration
    const bucketName = process.env.R2_BUCKET_NAME;
    const accessKeyId = process.env.R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
    const accountId = process.env.R2_ACCOUNT_ID;
    const endpoint = process.env.R2_ENDPOINT || (accountId ? `https://${accountId}.r2.cloudflarestorage.com` : undefined);
    
    if (!bucketName || !accessKeyId || !secretAccessKey || !endpoint) {
      console.error('[presigned-upload] R2 not configured');
      return NextResponse.json({ error: 'Storage not configured' }, { status: 500 });
    }
    
    // Create S3 client
    const client = new S3Client({
      region: 'auto',
      endpoint,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
    
    // Generate storage key
    const extension = ALLOWED_VIDEO_TYPES[contentType];
    const key = generateShowroomAssetKey({
      partnerId,
      type: type as ShowroomAssetType,
      extension,
    });
    
    // Create presigned PUT URL with aggressive CDN caching
    // Videos are immutable once uploaded (key contains unique ID)
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      ContentType: contentType,
      CacheControl: 'public, max-age=31536000, immutable', // 1 year, immutable for CDN
    });
    
    const uploadUrl = await getSignedUrl(client, command, {
      expiresIn: 600, // 10 minutes to complete upload
    });
    
    // Schedule deletion of previous file (async, don't block)
    if (previousKey?.startsWith('brands/')) {
      deleteFile(previousKey).catch((err) => {
        console.warn(`[presigned-upload] Failed to delete old file: ${previousKey}`, err);
      });
    }
    
    return NextResponse.json({
      uploadUrl,
      key,
      expiresIn: 600,
      maxSize: MAX_VIDEO_SIZE,
    });
    
  } catch (error) {
    console.error('[storage/presigned-upload] POST failed', error);
    return NextResponse.json({ error: 'Failed to generate upload URL' }, { status: 500 });
  }
}
