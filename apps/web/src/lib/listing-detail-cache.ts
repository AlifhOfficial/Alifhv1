import { unstable_cache } from 'next/cache';
import {
  getListingDetailed,
  getDealerBaseProfile,
  getUserProfileByUserId,
  getStaffEffectivePhone,
  calculatePartnerStats,
  calculateUserStats,
  hasPublishedShowroom,
} from '@alifh/database';
import type { SellerData } from '@/hooks/listings';
import type { SimilarListingCard } from '@/hooks/listings/use-similar-listings';
import { getCachedSimilarListingsForListing } from '@/lib/similar-listings-cache';

const LISTING_DETAIL_CACHE_TTL = 300;

type ListingResult = NonNullable<Awaited<ReturnType<typeof getListingDetailed>>>;

export interface CachedListingDetailBundle {
  listing: ListingResult | null;
  sellerData: SellerData | null;
  similarListings: SimilarListingCard[];
}

async function fetchSellerData(listing: ListingResult): Promise<SellerData | null> {
  try {
    if (listing.partnerId) {
      const [partnerProfile, staffContact, partnerStats, hasShowroom] = await Promise.all([
        getDealerBaseProfile(listing.partnerId),
        listing.postedByRole === 'staff' && listing.userId
          ? getStaffEffectivePhone(listing.userId, listing.partnerId)
          : Promise.resolve(null),
        calculatePartnerStats(listing.partnerId),
        hasPublishedShowroom(listing.partnerId),
      ]);

      return {
        type: 'partner' as const,
        partnerId: listing.partnerId,
        partner: partnerProfile,
        partnerStats: partnerStats ? { ...partnerStats, hasShowroom } : null,
        staffContact: staffContact ? {
          phone: staffContact.phone,
          displayName: staffContact.displayName,
        } : null,
      } as unknown as SellerData;
    }

    const [userProfile, userStats] = await Promise.all([
      getUserProfileByUserId(listing.userId),
      calculateUserStats(listing.userId),
    ]);

    return {
      type: 'user' as const,
      userId: listing.userId,
      userProfile,
      userStats,
    } as unknown as SellerData;
  } catch (error) {
    console.error('[listing-detail-cache] fetchSellerData failed:', error);
    return null;
  }
}

async function fetchPublicListingDetailBundleUncached(listingId: string): Promise<CachedListingDetailBundle> {
  const listing = await getListingDetailed(listingId);

  if (!listing || listing.moderationStatus !== 'approved' || listing.lifecycleStatus !== 'active') {
    return {
      listing: null,
      sellerData: null,
      similarListings: [],
    };
  }

  const [sellerData, similarListings] = await Promise.all([
    fetchSellerData(listing),
    getCachedSimilarListingsForListing(listing.id),
  ]);

  return {
    listing,
    sellerData,
    similarListings,
  };
}

export async function getCachedPublicListingDetailBundle(listingId: string): Promise<CachedListingDetailBundle> {
  const cachedFn = unstable_cache(
    async () => fetchPublicListingDetailBundleUncached(listingId),
    ['listing-detail-bundle', listingId],
    {
      revalidate: LISTING_DETAIL_CACHE_TTL,
    }
  );

  return cachedFn();
}
