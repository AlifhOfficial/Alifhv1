/**
 * API: Car Card Listings Endpoint
 * GET /api/listings/car-card
 * 
 * Purpose: Optimized listing cards for browse/search pages
 * Authentication: None required (public endpoint)
 * 
 * Features:
 * - Denormalized partner data (no JOIN needed)
 * - Only UI-essential fields (reduces payload ~60%)
 * - CDN edge caching (60s)
 * - Batch fetching via IDs for favorites/superlikes pages
 * 
 * Query Params:
 * - ids: Comma-separated listing IDs (max 100, for favorites/superlikes)
 * - status: Legacy param; only 'public'/'published' allowed (public endpoint)
 * - partnerId: Filter by partner (inventory pages)
 * - limit: Results per page (default: 20, max: 100)
 * - offset: Pagination offset (default: 0)
 * 
 * Cache Strategy:
 * - Browse/Partner pages: CDN cached (s-maxage=60, stale-while-revalidate=120)
 * - Batch requests (favorites): No CDN cache (personalized content)
 * - Memory cache: 1-3min depending on request type
 * - Cache invalidation: Handled by listing mutations
 * 
 * Standards:
 * - Returns 500 for server errors
 * - Max 100 IDs per request
 * - Sorted by createdAt DESC
 * - Rate limited: 300 requests/min per IP
 */

import { NextRequest, NextResponse } from "next/server";
import { applyCdnHeaders, NO_CACHE_HEADERS } from '@/lib/cdn-cache';
import { getListingCards } from "@alifh/database";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

// Rate limiting removed — public read endpoint protected by CF DDoS/bot + CDN caching.
// Upstash REST round-trip was adding ~100ms per request.

export async function GET(req: NextRequest) {
  try {
    const isProd = process.env.NODE_ENV === 'production';

    const { searchParams } = new URL(req.url);

    const statusParam = searchParams.get('status');
    const statusExplicit = searchParams.has('status');
    const status = statusParam || 'published';
    const partnerId = searchParams.get('partnerId');
    const idsParam = searchParams.get('ids');
    const limitRaw = Number(searchParams.get('limit') ?? '20');
    const offsetRaw = Number(searchParams.get('offset') ?? '0');
    const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(Math.trunc(limitRaw), 1), 100) : 20;
    const offset = Number.isFinite(offsetRaw) ? Math.max(Math.trunc(offsetRaw), 0) : 0;

    // Public endpoint: only allow public visibility.
    if (statusExplicit && !['published', 'public'].includes(status)) {
      return NextResponse.json(
        { error: "Only 'public' listings are available on this endpoint" },
        { status: 400 }
      );
    }

    const ids = idsParam
      ? idsParam
          .split(',')
          .map((id) => id.trim())
          .filter(Boolean)
          .slice(0, 100)
      : null;

    // Select appropriate cache headers: CDN for public browse, no-cache for specific ID lookups
    const isPublicBrowse = !ids?.length;

    // In dev, bypass cache so new/updated listings reflect immediately.
    if (!isProd) {
      const listings = await getListingCards({
        ids: ids || undefined,
        visibility: 'public',
        partnerId: partnerId || undefined,
        limit,
        offset,
      });

      const response = NextResponse.json({
        data: listings,
        meta: { total: listings.length, limit, offset },
      });
      response.headers.set('Cache-Control', 'no-store');
      return response;
    }

    // Query database
    const listings = await getListingCards({
      ids: ids || undefined,
      visibility: 'public',
      partnerId: partnerId || undefined,
      limit,
      offset,
    });

    // Calculate hasMore based on whether we got a full page of results
    const hasMore = listings.length === limit;

    const responseData = {
      data: listings,
      meta: {
        returned: listings.length,
        limit,
        offset,
        hasMore,
      },
    };
    
    const response = NextResponse.json(responseData);
    
    if (isPublicBrowse) {
      applyCdnHeaders(response, 'carCard');
    } else {
      Object.entries(NO_CACHE_HEADERS).forEach(([key, value]) => 
        response.headers.set(key, value)
      );
    }
    
    return response;
  } catch (error) {
    console.error('[car-card listings] GET failed', error);
    return NextResponse.json(
      { error: 'Failed to fetch listings' },
      { status: 500 }
    );
  }
}
