/**
 * API: Partner List
 * GET /api/partner/list - Fetch top 50 partners ordered by join date (oldest first)
 * 
 * Purpose: Public endpoint for browsing partners/dealers
 * Authentication: None required (public endpoint)
 * 
 * Cache Strategy: Public 5min, stale-while-revalidate 2min
 * 
 * Standards:
 * - Returns 429 for rate limited requests
 * - Returns 500 for server errors
 */

import { NextRequest, NextResponse } from 'next/server';
import { CDN_HEADERS } from '@/lib/cdn-cache';
import { getPartnersList } from '@alifh/database';
import { createRateLimiter, getIdentifier, rateLimitResponse, RATE_LIMITS_GENERAL } from '@/lib/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const listLimiter = createRateLimiter(RATE_LIMITS_GENERAL.READ_PUBLIC);



/**
 * Attaches absolute CDN URLs for logo and hero images
 */
function attachImageUrls(partner: any) {
  const publicUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL;
  if (!publicUrl) {
    return { ...partner, logoUrl: null, heroImageUrl: null };
  }

  const cacheBuster = partner.createdAt
    ? new Date(partner.createdAt).getTime()
    : Date.now();

  const base = publicUrl.replace(/\/$/, '');

  let logoUrl: string | null = null;
  if (partner.logo) {
    logoUrl = partner.logo.startsWith('http')
      ? partner.logo
      : `${base}/${partner.logo}?v=${cacheBuster}`;
  }

  let heroImageUrl: string | null = null;
  if (partner.heroImage) {
    heroImageUrl = partner.heroImage.startsWith('http')
      ? partner.heroImage
      : `${base}/${partner.heroImage}?v=${cacheBuster}`;
  }

  return { ...partner, logoUrl, heroImageUrl };
}

export async function GET(req: NextRequest) {
  try {
    // Rate limit
    const identifier = getIdentifier(req);
    const { success, ...rateLimitResult } = await listLimiter.check(identifier);
    if (!success) return rateLimitResponse({ success, ...rateLimitResult });

    const partners = await getPartnersList();

    // Attach image URLs
    const withUrls = partners.map(attachImageUrls);

    const response = NextResponse.json({ partners: withUrls });
    Object.entries(CDN_HEADERS.partnerList).forEach(([key, value]) =>
      response.headers.set(key, value)
    );
    return response;
  } catch (error) {
    console.error('[partner-list] GET failed', error);
    return NextResponse.json({ error: 'Failed to fetch partners' }, { status: 500 });
  }
}
