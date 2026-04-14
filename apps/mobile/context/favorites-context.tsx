/**
 * Favorites Context - TanStack-backed saved/favorite state.
 *
 * This context exposes a convenient API for listing cards while delegating the
 * actual server state to the shared React Query cache. Saved screens and card
 * actions now read from the same source of truth.
 */

import { useAlert } from '@/components/ui/themed-alert';
import React, { createContext, useContext, useMemo, useRef, type ReactNode, useCallback, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { savedApi, type FavoritesStatusData, type SavedListingCard } from '@/lib/saved-api';
import { queryKeys } from '@/lib/query-client';
import { useAuth } from '@/context/auth-context';

interface SavedStatusCache {
  favoriteIds: string[];
  superlikeIds: string[];
  quota: FavoritesStatusData['quota'];
}

interface FavoritesContextType {
  favoriteIds: string[];
  superlikeIds: string[];
  quota: FavoritesStatusData['quota'] | null;
  isLoading: boolean;
  isFavorite: (listingId: string) => boolean;
  isSuperliked: (listingId: string) => boolean;
  isPending: (listingId: string) => boolean;
  toggleFavorite: (listingId: string) => Promise<void>;
  toggleSuperlike: (listingId: string) => Promise<void>;
  refresh: () => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

const DEBOUNCE_MS = 500;
const SAVED_STATUS_STALE_TIME = 5 * 60 * 1000;

function mapSavedStatus(status: FavoritesStatusData): SavedStatusCache {
  return {
    // Dedupe and stable-sort so the same logical set always produces the same cache key
    favoriteIds: [...new Set(status.favorites)].sort(),
    superlikeIds: [...new Set(status.superlikes)].sort(),
    quota: status.quota,
  };
}

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, user, isLoading: isAuthLoading } = useAuth();
  const { showAlert } = useAlert();
  const queryClient = useQueryClient();

  const pendingFavoritesRef = useRef<Set<string>>(new Set());
  const pendingSuperlikesRef = useRef<Set<string>>(new Set());
  const lastToggleTimeRef = useRef<Map<string, number>>(new Map());
  const prevUserIdRef = useRef<string | undefined>(undefined);
  // When a toggle fires while a mutation is in flight, record the intent so we can
  // replay it once the current mutation settles (prevents silent drops on rapid taps).
  const retoggleFavoritesRef = useRef<Set<string>>(new Set());
  const retoggleSuperlikesRef = useRef<Set<string>>(new Set());

  const isStatusEnabled = isAuthenticated && !!user?.id && !isAuthLoading;

  const {
    data: statusData,
    isLoading: isStatusLoading,
    refetch: refetchStatus,
  } = useQuery<SavedStatusCache>({
    queryKey: queryKeys.savedStatus(user?.id),
    queryFn: async () => mapSavedStatus(await savedApi.getFavoritesStatus()),
    enabled: isStatusEnabled,
    staleTime: SAVED_STATUS_STALE_TIME,
    gcTime: 30 * 60 * 1000,
    placeholderData: (prev) => prev,
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message === 'AUTH_REQUIRED') {
        return false;
      }
      return failureCount < 2;
    },
  });

  useEffect(() => {
    const currentUserId = user?.id;
    if (prevUserIdRef.current !== currentUserId) {
      queryClient.removeQueries({ queryKey: queryKeys.saved() });
      prevUserIdRef.current = currentUserId;
    }
  }, [queryClient, user?.id]);

  const favoriteIds = statusData?.favoriteIds ?? [];
  const superlikeIds = statusData?.superlikeIds ?? [];
  const quota = statusData?.quota ?? null;

  const isPending = useCallback((listingId: string) => {
    return pendingFavoritesRef.current.has(listingId) || pendingSuperlikesRef.current.has(listingId);
  }, []);

  const updateSavedStatus = useCallback(
    (updater: (current: SavedStatusCache | undefined) => SavedStatusCache | undefined) => {
      queryClient.setQueryData<SavedStatusCache | undefined>(queryKeys.savedStatus(user?.id), updater);
    },
    [queryClient, user?.id]
  );

  const refresh = useCallback(async () => {
    if (!isStatusEnabled) {
      queryClient.removeQueries({ queryKey: queryKeys.saved() });
      return;
    }

    await refetchStatus();
    await queryClient.invalidateQueries({ queryKey: ['saved', 'listings'] });
  }, [isStatusEnabled, queryClient, refetchStatus]);

  const favoriteMutation = useMutation({
    mutationFn: async (listingId: string) => savedApi.toggleFavorite(listingId),
    onMutate: async (listingId: string) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.savedStatus(user?.id) });

      const previousStatus = queryClient.getQueryData<SavedStatusCache>(queryKeys.savedStatus(user?.id));
      const wasFavoriteActive = previousStatus?.favoriteIds.includes(listingId) ?? false;
      const previousFavoriteListings = queryClient.getQueriesData<SavedListingCard[]>({
        queryKey: ['saved', 'listings', 'favorites'],
      });

      updateSavedStatus((current) => {
        if (!current) return current;
        const isActive = current.favoriteIds.includes(listingId);
        return {
          ...current,
          favoriteIds: isActive
            ? current.favoriteIds.filter((id) => id !== listingId)
            : [...current.favoriteIds, listingId],
        };
      });

      if (wasFavoriteActive) {
        queryClient.setQueriesData<SavedListingCard[]>(
          { queryKey: ['saved', 'listings', 'favorites'] },
          (current) => current?.filter((listing) => listing.id !== listingId) ?? current
        );
      }

      return { previousStatus, previousFavoriteListings };
    },
    onError: (error, _listingId, context) => {
      if (context?.previousStatus) {
        queryClient.setQueryData(queryKeys.savedStatus(user?.id), context.previousStatus);
      }
      context?.previousFavoriteListings?.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });

      if (error instanceof Error && error.message === 'RATE_LIMITED') {
        showAlert('Please slow down', "You're saving too fast. Please wait a moment and try again.");
      }
    },
    onSettled: async () => {
      await refetchStatus();
      await queryClient.invalidateQueries({ queryKey: ['saved', 'listings'] });
    },
  });

  const superlikeMutation = useMutation({
    mutationFn: async (listingId: string) => savedApi.toggleSuperlike(listingId),
    onMutate: async (listingId: string) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.savedStatus(user?.id) });

      const previousStatus = queryClient.getQueryData<SavedStatusCache>(queryKeys.savedStatus(user?.id));
      const wasSuperlikedActive = previousStatus?.superlikeIds.includes(listingId) ?? false;
      const previousSuperlikeListings = queryClient.getQueriesData<SavedListingCard[]>({
        queryKey: ['saved', 'listings', 'superlikes'],
      });

      updateSavedStatus((current) => {
        if (!current) return current;
        const isActive = current.superlikeIds.includes(listingId);
        return {
          ...current,
          superlikeIds: isActive
            ? current.superlikeIds.filter((id) => id !== listingId)
            : [...current.superlikeIds, listingId],
          quota: current.quota && !isActive
            ? {
                ...current.quota,
                currentMonthSuperlikesUsed: current.quota.currentMonthSuperlikesUsed + 1,
                remaining: Math.max(0, current.quota.remaining - 1),
              }
            : current.quota,
        };
      });

      if (wasSuperlikedActive) {
        queryClient.setQueriesData<SavedListingCard[]>(
          { queryKey: ['saved', 'listings', 'superlikes'] },
          (current) => current?.filter((listing) => listing.id !== listingId) ?? current
        );
      }

      return { previousStatus, previousSuperlikeListings };
    },
    onSuccess: (result) => {
      updateSavedStatus((current) => {
        if (!current) return current;
        return { ...current, quota: result.quota };
      });
    },
    onError: (error, _listingId, context) => {
      if (context?.previousStatus) {
        queryClient.setQueryData(queryKeys.savedStatus(user?.id), context.previousStatus);
      }
      context?.previousSuperlikeListings?.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });

      if (error instanceof Error && error.message === 'QUOTA_EXCEEDED') {
        showAlert(
          'Superlike limit reached',
          "You've used all your superlikes for this month. Upgrade to Premium for more!"
        );
        return;
      }

      if (error instanceof Error && error.message === 'RATE_LIMITED') {
        showAlert('Please slow down', "You're acting too fast. Please wait a moment and try again.");
      }
    },
    onSettled: async () => {
      await refetchStatus();
      await queryClient.invalidateQueries({ queryKey: ['saved', 'listings'] });
    },
  });

  const toggleFavorite = useCallback(async (listingId: string) => {
    if (!isAuthenticated) {
      throw new Error('AUTH_REQUIRED');
    }

    const now = Date.now();
    const lastToggle = lastToggleTimeRef.current.get(`fav:${listingId}`);
    if (lastToggle && now - lastToggle < DEBOUNCE_MS) {
      return;
    }

    if (pendingFavoritesRef.current.has(listingId)) {
      // Mutation in flight — queue a retoggle instead of dropping the tap.
      // A second tap while queued cancels the queue (double-tap = no-op).
      if (retoggleFavoritesRef.current.has(listingId)) {
        retoggleFavoritesRef.current.delete(listingId);
      } else {
        retoggleFavoritesRef.current.add(listingId);
      }
      return;
    }

    pendingFavoritesRef.current.add(listingId);
    lastToggleTimeRef.current.set(`fav:${listingId}`, now);

    try {
      await favoriteMutation.mutateAsync(listingId);
    } finally {
      pendingFavoritesRef.current.delete(listingId);
      // Clear debounce window so the very next tap (after settle) is never blocked.
      lastToggleTimeRef.current.delete(`fav:${listingId}`);

      if (retoggleFavoritesRef.current.has(listingId)) {
        retoggleFavoritesRef.current.delete(listingId);
        pendingFavoritesRef.current.add(listingId);
        lastToggleTimeRef.current.set(`fav:${listingId}`, Date.now());
        favoriteMutation.mutateAsync(listingId).finally(() => {
          pendingFavoritesRef.current.delete(listingId);
          lastToggleTimeRef.current.delete(`fav:${listingId}`);
          retoggleFavoritesRef.current.delete(listingId);
        });
      }
    }
  }, [favoriteMutation, isAuthenticated]);

  const toggleSuperlike = useCallback(async (listingId: string) => {
    if (!isAuthenticated) {
      throw new Error('AUTH_REQUIRED');
    }

    const now = Date.now();
    const lastToggle = lastToggleTimeRef.current.get(`superlike:${listingId}`);
    if (lastToggle && now - lastToggle < DEBOUNCE_MS) {
      return;
    }

    if (pendingSuperlikesRef.current.has(listingId)) {
      if (retoggleSuperlikesRef.current.has(listingId)) {
        retoggleSuperlikesRef.current.delete(listingId);
      } else {
        retoggleSuperlikesRef.current.add(listingId);
      }
      return;
    }

    pendingSuperlikesRef.current.add(listingId);
    lastToggleTimeRef.current.set(`superlike:${listingId}`, now);

    try {
      await superlikeMutation.mutateAsync(listingId);
    } finally {
      pendingSuperlikesRef.current.delete(listingId);
      lastToggleTimeRef.current.delete(`superlike:${listingId}`);

      if (retoggleSuperlikesRef.current.has(listingId)) {
        retoggleSuperlikesRef.current.delete(listingId);
        pendingSuperlikesRef.current.add(listingId);
        lastToggleTimeRef.current.set(`superlike:${listingId}`, Date.now());
        superlikeMutation.mutateAsync(listingId).finally(() => {
          pendingSuperlikesRef.current.delete(listingId);
          lastToggleTimeRef.current.delete(`superlike:${listingId}`);
          retoggleSuperlikesRef.current.delete(listingId);
        });
      }
    }
  }, [isAuthenticated, superlikeMutation]);

  const isFavorite = useCallback((listingId: string) => favoriteIds.includes(listingId), [favoriteIds]);
  const isSuperliked = useCallback((listingId: string) => superlikeIds.includes(listingId), [superlikeIds]);

  const value = useMemo<FavoritesContextType>(() => ({
    favoriteIds,
    superlikeIds,
    quota,
    isLoading: isStatusEnabled ? isStatusLoading && !statusData : false,
    isFavorite,
    isSuperliked,
    isPending,
    toggleFavorite,
    toggleSuperlike,
    refresh,
  }), [
    favoriteIds,
    superlikeIds,
    quota,
    isStatusEnabled,
    isStatusLoading,
    statusData,
    isFavorite,
    isSuperliked,
    isPending,
    toggleFavorite,
    toggleSuperlike,
    refresh,
  ]);

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites(): FavoritesContextType {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}

export function useListingFavorite(listingId: string) {
  const { isFavorite, isSuperliked, isPending, toggleFavorite, toggleSuperlike, quota } = useFavorites();

  return useMemo(() => ({
    isFavorite: isFavorite(listingId),
    isSuperliked: isSuperliked(listingId),
    isPending: isPending(listingId),
    toggleFavorite: () => toggleFavorite(listingId),
    toggleSuperlike: () => toggleSuperlike(listingId),
    quota,
  }), [listingId, isFavorite, isSuperliked, isPending, toggleFavorite, toggleSuperlike, quota]);
}
