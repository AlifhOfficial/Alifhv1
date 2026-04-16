'use client';

import { useState } from 'react';
import { useAsyncMutation } from '@/hooks/use-async-mutation';
import { useAsyncQuery } from '@/hooks/use-async-query';
import {
  clearFavoritesStore,
  ensureFavoritesLoaded,
  refreshFavorites,
  seedFavorites,
  updateFavoritesState,
  useFavoritesStore,
  type FavoritesStatusData,
} from './favorites-store';

interface AuthState {
  show: boolean;
  message: string;
}

const DEFAULT_AUTH_STATE: AuthState = { show: false, message: '' };

async function toggleFavoriteAPI(listingId: string): Promise<{ status: { isFavorite: boolean; isSuperliked: boolean } }> {
  const res = await fetch('/api/engagement/favorites', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ listingId }),
  });

  if (res.status === 401) {
    const data = await res.json();
    throw new Error(JSON.stringify({ auth: true, message: data.error || 'Please sign in' }));
  }

  if (!res.ok) throw new Error('Failed to toggle favorite');
  return res.json();
}

async function toggleSuperlikeAPI(listingId: string): Promise<{
  status: { isFavorite: boolean; isSuperliked: boolean };
  quota: FavoritesStatusData['quota'];
}> {
  const res = await fetch('/api/engagement/superlikes', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ listingId }),
  });

  if (res.status === 401) {
    const data = await res.json();
    throw new Error(JSON.stringify({ auth: true, message: data.error || 'Please sign in' }));
  }

  if (res.status === 429) {
    const data = await res.json();
    throw new Error(JSON.stringify({ quotaExceeded: true, message: data.error || 'Superlike limit reached' }));
  }

  if (!res.ok) throw new Error('Failed to toggle superlike');
  return res.json();
}

export function useFavoritesStatus(options?: {
  enabled?: boolean;
  initialData?: FavoritesStatusData;
}) {
  const store = useFavoritesStore(options);

  return {
    data: store.data,
    isLoading: store.isLoading && !store.data,
    error: store.error ? new Error(store.error) : null,
    refetch: refreshFavorites,
  };
}

export function useFavorite(listingId: string) {
  const { data } = useFavoritesStatus();
  const [authRequired, setAuthRequired] = useState<AuthState>(DEFAULT_AUTH_STATE);

  const isFavorite = data?.favorites.includes(listingId) || false;

  const mutation = useAsyncMutation({
    mutationFn: () => toggleFavoriteAPI(listingId),
    onMutate: async () => {
      await ensureFavoritesLoaded();
      const previous = data ?? null;

      updateFavoritesState((current) => {
        if (!current) return current;
        const willBeAdded = !current.favorites.includes(listingId);
        return {
          ...current,
          favorites: willBeAdded
            ? [...current.favorites, listingId]
            : current.favorites.filter((id) => id !== listingId),
        };
      });

      return previous;
    },
    onError: async (error, _variables, previous) => {
      if (previous) {
        seedFavorites(previous);
      }

      try {
        const parsed = JSON.parse(error.message);
        if (parsed.auth) {
          setAuthRequired({ show: true, message: parsed.message });
        }
      } catch {
        // Ignore parse failures and surface the generic error.
      }
    },
    onSuccess: async () => {
      await refreshFavorites();
    },
  });

  return {
    isFavorite,
    isUpdating: mutation.isPending,
    error: mutation.error?.message || null,
    toggle: () => mutation.mutate(undefined),
    requireAuth: () => setAuthRequired({ show: true, message: 'Please sign in to save favorites' }),
    authRequired: authRequired.show,
    authMessage: authRequired.message,
    dismissAuth: () => setAuthRequired(DEFAULT_AUTH_STATE),
  };
}

