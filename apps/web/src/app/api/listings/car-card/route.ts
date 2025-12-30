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
export const revalidate = 0; // No ISR caching - rely on memory cache only

// CDN caching for public feed - reduces origin hits significantly
// Memory cache handles invalidation; CDN provides edge distribution
const CDN_CACHE_HEADERS = {
  // CDN caches for 60s, serves stale for 120s while revalidating
  'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
} as const;

// For personalized/batch requests (favorites, superlikes) - no CDN cache
const NO_CACHE_HEADERS = {
  'Cache-Control': 'private, no-cache, no-store, must-revalidate',
} as const;

// Only log in development or for cache misses in production
const DEBUG_LOGGING = process.env.NODE_ENV !== 'production';

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

    // ⚡ CACHE HIT: Return cached data
    const cached = memoryCache.get<any>(cacheKey);
    if (cached) {
      if (DEBUG_LOGGING) {
        console.log(`[car-card] ✅ Cache HIT for ${cacheKey.substring(0, 50)}...`);
      }
      const response = NextResponse.json(cached);
      Object.entries(cacheHeaders).forEach(([key, value]) => 
        response.headers.set(key, value)
      );
      response.headers.set('X-Cache', 'HIT');
      return response;
    }

    // ⚡ CACHE MISS: Query database using query function
    if (DEBUG_LOGGING) {
      console.log(`[car-card] ❌ Cache MISS for ${cacheKey.substring(0, 50)}... - querying DB`);
    }
    const queryStart = performance.now();

    // Use exported query function - handles 2-step optimization internally
    const listings = await getListingCards({
      ids: ids || undefined,
      visibility: 'public',
      partnerId: partnerId || undefined,
      limit,
      offset,
    });
    
    const queryTime = performance.now() - queryStart;
    if (DEBUG_LOGGING) {
      console.log(`[car-card] 📊 Total DB time: ${queryTime.toFixed(2)}ms - ${listings.length} results`);
    }

    // Calculate hasMore based on whether we got a full page of results
    const hasMore = listings.length === limit;

    // ⚡ CACHE: Store results
    const responseData = {
      data: listings,
      meta: {
        returned: listings.length,
        limit,
        offset,
        hasMore,
        // Note: total count requires expensive COUNT(*) query and is not available in edge runtime
        // Use hasMore flag for pagination instead
      },
    };
    
    memoryCache.set(cacheKey, responseData, cacheTTL);
    
    const response = NextResponse.json(responseData);
    
    Object.entries(cacheHeaders).forEach(([key, value]) => 
      response.headers.set(key, value)
    );
    response.headers.set('X-Cache', 'MISS');
    response.headers.set('X-Query-Time', `${queryTime.toFixed(2)}ms`);
    
    return response;
  } catch (error) {
    console.error('[car-card listings] GET failed', error);
    return NextResponse.json(
      { error: 'Failed to fetch listings' },
      { status: 500 }
    );
  }
}
