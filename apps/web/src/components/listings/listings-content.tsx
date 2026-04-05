/**
 * ListingsContent - Scrollable car cards grid/list
 * Displays loading, error, empty, and results states
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CarCard, CarCardMinimal, CarListItem } from '@/components/inventory';
import { X, XCircle, Package } from 'lucide-react';
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
  /** Current page — used to disable eager image loading on page 2+ */
  currentPage: number;
}

export function ListingsContent({
  listings,
  meta: _meta,
  isLoading,
  isFetching,
  error,
  activeFilterCount,
  viewMode,
  clearFilters,
  loadMore: _loadMore,
  currentPage,
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
        <h3 className="text-subhead font-semibold tracking-tight">Something went wrong</h3>
        <p className="text-caption1 text-muted-foreground mt-1 max-w-xs">{error.message}</p>
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

  // Empty state - simplified to match listing view (CheckCircle2 icon, minimal text)
  if (!isLoading && !isFetching && listings.length === 0) {
    const showFilters = activeFilterCount > 0;
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="text-center max-w-xs">
          {showFilters ? (
            <XCircle className="w-8 h-8 mx-auto mb-4 text-red-500" strokeWidth={1.5} />
          ) : (
            <Package className="w-8 h-8 mx-auto mb-4 text-muted-foreground/60" strokeWidth={1.5} />
          )}
          <h3 className="text-subhead font-semibold text-foreground mb-1">{showFilters ? 'No matches found' : 'No listings yet'}</h3>
          <p className="text-caption1 text-muted-foreground/60 leading-relaxed mb-4">
            {showFilters ? 'Try adjusting your search or filters.' : 'Create your first listing to get started.'}
          </p>
          {showFilters ? (
            <Button 
              variant="secondary" 
              size="default" 
              onClick={clearFilters}
              className="min-w-[140px]"
            >
              Clear all filters
            </Button>
          ) : (
            <Button 
              onClick={handleSellClick}
              className="min-w-[140px] bg-blue-600 text-white hover:bg-blue-700"
            >
              Create Listing
            </Button>
          )}
          <AuthRequiredModal
            open={showModal}
            onClose={closeModal}
            feature="create listings"
            redirectTo="/user-dashboard/listings/new"
          />
        </div>
      </div>
    );
  }

  // Show skeletons ONLY on initial load, not on refetch (to preserve scroll position)
  const showSkeletons = isLoading && listings.length === 0;

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
                priority={currentPage === 1 && index < 4}
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
                priority={currentPage === 1 && index < 4}
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
                priority={currentPage === 1 && index < 4}
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
                priority={currentPage === 1 && index < 4}
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