export function useSuperlike(listingId: string) {
  const { data } = useFavoritesStatus();
  const [authRequired, setAuthRequired] = useState<AuthState>(DEFAULT_AUTH_STATE);
  const [quotaExceeded, setQuotaExceeded] = useState(false);

  const isSuperliked = data?.superlikes.includes(listingId) || false;
  const quota = data?.quota || null;

  const mutation = useAsyncMutation({
    mutationFn: () => toggleSuperlikeAPI(listingId),
    onMutate: async () => {
      await ensureFavoritesLoaded();
      const previous = data ?? null;

      updateFavoritesState((current) => {
        if (!current) return current;
        const willBeAdded = !current.superlikes.includes(listingId);
        return {
          ...current,
          superlikes: willBeAdded
            ? [...current.superlikes, listingId]
            : current.superlikes.filter((id) => id !== listingId),
          quota: willBeAdded
            ? {
                ...current.quota,
                currentMonthSuperlikesUsed: current.quota.currentMonthSuperlikesUsed + 1,
                remaining: current.quota.remaining - 1,
              }
            : current.quota,
        };
      });

      return previous;
    },
    onError: async (error, _variables, previous) => {
      if (previous) {
        seedFavorites(previous);
      }

      try {
        const parsed = JSON.parse(error.message);
        if (parsed.auth) {
          setAuthRequired({ show: true, message: parsed.message });
        } else if (parsed.quotaExceeded) {
          setQuotaExceeded(true);
        }
      } catch {
        // Ignore parse failures and surface the generic error.
      }
    },
    onSuccess: async (result) => {
      updateFavoritesState((current) => {
        if (!current) return current;
        return {
          ...current,
          quota: result.quota ?? current.quota,
        };
      });
      await refreshFavorites();
    },
  });

  return {
    isSuperliked,
    isUpdating: mutation.isPending,
    error: mutation.error?.message || null,
    quota,
    toggle: () => mutation.mutate(undefined),
    requireAuth: () => setAuthRequired({ show: true, message: 'Please sign in to superlike listings' }),
    authRequired: authRequired.show,
    authMessage: authRequired.message,
    quotaExceeded,
    dismissAuth: () => setAuthRequired(DEFAULT_AUTH_STATE),
    dismissQuotaError: () => setQuotaExceeded(false),
  };
}

export interface ListingCardData {
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
  partnerName: string | null;
  partnerLogo?: string | null;
  partnerVerified: boolean | null;
  isBlkListing: boolean | null;
  sellerName?: string | null;
  sellerAvatarUrl?: string | null;
  sellerKycVerified?: boolean | null;
}

async function fetchListingCards(ids: string[]): Promise<ListingCardData[]> {
  if (!ids.length) return [];
  const { getListingCardsByIdsAction } = await import('@/actions/favorites');
  return getListingCardsByIdsAction(ids);
}

export function useFavoritesListings(options?: {
  initialStatus?: FavoritesStatusData;
  initialListings?: ListingCardData[];
}) {
  const { data: favoritesData, isLoading: isLoadingStatus } = useFavoritesStatus({
    initialData: options?.initialStatus,
  });
  const favoriteIds = favoritesData?.favorites || [];
  const favoritesKey = favoriteIds.join(',');

  const listingsQuery = useAsyncQuery({
    queryFn: () => fetchListingCards(favoriteIds),
    enabled: favoriteIds.length > 0,
    initialData: options?.initialListings,
    dependencies: [favoritesKey],
  });

  return {
    listings: listingsQuery.data || [],
    favoriteIds,
    isLoading: isLoadingStatus || listingsQuery.isLoading,
    error: listingsQuery.error?.message || null,
    refresh: async () => {
      await refreshFavorites();
      await listingsQuery.refetch();
    },
  };
}

export function useSuperlikesListings(options?: {
  initialStatus?: FavoritesStatusData;
  initialListings?: ListingCardData[];
}) {
  const { data: favoritesData, isLoading: isLoadingStatus } = useFavoritesStatus({
    initialData: options?.initialStatus,
  });
  const superlikeIds = favoritesData?.superlikes || [];
  const superlikesKey = superlikeIds.join(',');

  const listingsQuery = useAsyncQuery({
    queryFn: () => fetchListingCards(superlikeIds),
    enabled: superlikeIds.length > 0,
    initialData: options?.initialListings,
    dependencies: [superlikesKey],
  });

  return {
    listings: listingsQuery.data || [],
    superlikeIds,
    isLoading: isLoadingStatus || listingsQuery.isLoading,
    error: listingsQuery.error?.message || null,
    refresh: async () => {
      await refreshFavorites();
      await listingsQuery.refetch();
    },
  };
}

export { clearFavoritesStore };
export type { FavoritesStatusData };
