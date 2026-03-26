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

import { unstable_cache } from 'next/cache';
import { getUserDashboardStats } from '../../../../packages/database/src/queries/user-dashboard';

// Cache dashboard stats for 24 hours
// Stats change infrequently - users don't need real-time updates for views/saves/counts
export const getCachedUserDashboardStats = unstable_cache(
  async (userId: string) => getUserDashboardStats(userId),
  ['user-dashboard-stats'],
  { revalidate: 86400 } // 24 hours
);
