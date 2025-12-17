'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { Loader2, RefreshCw } from 'lucide-react';
import { CarCard } from '@/components/inventory/car-card';
import { useFavoritesContext } from '@/contexts/favorites-context';

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
  images: string[] | null;
  qiScore: number | null;
  partnerName: string | null;
  partnerVerified: boolean | null;
  isBlackMember: boolean | null;
};

type FavoritesResponse = {
  statuses?: Record<string, { isFavorite: boolean; isSuperliked: boolean }>;
  error?: string;
};

type CarCardResponse = {
  data: ListingPayload[];
  error?: string;
};

export default function FavoritesPage() {
  const { setStatuses } = useFavoritesContext();
  const [listings, setListings] = useState<ListingPayload[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadFavorites = useCallback(async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const res = await fetch('/api/favorites', {
        credentials: 'include',
        cache: 'no-store',
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to load favorites');
      }

      const data: FavoritesResponse = await res.json();
      const statuses = data.statuses || {};
      setStatuses(statuses);

      const ids = Object.entries(statuses)
        .filter(([, s]) => Boolean(s?.isFavorite))
        .map(([listingId]) => listingId);

      setFavoriteIds(ids);

      if (ids.length === 0) {
        setListings([]);
      } else {
        const cardsRes = await fetch(`/api/listings/car-card?ids=${encodeURIComponent(ids.join(','))}`, {
          credentials: 'include',
          cache: 'no-store',
        });

        if (!cardsRes.ok) {
          const cardsErr = await cardsRes.json().catch(() => ({}));
          throw new Error(cardsErr.error || 'Failed to load listing cards');
        }

        const cardsData: CarCardResponse = await cardsRes.json();
        setListings(cardsData.data || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load favorites');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [setStatuses]);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  const listingsById = useMemo(() => {
    const map = new Map<string, ListingPayload>();
    listings.forEach((l) => {
      if (l?.id) map.set(l.id, l);
    });
    return map;
  }, [listings]);

  return (
    <div className="p-4 sm:p-6 space-y-6 sm:space-y-8">
      <header className="mb-2 flex items-center justify-between gap-3">
        <h1 className="text-base sm:text-lg font-medium text-foreground truncate">Favorites</h1>
        <button
          onClick={() => loadFavorites(true)}
          disabled={isRefreshing || isLoading}
          className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm rounded-lg bg-muted hover:bg-muted/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          aria-label="Refresh favorites"
        >
          <RefreshCw className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </header>

      {isLoading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading your favorites…
        </div>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}

      {!isLoading && !error && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{favoriteIds.length} item{favoriteIds.length === 1 ? '' : 's'}</span>
          </div>

          {favoriteIds.length === 0 ? (
            <div className="min-h-[400px] flex items-center justify-center">
              <div className="text-center space-y-3">
                <svg className="w-16 h-16 mx-auto text-muted-foreground/40" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C10.34 2 9 3.34 9 5c0 1.66 1.34 3 3 3s3-1.34 3-3c0-1.66-1.34-3-3-3zM9 5c0-.55.45-1 1-1s1 .45 1 1-.45 1-1 1-1-.45-1-1zm6 0c0-.55.45-1 1-1s1 .45 1 1-.45 1-1 1-1-.45-1-1zm-3 3c-3.87 0-7 3.13-7 7v5c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2v-5c0-3.87-3.13-7-7-7z"/>
                </svg>
                <p className="text-sm text-muted-foreground">ZZZ</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {favoriteIds.map((listingId) => {
                const listing = listingsById.get(listingId);
                if (!listing) {
                  return (
                    <div key={listingId} className="rounded-lg border border-border bg-card p-4">
                      <p className="text-sm text-muted-foreground">Listing {listingId} unavailable.</p>
                    </div>
                  );
                }
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
                    partnerName={listing.partnerName ?? undefined}
                    partnerVerified={listing.partnerVerified ?? undefined}
                    isBlackMember={listing.isBlackMember ?? undefined}
                  />
                );
              })}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
