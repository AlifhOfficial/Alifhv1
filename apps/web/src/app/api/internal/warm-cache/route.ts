/**
 * API: Cache Warming Endpoint
 * POST /api/internal/warm-cache
 * 
 * Purpose: Pre-populate cache with popular searches for instant response times
 * Authentication: Internal only (protected by secret)
 * 
 * Call this:
 * - On server startup
 * - Via cron job every 2-5 minutes
 * - After bulk listing changes
 * 
 * @module api/internal/warm-cache
 */

import { NextRequest, NextResponse } from 'next/server';
import { 
  searchListings, 
  getSearchFacets,
  memoryCache,
  UAE_POPULAR_MAKES,
  flushViewBuffer,
  getViewBufferStats,
} from '@alifh/database';

export const runtime = 'nodejs';
export const maxDuration = 60; // Allow up to 60s for warming

// Secret to protect internal endpoint
const INTERNAL_SECRET = process.env.INTERNAL_API_SECRET || process.env.CRON_SECRET;

// Cache TTLs (match search route - long TTLs since we have proper invalidation)
const SEARCH_CACHE_TTL = 600; // 10 minutes
const FACET_CACHE_TTL = 900; // 15 minutes

// Common pagination variants that frontend might send
// Must match EXACTLY what the frontend sends to get cache hits
const PAGINATION_VARIANTS = [
  { limit: 30, offset: 0 },  // Most common - listings page default
  { limit: 20, offset: 0 },  // Alternative default
  {},                        // No pagination (some clients)
];

// Popular searches to warm (with all pagination variants for cache hits)
// Note: make must be an array to match the search API's IN clause
const SEARCHES_TO_WARM = [
  // Default homepage - all pagination variants
  ...PAGINATION_VARIANTS,
  // Conditions
  ...PAGINATION_VARIANTS.map(p => ({ condition: 'new' as const, ...p })),
  ...PAGINATION_VARIANTS.map(p => ({ condition: 'used' as const, ...p })),
  // Black listings
  ...PAGINATION_VARIANTS.map(p => ({ isBlkListing: true, ...p })),
  // All popular makes - with pagination variants (make as array for IN clause)
  ...UAE_POPULAR_MAKES.flatMap(make => 
    PAGINATION_VARIANTS.map(p => ({ make: [make], ...p }))
  ),
];

function generateCacheKey(params: Record<string, any>, prefix: string): string {
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

export async function POST(req: NextRequest) {
  try {
    // Verify internal secret
    const authHeader = req.headers.get('authorization');
    const providedSecret = authHeader?.replace('Bearer ', '');
    
    if (INTERNAL_SECRET && providedSecret !== INTERNAL_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const startTime = Date.now();
    const results: { search: string; time: number; cached: boolean }[] = [];

    console.log(`[cache-warm] Starting cache warming for ${SEARCHES_TO_WARM.length} searches...`);

    // Warm each search sequentially to avoid overwhelming the DB
    for (const params of SEARCHES_TO_WARM) {
      const searchKey = generateCacheKey(params, 'search');
      const facetKey = generateCacheKey(params, 'facets');
      
      // Check if already cached
      const existingSearch = memoryCache.get(searchKey);
      const existingFacets = memoryCache.get(facetKey);
      
      if (existingSearch && existingFacets) {
        results.push({ 
          search: searchKey, 
          time: 0, 
          cached: true 
        });
        continue;
      }

      const queryStart = Date.now();
      
      // Execute search and facets in parallel
      const [searchResult, facets] = await Promise.all([
        existingSearch ? Promise.resolve(null) : searchListings(params as any, { skipFacets: true }),
        existingFacets ? Promise.resolve(null) : getSearchFacets(params as any),
      ]);

      // Cache results
      if (searchResult) {
        memoryCache.set(searchKey, searchResult, SEARCH_CACHE_TTL);
      }
      if (facets) {
        memoryCache.set(facetKey, facets, FACET_CACHE_TTL);
      }

      results.push({
        search: searchKey,
        time: Date.now() - queryStart,
        cached: false,
      });
    }

    const totalTime = Date.now() - startTime;
    const warmedCount = results.filter(r => !r.cached).length;
    const skippedCount = results.filter(r => r.cached).length;

    // Also flush view buffer while we're here
    const viewBufferStats = getViewBufferStats();
    let flushResult = { views: 0, viewListings: 0, impressionListings: 0 };
    
    if (viewBufferStats.pendingViews > 0 || viewBufferStats.pendingImpressionListings > 0) {
      try {
        flushResult = await flushViewBuffer();
        console.log(`[cache-warm] Flushed ${flushResult.views} views, ${flushResult.impressionListings} impression updates`);
      } catch (err) {
        console.error('[cache-warm] Analytics flush error:', err);
      }
    }

    console.log(`[cache-warm] Completed: ${warmedCount} warmed, ${skippedCount} already cached, ${totalTime}ms total`);

    return NextResponse.json({
      success: true,
      summary: {
        total: SEARCHES_TO_WARM.length,
        warmed: warmedCount,
        alreadyCached: skippedCount,
        totalTimeMs: totalTime,
        viewsFlushed: flushResult.views,
        viewListingsUpdated: flushResult.viewListings,
        impressionListingsUpdated: flushResult.impressionListings,
      },
      details: results,
    });
  } catch (error) {
    console.error('[cache-warm] Error:', error);
    return NextResponse.json(
      { error: 'Cache warming failed' },
      { status: 500 }
    );
  }
}

// Also allow GET for easy testing/cron
export async function GET(req: NextRequest) {
  return POST(req);
}
