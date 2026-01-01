/**
 * API: Listing Search Endpoint
 * GET /api/listings/search
 * 
 * Purpose: Faceted search with 3-tier filters
 * Authentication: None required (public endpoint)
 * 
 * Features:
 * - Basic search: text query (q)
 * - Medium filters: make, model, year, price, mileage, emirate
 * - Advanced filters: bodyType, fuelType, transmission, colors, etc.
 * - Faceted counts for filter UI
 * - URL-friendly params for shareable links
 * 
 * Cache Strategy:
 * - CDN: 30s (lower than browse for fresher facets)
 * - Memory: 15s for search results, 60s for facets
 * 
 * @module api/listings/search
 */

import { NextRequest, NextResponse } from "next/server";
import { 
  memoryCache, 
  CacheKeys, 
  searchListings,
  urlToSearchParams,
  type SearchParams,
  type SearchResponse,
} from "@alifh/database";
import { createRateLimiter, getIdentifier, rateLimitResponse, RATE_LIMITS_LISTINGS } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

// Rate limit: 100 search requests per minute (more expensive than browse)
const searchLimiter = createRateLimiter({
  ...RATE_LIMITS_LISTINGS.BROWSE,
  maxRequests: 100, // Lower than browse due to facet computation
});

// Cache TTLs
const SEARCH_CACHE_TTL = 15_000; // 15 seconds for search results
const FACET_CACHE_TTL = 60_000; // 60 seconds for facets (computed less frequently)

// CDN cache headers - shorter TTL for search
const CDN_CACHE_HEADERS = {
  'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
} as const;

/**
 * Generate cache key from search params
 */
function generateCacheKey(params: SearchParams): string {
  // Sort keys for consistent cache key
  const sorted = Object.entries(params)
    .filter(([_, v]) => v !== undefined && v !== null && v !== '')
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => {
      if (Array.isArray(v)) return `${k}:${v.sort().join(',')}`;
      return `${k}:${v}`;
    })
    .join('|');
  
  return `search:${sorted || 'default'}`;
}

export async function GET(req: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Rate limiting
    const identifier = getIdentifier(req);
    const rateLimitResult = await searchLimiter.check(identifier);
    if (!rateLimitResult.success) {
      return rateLimitResponse(rateLimitResult);
    }

    // Parse search params from URL
    const { searchParams: urlParams } = new URL(req.url);
    const params = urlToSearchParams(urlParams);

    // Validate limit
    if (params.limit && (params.limit < 1 || params.limit > 100)) {
      return NextResponse.json(
        { error: "Limit must be between 1 and 100" },
        { status: 400 }
      );
    }

    // Check cache (skip in dev for faster iteration)
    const isProd = process.env.NODE_ENV === 'production';
    const cacheKey = generateCacheKey(params);

    if (isProd) {
      const cached = memoryCache.get<SearchResponse>(cacheKey);
      if (cached) {
        const response = NextResponse.json({
          ...cached,
          meta: {
            ...cached.meta,
            cached: true,
            cacheAge: Date.now() - startTime,
          },
        });
        Object.entries(CDN_CACHE_HEADERS).forEach(([key, value]) =>
          response.headers.set(key, value)
        );
        return response;
      }
    }

    // Execute search
    const result = await searchListings(params);

    // Cache result in production
    if (isProd) {
      memoryCache.set(cacheKey, result, SEARCH_CACHE_TTL);
    }

    const response = NextResponse.json(result);
    
    if (isProd) {
      Object.entries(CDN_CACHE_HEADERS).forEach(([key, value]) =>
        response.headers.set(key, value)
      );
    } else {
      response.headers.set('Cache-Control', 'no-store');
    }

    return response;
  } catch (error) {
    console.error('[search] Error:', error);
    return NextResponse.json(
      { error: "Failed to execute search" },
      { status: 500 }
    );
  }
}
