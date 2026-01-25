/**
 * Similar Listings Section
 * 
 * Displays 2-3 comparable vehicles at the bottom of listing detail.
 * Shows nothing if no quality matches (intentional - trust over engagement).
 * 
 * Philosophy:
 * - Title: "Similar Listings" — neutral, honest, no sales speak
 * - Max 3 cards, minimum 2 (don't show lonely single card)
 * - Non-blocking load with skeleton
 * - Graceful degradation (errors = invisible)
 */

'use client';

import { CarCard } from '@/components/inventory';
import { useSimilarListings } from '@/hooks/listings';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/utils';

interface SimilarListingsProps {
  listingId: string;
  /** Only fetch when main listing is loaded */
  enabled?: boolean;
  className?: string;
}

export function SimilarListings({ 
  listingId, 
  enabled = true,
  className 
}: SimilarListingsProps) {
  const { listings, isLoading } = useSimilarListings(listingId, { enabled });

  // Don't render anything if no listings and not loading
  if (!isLoading && listings.length === 0) {
    return null;
  }

  return (
    <section className={cn('py-8 border-t border-border', className)}>
      {/* Section Header */}
      <h2 className="text-lg font-bold tracking-tight text-foreground mb-6">
        Similar Listings
      </h2>

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {[1, 2, 3].map((i) => (
            <SimilarListingSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Listings Grid */}
      {!isLoading && listings.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {listings.map((listing) => (
            <CarCard
              key={listing.id}
              id={listing.id}
              make={listing.make}
              model={listing.model}
              year={listing.year}
              trim={listing.trim}
              price={listing.price}
              mileage={listing.mileage}
              emirate={listing.emirate}
              specs={listing.specs}
              thumbnail={listing.thumbnail}
              qiScore={listing.qiScore}
              isBlkListing={listing.isBlkListing}
              partnerName={listing.partnerName ?? undefined}
              partnerLogo={listing.partnerLogo}
              partnerVerified={listing.partnerVerified ?? undefined}
              sellerName={listing.sellerName}
              sellerAvatarUrl={listing.sellerAvatarUrl}
              kycVerified={listing.sellerKycVerified ?? undefined}
            />
          ))}
        </div>
      )}
    </section>
  );
}

/**
 * Skeleton for similar listing cards
 */
function SimilarListingSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="aspect-[16/10] w-full rounded-xl" />
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  );
}
