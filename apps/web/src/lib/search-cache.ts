/**
 * Search Functions - Server-only
 *
 * Facets: cached 1 hour via Vercel Data Cache (unstable_cache).
 *   - Facet counts (make/model counts) change infrequently — safe to cache long.
 *   - Each unique filter combo gets its own cache entry.
 *   - Shared between web SSR and mobile API hits.
 *
 * Search results: cached 2 minutes via Vercel Data Cache.
 *   - Web SSR: ISR (revalidate=300) on the page already caches the HTML for 5 min,
 *     so this only benefits the mobile API route (/api/listings/search).
 *   - 2 min chosen so price changes and new listings appear quickly.
 *   - Sold/expired listings may show stale for up to 2 min (acceptable — detail page
 *     always shows true state, and the expire cron runs every 10 min anyway).
 *
 * Quick search (autocomplete): cached 10 minutes.
 *   - Called frequently during typing but make/model/trim names don't change often.
 *   - Reduces DB load from typeahead queries.
 *
 * Popular makes: cached 1 hour.
 *   - Very stable data - top makes by count rarely change.
 *   - Used for default autocomplete suggestions.
 *
 * @module lib/search-cache
 */

import { cache } from 'react';
import { unstable_cache } from 'next/cache';
import {
  getSearchFacets,
  searchListings,
  quickSearch,
  getPopularMakes,
  type SearchParams,
  type SearchFacets,
  type SearchResponse,
} from '@alifh/database';

const DEBUG = process.env.CACHE_DEBUG === '1';
const dbg = (msg: string) => { if (DEBUG) console.warn(`[cache] ${msg}`); };

const _getCachedSearchFacets = unstable_cache(
  async (params: SearchParams) => {
    dbg(`MISS search-facets params=${JSON.stringify(params).slice(0, 80)}`);
    return getSearchFacets(params);
  },
  ['search-facets'],
  { revalidate: 3600 }
);

const _getCachedSearchResults = unstable_cache(
  async (params: SearchParams) => {
    dbg(`MISS search-results params=${JSON.stringify(params).slice(0, 80)}`);
    return searchListings(params, { fast: true });
  },
  ['search-results'],
  { revalidate: 120 }
);

const _getCachedQuickSearch = unstable_cache(
  async (query: string, limit: number, context?: { make?: string; model?: string }) => {
    dbg(`MISS quick-search query=${query}`);
    return quickSearch(query, limit, context);
  },
  ['quick-search'],
  { revalidate: 600 }
);

const _getCachedPopularMakes = unstable_cache(
  async (limit: number) => {
    dbg(`MISS popular-makes limit=${limit}`);
    return getPopularMakes(limit);
  },
  ['popular-makes'],
  { revalidate: 3600 }
);

export const getCachedSearchFacets = cache(async (params: SearchParams): Promise<SearchFacets> => {
  dbg(`REQUEST search-facets params=${JSON.stringify(params).slice(0, 80)}`);
  return _getCachedSearchFacets(params);
});

export const getCachedSearchResults = cache(async (params: SearchParams): Promise<SearchResponse> => {
  dbg(`REQUEST search-results params=${JSON.stringify(params).slice(0, 80)}`);
  return _getCachedSearchResults(params);
});

export const getCachedQuickSearch = cache(async (
  query: string,
  limit: number,
  context?: { make?: string; model?: string }
) => {
  dbg(`REQUEST quick-search query=${query}`);
  return _getCachedQuickSearch(query, limit, context);
});

export const getCachedPopularMakes = cache(async (limit: number) => {
  dbg(`REQUEST popular-makes limit=${limit}`);
  return _getCachedPopularMakes(limit);
});

// Re-export for convenience
export { getSearchFacets };
