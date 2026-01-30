'use client';

import { useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { Loader2, RefreshCw, Sparkles } from 'lucide-react';
import { CarListItem } from '@/components/inventory';
import { SuperlikeQuotaBadge } from '@/components/engagement';
import { useSuperlikesListings, useFavoritesStatus } from '@/hooks/engagement';

export default function SuperlikesPage() {
  const queryClient = useQueryClient();
  const { data: statusData } = useFavoritesStatus();
  const { listings, superlikeIds, isLoading, error } = useSuperlikesListings();
  
  const quota = statusData?.quota || null;

  // Map listings by ID for quick lookup
  const listingsById = useMemo(() => {
    const map = new Map<string, (typeof listings)[0]>();
    listings.forEach((l) => {
      if (l?.id) map.set(l.id, l);
    });
    return map;
  }, [listings]);

  // Filter to only IDs that have valid listing data (excludes deleted listings)
  const validSuperlikeIds = useMemo(() => 
    superlikeIds.filter(id => listingsById.has(id)), 
    [superlikeIds, listingsById]
  );

  const handleRefresh = () => {
    // Invalidate both status and listings to refresh everything
    queryClient.invalidateQueries({ queryKey: ['favorites-status'] });
    queryClient.invalidateQueries({ queryKey: ['superlikes-listings'] });
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
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

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12 sm:py-20">
          <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-3 sm:p-4">
          <p className="text-xs sm:text-sm text-red-500">{error}</p>
        </div>
      )}

      {/* Content */}
      {!isLoading && !error && (
        <>
          {validSuperlikeIds.length === 0 ? (
            <div className="flex items-center justify-center min-h-[50vh]">
              <div className="text-center max-w-xs">
                <Sparkles className="w-8 h-8 mx-auto text-muted-foreground/20 mb-4" strokeWidth={1.5} />
                <h3 className="text-sm font-semibold text-foreground mb-1">No superlikes yet</h3>
                <p className="text-xs text-muted-foreground/60 leading-relaxed">
                  Use superlikes to show extra interest in listings you love
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-2 sm:space-y-3">
              {validSuperlikeIds.map((listingId) => {
                const listing = listingsById.get(listingId)!;
                
                return (
                  <CarListItem
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
