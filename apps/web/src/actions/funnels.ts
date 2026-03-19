'use server';

import { getFunnelMatchingListings } from '@alifh/database';
import { getSessionUser } from '@/lib/auth/session-context';

interface FunnelMatchesResult {
  listings: Array<{
    id: string;
    make: string;
    model: string;
    year: number;
    price: number;
    thumbnail: string | null;
  }>;
  total: number;
  hasMore: boolean;
}

export async function getFunnelMatchesAction(
  funnelId: string,
  options: { limit?: number; offset?: number } = {}
): Promise<FunnelMatchesResult> {
  const user = await getSessionUser();
  if (!user) {
    throw new Error('Unauthorized');
  }

  // Get the first partner membership (if any) - must not be viewer
  const membership = (user as any).partnerMemberships?.find(
    (m: any) => m.staffRole !== 'viewer'
  );

  if (!membership?.partnerId) {
    throw new Error('Not a partner staff member');
  }

  const { limit = 20, offset = 0 } = options;

  const { listings, total } = await getFunnelMatchingListings(funnelId, membership.partnerId, {
    limit,
    offset,
  });

  return {
    listings,
    total,
    hasMore: offset + listings.length < total,
  };
}
