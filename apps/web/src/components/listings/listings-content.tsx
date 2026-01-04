/**
 * ListingsContent - Scrollable car cards grid/list
 * Displays loading, error, empty, and results states
 */

'use client';

import { CarCard, CarListItem, CarCardSkeleton, CarListItemSkeleton } from '@/components/inventory';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
  images?: string[] | null;
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
  viewMode: 'grid' | 'list';
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
  // Error state
  if (error) {
    return (
      <div className="rounded-lg border border-border/30 p-8 text-center">
        <X className="w-8 h-8 text-red-500 mx-auto mb-3" />
        <p className="font-medium mb-1">Something went wrong</p>
        <p className="text-sm text-muted-foreground mb-4">{error.message}</p>
        <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
          Try again
        </Button>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <>
        {/* Mobile/Tablet: always grid */}
        <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <CarCardSkeleton key={i} />
          ))}
        </div>
        
        {/* Desktop (lg+): respects viewMode */}
        <div className="hidden lg:block">
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <CarCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <CarListItemSkeleton key={i} />
              ))}
            </div>
          )}
        </div>
      </>
    );
  }

  // Empty state
  if (listings.length === 0) {
    return (
      <div className="rounded-lg border border-border/30 p-6 text-center">
        <Search className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
        <p className="font-medium mb-1">No cars found</p>
        <p className="text-sm text-muted-foreground mb-4">Try adjusting your filters</p>
        {activeFilterCount > 0 && (
          <Button variant="outline" size="sm" onClick={clearFilters}>
            Clear filters
          </Button>
        )}
      </div>
    );
  }

  // Results
  return (
    <>
      {/* Mobile/Tablet: always grid */}
      <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
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
            images={listing.images}
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

      {/* Desktop (lg+): respects viewMode */}
      <div className="hidden lg:block">
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-5">
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
                images={listing.images}
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
                images={listing.images}
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

      {/* Load More Button */}
      {meta?.hasMore && (
        <div className="flex justify-center pt-4 sm:pt-6 md:pt-8">
          <Button variant="outline" size="sm" onClick={loadMore} disabled={isFetching} className="text-xs sm:text-sm">
            {isFetching ? 'Loading...' : `Load more (${listings.length}/${meta.total})`}
          </Button>
        </div>
      )}
    </>
  );
}
