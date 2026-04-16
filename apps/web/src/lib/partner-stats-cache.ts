/**
 * Partner Stats Cache - Server-only
 *
 * Wraps partner insights queries via Vercel Data Cache (unstable_cache).
 *
 * Cache durations:
 * - Partner descriptive stats: 24 hours — covers all 6 sub-queries
 *   (inventory, sales, engagement, bookings, trends, composition).
 *   Stats are aggregated dashboard metrics that tolerate up to 1-day staleness.
 *   Cache is keyed per partnerId so each dealer gets their own entry.
 *
 * @module lib/partner-stats-cache
 */

import { cache } from 'react';
import { unstable_cache } from 'next/cache';
import { getPartnerDescriptiveStats } from '@alifh/database';

const DEBUG = process.env.CACHE_DEBUG === '1';
const dbg = (msg: string) => { if (DEBUG) console.warn(`[cache] ${msg}`); };

const _getCachedPartnerDescriptiveStats = unstable_cache(
  async (partnerId: string) => {
    dbg(`MISS partner-descriptive-stats partnerId=${partnerId}`);
    return getPartnerDescriptiveStats(partnerId);
  },
  ['partner-descriptive-stats'],
  { revalidate: 86400 }
);

export const getCachedPartnerDescriptiveStats = cache(async (partnerId: string) => {
  dbg(`REQUEST partner-descriptive-stats partnerId=${partnerId}`);
  return _getCachedPartnerDescriptiveStats(partnerId);
});
