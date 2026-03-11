import { getSessionUser } from '@/lib/auth/session-context';
import { getFavoritesWithListings, getSuperlikeQuotaForUser } from '@alifh/database';
import { FavoritesPageClient } from '@/components/dashboards/user/favorites-page-client';

export default async function FavoritesPage() {
  const user = await getSessionUser();
  if (!user) return null;

  const [{ favorites, superlikes, listings }, quota] = await Promise.all([
    getFavoritesWithListings(user.id, { limit: 100 }),
    getSuperlikeQuotaForUser(user.id),
  ]);

  return (
    <FavoritesPageClient
      initialStatus={{
        favorites,
        superlikes,
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
      }}
      initialListings={listings}
    />
  );
}
