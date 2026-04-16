'use server';

import { unstable_cache } from 'next/cache';
import {
  getListingCards,
  getFavoriteStatusForListings,
  getSuperlikeQuotaForUser,
} from '@alifh/database';
import { getSessionUser } from '@/lib/auth/session-context';
import type { FavoritesStatusData } from '@/hooks/engagement/favorites/use-favorites-unified';

const DEBUG = process.env.CACHE_DEBUG === '1';
const dbg = (msg: string) => { if (DEBUG) console.warn(`[cache] ${msg}`); };

const getCachedNavbarFavoriteListings = unstable_cache(
  async (idsKey: string) => {
    dbg(`MISS navbar-favorite-listings ids=${idsKey}`);
    const ids = idsKey.split(',').filter(Boolean);
    if (!ids.length) return [];

    const listings = await getListingCards({ ids, status: 'published' });
    const byId = new Map(listings.map((l) => [l.id, l]));

    return ids
      .map((id) => {
        const l = byId.get(id);
        if (!l) return null;
        return {
          id: l.id,
          make: l.make ?? null,
          model: l.model ?? null,
          year: l.year ?? null,
          price: l.price ?? null,
          thumbnail: l.thumbnail ?? null,
        };
      })
      .filter(Boolean) as Array<{
      id: string;
      make: string | null;
      model: string | null;
      year: number | null;
      price: number | null;
      thumbnail: string | null;
    }>;
  },
  ['navbar-favorite-listings'],
  { revalidate: 30 }
);

export async function getFavoritesStatusAction(): Promise<FavoritesStatusData> {
  const user = await getSessionUser();
  if (!user) {
    return {
      favorites: [],
      superlikes: [],
      quota: {
        currentMonthSuperlikesUsed: 0,
        maxSuperlikesPerMonth: 0,
        premiumSuperlikesBonus: 0,
        remaining: 0,
        periodEndDate: null,
        periodStartDate: null,
      },
    };
  }

  const [status, quota] = await Promise.all([
    getFavoriteStatusForListings(user.id),
    getSuperlikeQuotaForUser(user.id),
  ]);

  return {
    favorites: status.favorites,
    superlikes: status.superlikes,
    quota: {
      currentMonthSuperlikesUsed: quota.currentMonthSuperlikesUsed,
      maxSuperlikesPerMonth: quota.maxSuperlikesPerMonth,
      premiumSuperlikesBonus: quota.premiumSuperlikesBonus || 0,
      remaining:
        (quota.maxSuperlikesPerMonth + (quota.premiumSuperlikesBonus || 0)) -
        quota.currentMonthSuperlikesUsed,
      periodEndDate: quota.periodEndDate,
      periodStartDate: quota.periodStartDate,
    },
  };
}

export async function getNavbarFavoriteListings(ids: string[]) {
  if (!ids.length) return [];
  const top3 = ids.slice(0, 3);
  const key = top3.join(',');
  dbg(`REQUEST navbar-favorite-listings ids=${key}`);
  return getCachedNavbarFavoriteListings(key);
}

export async function getListingCardsByIdsAction(ids: string[]) {
  if (!ids.length) return [];
  return getListingCards({ ids, visibility: 'public', limit: 100, offset: 0 });
}
