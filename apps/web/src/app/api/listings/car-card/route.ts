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
 * - 2-tier caching: CDN (60s) + Memory cache (2-3min)
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
import { memoryCache, CacheKeys, CacheTTL, getListingCards } from "@alifh/database";
import { createRateLimiter, getIdentifier, rateLimitResponse, RATE_LIMITS_LISTINGS } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const listingBrowseLimiter = createRateLimiter(RATE_LIMITS_LISTINGS.BROWSE);
export const revalidate = 0;

// CDN caching for public feed - 5min cache for near-zero latency
const CDN_CACHE_HEADERS = {
  'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
} as const;

// For personalized/batch requests (favorites, superlikes) - no CDN cache
const NO_CACHE_HEADERS = {
  'Cache-Control': 'private, no-cache, no-store, must-revalidate',
} as const;

export async function GET(req: NextRequest) {
  try {
    const isProd = process.env.NODE_ENV === 'production';

    // Rate limiting: 300 browse requests per minute
    const identifier = getIdentifier(req);
    const rateLimitResult = await listingBrowseLimiter.check(identifier);
    if (!rateLimitResult.success) {
      return rateLimitResponse(rateLimitResult);
    }

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

    // ⚡ MEMORY CACHE: Generate cache key based on request params
    let cacheKey: string;
    let cacheTTL: number;
    let usesCdnCache = false; // Track if this request can use CDN caching
    
    if (ids?.length) {
      // Batch request (favorites/superlikes) - 1min cache, no CDN (personalized)
      cacheKey = CacheKeys.listingCardsBatch(ids);
      cacheTTL = CacheTTL.listingCardsBatch;
      usesCdnCache = false;
    } else if (partnerId) {
      // Partner inventory - 3min cache, can use CDN
      cacheKey = CacheKeys.partnerInventory(partnerId, statusExplicit ? status : undefined);
      cacheTTL = CacheTTL.partnerInventory;
      usesCdnCache = true;
    } else {
      // Main browse/search - 2min cache, can use CDN
      const filterKey = `${status}:${limit}:${offset}`;
      cacheKey = CacheKeys.listingCards(filterKey);
      cacheTTL = CacheTTL.listingCards;
      usesCdnCache = true;
    }

    // Select appropriate cache headers
    const cacheHeaders = usesCdnCache ? CDN_CACHE_HEADERS : NO_CACHE_HEADERS;

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

    // Cache check (disabled - no-op)
    const cached = memoryCache.get<any>(cacheKey);
    if (cached) {
      const response = NextResponse.json(cached);
      Object.entries(cacheHeaders).forEach(([key, value]) => 
        response.headers.set(key, value)
      );
      response.headers.set('X-Cache', 'HIT');
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

    // Store results (disabled - no-op)
    const responseData = {
      data: listings,
      meta: {
        returned: listings.length,
        limit,
        offset,
        hasMore,
      },
    };
    
    memoryCache.set(cacheKey, responseData, cacheTTL);
    
    const response = NextResponse.json(responseData);
    
    Object.entries(cacheHeaders).forEach(([key, value]) => 
      response.headers.set(key, value)
    );
    
    return response;
  } catch (error) {
    console.error('[car-card listings] GET failed', error);
    return NextResponse.json(
      { error: 'Failed to fetch listings' },
      { status: 500 }
    );
  }
}
