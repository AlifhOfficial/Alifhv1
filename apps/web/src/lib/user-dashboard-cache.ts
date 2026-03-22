import { unstable_cache } from 'next/cache';
import { getUserDashboardStats as getUserDashboardStatsUncached, type UserDashboardStats } from '@alifh/database';

const USER_DASHBOARD_STATS_CACHE_TTL = 3600;

export async function getCachedUserDashboardStats(userId: string): Promise<UserDashboardStats> {
  const cachedFn = unstable_cache(
    async () => getUserDashboardStatsUncached(userId),
    ['user-dashboard-stats', userId],
    {
      revalidate: USER_DASHBOARD_STATS_CACHE_TTL,
    }
  );

  return cachedFn();
}

