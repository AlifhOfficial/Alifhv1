'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Loader2, RefreshCw, Heart } from 'lucide-react';
import { CarCard } from '@/components/inventory';
import { useFavoritesStatus } from '@/hooks/engagement';
import { DashboardPageWrapper, DashboardPageHeader } from '@/components/shared/layout/dashboard-page-wrapper';

type ListingPayload = {
  id: string;
  make: string | null;
  model: string | null;
  year: number | null;
  trim: string | null;
  price: number | null;
  mileage: number | null;
  emirate: string | null;
  specs: string | null;
  thumbnail: string | null;
  images?: string[] | null; // Optional: Not returned in car-card API, lazy-loaded separately
  qiScore: number | null;
  partnerName: string | null;
  partnerLogo?: string | null;
  partnerVerified: boolean | null;
  isBlkListing: boolean | null;
  sellerName?: string | null;
  sellerAvatarUrl?: string | null;
  sellerKycVerified?: boolean | null;
};

type FavoritesResponse = {
  favorites?: string[];
  superlikes?: string[];
  error?: string;
};

type CarCardResponse = {
  data: ListingPayload[];
  error?: string;
};

export default function FavoritesPage() {
  const { data: favoritesData, isLoading, error: favError, refetch } = useFavoritesStatus();
  const [listings, setListings] = useState<ListingPayload[]>([]);
  const [isLoadingListings, setIsLoadingListings] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const hasFetchedRef = useRef(false);

  const favoriteIds = useMemo(() => favoritesData?.favorites || [], [favoritesData?.favorites]);

  // Load listing details when favorite IDs change
  useEffect(() => {
    if (!favoriteIds.length) {
      setListings([]);
      hasFetchedRef.current = false;
      return;
    }

    if (hasFetchedRef.current) return;

    hasFetchedRef.current = true;
    setIsLoadingListings(true);

    fetch(`/api/listings/car-card?ids=${encodeURIComponent(favoriteIds.join(','))}`, {
      credentials: 'include',
    })
      .then(res => res.json())
      .then((data: CarCardResponse) => setListings(data.data || []))
      .catch(() => setListings([]))
      .finally(() => setIsLoadingListings(false));
  }, [favoriteIds]);

  const listingsById = useMemo(() => {
    const map = new Map<string, ListingPayload>();
    listings.forEach((l) => {
      if (l?.id) map.set(l.id, l);
    });
    return map;
  }, [listings]);

  // Filter to only IDs that have valid listing data (excludes deleted listings)
  // Reverse order to show newest favorites first
  const validFavoriteIds = useMemo(() => 
    favoriteIds.filter(id => listingsById.has(id)).reverse(), 
    [favoriteIds, listingsById]
  );

  const handleRefresh = async () => {
    setIsRefreshing(true);
    hasFetchedRef.current = false;
    await refetch();
    setTimeout(() => setIsRefreshing(false), 300);
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
          disabled={isRefreshing}
          className="p-2 rounded-lg hover:bg-sidebar transition-colors disabled:opacity-50"
          aria-label="Refresh favorites"
        >
          <RefreshCw className={`h-4 w-4 text-muted-foreground ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
      </DashboardPageHeader>

      {/* Loading State */}
      {(isLoading || isLoadingListings) && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Error State */}
      {favError && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
          <p className="text-sm text-red-500">
            {favError?.message || 'Failed to load favorites'}
          </p>
        </div>
      )}

      {/* Content */}
      {!isLoading && !isLoadingListings && !favError && (
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
                      year={listing.year ?? undefined}
                      trim={listing.trim ?? undefined}
                      price={listing.price ?? undefined}
                      mileage={listing.mileage ?? undefined}
                      emirate={listing.emirate ?? undefined}
                      specs={listing.specs ?? undefined}
                      thumbnail={listing.thumbnail ?? undefined}
                      images={listing.images ?? undefined}
                      qiScore={listing.qiScore ?? undefined}
                      isBlkListing={listing.isBlkListing ?? undefined}
                      partnerName={listing.partnerName ?? undefined}
                      partnerLogo={listing.partnerLogo ?? undefined}
                      partnerVerified={listing.partnerVerified ?? undefined}
                      sellerName={listing.sellerName ?? undefined}
                      sellerAvatarUrl={listing.sellerAvatarUrl ?? undefined}
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
