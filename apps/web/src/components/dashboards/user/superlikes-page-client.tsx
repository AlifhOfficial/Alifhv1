'use client';

import { useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { RefreshCw, Zap } from 'lucide-react';
import { CarCard } from '@/components/inventory';
import { SuperlikeQuotaBadge } from '@/components/engagement';
import { useSuperlikesListings } from '@/hooks/engagement';
import { useFavoritesStatus } from '@/hooks/engagement/favorites/use-favorites-unified';
import type { FavoritesStatusData, ListingCardData } from '@/hooks/engagement/favorites/use-favorites-unified';

interface SuperlikesPageClientProps {
  initialStatus: FavoritesStatusData;
  initialListings: ListingCardData[];
}

export function SuperlikesPageClient({ initialStatus, initialListings }: SuperlikesPageClientProps) {
  const queryClient = useQueryClient();
  const { listings, superlikeIds, isLoading, error } = useSuperlikesListings({
    initialStatus,
    initialListings,
  });
  const { data: statusData } = useFavoritesStatus({ initialData: initialStatus });
  const quota = statusData?.quota || null;

  const listingsById = useMemo(() => {
    const map = new Map<string, (typeof listings)[0]>();
    listings.forEach((l) => {
      if (l?.id) map.set(l.id, l);
    });
    return map;
  }, [listings]);

  const validSuperlikeIds = useMemo(
    () => superlikeIds.filter((id) => listingsById.has(id)),
    [superlikeIds, listingsById]
  );

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['favorites-status'] });
    queryClient.invalidateQueries({ queryKey: ['superlikes-listings'] });
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base sm:text-lg font-semibold text-foreground">Superlikes</h1>
          <p className="text-[11px] sm:text-xs text-muted-foreground/60 mt-0.5">{validSuperlikeIds.length} saved</p>
        </div>
        <div className="flex items-center gap-2">
          <SuperlikeQuotaBadge quota={quota} />
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="p-1.5 sm:p-2 rounded-lg hover:bg-sidebar transition-colors disabled:opacity-50"
            aria-label="Refresh superlikes"
          >
            <RefreshCw className={`h-4 w-4 text-muted-foreground ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
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
          {validSuperlikeIds.length === 0 ? (
            <div className="flex items-center justify-center min-h-[40vh]">
              <div className="text-center max-w-xs">
                <Zap className="w-8 h-8 mx-auto text-muted-foreground/20 mb-4" strokeWidth={1.5} />
                <h3 className="text-sm font-semibold text-foreground mb-1">No superlikes yet</h3>
                <p className="text-xs text-muted-foreground/60 leading-relaxed">
                  Use superlikes to show extra interest in listings you love
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {validSuperlikeIds.map((listingId) => {
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
