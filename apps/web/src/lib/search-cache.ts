/**
 * Search Cache - Server-only
 * 
 * Cached search functions using Next.js unstable_cache.
 * Facets change rarely, so we cache them for 1 hour to reduce DB load.
 * 
 * @module lib/search-cache
 */

import { unstable_cache } from 'next/cache';
import {
  getSearchFacets as getSearchFacetsUncached,
  searchListings as searchListingsUncached,
  type SearchParams,
  type SearchFacets,
  type SearchResponse,
} from '@alifh/database';

// 1 hour TTL for facets (they are UI hints, not search correctness)
const FACET_CACHE_TTL = 3600;
// 2 minute TTL for public search result pages
const SEARCH_RESULT_CACHE_TTL = 120;

function stableParamValue(value: unknown): string {
  if (Array.isArray(value)) {
    return [...value].map(String).sort().join(',');
  }
  return String(value);
}

function getSearchResultCacheKey(params: SearchParams): string {
  const entries = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .sort(([a], [b]) => a.localeCompare(b));

  if (entries.length === 0) return 'default';

  return entries.map(([key, value]) => `${key}:${stableParamValue(value)}`).join('|');
}

/**
 * Generate a stable cache key from search params
 * Only include params that affect the remaining hierarchical facets.
 * We intentionally ignore the rest of the search filters so cache hit rate stays high.
 */
function getFacetCacheKey(params: SearchParams): string {
  const keyParts: string[] = [];
  
  if (params.make?.length) keyParts.push(`make:${[...params.make].sort().join(',')}`);
  if (params.model?.length) keyParts.push(`model:${[...params.model].sort().join(',')}`);
  
  return keyParts.length > 0 ? keyParts.join('|') : 'all';
}

/**
 * Cached version of getSearchFacets
 * Uses Next.js unstable_cache with 1 hour TTL
 */
export async function getCachedSearchFacets(params: SearchParams): Promise<SearchFacets> {
  const cacheKey = getFacetCacheKey(params);
  console.log(`[facets-cache] REQUEST key=${cacheKey}`);
  
  const cachedFn = unstable_cache(
    async () => {
      const startTime = Date.now();
      console.log(`[facets-cache] MISS key=${cacheKey}`);
      const result = await getSearchFacetsUncached(params);
      const took = Date.now() - startTime;
      
      if (took > 200) {
        console.log(`[facets-cache] MISS_DONE ${took}ms key=${cacheKey.substring(0, 50)}`);
      }
      
      return result;
    },
    ['search-facets', cacheKey],
    {
      revalidate: FACET_CACHE_TTL,
      tags: ['search-facets'],
    }
  );
  
  return cachedFn();
}

export async function getCachedSearchResults(params: SearchParams): Promise<SearchResponse> {
  const cacheKey = getSearchResultCacheKey(params);

  const cachedFn = unstable_cache(
    async () => searchListingsUncached(params, { fast: true }),
    ['search-results', cacheKey],
    {
      revalidate: SEARCH_RESULT_CACHE_TTL,
      tags: ['search-results'],
    }
  );

  return cachedFn();
}

// Re-export for convenience
export { getSearchFacetsUncached as getSearchFacets };
