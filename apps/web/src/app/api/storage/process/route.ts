/**
 * Image Processing API
 * POST /api/storage/process
 * 
 * Processes raw images uploaded via presigned URLs.
 * Reads from raw/ prefix, processes, saves to final location, deletes raw.
 * 
 * Processing by type:
 * - listing: thumb (480w q72) + full (2000w q78) pair
 * - avatar: 512x512 square crop
 * - partner/logo: 512x512
 * - partner/hero: 1920x600 cover crop
 * - showroom/*: Various sizes, 1-year CDN cache
 * 
 * Request Body:
 * - rawKey: The raw/ key from presigned upload
 * 
 * Returns for listings:
 * { thumbKey, thumbUrl, fullKey, fullUrl }
 * 
 * Returns for single images:
 * { key, url }
 */

import { NextRequest, NextResponse } from 'next/server';
import { GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSessionUser } from '@/lib/auth/session-context';
import { uploadFile } from '@/lib/storage';
import { getR2Client, getR2Bucket, getCdnUrl } from '@/lib/storage/r2-client';
import { 
  processListingImages, 
  processSingleImage,
  ImageValidationError 
} from '@/lib/storage/image-processing';
import { createId } from '@paralleldrive/cuid2';

export const runtime = 'nodejs';
export const maxDuration = 60; // HEIC processing can be slow

// ============================================================================
// Configuration
// ============================================================================

const CDN_CACHE = 'public, max-age=31536000, immutable'; // 1 year

// Processing configs
const PROCESS_CONFIG = {
  avatar: { maxWidth: 512, maxHeight: 512, fit: 'cover' as const, quality: 80 },
  'partner/logo': { maxWidth: 512, maxHeight: 512, fit: 'inside' as const, quality: 90 },
  'partner/hero': { maxWidth: 1920, maxHeight: 600, fit: 'cover' as const, quality: 85 },
  // Showroom images
  'showroom/hero-image': { maxWidth: 1920, maxHeight: 1080, fit: 'cover' as const, quality: 85 },
  'showroom/founder-image': { maxWidth: 800, maxHeight: 1000, fit: 'cover' as const, quality: 85 },
  'showroom/gallery': { maxWidth: 1600, maxHeight: 1200, fit: 'inside' as const, quality: 82 },
  'showroom/team-member': { maxWidth: 600, maxHeight: 600, fit: 'cover' as const, quality: 82 },
};

// ============================================================================
// Helpers
// ============================================================================

function getDatePath(): string {
  const now = new Date();
  return `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')}`;
}

function generateFinalKey(type: string, userId: string, meta: Record<string, string>): { single?: string; thumb?: string; full?: string } {
  const ts = Date.now();
  const id = createId();
  const datePath = getDatePath();
  
  if (type === 'listing') {
    const prefix = `listings/${datePath}/${userId.slice(0, 8)}/${meta.vin}/${id}`;
    return {
      thumb: `${prefix}_thumb.webp`,
      full: `${prefix}_full.webp`,
    };
  }
  
  if (type === 'avatar') {
    return { single: `users/${userId}/${datePath}/avatar-${ts}.webp` };
  }
  
  if (type === 'partner') {
    return { single: `brands/${meta.partnerId}/${datePath}/${meta.imageType}-${ts}.webp` };
  }
  
  if (type === 'showroom') {
    return { single: `brands/${meta.partnerId}/showroom/${datePath}/${meta.assetType}-${ts}.webp` };
  }
  
  throw new Error(`Unknown type: ${type}`);
}

