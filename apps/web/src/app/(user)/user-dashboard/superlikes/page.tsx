import { getSessionUser } from '@/lib/auth/session-context';
import { getFavoriteStatusForListings, getListingCards, getSuperlikeQuotaForUser } from '@alifh/database';
import { SuperlikesPageClient } from '@/components/dashboards/user/superlikes-page-client';
import type { ListingCardData } from '@/hooks/engagement/favorites/use-favorites-unified';

export default async function SuperlikesPage() {
  const user = await getSessionUser();
  if (!user) return null;

  const [status, quota] = await Promise.all([
    getFavoriteStatusForListings(user.id),
    getSuperlikeQuotaForUser(user.id),
  ]);

  const initialListings: ListingCardData[] = status.superlikes.length > 0
    ? (await getListingCards({
        ids: status.superlikes.slice(0, 100),
        visibility: 'public',
        limit: 100,
      })).map((listing) => ({
        id: listing.id,
        make: listing.make,
        model: listing.model,
        year: listing.year,
        trim: listing.trim,
        price: listing.price,
        mileage: listing.mileage,
        emirate: listing.emirate,
        specs: listing.specs,
        thumbnail: listing.thumbnail,
        qiScore: null,
        partnerName: listing.partnerName,
        partnerLogo: listing.partnerLogo,
        partnerVerified: listing.partnerVerified,
        isBlkListing: listing.isBlkListing,
        sellerName: listing.sellerName,
        sellerAvatarUrl: listing.sellerAvatarUrl,
        sellerKycVerified: listing.sellerKycVerified,
      }))
    : [];

  return (
    <SuperlikesPageClient
      initialStatus={{
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
      }}
      initialListings={initialListings}
    />
  );
}
