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
 * - Memory: 15s for search results, 60s for facets (cached separately)
 * 
 * Performance Optimizations:
 * - Facets cached separately with longer TTL (60s vs 15s for results)
 * - Total count skipped when facets are cache hits (uses hasMore instead)
 * - Search results and facets combined from separate cache entries
 * 
 * @module api/listings/search
 */

import { NextRequest, NextResponse } from "next/server";
import { 
  memoryCache, 
  searchListings,
  getSearchFacets,
  urlToSearchParams,
  type SearchParams,
  type SearchResponse,
  type SearchFacets,
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

// Cache TTLs (in seconds for memoryCache.set())
// With proper invalidation in place, we use long TTLs - cache clears when data changes
const SEARCH_CACHE_TTL = 600; // 10 minutes for search results (invalidated on listing changes)
const FACET_CACHE_TTL = 900; // 15 minutes for facets (invalidated on listing changes)

// CDN cache headers - 2min for search results
const CDN_CACHE_HEADERS = {
  'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=300',
} as const;

/**
 * Generate cache key from search params
 */
function generateCacheKey(params: SearchParams, prefix: string = 'search'): string {
  // Sort keys for consistent cache key
  const sorted = Object.entries(params)
    .filter(([_, v]) => v !== undefined && v !== null && v !== '')
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => {
      if (Array.isArray(v)) return `${k}:${v.sort().join(',')}`;
      return `${k}:${v}`;
    })
    .join('|');
  
  return `${prefix}:${sorted || 'default'}`;
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

    // Enable cache in all environments for performance
    const searchCacheKey = generateCacheKey(params, 'search');
    const facetCacheKey = generateCacheKey(params, 'facets');

    // Check for cached search results
    let cachedSearch: SearchResponse | null = null;
    let cachedFacets: SearchFacets | null = null;
    
    // Debug: Log cache state
    const cacheInfo = memoryCache.info();
    console.log(`[search] cache state: ${cacheInfo.entries.active} active entries, ${cacheInfo.performance.hitRate} hit rate`);
    
    // Cache enabled in all environments (invalidation handles freshness)
    cachedSearch = memoryCache.get<SearchResponse>(searchCacheKey);
    cachedFacets = memoryCache.get<SearchFacets>(facetCacheKey);
    
    console.log(`[search] cache check: search=${!!cachedSearch}, facets=${!!cachedFacets}, key=${searchCacheKey}`);
    
    // Full cache hit - return immediately
    if (cachedSearch && cachedFacets) {
      console.log(`[search] CACHE HIT - ${Date.now() - startTime}ms`);
      const response = NextResponse.json({
        ...cachedSearch,
        facets: cachedFacets,
        meta: {
          ...cachedSearch.meta,
          cached: true,
          cacheAge: Date.now() - startTime,
        },
      });
      Object.entries(CDN_CACHE_HEADERS).forEach(([key, value]) =>
        response.headers.set(key, value)
      );
      return response;
    }

    // Determine what we need to fetch
    const needsSearch = !cachedSearch;
    const needsFacets = !cachedFacets;

    // Execute queries in parallel (only what's needed)
    const [searchResult, facets] = await Promise.all([
      needsSearch 
        ? searchListings(params, { 
            skipFacets: !needsFacets, // Skip if we have cached facets
            skipTotalCount: !!cachedFacets, // Skip count if facets cached (use hasMore)
          })
        : Promise.resolve(cachedSearch!),
      needsFacets 
        ? getSearchFacets(params)
        : Promise.resolve(cachedFacets!),
    ]);

    // Cache results (invalidation handles freshness)
    if (needsSearch) {
      memoryCache.set(searchCacheKey, searchResult, SEARCH_CACHE_TTL);
      console.log(`[search] cached search results: ${searchCacheKey}`);
    }
    if (needsFacets) {
      memoryCache.set(facetCacheKey, facets, FACET_CACHE_TTL);
      console.log(`[search] cached facets: ${facetCacheKey}`);
    }

    // Combine results
    const finalResult: SearchResponse = {
      ...searchResult,
      facets,
    };

    const response = NextResponse.json(finalResult);
    
    // CDN cache headers (memory cache + invalidation handles server-side freshness)
    Object.entries(CDN_CACHE_HEADERS).forEach(([key, value]) =>
      response.headers.set(key, value)
    );

    return response;
  } catch (error) {
    console.error('[search] Error:', error);
    return NextResponse.json(
      { error: "Failed to execute search" },
      { status: 500 }
    );
  }
}
