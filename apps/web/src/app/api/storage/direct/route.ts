/**
 * Direct Upload API (No Server Processing)
 * POST /api/storage/direct
 * 
 * Accepts pre-compressed images from clients and stores directly to R2.
 * No server-side processing — client handles all compression.
 * 
 * This is the fast path for WhatsApp-like upload speeds.
 * 
 * Upload Types:
 * - listing: Returns presigned URLs for thumb + full (2 files)
 * - avatar: Returns single presigned URL
 * - showroom: Returns single presigned URL
 * 
 * Flow:
 * 1. POST here → get presigned URL(s) + final key(s)
 * 2. PUT directly to presigned URL(s)
 * 3. Done! URLs are immediately CDN-ready
 * 
 * Max sizes enforced (client should compress to these):
 * - Thumb: 50KB
 * - Full: 100KB
 * - Avatar: 50KB
 * - Showroom: 200KB
 */

import { NextRequest, NextResponse } from 'next/server';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { getSessionUser } from '@/lib/auth/session-context';
import { getR2Client, getR2Bucket, getCdnUrl } from '@/lib/storage/r2-client';
import { createId } from '@paralleldrive/cuid2';

export const runtime = 'nodejs';

// ============================================================================
// Configuration
// ============================================================================

type UploadType = 'listing' | 'avatar' | 'showroom' | 'partner';

// Max sizes for pre-compressed images (allow some headroom above targets)
const MAX_SIZES = {
  listing_thumb: 120 * 1024,     // 120KB (target 80KB)
  listing_full: 200 * 1024,      // 200KB (target 150KB)
  avatar: 60 * 1024,             // 60KB (target 40KB)
  showroom: 250 * 1024,          // 250KB
  partner_logo: 60 * 1024,       // 60KB (target 40KB)
  partner_hero: 150 * 1024,      // 150KB (target 120KB)
};

// Allowed compressed image types
const ALLOWED_TYPES = ['image/jpeg', 'image/webp', 'image/png'];

// CDN cache headers (1 year immutable)
const CDN_CACHE = 'public, max-age=31536000, immutable';

// Showroom asset types
const SHOWROOM_ASSET_TYPES = [
  'hero-image', 'founder-image', 'gallery', 'team-member',
];

// Partner image types
const PARTNER_IMAGE_TYPES = ['logo', 'hero'];

// ============================================================================
// Key Generation — Final paths (no raw/ prefix, no processing needed)
// ============================================================================

function getDatePath(): string {
  const now = new Date();
  return `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')}`;
}

function generateListingKeys(userId: string, vin: string): { thumbKey: string; fullKey: string } {
  const datePath = getDatePath();
  const id = createId();
  const prefix = `listings/${datePath}/${userId.slice(0, 8)}/${vin}/${id}`;
  return {
    thumbKey: `${prefix}_thumb.jpg`,
    fullKey: `${prefix}_full.jpg`,
  };
}

function generateAvatarKey(userId: string): string {
  const datePath = getDatePath();
  const ts = Date.now();
  return `users/${userId}/${datePath}/avatar-${ts}.jpg`;
}

function generateShowroomKey(partnerId: string, assetType: string): string {
  const datePath = getDatePath();
  const ts = Date.now();
  const id = createId();
  return `brands/${partnerId}/showroom/${datePath}/${assetType}-${ts}-${id}.jpg`;
}

function generatePartnerKey(partnerId: string, imageType: string): string {
  const datePath = getDatePath();
  const ts = Date.now();
  return `brands/${partnerId}/${datePath}/${imageType}-${ts}.jpg`;
}

