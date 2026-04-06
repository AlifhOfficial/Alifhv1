import { calculateUserStats } from '@alifh/database';
import { unstable_cache } from 'next/cache';

// Shared 24h cache for user stats across API routes and server components.
export const getCachedUserStats = unstable_cache(
  async (userId: string) => calculateUserStats(userId),
  ['user-stats'],
  { revalidate: 86400, tags: ['user-stats'] }
);
