/**
 * Saved Listings Hook - Favorites & Superlikes
 * 
 * React Query powered hook for saved listings.
 * Provides caching, optimistic updates, and stale-while-revalidate.
 */

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { savedApi, FavoritesStatusData, SavedListingCard } from '@/lib/saved-api';
import { queryKeys } from '@/lib/query-client';

// ============================================================================
// TYPES
// ============================================================================

export type SavedTab = 'favorites' | 'superlikes';

interface UseSavedOptions {
  isAuthenticated: boolean;
}

interface SavedStatusData {
  favoriteIds: string[];
  superlikeIds: string[];
  quota: FavoritesStatusData['quota'];
}

export interface UseSavedReturn {
  // Data
  favorites: SavedListingCard[];
  superlikes: SavedListingCard[];
  favoriteIds: string[];
  superlikeIds: string[];
  quota: FavoritesStatusData['quota'] | null;
  
  // State
  activeTab: SavedTab;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setActiveTab: (tab: SavedTab) => void;
  refresh: () => Promise<void>;
  toggleFavorite: (listingId: string) => Promise<void>;
  toggleSuperlike: (listingId: string) => Promise<void>;
}

// ============================================================================
// HOOK
// ============================================================================

export function useSaved({ isAuthenticated }: UseSavedOptions): UseSavedReturn {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<SavedTab>('favorites');

  // Query for saved status (IDs + quota)
  const {
    data: statusData,
    isLoading: isStatusLoading,
    error: statusError,
    refetch: refetchStatus,
  } = useQuery<SavedStatusData>({
    queryKey: queryKeys.savedStatus(),
    queryFn: async () => {
      const status = await savedApi.getFavoritesStatus();
      return {
        favoriteIds: status.favorites,
        superlikeIds: status.superlikes,
        quota: status.quota,
      };
    },
    enabled: isAuthenticated,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 30 * 60 * 1000,
    placeholderData: (prev) => prev,
  });

  // Query for favorite listings (depends on status)
  const favoriteIds = statusData?.favoriteIds ?? [];
  const {
    data: favorites = [],
    isLoading: isFavoritesLoading,
  } = useQuery<SavedListingCard[]>({
    queryKey: queryKeys.savedListings('favorites'),
    queryFn: async () => {
      if (favoriteIds.length === 0) return [];
      return savedApi.getListingCards(favoriteIds);
    },
    enabled: isAuthenticated && favoriteIds.length > 0,
    staleTime: 2 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    placeholderData: (prev) => prev,
  });

  // Query for superlike listings (depends on status)
  const superlikeIds = statusData?.superlikeIds ?? [];
  const {
    data: superlikes = [],
    isLoading: isSuperllikesLoading,
  } = useQuery<SavedListingCard[]>({
    queryKey: queryKeys.savedListings('superlikes'),
    queryFn: async () => {
      if (superlikeIds.length === 0) return [];
      return savedApi.getListingCards(superlikeIds);
    },
    enabled: isAuthenticated && superlikeIds.length > 0,
    staleTime: 2 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    placeholderData: (prev) => prev,
  });

  // Toggle favorite mutation with optimistic update
  const { mutateAsync: toggleFavoriteMutation } = useMutation({
    mutationFn: async (listingId: string) => {
      await savedApi.toggleFavorite(listingId);
      return listingId;
    },
    onMutate: async (listingId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.savedStatus() });
      
      const previousStatus = queryClient.getQueryData<SavedStatusData>(queryKeys.savedStatus());
      const previousFavorites = queryClient.getQueryData<SavedListingCard[]>(queryKeys.savedListings('favorites'));
      
      if (previousStatus) {
        const isCurrentlyFavorite = previousStatus.favoriteIds.includes(listingId);
        queryClient.setQueryData<SavedStatusData>(queryKeys.savedStatus(), {
          ...previousStatus,
          favoriteIds: isCurrentlyFavorite
            ? previousStatus.favoriteIds.filter(id => id !== listingId)
            : [...previousStatus.favoriteIds, listingId],
        });
        
        if (isCurrentlyFavorite && previousFavorites) {
          queryClient.setQueryData<SavedListingCard[]>(
            queryKeys.savedListings('favorites'),
            previousFavorites.filter(l => l.id !== listingId)
          );
        }
      }
      
      return { previousStatus, previousFavorites };
    },
    onError: (_err, _listingId, context) => {
      if (context?.previousStatus) {
        queryClient.setQueryData(queryKeys.savedStatus(), context.previousStatus);
      }
      if (context?.previousFavorites) {
        queryClient.setQueryData(queryKeys.savedListings('favorites'), context.previousFavorites);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.savedStatus() });
      queryClient.invalidateQueries({ queryKey: queryKeys.savedListings('favorites') });
    },
  });

  // Toggle superlike mutation with optimistic update
  const { mutateAsync: toggleSuperlikeMutation } = useMutation({
    mutationFn: async (listingId: string) => {
      const result = await savedApi.toggleSuperlike(listingId);
      return { listingId, quota: result.quota };
    },
    onMutate: async (listingId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.savedStatus() });
      
      const previousStatus = queryClient.getQueryData<SavedStatusData>(queryKeys.savedStatus());
      const previousSuperlikes = queryClient.getQueryData<SavedListingCard[]>(queryKeys.savedListings('superlikes'));
      
      if (previousStatus) {
        const isCurrentlySuperliked = previousStatus.superlikeIds.includes(listingId);
        queryClient.setQueryData<SavedStatusData>(queryKeys.savedStatus(), {
          ...previousStatus,
          superlikeIds: isCurrentlySuperliked
            ? previousStatus.superlikeIds.filter(id => id !== listingId)
            : [...previousStatus.superlikeIds, listingId],
        });
        
        if (isCurrentlySuperliked && previousSuperlikes) {
          queryClient.setQueryData<SavedListingCard[]>(
            queryKeys.savedListings('superlikes'),
            previousSuperlikes.filter(l => l.id !== listingId)
          );
        }
      }
      
      return { previousStatus, previousSuperlikes };
    },
    onSuccess: (data) => {
      // Update quota from response
      queryClient.setQueryData<SavedStatusData>(queryKeys.savedStatus(), (old) => 
        old ? { ...old, quota: data.quota } : old
      );
    },
    onError: (_err, _listingId, context) => {
      if (context?.previousStatus) {
        queryClient.setQueryData(queryKeys.savedStatus(), context.previousStatus);
      }
      if (context?.previousSuperlikes) {
        queryClient.setQueryData(queryKeys.savedListings('superlikes'), context.previousSuperlikes);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.savedStatus() });
      queryClient.invalidateQueries({ queryKey: queryKeys.savedListings('superlikes') });
    },
  });

  // Refresh handler
  const refresh = useCallback(async () => {
    await refetchStatus();
    await queryClient.invalidateQueries({ queryKey: ['saved', 'listings'] });
  }, [refetchStatus, queryClient]);

  // Toggle handlers
  const toggleFavorite = useCallback(async (listingId: string) => {
    try {
      await toggleFavoriteMutation(listingId);
    } catch (err) {
      console.error('[useSaved] Toggle favorite error:', err);
    }
  }, [toggleFavoriteMutation]);

  const toggleSuperlike = useCallback(async (listingId: string) => {
    try {
      await toggleSuperlikeMutation(listingId);
    } catch (err) {
      console.error('[useSaved] Toggle superlike error:', err);
    }
  }, [toggleSuperlikeMutation]);

  // Determine loading state - only when no cached data
  const currentListings = activeTab === 'favorites' ? favorites : superlikes;
  const isLoading = isStatusLoading && !statusData;
  const isListingsLoading = activeTab === 'favorites' 
    ? isFavoritesLoading && favorites.length === 0
    : isSuperllikesLoading && superlikes.length === 0;

  return {
    favorites,
    superlikes,
    favoriteIds,
    superlikeIds,
    quota: statusData?.quota ?? null,
    activeTab,
    isLoading: isLoading || isListingsLoading,
    error: statusError ? (statusError instanceof Error ? statusError.message : 'Failed to load saved') : null,
    setActiveTab,
    refresh,
    toggleFavorite,
    toggleSuperlike,
  };
}
