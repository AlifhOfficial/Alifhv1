'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';

import { Loader2, RefreshCw } from 'lucide-react';
import { CarCard } from '@/components/inventory/car-card';
import { SuperlikeQuotaBadge } from '@/components/inventory/superlike-quota-badge';
import { useSession } from '@/lib/auth/client';
import { useFavoritesContext } from '@/contexts/favorites-context';

type SuperlikeQuota = {
  currentMonthSuperlikesUsed: number;
  maxSuperlikesPerMonth: number;
  premiumSuperlikesBonus: number;
  totalSuperlikesUsed: number;
  periodEndDate?: string | Date | null;
  periodStartDate?: string | Date | null;
  remaining: number;
};

type FavoriteRecord = {
  id: string;
  userId: string;
  listingId: string;
  type: 'favorite' | 'superlike';
  addedFrom?: string | null;
  createdAt?: string | null;
};

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

interface FavoritesResponse {
  favorites: FavoriteRecord[];
  listings: ListingPayload[];
  statuses?: Record<string, { isFavorite: boolean; isSuperliked: boolean }>;
  quota?: SuperlikeQuota;
  error?: string;
}

export default function FavsPage() {
  const { data: session } = useSession();
  const { setStatuses } = useFavoritesContext();
  const [favorites, setFavorites] = useState<FavoriteRecord[]>([]);
  const [listings, setListings] = useState<ListingPayload[]>([]);
  const [quota, setQuota] = useState<SuperlikeQuota | null>(null);
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
      setFavorites(data.favorites || []);
      setListings(data.listings || []);
      
      // Update context with statuses
      if (data.statuses) {
        setStatuses(data.statuses);
      }
      
      if (data.quota) {
        const baseMax = data.quota.maxSuperlikesPerMonth || 0;
        const bonus = data.quota.premiumSuperlikesBonus || 0;
        const used = data.quota.currentMonthSuperlikesUsed || 0;
        setQuota({
          ...data.quota,
          remaining: Math.max(baseMax + bonus - used, 0),
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load favorites');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [setStatuses]);

  // Initial load only
  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  const { favoritesList, superlikesList } = useMemo(() => {
    // Note: A listing can appear in both lists if user has both favorite AND superlike
    const favs = favorites.filter((f) => f.type === 'favorite');
    const supers = favorites.filter((f) => f.type === 'superlike');
    return { favoritesList: favs, superlikesList: supers };
  }, [favorites]);

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
        <h1 className="text-base sm:text-lg font-medium text-foreground truncate">Favorites & Superlikes</h1>
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

      {isLoading && !error && (
        <div className="grid gap-6 sm:gap-8 lg:grid-cols-2">
          {["Superlikes", "Favorites"].map((label) => (
            <section key={label} className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="h-5 w-24 rounded-md bg-muted animate-pulse" />
                <div className="h-4 w-12 rounded-md bg-muted animate-pulse" />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2">
                {Array.from({ length: 4 }).map((_, idx) => (
                  <div
                    key={`${label}-skeleton-${idx}`}
                    className="rounded-lg border border-border bg-card p-4 shadow-sm"
                  >
                    <div className="mb-3 h-40 w-full rounded-md bg-muted animate-pulse" />
                    <div className="space-y-2">
                      <div className="h-4 w-3/4 rounded-md bg-muted animate-pulse" />
                      <div className="h-3 w-1/2 rounded-md bg-muted animate-pulse" />
                      <div className="h-3 w-2/3 rounded-md bg-muted animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {!isLoading && !error && (
        <div className="grid gap-6 sm:gap-8 lg:grid-cols-2">
          <section className="space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <h2 className="text-base font-medium text-foreground">Superlikes</h2>
                <SuperlikeQuotaBadge quota={quota} />
              </div>
              <span className="text-xs text-muted-foreground">{superlikesList.length} item{superlikesList.length === 1 ? '' : 's'}</span>
            </div>
            {superlikesList.length === 0 ? (
              <div className="min-h-[400px] flex items-center justify-center">
                <div className="text-center space-y-3">
                  <svg className="w-16 h-16 mx-auto text-muted-foreground/40" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C10.34 2 9 3.34 9 5c0 1.66 1.34 3 3 3s3-1.34 3-3c0-1.66-1.34-3-3-3zM9 5c0-.55.45-1 1-1s1 .45 1 1-.45 1-1 1-1-.45-1-1zm6 0c0-.55.45-1 1-1s1 .45 1 1-.45 1-1 1-1-.45-1-1zm-3 3c-3.87 0-7 3.13-7 7v5c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2v-5c0-3.87-3.13-7-7-7z"/>
                  </svg>
                  <p className="text-sm text-muted-foreground">ZZZ</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {superlikesList.map((fav) => {
                  const listing = listingsById.get(fav.listingId);
                if (!listing) {
                  return (
                    <div key={fav.id} className="rounded-lg border border-border bg-card p-4">
                      <p className="text-sm text-muted-foreground">Listing {fav.listingId} unavailable.</p>
                    </div>
                  );
                }
                return (
                  <CarCard
                    key={fav.id}
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

          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-medium text-foreground">Favorites</h2>
              <span className="text-xs text-muted-foreground">{favoritesList.length} item{favoritesList.length === 1 ? '' : 's'}</span>
            </div>
            {favoritesList.length === 0 ? (
              <div className="min-h-[400px] flex items-center justify-center">
                <div className="text-center space-y-3">
                  <svg className="w-16 h-16 mx-auto text-muted-foreground/40" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C10.34 2 9 3.34 9 5c0 1.66 1.34 3 3 3s3-1.34 3-3c0-1.66-1.34-3-3-3zM9 5c0-.55.45-1 1-1s1 .45 1 1-.45 1-1 1-1-.45-1-1zm6 0c0-.55.45-1 1-1s1 .45 1 1-.45 1-1 1-1-.45-1-1zm-3 3c-3.87 0-7 3.13-7 7v5c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2v-5c0-3.87-3.13-7-7-7z"/>
                  </svg>
                  <p className="text-sm text-muted-foreground">ZZZ</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2">
                {favoritesList.map((fav) => {
                  const listing = listingsById.get(fav.listingId);
                if (!listing) {
                  return (
                    <div key={fav.id} className="rounded-lg border border-border bg-card p-4">
                      <p className="text-sm text-muted-foreground">Listing {fav.listingId} unavailable.</p>
                    </div>
                  );
                }
                return (
                  <CarCard
                    key={fav.id}
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
        </div>
      )}
    </div>
  );
}
