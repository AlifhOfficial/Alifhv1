/**
 * POST /api/storage/upload-token
 *
 * Issues a short-lived HMAC token that authorises a browser to POST files
 * directly to the Fly preprocessing service (no Vercel body limit involved).
 *
 * Handles all image upload types:
 *   listing  → { type:'listing', vin }
 *   avatar   → { type:'avatar' }
 *   partner  → { type:'partner', partnerId, imageType:'logo'|'hero' }
 *   showroom → { type:'showroom', partnerId, assetType }
 *
 * Token: base64url(JSON.stringify({ userId, exp, ctx })).hmac-sha256-hex
 * Response: { token, expiresAt, uploadUrl }
 */

import { createHmac } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session-context';

export const runtime = 'nodejs';

type UploadType = 'listing' | 'avatar' | 'partner' | 'showroom';

const SHOWROOM_ASSET_TYPES = [
  'hero-image',
  'brand-story-image',
  'founder-image',
  'gallery',
  'gallery-section-image',
  'team-member',
  'team-section-image',
  'achievement-image',
  'achievements-section-image',
  'testimonial-image',
  'testimonials-section-image',
  'service-image',
  'services-section-image',
  'seo-image',
];
const PARTNER_IMAGE_TYPES  = ['logo', 'hero'];

function makeToken(secret: string, ctx: Record<string, unknown>, userId: string): string {
  const exp = Math.floor(Date.now() / 1000) + 300; // 5 min
  const payload = { userId, exp, ctx };
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = createHmac('sha256', secret).update(payloadB64).digest('hex');
  return `${payloadB64}.${sig}`;
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const secret = process.env.PREPROCESSING_SECRET;
  const serviceUrl = process.env.PREPROCESSING_URL;

  if (!secret || !serviceUrl) {
    console.error('[upload-token] PREPROCESSING_SECRET or PREPROCESSING_URL not set');
    return NextResponse.json({ error: 'Service not configured' }, { status: 500 });
  }

  let body: Record<string, string>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const type: UploadType = body.type as UploadType;

  // ── listing ───────────────────────────────────────────────────────────────
  if (type === 'listing') {
    const vin = (body.vin ?? '').trim();
    if (!vin || vin.length < 11) {
      return NextResponse.json({ error: 'Valid VIN required (min 11 chars)' }, { status: 400 });
    }
    const token = makeToken(secret, { kind: 'listing', vin }, user.id);
    return NextResponse.json({ token, expiresAt: (Math.floor(Date.now() / 1000) + 300) * 1000, uploadUrl: `${serviceUrl.replace(/\/$/, '')}/process` });
  }

  // ── avatar ────────────────────────────────────────────────────────────────
  if (type === 'avatar') {
    const token = makeToken(secret, { kind: 'avatar' }, user.id);
    return NextResponse.json({ token, expiresAt: (Math.floor(Date.now() / 1000) + 300) * 1000, uploadUrl: `${serviceUrl.replace(/\/$/, '')}/process` });
  }

  // ── partner ───────────────────────────────────────────────────────────────
  if (type === 'partner') {
    const { partnerId, imageType } = body;
    if (!partnerId) return NextResponse.json({ error: 'partnerId required' }, { status: 400 });
    if (!imageType || !PARTNER_IMAGE_TYPES.includes(imageType)) {
      return NextResponse.json({ error: `imageType must be one of: ${PARTNER_IMAGE_TYPES.join(', ')}` }, { status: 400 });
    }

    const membership = user.partnerMemberships?.find((m: any) => m.partnerId === partnerId);
    if (!membership || !['owner', 'admin'].includes(membership.staffRole)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const token = makeToken(secret, { kind: 'partner', partnerId, imageType }, user.id);
    return NextResponse.json({ token, expiresAt: (Math.floor(Date.now() / 1000) + 300) * 1000, uploadUrl: `${serviceUrl.replace(/\/$/, '')}/process` });
  }

  // ── showroom ──────────────────────────────────────────────────────────────
  if (type === 'showroom') {
    const { partnerId, assetType } = body;
    if (!partnerId) return NextResponse.json({ error: 'partnerId required' }, { status: 400 });
    if (!assetType || !SHOWROOM_ASSET_TYPES.includes(assetType)) {
      return NextResponse.json({ error: `assetType must be one of: ${SHOWROOM_ASSET_TYPES.join(', ')}` }, { status: 400 });
    }

    const membership = user.partnerMemberships?.find((m: any) => m.partnerId === partnerId);
    if (!membership || membership.partnerTier !== 'black') {
      return NextResponse.json({ error: 'Showroom requires Black tier' }, { status: 403 });
    }
    if (!['owner', 'admin'].includes(membership.staffRole)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const token = makeToken(secret, { kind: 'showroom', partnerId, assetType }, user.id);
    return NextResponse.json({ token, expiresAt: (Math.floor(Date.now() / 1000) + 300) * 1000, uploadUrl: `${serviceUrl.replace(/\/$/, '')}/process` });
  }

  return NextResponse.json({ error: 'Invalid type. Use: listing, avatar, partner, showroom' }, { status: 400 });
}
