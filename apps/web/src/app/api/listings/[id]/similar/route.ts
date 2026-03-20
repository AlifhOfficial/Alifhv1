/**
 * API: Similar Listings
 * GET /api/listings/[id]/similar
 * 
 * Purpose: Get comparable vehicles in the same price range
 * Authentication: None required (public endpoint)
 * 
 * Returns up to 4 similar listings based on price-focused matching:
 * - Price within ±15%
 * - Same body type (soft preference, fallback to any)
 * 
 * Philosophy: Help users discover alternatives in their budget.
 * 
 */

import { NextRequest, NextResponse } from 'next/server';
import { applyCdnHeaders } from '@/lib/cdn-cache';
import { getCachedSimilarListingsForListing } from '@/lib/similar-listings-cache';

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
    const similar = await getCachedSimilarListingsForListing(id);

    const response = NextResponse.json({ listings: similar });
    applyCdnHeaders(response, 'similar');
    
    return response;
  } catch (error) {
    console.error('[similar] Error fetching similar listings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch similar listings' },
      { status: 500 }
    );
  }
}
