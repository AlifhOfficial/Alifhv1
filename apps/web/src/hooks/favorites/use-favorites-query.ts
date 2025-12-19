/**
 * Favorites Hook - React Query Edition
 * 
 * Uses React Query for data fetching, caching, and mutations.
 * Replaces manual context-based state management with automatic cache management.
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

export interface FavoriteStatus {
  isFavorite: boolean;
  isSuperliked: boolean;
}

export interface SuperlikeQuota {
  currentMonthSuperlikesUsed: number;
  maxSuperlikesPerMonth: number;
  premiumSuperlikesBonus: number;
  totalSuperlikesUsed: number;
  periodEndDate?: string | Date | null;
  periodStartDate?: string | Date | null;
  remaining: number;
}

interface FavoritesData {
  favorites: string[];
  superlikes: string[];
}

interface AuthState {
  show: boolean;
  message: string;
  feature: 'favorites' | 'superlikes';
}

const DEFAULT_AUTH_STATE: AuthState = { show: false, message: '', feature: 'favorites' };

// Fetch all user favorites
async function fetchFavorites(): Promise<FavoritesData> {
  const res = await fetch(`/api/favorites?_t=${Date.now()}`, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to fetch favorites');
  return res.json();
}

// Fetch superlike quota
async function fetchQuota(): Promise<SuperlikeQuota> {
  const res = await fetch(`/api/superlikes?_t=${Date.now()}`, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to fetch quota');
  const data = await res.json();
  return {
    ...data.quota,
    remaining: (data.quota.maxSuperlikesPerMonth + data.quota.premiumSuperlikesBonus) - data.quota.currentMonthSuperlikesUsed
  };
}

export function useFavoritesQuery() {
  return useQuery({
    queryKey: ['favorites'],
    queryFn: fetchFavorites,
    staleTime: 30 * 1000, // 30s - matches API revalidation
    refetchOnWindowFocus: false,
  });
}

export function useQuotaQuery() {
  return useQuery({
    queryKey: ['superlike-quota'],
    queryFn: fetchQuota,
    staleTime: 30 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useFavorites(listingId: string) {
  const queryClient = useQueryClient();
  const [authRequired, setAuthRequired] = useState<AuthState>(DEFAULT_AUTH_STATE);
  
  const { data: favoritesData } = useFavoritesQuery();
  const { data: quota } = useQuotaQuery();
  
  const isFavorite = favoritesData?.favorites?.includes(listingId) ?? false;
  const isSuperliked = favoritesData?.superlikes?.includes(listingId) ?? false;

  const favoriteMutation = useMutation({
    mutationFn: async (add: boolean) => {
      const res = await fetch(`/api/favorites?_t=${Date.now()}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId, addedFrom: 'car-card' }),
      });

      if (res.status === 401) {
        const data = await res.json();
        throw new Error(JSON.stringify({ auth: true, message: data.error || 'Please sign in' }));
      }

      if (!res.ok) throw new Error('Failed to update favorite');
      return res.json();
    },
    onMutate: async (add) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['favorites'] });
      const previous = queryClient.getQueryData<FavoritesData>(['favorites']);
      
      if (previous) {
        queryClient.setQueryData<FavoritesData>(['favorites'], {
          favorites: add 
            ? [...previous.favorites, listingId]
            : previous.favorites.filter(id => id !== listingId),
          superlikes: previous.superlikes,
        });
      }
      
      return { previous };
    },
    onError: (error: Error, _, context) => {
      // Rollback on error
      if (context?.previous) {
        queryClient.setQueryData(['favorites'], context.previous);
      }
      
      // Handle auth error
      try {
        const parsed = JSON.parse(error.message);
        if (parsed.auth) {
          setAuthRequired({ show: true, message: parsed.message, feature: 'favorites' });
        }
      } catch {}
    },
    onSuccess: () => {
      // Refetch to get server state
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });

  const superlikeMutation = useMutation({
    mutationFn: async (add: boolean) => {
      const res = await fetch(`/api/superlikes?_t=${Date.now()}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId, addedFrom: 'car-card' }),
      });

      if (res.status === 401) {
        const data = await res.json();
        throw new Error(JSON.stringify({ auth: true, message: data.error || 'Please sign in' }));
      }

      if (!res.ok) throw new Error('Failed to update superlike');
      return res.json();
    },
    onMutate: async (add) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['favorites'] });
      const previous = queryClient.getQueryData<FavoritesData>(['favorites']);
      
      if (previous) {
        queryClient.setQueryData<FavoritesData>(['favorites'], {
          favorites: previous.favorites,
          superlikes: add 
            ? [...previous.superlikes, listingId]
            : previous.superlikes.filter(id => id !== listingId),
        });
      }
      
      return { previous };
    },
    onError: (error: Error, _, context) => {
      // Rollback on error
      if (context?.previous) {
        queryClient.setQueryData(['favorites'], context.previous);
      }
      
      // Handle auth error
      try {
        const parsed = JSON.parse(error.message);
        if (parsed.auth) {
          setAuthRequired({ show: true, message: parsed.message, feature: 'superlikes' });
        }
      } catch {}
    },
    onSuccess: () => {
      // Refetch both favorites and quota
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      queryClient.invalidateQueries({ queryKey: ['superlike-quota'] });
    },
  });

  return {
    isFavorite,
    isSuperliked,
    isUpdating: favoriteMutation.isPending || superlikeMutation.isPending,
    error: favoriteMutation.error?.message || superlikeMutation.error?.message || null,
    quota,
    toggleFavorite: () => favoriteMutation.mutate(!isFavorite),
    toggleSuperlike: () => superlikeMutation.mutate(!isSuperliked),
    authRequired: authRequired.show,
    authMessage: authRequired.message,
    authFeature: authRequired.feature,
    closeAuthDialog: () => setAuthRequired(DEFAULT_AUTH_STATE),
  };
}
