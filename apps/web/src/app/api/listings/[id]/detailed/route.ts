/**
 * API: Detailed Car Listing Endpoint
 * GET /api/listings/[id]/detailed
 * 
 * Purpose: Fetch comprehensive listing data for detailed view pages
 * Authentication: None required (public endpoint)
 * 
 * Features:
 * - Full specifications, features, and pricing insights
 * - Partner info with joined details
 * - CDN-friendly caching (2min cache, 5min stale-while-revalidate)
 * 
 * Standards:
 * - Returns 404 for non-existent listings
 * - Returns 500 for server errors
 */

import { NextRequest, NextResponse } from "next/server";
import { memoryCache, CacheTTL, getListingDetailed } from "@alifh/database";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 120;

const CACHE_HEADERS = {
  'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=300',
} as const;

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
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
      if (!listing) {
        return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
      }
      if (!listing.isPublic) {
        return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
      }

      const response = NextResponse.json(listing);
      response.headers.set('Cache-Control', 'no-store');
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

    // Cache for 5 minutes
    memoryCache.set(cacheKey, listing, CacheTTL.listingDetail);

    return NextResponse.json(listing, { headers: CACHE_HEADERS });
  } catch (error) {
    console.error('[API] Error fetching detailed listing:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
