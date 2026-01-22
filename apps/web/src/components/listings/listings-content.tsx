/**
 * ListingsContent - Scrollable car cards grid/list
 * Displays loading, error, empty, and results states
 */

'use client';

import { useEffect, useRef } from 'react';
import { CarCard, CarCardMinimal, CarListItem } from '@/components/inventory';
import { Search, X, ChevronLeft, ChevronRight } from 'lucide-react';
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
  /** Current page (1-indexed) */
  currentPage: number;
  /** Total number of pages */
  totalPages: number;
  /** Go to specific page callback */
  goToPage: (page: number) => void;
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
  currentPage,
  totalPages,
  goToPage,
}: ListingsContentProps) {
  const { trackImpressions } = useTrackImpressions();
  const prevPageRef = useRef(currentPage);

  // Scroll to top when page changes (after new data loads)
  useEffect(() => {
    if (prevPageRef.current !== currentPage && !isFetching) {
      window.scrollTo({ top: 0, behavior: 'instant' });
      prevPageRef.current = currentPage;
    }
  }, [currentPage, isFetching]);

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

      {/* Pagination */}
      {totalPages > 1 && !showSkeletons && (
        <div className="flex flex-col items-center gap-3 pt-6 sm:pt-8 md:pt-10">
          {/* Page info */}
          <p className="text-xs sm:text-sm text-muted-foreground">
            Page {currentPage} of {totalPages} • {meta?.total ?? 0} results
          </p>
          
          {/* Pagination controls */}
          <div className="flex items-center gap-1">
            {/* Previous button */}
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1 || isFetching}
              className="p-2 rounded-lg hover:bg-secondary/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            {/* Page numbers */}
            {(() => {
              const pages: (number | 'ellipsis')[] = [];
              const maxVisible = 5;
              
              if (totalPages <= maxVisible + 2) {
                // Show all pages if there aren't many
                for (let i = 1; i <= totalPages; i++) {
                  pages.push(i);
                }
              } else {
                // Always show first page
                pages.push(1);
                
                if (currentPage <= 3) {
                  // Near start: 1 2 3 4 ... last
                  for (let i = 2; i <= 4; i++) {
                    pages.push(i);
                  }
                  pages.push('ellipsis');
                  pages.push(totalPages);
                } else if (currentPage >= totalPages - 2) {
                  // Near end: 1 ... n-3 n-2 n-1 n
                  pages.push('ellipsis');
                  for (let i = totalPages - 3; i <= totalPages; i++) {
                    pages.push(i);
                  }
                } else {
                  // Middle: 1 ... current-1 current current+1 ... last
                  pages.push('ellipsis');
                  pages.push(currentPage - 1);
                  pages.push(currentPage);
                  pages.push(currentPage + 1);
                  pages.push('ellipsis');
                  pages.push(totalPages);
                }
              }
              
              return pages.map((page, idx) => {
                if (page === 'ellipsis') {
                  return (
                    <span key={`ellipsis-${idx}`} className="w-8 h-8 flex items-center justify-center text-muted-foreground">
                      …
                    </span>
                  );
                }
                
                return (
                  <button
                    key={page}
                    onClick={() => goToPage(page)}
                    disabled={isFetching}
                    className={`w-8 h-8 rounded-lg text-sm transition-colors disabled:cursor-not-allowed ${
                      currentPage === page
                        ? 'bg-foreground text-background font-medium'
                        : 'text-muted-foreground hover:bg-secondary/50'
                    }`}
                  >
                    {page}
                  </button>
                );
              });
            })()}
            
            {/* Next button */}
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages || isFetching}
              className="p-2 rounded-lg hover:bg-secondary/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
