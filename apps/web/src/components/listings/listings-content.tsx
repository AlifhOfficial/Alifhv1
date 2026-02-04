/**
 * ListingsContent - Scrollable car cards grid/list
 * Displays loading, error, empty, and results states
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CarCard, CarCardMinimal, CarListItem } from '@/components/inventory';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTrackImpressions } from '@/hooks/listings';
import { useAuthRequired } from '@/hooks/use-auth-required';
import { AuthRequiredModal } from '@/components/auth/auth-required-modal';
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
  const router = useRouter();
  const { trackImpressions } = useTrackImpressions();
  const { isAuthenticated, showModal, openModal, closeModal } = useAuthRequired({
    feature: "create listings",
    redirectTo: "/user-dashboard/listings/new",
  });

  const handleSellClick = () => {
    if (isAuthenticated) {
      router.push('/user-dashboard/listings/new');
    } else {
      openModal();
    }
  };

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

  // Empty state - full width and height card design
  if (!isLoading && !isFetching && listings.length === 0) {
    return (
      <>
        <div className="w-full">
          <div className="rounded-xl border border-border/40 bg-sidebar p-12 sm:p-16 min-h-[60vh] flex items-center justify-center">
            <div className="flex flex-col items-center text-center max-w-2xl mx-auto">
              <div className="rounded-full bg-muted/50 p-4 mb-6">
                <Search className="w-8 h-8 text-muted-foreground" strokeWidth={2} />
              </div>
              
              <h3 className="text-xl font-semibold tracking-tight text-foreground mb-3">
                {activeFilterCount > 0 ? 'No matches found' : 'Be the first one to list'}
              </h3>
              
              <p className="text-sm text-muted-foreground leading-relaxed max-w-lg mb-8">
                {activeFilterCount > 0 
                  ? 'Try adjusting your search criteria or removing some filters to see more results.' 
                  : 'No listings available yet. Start your journey by adding the first vehicle to our marketplace.'}
              </p>

              {activeFilterCount > 0 ? (
                <div className="pt-6 border-t border-border/40 w-full max-w-md">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={clearFilters}
                    className="min-w-[160px]"
                  >
                    Clear all filters
                  </Button>
                </div>
              ) : (
                <Button 
                  onClick={handleSellClick}
                  className="h-11 px-8 bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm"
                >
                  Sell Your Car
                </Button>
              )}
            </div>
          </div>
        </div>
        <AuthRequiredModal
          open={showModal}
          onClose={closeModal}
          feature="create listings"
          redirectTo="/user-dashboard/listings/new"
        />
      </>
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
