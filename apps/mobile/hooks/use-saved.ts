/**
 * Saved Listings Hook - Favorites & Superlikes
 *
 * Uses the shared favorites context for saved status and TanStack queries for
 * the listing cards themselves. This keeps listing cards and the Saved screen
 * on the same source of truth.
 */

import { useState, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { useFavorites } from '@/context/favorites-context';
import { savedApi, type FavoritesStatusData, type SavedListingCard } from '@/lib/saved-api';
import { queryKeys } from '@/lib/query-client';

export type SavedTab = 'favorites' | 'superlikes';

interface UseSavedOptions {
  isAuthenticated: boolean;
}

export interface UseSavedReturn {
  favorites: SavedListingCard[];
  superlikes: SavedListingCard[];
  favoriteIds: string[];
  superlikeIds: string[];
  quota: FavoritesStatusData['quota'] | null;
  activeTab: SavedTab;
  isLoading: boolean;
  error: string | null;
  setActiveTab: (tab: SavedTab) => void;
  refresh: () => Promise<void>;
  toggleFavorite: (listingId: string) => Promise<void>;
  toggleSuperlike: (listingId: string) => Promise<void>;
}

const SAVED_LISTINGS_STALE_TIME = 5 * 60 * 1000;

export function useSaved({ isAuthenticated }: UseSavedOptions): UseSavedReturn {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<SavedTab>('favorites');
  const {
    favoriteIds,
    superlikeIds,
    quota,
    isLoading: isStatusLoading,
    toggleFavorite,
    toggleSuperlike,
    refresh: refreshStatus,
  } = useFavorites();

  const {
    data: favorites = [],
    isLoading: isFavoritesLoading,
    error: favoritesError,
  } = useQuery<SavedListingCard[]>({
    queryKey: queryKeys.savedListings('favorites', favoriteIds),
    queryFn: async () => {
      if (favoriteIds.length === 0) return [];
      return savedApi.getListingCards(favoriteIds);
    },
    enabled: isAuthenticated && favoriteIds.length > 0,
    staleTime: SAVED_LISTINGS_STALE_TIME,
    gcTime: 30 * 60 * 1000,
  });

  const {
    data: superlikes = [],
    isLoading: isSuperlikesLoading,
    error: superlikesError,
  } = useQuery<SavedListingCard[]>({
    queryKey: queryKeys.savedListings('superlikes', superlikeIds),
    queryFn: async () => {
      if (superlikeIds.length === 0) return [];
      return savedApi.getListingCards(superlikeIds);
    },
    enabled: isAuthenticated && superlikeIds.length > 0,
    staleTime: SAVED_LISTINGS_STALE_TIME,
    gcTime: 30 * 60 * 1000,
  });

  const refresh = useCallback(async () => {
    await refreshStatus();
    await queryClient.invalidateQueries({ queryKey: ['saved', 'listings'] });
  }, [queryClient, refreshStatus]);

  const currentListings = activeTab === 'favorites' ? favorites : superlikes;
  const isLoading = isStatusLoading || (activeTab === 'favorites'
    ? isFavoritesLoading && favoriteIds.length > 0 && currentListings.length === 0
    : isSuperlikesLoading && superlikeIds.length > 0 && currentListings.length === 0);

  const combinedError = favoritesError ?? superlikesError;

  return {
    favorites,
    superlikes,
    favoriteIds,
    superlikeIds,
    quota,
    activeTab,
    isLoading,
    error: combinedError instanceof Error ? combinedError.message : null,
    setActiveTab,
    refresh,
    toggleFavorite,
    toggleSuperlike,
  };
}
