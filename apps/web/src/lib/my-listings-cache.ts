/**
 * My Listings Cache - Server-only
 *
 * Caches queries for the /user-dashboard/listings/my-listings page via Vercel Data Cache.
 *
 * Cache durations:
 * - Listing stats (tab badge counts): 30s
 *     Same aggregate fires on every tab switch (?status=active, ?status=archived …).
 *     30s prevents the redundant hit while still reflecting mutations quickly.
 * - Paginated listings:               30s
 *     Each unique (userId + status + sort + page + q) combo is a separate entry.
 *     Navigating back to a visited tab within 30s skips the DB entirely.
 *
 * @module lib/my-listings-cache
 */

import { cache } from 'react';
import { unstable_cache } from 'next/cache';
import {
  getListingsByUserId,
  getListingStatsByUserId,
  type GetListingsByUserOptions,
} from '@alifh/database';

const DEBUG = process.env.CACHE_DEBUG === '1';
const dbg = (msg: string) => { if (DEBUG) console.warn(`[cache] ${msg}`); };

// ─── Tab badge counts (30s) ──────────────────────────────────────────────────

const _getCachedMyListingStats = unstable_cache(
  async (userId: string, listingType: 'personal' | 'work') => {
    dbg(`MISS my-listing-stats userId=${userId} type=${listingType}`);
    return getListingStatsByUserId(userId, { listingType });
  },
  ['my-listing-stats'],
  { revalidate: 30 }
);

export const getCachedMyListingStats = cache(async (
  userId: string,
  listingType: 'personal' | 'work' = 'personal'
) => {
  dbg(`REQUEST my-listing-stats userId=${userId} type=${listingType}`);
  return _getCachedMyListingStats(userId, listingType);
});

// ─── Paginated user listings (30s) ───────────────────────────────────────────

const _getCachedMyListings = unstable_cache(
  async (userId: string, options: GetListingsByUserOptions) => {
    dbg(`MISS my-listings userId=${userId}`);
    return getListingsByUserId(userId, options);
  },
  ['my-listings'],
  { revalidate: 30 }
);

export const getCachedMyListings = cache(async (
  userId: string,
  options: GetListingsByUserOptions
) => {
  dbg(`REQUEST my-listings userId=${userId}`);
  return _getCachedMyListings(userId, options);
});
