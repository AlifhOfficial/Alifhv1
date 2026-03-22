import { unstable_cache } from 'next/cache';
import {
  getListingDetailed,
  getSimilarListings,
  type SimilarListingCard,
} from '@alifh/database';

const SIMILAR_LISTINGS_CACHE_TTL = 60 * 60 * 12;

async function fetchSimilarListingsForListingUncached(listingId: string): Promise<SimilarListingCard[]> {
  const listing = await getListingDetailed(listingId);

  if (!listing || listing.moderationStatus !== 'approved' || listing.lifecycleStatus !== 'active') {
    return [];
  }

  return getSimilarListings({
    excludeId: listing.id,
    price: listing.price,
    bodyType: listing.bodyType,
    make: listing.make,
    model: listing.model,
    mileage: listing.mileage,
    fuelType: listing.fuelType,
  });
}

export async function getCachedSimilarListingsForListing(listingId: string): Promise<SimilarListingCard[]> {
  const cachedFn = unstable_cache(
    async () => fetchSimilarListingsForListingUncached(listingId),
    ['similar-listings', listingId],
    {
      revalidate: SIMILAR_LISTINGS_CACHE_TTL,
    }
  );

  return cachedFn();
}
