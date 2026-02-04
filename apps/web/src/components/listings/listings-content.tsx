/**
 * ListingsContent - Scrollable car cards grid/list
 * Displays loading, error, empty, and results states
 */

'use client';

import { useEffect } from 'react';
import { CarCard, CarCardMinimal, CarListItem } from '@/components/inventory';
import { Search, X, Car } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTrackImpressions } from '@/hooks/listings';
import type { SearchResponse } from '@/lib/search-utils';

// Empty state config - consistent with booking views
const EMPTY_STATE_CONFIG = {
  noResults: { 
    icon: Search, 
    color: 'text-foreground', 
    message: 'No matches found', 
    subMessage: 'Try adjusting your search or filters' 
  },
  noListings: { 
    icon: Car, 
    color: 'text-foreground', 
    message: 'No cars available', 
    subMessage: 'Check back soon for new listings' 
  },
};

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

  // Error state - consistent with booking views
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <X className="w-5 h-5 text-destructive mb-3" strokeWidth={2} />
        <h3 className="text-sm font-semibold tracking-tight">Something went wrong</h3>
        <p className="text-xs text-muted-foreground mt-1 max-w-xs">{error.message}</p>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => window.location.reload()}
          className="mt-4"
        >
          Try again
        </Button>
      </div>
    );
  }

  // Empty state - consistent with booking views
  if (!isLoading && !isFetching && listings.length === 0) {
    const config = activeFilterCount > 0 
      ? EMPTY_STATE_CONFIG.noResults 
      : EMPTY_STATE_CONFIG.noListings;
    const Icon = config.icon;
    
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <Icon className={`w-5 h-5 ${config.color} mb-3`} strokeWidth={2} />
        <h3 className="text-sm font-semibold tracking-tight">{config.message}</h3>
        <p className="text-xs text-muted-foreground mt-1">{config.subMessage}</p>
        {activeFilterCount > 0 && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={clearFilters}
            className="mt-4"
          >
            Clear filters
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
      {/* Mobile/Tablet: mobile card, grid, or minimal */}
      <div className="lg:hidden">
        {showSkeletons ? (
          viewMode === 'minimal' ? (
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <CarCardMinimal.Skeleton key={i} />
              ))}
            </div>
          ) : (
            /* Mobile grid/list view - use responsive CarCard */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <CarCard.Skeleton key={i} />
              ))}
            </div>
          )
        ) : viewMode === 'minimal' ? (
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
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
          /* Mobile grid/list view - use responsive CarCard */
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
