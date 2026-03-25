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

const _getCachedSearchFacets = unstable_cache(
  async (params: SearchParams) => getSearchFacets(params),
  ['search-facets'],
  { revalidate: 3600 } // 1 hour
);

const _getCachedSearchResults = unstable_cache(
  async (params: SearchParams) => searchListings(params, { fast: true }),
  ['search-results'],
  { revalidate: 120 } // 2 minutes
);

// Cache quick search (autocomplete) for 10 minutes
// Longer cache OK since make/model/trim names don't change often
const _getCachedQuickSearch = unstable_cache(
  async (query: string, limit: number, context?: { make?: string; model?: string }) => 
    quickSearch(query, limit, context),
  ['quick-search'],
  { revalidate: 600 } // 10 minutes
);

// Cache popular makes for 1 hour
// Very stable data - top makes rarely change
const _getCachedPopularMakes = unstable_cache(
  async (limit: number) => getPopularMakes(limit),
  ['popular-makes'],
  { revalidate: 3600 } // 1 hour
);

export async function getCachedSearchFacets(params: SearchParams): Promise<SearchFacets> {
  return _getCachedSearchFacets(params);
}

export async function getCachedSearchResults(params: SearchParams): Promise<SearchResponse> {
  return _getCachedSearchResults(params);
}

export async function getCachedQuickSearch(
  query: string, 
  limit: number, 
  context?: { make?: string; model?: string }
) {
  return _getCachedQuickSearch(query, limit, context);
}

export async function getCachedPopularMakes(limit: number) {
  return _getCachedPopularMakes(limit);
}

// Re-export for convenience
export { getSearchFacets };
