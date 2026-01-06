/**
 * API: Public Black Listings
 * GET /api/listings/black
 * 
 * Purpose: Fetch all public black listings for the signature page
 * Authentication: None (public endpoint)
 * 
 * Query params:
 * - limit: number (default 50)
 * - offset: number (default 0)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getPublicBlackListings } from '@alifh/database';

export const runtime = 'nodejs';

const R2_PUBLIC_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL;

/**
 * Normalize storage URLs - convert R2 keys to full URLs
 */
function normalizeStorageUrl(url: string | null): string | null {
  if (!url) return null;
  // Already a full URL
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  // Already a local path
  if (url.startsWith('/')) return url;
  // R2 key - prepend base URL
  if (R2_PUBLIC_URL) {
    return `${R2_PUBLIC_URL.replace(/\/$/, '')}/${url}`;
  }
  // Fallback to local path
  return `/${url}`;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const result = await getPublicBlackListings({
      limit: Math.min(limit, 100), // Max 100 per request
      offset,
    });

    // Transform listings to include full URLs for images
    const transformedListings = result.listings.map(listing => ({
      ...listing,
      partnerLogo: normalizeStorageUrl(listing.partnerLogo),
      sellerAvatarUrl: normalizeStorageUrl(listing.sellerAvatarUrl),
    }));

    return NextResponse.json({
      success: true,
      data: transformedListings,
      meta: {
        total: result.total,
        limit,
        offset,
        hasMore: offset + result.listings.length < result.total,
      },
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error('[API] Error fetching public black listings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
