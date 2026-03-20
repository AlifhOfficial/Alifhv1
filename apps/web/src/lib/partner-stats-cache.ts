import { unstable_cache } from 'next/cache';
import { getPartnerDescriptiveStats as getPartnerDescriptiveStatsUncached, type PartnerDescriptiveStats } from '@alifh/database';

const PARTNER_STATS_CACHE_TTL = 60 * 60 * 24;

export async function getCachedPartnerDescriptiveStats(partnerId: string): Promise<PartnerDescriptiveStats> {
  const cachedFn = unstable_cache(
    async () => getPartnerDescriptiveStatsUncached(partnerId),
    ['partner-descriptive-stats', partnerId],
    {
      revalidate: PARTNER_STATS_CACHE_TTL,
      tags: [`partner-descriptive-stats:${partnerId}`],
    }
  );

  return cachedFn();
}

export { PARTNER_STATS_CACHE_TTL };
