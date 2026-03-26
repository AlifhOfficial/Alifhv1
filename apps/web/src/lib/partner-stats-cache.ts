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

import { unstable_cache } from 'next/cache';
import { getPartnerDescriptiveStats } from '@alifh/database';

export const getCachedPartnerDescriptiveStats = unstable_cache(
  async (partnerId: string) => getPartnerDescriptiveStats(partnerId),
  ['partner-descriptive-stats'],
  { revalidate: 86400 } // 24 hours
);
