/**
 * ListingsContent - Scrollable car cards grid/list
 * Displays loading, error, empty, and results states
 */

'use client';

import { useEffect } from 'react';
import { CarCard, CarCardMinimal, CarListItem } from '@/components/inventory';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTrackImpressions } from '@/hooks/listings';
import type { SearchResponse } from '@/lib/search-utils';

interface ListingItem {
  id: string;
  make: string;
  model: string;
  year: number;
  trim?: string | null;
  price: number;
  mileage: number;
  emirate: string;
  specs: string;
  thumbnail?: string | null;
  // NOTE: images array excluded from search results for performance - use detail endpoint
  qiScore?: number | null;
  isBlkListing?: boolean | null;
  partnerName?: string | null;
  partnerLogo?: string | null;
  partnerVerified?: boolean | null;
  isBlackTierPartner?: boolean | null;
  sellerName?: string | null;
  sellerAvatarUrl?: string | null;
  sellerKycVerified?: boolean | null;
}

interface ListingsContentProps {
  /** Listings data */
  listings: ListingItem[];
  /** Meta information */
  meta: SearchResponse['meta'] | null;
  /** Loading state */
  isLoading: boolean;
  /** Fetching more state */
  isFetching: boolean;
  /** Error object */
  error: Error | null;
  /** Number of active filters */
  activeFilterCount: number;
  /** View mode */
  viewMode: 'grid' | 'list' | 'minimal';
  /** Clear filters callback */
  clearFilters: () => void;
  /** Load more callback */
  loadMore: () => void;
}

export function ListingsContent({
  listings,
  meta,
  isLoading,
  isFetching,
  error,
  activeFilterCount,
  viewMode,
  clearFilters,
  loadMore,
}: ListingsContentProps) {
  const { trackImpressions } = useTrackImpressions();

  // Track impressions when new listings appear (including infinite scroll)
  // Note: Deduplication is handled at the module level in useTrackImpressions
  useEffect(() => {
    if (listings.length > 0 && !isFetching) {
      const listingIds = listings.map(l => l.id);
      // Queue impressions (debounced, deduplicated at module level)
      trackImpressions(listingIds);
    }
  }, [listings, isFetching, trackImpressions]);

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 sm:py-24">
        <div className="rounded-full bg-destructive/10 p-4 mb-4">
          <X className="w-6 h-6 text-destructive" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Something went wrong</h3>
        <p className="text-sm text-muted-foreground mb-6 max-w-sm text-center">{error.message}</p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Try again
        </Button>
      </div>
    );
  }

  // Empty state (only show after loading is complete)
  if (!isLoading && !isFetching && listings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 sm:py-24">
        <div className="rounded-full bg-muted/50 p-4 mb-4">
          <Search className="w-6 h-6 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No cars found</h3>
        <p className="text-sm text-muted-foreground mb-6">Try adjusting your filters or search terms</p>
        {activeFilterCount > 0 && (
          <Button variant="outline" onClick={clearFilters}>
            Clear all filters
          </Button>
        )}
      </div>
    );
  }

  // Show skeletons when loading or fetching new data
  const showSkeletons = isLoading || isFetching;

  // Results - immediate skeleton swap, no fade animations
  return (
    <div>
      {/* Mobile/Tablet: grid or minimal */}
      <div className="lg:hidden">
        {showSkeletons ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              viewMode === 'minimal' 
                ? <CarCardMinimal.Skeleton key={i} />
                : <CarCard.Skeleton key={i} />
            ))}
          </div>
        ) : viewMode === 'minimal' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
            {listings.map((listing, index) => (
              <CarCardMinimal
                key={listing.id}
                id={listing.id}
                make={listing.make}
                model={listing.model}
                thumbnail={listing.thumbnail}
                isBlkListing={listing.isBlkListing}
                partnerName={listing.partnerName || undefined}
                partnerLogo={listing.partnerLogo || undefined}
                partnerVerified={listing.partnerVerified || undefined}
                isBlackTierPartner={listing.isBlackTierPartner || undefined}
                sellerName={listing.sellerName || undefined}
                sellerAvatarUrl={listing.sellerAvatarUrl || undefined}
                kycVerified={listing.sellerKycVerified || undefined}
                priority={index < 4}
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
            {listings.map((listing, index) => (
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
                partnerName={listing.partnerName || undefined}
                partnerLogo={listing.partnerLogo || undefined}
                partnerVerified={listing.partnerVerified || undefined}
                isBlackTierPartner={listing.isBlackTierPartner || undefined}
                sellerName={listing.sellerName || undefined}
                sellerAvatarUrl={listing.sellerAvatarUrl || undefined}
                kycVerified={listing.sellerKycVerified || undefined}
                priority={index < 4}
              />
            ))}
          </div>
        )}
      </div>

      {/* Desktop (lg+): respects viewMode */}
      <div className="hidden lg:block">
        {showSkeletons ? (
          viewMode === 'list' ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <CarListItem.Skeleton key={i} />
              ))}
            </div>
          ) : viewMode === 'minimal' ? (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(340px,1fr))] gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <CarCardMinimal.Skeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(340px,1fr))] gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <CarCard.Skeleton key={i} />
              ))}
            </div>
          )
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(340px,1fr))] gap-6">
            {listings.map((listing, index) => (
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
                partnerName={listing.partnerName || undefined}
                partnerLogo={listing.partnerLogo || undefined}
                partnerVerified={listing.partnerVerified || undefined}
                isBlackTierPartner={listing.isBlackTierPartner || undefined}
                sellerName={listing.sellerName || undefined}
                sellerAvatarUrl={listing.sellerAvatarUrl || undefined}
                kycVerified={listing.sellerKycVerified || undefined}
                priority={index < 4}
              />
            ))}
          </div>
        ) : viewMode === 'minimal' ? (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(340px,1fr))] gap-6">
            {listings.map((listing, index) => (
              <CarCardMinimal
                key={listing.id}
                id={listing.id}
                make={listing.make}
                model={listing.model}
                thumbnail={listing.thumbnail}
                isBlkListing={listing.isBlkListing}
                partnerName={listing.partnerName || undefined}
                partnerLogo={listing.partnerLogo || undefined}
                partnerVerified={listing.partnerVerified || undefined}
                isBlackTierPartner={listing.isBlackTierPartner || undefined}
                sellerName={listing.sellerName || undefined}
                sellerAvatarUrl={listing.sellerAvatarUrl || undefined}
                kycVerified={listing.sellerKycVerified || undefined}
                priority={index < 8}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {listings.map((listing) => (
              <CarListItem
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
                partnerName={listing.partnerName || undefined}
                partnerLogo={listing.partnerLogo || undefined}
                partnerVerified={listing.partnerVerified || undefined}
                isBlackTierPartner={listing.isBlackTierPartner || undefined}
                sellerName={listing.sellerName || undefined}
                sellerAvatarUrl={listing.sellerAvatarUrl || undefined}
                kycVerified={listing.sellerKycVerified || undefined}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