function parseRawKey(rawKey: string): { type: string; userId?: string; vin?: string; partnerId?: string; imageType?: string; assetType?: string } {
  // raw/listing/{userId}/{vin}/{ts}-{id}.{ext}
  // raw/avatar/{userId}/{ts}-{id}.{ext}
  // raw/partner/{partnerId}/{imageType}/{ts}-{id}.{ext}
  // raw/showroom/{partnerId}/{assetType}/{ts}-{id}.{ext}
  
  const parts = rawKey.split('/');
  
  if (parts[0] === 'raw') {
    const type = parts[1];
    if (type === 'listing') {
      return { type: 'listing', userId: parts[2], vin: parts[3] };
    }
    if (type === 'avatar') {
      return { type: 'avatar', userId: parts[2] };
    }
    if (type === 'partner') {
      return { type: 'partner', partnerId: parts[2], imageType: parts[3] };
    }
    if (type === 'showroom') {
      return { type: 'showroom', partnerId: parts[2], assetType: parts[3] };
    }
  }
  
  throw new Error(`Cannot parse rawKey: ${rawKey}`);
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

    const { rawKey } = await req.json();
    if (!rawKey || typeof rawKey !== 'string') {
      return NextResponse.json({ error: 'rawKey required' }, { status: 400 });
    }

    // Parse the raw key to understand what type of processing needed
    const parsed = parseRawKey(rawKey);
    
    // Get singleton R2 client (reuses TCP connections)
    const client = getR2Client();
    const bucketName = getR2Bucket();
    const cdnUrl = getCdnUrl();

    // Read raw file from R2
    const getCmd = new GetObjectCommand({ Bucket: bucketName, Key: rawKey });
    const response = await client.send(getCmd);
    
    if (!response.Body) {
      return NextResponse.json({ error: 'Raw file not found' }, { status: 404 });
    }

    const chunks: Uint8Array[] = [];
    // @ts-ignore - Body is a readable stream
    for await (const chunk of response.Body) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    // Process based on type
    if (parsed.type === 'listing') {
      // Generate thumb + full pair
      const { thumb, full, originalFormat } = await processListingImages(buffer);
      const keys = generateFinalKey('listing', user.id, { vin: parsed.vin! });
      
      // Upload both in parallel
      const [thumbResult, fullResult] = await Promise.all([
        uploadFile({
          key: keys.thumb!,
          data: thumb.buffer,
          contentType: 'image/webp',
          cacheControl: CDN_CACHE,
        }),
        uploadFile({
          key: keys.full!,
          data: full.buffer,
          contentType: 'image/webp',
          cacheControl: CDN_CACHE,
        }),
      ]);

      // Delete raw file (non-blocking)
      client.send(new DeleteObjectCommand({ Bucket: bucketName, Key: rawKey })).catch(() => {});

      return NextResponse.json({
        thumbKey: keys.thumb,
        thumbUrl: cdnUrl ? `${cdnUrl}/${keys.thumb}` : thumbResult.url,
        fullKey: keys.full,
        fullUrl: cdnUrl ? `${cdnUrl}/${keys.full}` : fullResult.url,
        originalFormat,
      });
    }

    // Single image types (avatar, partner, showroom images)
    type ConfigKey = keyof typeof PROCESS_CONFIG;
    let configKey: ConfigKey = 'avatar';
    if (parsed.type === 'partner' && parsed.imageType) {
      const key = `partner/${parsed.imageType}` as ConfigKey;
      if (key in PROCESS_CONFIG) configKey = key;
    } else if (parsed.type === 'showroom' && parsed.assetType) {
      const key = `showroom/${parsed.assetType}` as ConfigKey;
      if (key in PROCESS_CONFIG) configKey = key;
    }
    const config = PROCESS_CONFIG[configKey];

    const processed = await processSingleImage(buffer, config);
    const keys = generateFinalKey(parsed.type, user.id, {
      partnerId: parsed.partnerId!,
      imageType: parsed.imageType!,
      assetType: parsed.assetType!,
      vin: parsed.vin!,
    });

    const result = await uploadFile({
      key: keys.single!,
      data: processed.buffer,
      contentType: 'image/webp',
      cacheControl: CDN_CACHE,
    });

    // Delete raw file (non-blocking) - only if it's a raw/ key
    if (rawKey.startsWith('raw/')) {
      client.send(new DeleteObjectCommand({ Bucket: bucketName, Key: rawKey })).catch(() => {});
    }

    return NextResponse.json({
      key: keys.single,
      url: cdnUrl ? `${cdnUrl}/${keys.single}` : result.url,
      width: processed.width,
      height: processed.height,
      originalFormat: processed.originalFormat,
    });

  } catch (error) {
    if (error instanceof ImageValidationError) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: 400 });
    }
    console.error('[storage/process] Error:', error);
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 });
  }
}
