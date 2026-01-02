'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Loader2, RefreshCw, Heart, Moon } from 'lucide-react';
import { CarCard } from '@/components/inventory';
import { useFavoritesStatus } from '@/hooks/engagement';

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
  const validFavoriteIds = useMemo(() => 
    favoriteIds.filter(id => listingsById.has(id)), 
    [favoriteIds, listingsById]
  );

  const handleRefresh = async () => {
    setIsRefreshing(true);
    hasFetchedRef.current = false;
    await refetch();
    setTimeout(() => setIsRefreshing(false), 300);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 space-y-16">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight">Favorites</h1>
            <p className="text-sm text-muted-foreground/70">
              {validFavoriteIds.length} item{validFavoriteIds.length === 1 ? '' : 's'}
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-full hover:bg-secondary/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Refresh favorites"
          >
            <RefreshCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Loading State */}
        {(isLoading || isLoadingListings) && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin border-foreground" />
          </div>
        )}

        {/* Error State */}
        {favError && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6">
            <p className="text-sm text-red-500">
              {favError?.message || 'Failed to load favorites'}
            </p>
          </div>
        )}

        {/* Content */}
        {!isLoading && !isLoadingListings && !favError && (
          <>
            {validFavoriteIds.length === 0 ? (
              <div className="flex items-center justify-center py-24">
                <div className="flex flex-col items-center text-center space-y-4 max-w-sm">
                  <Moon className="w-16 h-16 text-muted-foreground/20" />
                  <div className="space-y-2">
                    <h2 className="text-lg font-medium text-muted-foreground">Such empty here</h2>
                    <p className="text-sm text-muted-foreground/60">
                      Heart some cars and they'll appear here
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
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
      </div>
  );
}