// ============================================================================
// Main Handler
// ============================================================================

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { type, vin, partnerId, assetType, imageType } = body;

    // Validate upload type
    if (!type || !['listing', 'avatar', 'showroom', 'partner'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid type. Use: listing, avatar, showroom, partner' },
        { status: 400 }
      );
    }

    const client = getR2Client();
    const bucketName = getR2Bucket();
    const cdnUrl = getCdnUrl();

    // ─── Listing: Return 2 presigned URLs (thumb + full) ───────────────────

    if (type === 'listing') {
      if (!vin || vin.length < 11) {
        return NextResponse.json(
          { error: 'Valid VIN required (min 11 chars)' },
          { status: 400 }
        );
      }

      const { thumbKey, fullKey } = generateListingKeys(user.id, vin);

      const [thumbUploadUrl, fullUploadUrl] = await Promise.all([
        getSignedUrl(
          client,
          new PutObjectCommand({
            Bucket: bucketName,
            Key: thumbKey,
            ContentType: 'image/jpeg',
            CacheControl: CDN_CACHE,
          }),
          { expiresIn: 600 }
        ),
        getSignedUrl(
          client,
          new PutObjectCommand({
            Bucket: bucketName,
            Key: fullKey,
            ContentType: 'image/jpeg',
            CacheControl: CDN_CACHE,
          }),
          { expiresIn: 600 }
        ),
      ]);

      return NextResponse.json({
        thumbUploadUrl,
        thumbKey,
        thumbUrl: `${cdnUrl}/${thumbKey}`,
        thumbMaxSize: MAX_SIZES.listing_thumb,
        fullUploadUrl,
        fullKey,
        fullUrl: `${cdnUrl}/${fullKey}`,
        fullMaxSize: MAX_SIZES.listing_full,
        expiresIn: 600,
      });
    }

    // ─── Avatar: Single presigned URL ──────────────────────────────────────

    if (type === 'avatar') {
      const key = generateAvatarKey(user.id);

      const uploadUrl = await getSignedUrl(
        client,
        new PutObjectCommand({
          Bucket: bucketName,
          Key: key,
          ContentType: 'image/jpeg',
          CacheControl: CDN_CACHE,
        }),
        { expiresIn: 600 }
      );

      return NextResponse.json({
        uploadUrl,
        key,
        url: `${cdnUrl}/${key}`,
        maxSize: MAX_SIZES.avatar,
        expiresIn: 600,
      });
    }

    // ─── Partner: Single presigned URL (logo or hero) ──────────────────────

    if (type === 'partner') {
      if (!partnerId) {
        return NextResponse.json({ error: 'partnerId required' }, { status: 400 });
      }
      if (!imageType || !PARTNER_IMAGE_TYPES.includes(imageType)) {
        return NextResponse.json(
          { error: `Invalid imageType. Use: ${PARTNER_IMAGE_TYPES.join(', ')}` },
          { status: 400 }
        );
      }

      // Check user has partner access
      const membership = user.partnerMemberships?.find(m => m.partnerId === partnerId);
      if (!membership || !['owner', 'admin'].includes(membership.staffRole)) {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
      }

      const key = generatePartnerKey(partnerId, imageType);
      const maxSize = imageType === 'logo' ? MAX_SIZES.partner_logo : MAX_SIZES.partner_hero;

      const uploadUrl = await getSignedUrl(
        client,
        new PutObjectCommand({
          Bucket: bucketName,
          Key: key,
          ContentType: 'image/jpeg',
          CacheControl: CDN_CACHE,
        }),
        { expiresIn: 600 }
      );

      return NextResponse.json({
        uploadUrl,
        key,
        url: `${cdnUrl}/${key}`,
        maxSize,
        expiresIn: 600,
      });
    }

    // ─── Showroom: Single presigned URL ────────────────────────────────────

    if (type === 'showroom') {
      if (!partnerId) {
        return NextResponse.json({ error: 'partnerId required' }, { status: 400 });
      }
      if (!assetType || !SHOWROOM_ASSET_TYPES.includes(assetType)) {
        return NextResponse.json(
          { error: `Invalid assetType. Use: ${SHOWROOM_ASSET_TYPES.join(', ')}` },
          { status: 400 }
        );
      }

      // Check Black tier (showroom requires it)
      const membership = user.partnerMemberships?.find(m => m.partnerId === partnerId);
      if (!membership || membership.partnerTier !== 'black') {
        return NextResponse.json({ error: 'Showroom requires Black tier' }, { status: 403 });
      }
      if (!['owner', 'admin'].includes(membership.staffRole)) {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
      }

      const key = generateShowroomKey(partnerId, assetType);

      const uploadUrl = await getSignedUrl(
        client,
        new PutObjectCommand({
          Bucket: bucketName,
          Key: key,
          ContentType: 'image/jpeg',
          CacheControl: CDN_CACHE,
        }),
        { expiresIn: 600 }
      );

      return NextResponse.json({
        uploadUrl,
        key,
        url: `${cdnUrl}/${key}`,
        maxSize: MAX_SIZES.showroom,
        expiresIn: 600,
      });
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });

  } catch (error) {
    console.error('[storage/direct] Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate upload URLs' },
      { status: 500 }
    );
  }
}
