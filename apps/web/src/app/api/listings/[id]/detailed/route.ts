/**
 * API: Detailed Car Listing Endpoint
 * GET /api/listings/[id]/detailed
 * 
 * Purpose: Fetch comprehensive listing data with seller info for detailed view pages
 * Authentication: None required (public endpoint)
 * 
 * Features:
 * - Full specifications, features, and pricing insights
 * - Seller data (partner profile + stats OR user profile)
 * - CDN-friendly caching (2min cache, 5min stale-while-revalidate)
 * 
 * Standards:
 * - Returns 404 for non-existent listings
 * - Returns 500 for server errors
 */

import { NextRequest, NextResponse } from "next/server";
import { 
  memoryCache, 
  CacheTTL, 
  getListingDetailed, 
  getDealerBaseProfile, 
  getUserProfileByUserId 
} from "@alifh/database";
import { calculatePartnerStats } from "@alifh/database/server";
import {
  createRateLimiter,
  getIdentifier,
  rateLimitResponse,
  RATE_LIMITS_GENERAL,
} from '@/lib/rate-limit';

const detailedLimiter = createRateLimiter(RATE_LIMITS_GENERAL.READ_PUBLIC);

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 300;

const CACHE_HEADERS = {
  'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
} as const;

interface RouteParams {
  params: Promise<{ id: string }>;
}

// Extracted outside handler to avoid recreation on each request
type ListingResult = NonNullable<Awaited<ReturnType<typeof getListingDetailed>>>;

async function fetchSellerData(listing: ListingResult) {
  const start = performance.now();
  
  if (listing.partnerId) {
    // Partner listing - fetch dealer profile and stats in parallel
    const [partnerProfile, partnerStats] = await Promise.all([
      getDealerBaseProfile(listing.partnerId),
      calculatePartnerStats(listing.partnerId),
    ]);
    console.log(`[fetchSellerData] partner (getDealerBaseProfile + calculatePartnerStats): ${(performance.now() - start).toFixed(0)}ms`);
    return { type: 'partner' as const, partner: partnerProfile, partnerStats };
  } else {
    // User listing - single query gets profile + extended user info
    const userProfile = await getUserProfileByUserId(listing.userId);
    console.log(`[fetchSellerData] user (getUserProfileByUserId): ${(performance.now() - start).toFixed(0)}ms`);
    return { type: 'user' as const, userProfile };
  }
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  const startTime = performance.now();
  const logTiming = (label: string) => console.log(`[listing-detailed] ${label}: ${(performance.now() - startTime).toFixed(0)}ms`);

  try {
    // Rate limit by IP (public endpoint)
    const identifier = getIdentifier(req);
    const rateLimitResult = await detailedLimiter.check(identifier);
    if (!rateLimitResult.success) {
      return rateLimitResponse(rateLimitResult);
    }
    logTiming('rate-limit');

    const isProd = process.env.NODE_ENV === 'production';

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Listing ID is required' },
        { status: 400 }
      );
    }

    // In dev, bypass cache so new/updated listings reflect immediately.
    if (!isProd) {
      const listing = await getListingDetailed(id);
      logTiming('getListingDetailed');
      if (!listing) {
        return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
      }
      if (!listing.isPublic) {
        return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
      }

      // Fetch seller data
      const sellerData = await fetchSellerData(listing);
      logTiming('fetchSellerData');

      const response = NextResponse.json({ listing, sellerData });
      response.headers.set('Cache-Control', 'no-store');
      logTiming('total');
      return response;
    }

    // Memory cache key
    const cacheKey = `listing:detailed:${id}`;
    
    // Check memory cache first
    const cached = memoryCache.get(cacheKey);
    if (cached) {
      return NextResponse.json(cached, { headers: CACHE_HEADERS });
    }

    // Fetch from database
    const listing = await getListingDetailed(id);

    if (!listing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      );
    }
    if (!listing.isPublic) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      );
    }

    // Fetch seller data
    const sellerData = await fetchSellerData(listing);

    // Build response with listing + seller data
    const responseData = { listing, sellerData };

    // Cache for 5 minutes
    memoryCache.set(cacheKey, responseData, CacheTTL.listingDetail);

    return NextResponse.json(responseData, { headers: CACHE_HEADERS });
  } catch (error) {
    console.error('[API] Error fetching detailed listing:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
