import { cache } from 'react';
import { unstable_cache } from 'next/cache';
import { calculateUserStats } from '@alifh/database';

const DEBUG = process.env.CACHE_DEBUG === '1';
const dbg = (msg: string) => { if (DEBUG) console.warn(`[cache] ${msg}`); };

const _getCachedUserStats = unstable_cache(
  async (userId: string) => {
    dbg(`MISS user-stats userId=${userId}`);
    return calculateUserStats(userId);
  },
  ['user-stats'],
  { revalidate: 86400, tags: ['user-stats'] }
);

export const getCachedUserStats = cache(async (userId: string) => {
  dbg(`REQUEST user-stats userId=${userId}`);
  return _getCachedUserStats(userId);
});
