/**
 * Favorites & Superlikes Hook - Unified Implementation
 * 
 * Single source of truth for all favorite/superlike operations.
 * One API call, one cache, simple state management.
 * 
 * Features:
 * - Single cache key for all favorite/superlike data
 * - Optimistic updates for instant UI feedback
 * - Automatic auth modal handling
 * - Quota tracking built-in
 * 
 * Usage:
 * ```tsx
 * const { favorites, superlikes, quota } = useFavoritesStatus();
 * const favorite = useFavorite(listingId);
 * const superlike = useSuperlike(listingId);
 * ```
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { CACHE_STALE_TIME } from '@/lib/cache-config';
import { optimisticUpdate, invalidateQueries } from '@/lib/cache-patterns';
import { useState } from 'react';

// ============================================================================
// Types
// ============================================================================

export interface FavoritesStatusData {
  favorites: string[];
  superlikes: string[];
  quota: {
    currentMonthSuperlikesUsed: number;
    maxSuperlikesPerMonth: number;
    premiumSuperlikesBonus: number;
    remaining: number;
    periodEndDate?: string | Date | null;
    periodStartDate?: string | Date | null;
  };
}

interface AuthState {
  show: boolean;
  message: string;
}

const DEFAULT_AUTH_STATE: AuthState = { show: false, message: '' };

// ============================================================================
// API Functions
// ============================================================================

async function fetchFavoritesStatus(): Promise<FavoritesStatusData> {
  const res = await fetch('/api/engagement/favorites-status', { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to fetch favorites status');
  return res.json();
}

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

// ============================================================================
// Main Hook: Get All Status Data
// ============================================================================

export function useFavoritesStatus() {
  return useQuery<FavoritesStatusData>({
    queryKey: ['favorites-status'],
    queryFn: fetchFavoritesStatus,
    staleTime: 30000, // 30s - balance between freshness and performance
    refetchOnWindowFocus: true,
  });
}

// ============================================================================
// Individual Favorite Hook
// ============================================================================

export function useFavorite(listingId: string) {
  const queryClient = useQueryClient();
  const [authRequired, setAuthRequired] = useState<AuthState>(DEFAULT_AUTH_STATE);

  const { data } = useQuery<FavoritesStatusData>({
    queryKey: ['favorites-status'],
    queryFn: fetchFavoritesStatus,
    staleTime: 30000,
  });

  const isFavorite = data?.favorites.includes(listingId) || false;

  const mutation = useMutation({
    mutationFn: () => toggleFavoriteAPI(listingId),
    onMutate: async () => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: ['favorites-status'] });
      
      // Snapshot current state
      const previous = queryClient.getQueryData<FavoritesStatusData>(['favorites-status']);
      
      // Optimistic update
      if (previous) {
        const willBeAdded = !isFavorite;
        queryClient.setQueryData<FavoritesStatusData>(['favorites-status'], {
          ...previous,
          favorites: willBeAdded
            ? [...previous.favorites, listingId]
            : previous.favorites.filter(id => id !== listingId),
        });
      }
      
      return { previous };
    },
    onError: (error: Error, _, context) => {
      // Rollback on error
      if (context?.previous) {
        queryClient.setQueryData(['favorites-status'], context.previous);
      }
      
      // Handle auth errors
      try {
        const parsed = JSON.parse(error.message);
        if (parsed.auth) {
          setAuthRequired({ show: true, message: parsed.message });
        }
      } catch {}
    },
    onSuccess: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['favorites-status'] });
    },
  });

  return {
    isFavorite,
    isUpdating: mutation.isPending,
    error: mutation.error?.message || null,
    toggle: () => mutation.mutate(),
    authRequired: authRequired.show,
    authMessage: authRequired.message,
    dismissAuth: () => setAuthRequired(DEFAULT_AUTH_STATE),
  };
}

// ============================================================================
// Individual Superlike Hook
// ============================================================================

export function useSuperlike(listingId: string) {
  const queryClient = useQueryClient();
  const [authRequired, setAuthRequired] = useState<AuthState>(DEFAULT_AUTH_STATE);
  const [quotaExceeded, setQuotaExceeded] = useState(false);

  const { data } = useQuery<FavoritesStatusData>({
    queryKey: ['favorites-status'],
    queryFn: fetchFavoritesStatus,
    staleTime: 30000,
  });

  const isSuperliked = data?.superlikes.includes(listingId) || false;
  const quota = data?.quota || null;

  const mutation = useMutation({
    mutationFn: () => toggleSuperlikeAPI(listingId),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['favorites-status'] });
      const previous = queryClient.getQueryData<FavoritesStatusData>(['favorites-status']);
      
      if (previous) {
        const willBeAdded = !isSuperliked;
        queryClient.setQueryData<FavoritesStatusData>(['favorites-status'], {
          ...previous,
          superlikes: willBeAdded
            ? [...previous.superlikes, listingId]
            : previous.superlikes.filter(id => id !== listingId),
          quota: willBeAdded
            ? {
                ...previous.quota,
                currentMonthSuperlikesUsed: previous.quota.currentMonthSuperlikesUsed + 1,
                remaining: previous.quota.remaining - 1,
              }
            : previous.quota,
        });
      }
      
      return { previous };
    },
    onError: (error: Error, _, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['favorites-status'], context.previous);
      }
      
      try {
        const parsed = JSON.parse(error.message);
        if (parsed.auth) {
          setAuthRequired({ show: true, message: parsed.message });
        } else if (parsed.quotaExceeded) {
          setQuotaExceeded(true);
        }
      } catch {}
    },
    onSuccess: (data) => {
      // Update quota from server response
      const previous = queryClient.getQueryData<FavoritesStatusData>(['favorites-status']);
      if (previous && data.quota) {
        queryClient.setQueryData<FavoritesStatusData>(['favorites-status'], {
          ...previous,
          quota: data.quota,
        });
      }
      queryClient.invalidateQueries({ queryKey: ['favorites-status'] });
    },
  });

  return {
    isSuperliked,
    isUpdating: mutation.isPending,
    error: mutation.error?.message || null,
    quota,
    toggle: () => mutation.mutate(),
    authRequired: authRequired.show,
    authMessage: authRequired.message,
    quotaExceeded,
    dismissAuth: () => setAuthRequired(DEFAULT_AUTH_STATE),
    dismissQuotaError: () => setQuotaExceeded(false),
  };
}
