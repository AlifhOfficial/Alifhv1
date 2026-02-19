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
 */

import { NextRequest, NextResponse } from 'next/server';
import { CDN_HEADERS } from '@/lib/cdn-cache';
import {
  getSimilarListings,
  getListingDetailed,
  type SimilarListingCard,
} from '@alifh/database';

export const runtime = 'nodejs';



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

    const response = NextResponse.json({ listings: similar });
    Object.entries(CDN_HEADERS.similar).forEach(([key, value]) =>
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
