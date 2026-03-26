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

import { unstable_cache } from 'next/cache';
import {
  getListingsByUserId,
  getListingStatsByUserId,
  type GetListingsByUserOptions,
} from '@alifh/database';

// ─── Tab badge counts (30s) ──────────────────────────────────────────────────

const _getCachedMyListingStats = unstable_cache(
  async (userId: string, listingType: 'personal' | 'work') =>
    getListingStatsByUserId(userId, { listingType }),
  ['my-listing-stats'],
  { revalidate: 30 }
);

export async function getCachedMyListingStats(
  userId: string,
  listingType: 'personal' | 'work' = 'personal'
) {
  return _getCachedMyListingStats(userId, listingType);
}

// ─── Paginated user listings (30s) ───────────────────────────────────────────

const _getCachedMyListings = unstable_cache(
  async (userId: string, options: GetListingsByUserOptions) =>
    getListingsByUserId(userId, options),
  ['my-listings'],
  { revalidate: 30 }
);

export async function getCachedMyListings(
  userId: string,
  options: GetListingsByUserOptions
) {
  return _getCachedMyListings(userId, options);
}
