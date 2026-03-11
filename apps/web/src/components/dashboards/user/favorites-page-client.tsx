'use client';

import { useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { RefreshCw, Heart } from 'lucide-react';
import { CarCard } from '@/components/inventory';
import { useFavoritesListings } from '@/hooks/engagement';
import type { FavoritesStatusData, ListingCardData } from '@/hooks/engagement/favorites/use-favorites-unified';

interface FavoritesPageClientProps {
  initialStatus: FavoritesStatusData;
  initialListings: ListingCardData[];
}

export function FavoritesPageClient({ initialStatus, initialListings }: FavoritesPageClientProps) {
  const queryClient = useQueryClient();
  const { listings, favoriteIds, isLoading, error } = useFavoritesListings({
    initialStatus,
    initialListings,
  });

  const listingsById = useMemo(() => {
    const map = new Map<string, (typeof listings)[0]>();
    listings.forEach((l) => {
      if (l?.id) map.set(l.id, l);
    });
    return map;
  }, [listings]);

  const validFavoriteIds = useMemo(
    () => favoriteIds.filter((id) => listingsById.has(id)),
    [favoriteIds, listingsById]
  );

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['favorites-status'] });
    queryClient.invalidateQueries({ queryKey: ['favorites-listings'] });
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base sm:text-lg font-semibold text-foreground">Favorites</h1>
          <p className="text-[11px] sm:text-xs text-muted-foreground/60 mt-0.5">{validFavoriteIds.length} saved</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className="p-1.5 sm:p-2 rounded-lg hover:bg-sidebar transition-colors disabled:opacity-50"
          aria-label="Refresh favorites"
        >
          <RefreshCw className={`h-4 w-4 text-muted-foreground ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {isLoading && (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {[...Array(6)].map((_, i) => (
            <CarCard.Skeleton key={i} />
          ))}
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-3 sm:p-4">
          <p className="text-xs sm:text-sm text-red-500">{error}</p>
        </div>
      )}

      {!isLoading && !error && (
        <>
          {validFavoriteIds.length === 0 ? (
            <div className="flex items-center justify-center min-h-[40vh]">
              <div className="text-center max-w-xs">
                <Heart className="w-8 h-8 mx-auto text-muted-foreground/20 mb-4" strokeWidth={1.5} />
                <h3 className="text-sm font-semibold text-foreground mb-1">No favorites yet</h3>
                <p className="text-xs text-muted-foreground/60 leading-relaxed">
                  Tap the heart icon on any listing to save it here
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
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
    </div>
  );
}
