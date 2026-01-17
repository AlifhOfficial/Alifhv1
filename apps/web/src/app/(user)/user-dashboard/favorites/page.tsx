'use client';

import { useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { Loader2, RefreshCw, Heart } from 'lucide-react';
import { CarCard } from '@/components/inventory';
import { useFavoritesListings } from '@/hooks/engagement';
import { DashboardPageWrapper, DashboardPageHeader } from '@/components/shared/layout/dashboard-page-wrapper';

export default function FavoritesPage() {
  const queryClient = useQueryClient();
  const { listings, favoriteIds, isLoading, error } = useFavoritesListings();

  // Map listings by ID for quick lookup
  const listingsById = useMemo(() => {
    const map = new Map<string, (typeof listings)[0]>();
    listings.forEach((l) => {
      if (l?.id) map.set(l.id, l);
    });
    return map;
  }, [listings]);

  // Filter to only IDs that have valid listing data (excludes deleted listings)
  const validFavoriteIds = useMemo(() => 
    favoriteIds.filter(id => listingsById.has(id)), 
    [favoriteIds, listingsById]
  );

  const handleRefresh = () => {
    // Invalidate both status and listings to refresh everything
    queryClient.invalidateQueries({ queryKey: ['favorites-status'] });
    queryClient.invalidateQueries({ queryKey: ['favorites-listings'] });
  };

  return (
    <DashboardPageWrapper>
      {/* Header */}
      <DashboardPageHeader
        title="Favorites"
        description={`${validFavoriteIds.length} saved`}
      >
        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className="p-2 rounded-lg hover:bg-sidebar transition-colors disabled:opacity-50"
          aria-label="Refresh favorites"
        >
          <RefreshCw className={`h-4 w-4 text-muted-foreground ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </DashboardPageHeader>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
          <p className="text-sm text-red-500">{error}</p>
        </div>
      )}

      {/* Content */}
      {!isLoading && !error && (
        <>
          {validFavoriteIds.length === 0 ? (
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-sidebar flex items-center justify-center">
                  <Heart className="w-5 h-5 text-muted-foreground/40" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">No favorites yet</p>
                  <p className="text-sm text-muted-foreground/60">
                    Tap the heart on listings to save them here
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-3 sm:gap-4 lg:gap-5">
              {validFavoriteIds.map((listingId) => {
                const listing = listingsById.get(listingId)!;
                
                return (
                  <CarCard
                    key={listingId}
                    id={listing.id}
                    make={listing.make ?? ''}
                    model={listing.model ?? ''}
                    year={listing.year ?? 0}
                    trim={listing.trim}
                    price={listing.price ?? 0}
                    mileage={listing.mileage ?? 0}
                    emirate={listing.emirate ?? ''}
                    specs={listing.specs}
                    thumbnail={listing.thumbnail}
                    qiScore={listing.qiScore}
                    isBlkListing={listing.isBlkListing ?? undefined}
                    partnerName={listing.partnerName ?? undefined}
                    partnerLogo={listing.partnerLogo}
                    partnerVerified={listing.partnerVerified ?? undefined}
                    sellerName={listing.sellerName}
                    sellerAvatarUrl={listing.sellerAvatarUrl}
                    kycVerified={listing.sellerKycVerified ?? undefined}
                  />
                );
              })}
            </div>
          )}
        </>
      )}
    </DashboardPageWrapper>
  );
}
