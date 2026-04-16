/**
 * Dashboard Cache - Server-only
 *
 * Caches user dashboard queries via Vercel Data Cache.
 *
 * Cache durations:
 * - Dashboard stats: 24 hours (listing counts, views, saves, sold count, etc.)
 *
 * @module lib/dashboard-cache
 */

import { cache } from 'react';
import { unstable_cache } from 'next/cache';
import { getUserDashboardStats } from '../../../../packages/database/src/queries/user-dashboard';

const DEBUG = process.env.CACHE_DEBUG === '1';
const dbg = (msg: string) => { if (DEBUG) console.warn(`[cache] ${msg}`); };

const _getCachedUserDashboardStats = unstable_cache(
  async (userId: string) => {
    dbg(`MISS user-dashboard-stats userId=${userId}`);
    return getUserDashboardStats(userId);
  },
  ['user-dashboard-stats'],
  { revalidate: 86400 }
);

export const getCachedUserDashboardStats = cache(async (userId: string) => {
  dbg(`REQUEST user-dashboard-stats userId=${userId}`);
  return _getCachedUserDashboardStats(userId);
});
