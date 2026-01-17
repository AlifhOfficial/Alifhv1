/**
 * API: Similar Listings
 * GET /api/listings/[id]/similar
 * 
 * Purpose: Get comparable vehicles for a listing
 * Authentication: None required (public endpoint)
 * 
 * Returns 2-3 similar listings based on strict matching:
 * - Same make + model
 * - Same body type
 * - Price within ±10%
 * - Mileage within ±30%
 * 
 * Returns empty array if insufficient quality matches.
 * Philosophy: Show nothing > show garbage.
 * 
 * Cache Strategy:
 * - CDN: 5 minutes (similar listings don't change frequently)
 * - Memory: 5 minutes (invalidated when listings change)
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getSimilarListings,
  getListingDetailed,
  memoryCache,
  type SimilarListingCard,
} from '@alifh/database';

export const runtime = 'nodejs';

// Cache settings
const CACHE_TTL = 300; // 5 minutes
const CDN_HEADERS = {
  'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60',
} as const;

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(
  _req: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const { id } = await params;

  if (!id) {
    return NextResponse.json(
      { error: 'Listing ID required' },
      { status: 400 }
    );
  }

  try {
    // Check cache first
    const cacheKey = `similar:${id}`;
    const cached = memoryCache.get<SimilarListingCard[]>(cacheKey);
    
    if (cached !== null) {
      const response = NextResponse.json({ listings: cached, cached: true });
      Object.entries(CDN_HEADERS).forEach(([key, value]) =>
        response.headers.set(key, value)
      );
      return response;
    }

    // Fetch the source listing to get matching criteria
    const listing = await getListingDetailed(id);
    
    if (!listing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      );
    }

    // Get similar listings with strict matching
    const similar = await getSimilarListings({
      excludeId: id,
      make: listing.make,
      model: listing.model,
      bodyType: listing.bodyType,
      fuelType: listing.fuelType,
      price: listing.price,
      mileage: listing.mileage,
    });

    // Cache the result
    memoryCache.set(cacheKey, similar, CACHE_TTL);

    const response = NextResponse.json({ listings: similar, cached: false });
    Object.entries(CDN_HEADERS).forEach(([key, value]) =>
      response.headers.set(key, value)
    );
    
    return response;
  } catch (error) {
    console.error('[similar] Error fetching similar listings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch similar listings' },
      { status: 500 }
    );
  }
}
