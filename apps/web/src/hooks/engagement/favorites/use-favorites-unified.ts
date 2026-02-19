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
import { optimisticUpdate, invalidateQueries } from '@/lib/query-helpers';
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

export function useFavoritesStatus(options?: { enabled?: boolean }) {
  return useQuery<FavoritesStatusData>({
    queryKey: ['favorites-status'],
    queryFn: fetchFavoritesStatus,
    // User-owned data: safe to cache indefinitely since we control all mutations
    // Data only changes via toggleFavorite/toggleSuperlike which invalidate both
    // server cache (invalidateFavoritesCache) and client cache (invalidateQueries)
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    enabled: options?.enabled ?? true,
  });
}

// ============================================================================
// Individual Favorite Hook
// ============================================================================

export function useFavorite(listingId: string) {
  const queryClient = useQueryClient();
  const [authRequired, setAuthRequired] = useState<AuthState>(DEFAULT_AUTH_STATE);

  // Read from cache only - parent component fetches via useFavoritesStatus({ enabled: isSignedIn })
  // enabled: false prevents this hook from triggering API calls
  const { data } = useQuery<FavoritesStatusData>({
    queryKey: ['favorites-status'],
    queryFn: fetchFavoritesStatus,
    enabled: false, // Never fetch - only subscribe to cache updates
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
      // Invalidate all favorites-related caches
      queryClient.invalidateQueries({ queryKey: ['favorites-status'] });
      queryClient.invalidateQueries({ queryKey: ['favorites-listings'] });
      queryClient.invalidateQueries({ queryKey: ['navbar-favorites-listings'] });
    },
  });

  return {
    isFavorite,
    isUpdating: mutation.isPending,
    error: mutation.error?.message || null,
    toggle: () => mutation.mutate(),
    requireAuth: () => setAuthRequired({ show: true, message: 'Please sign in to save favorites' }),
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

  // Read from cache only - parent component fetches via useFavoritesStatus({ enabled: isSignedIn })
  // enabled: false prevents this hook from triggering API calls
  const { data } = useQuery<FavoritesStatusData>({
    queryKey: ['favorites-status'],
    queryFn: fetchFavoritesStatus,
    enabled: false, // Never fetch - only subscribe to cache updates
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
      // Invalidate all favorites-related caches
      queryClient.invalidateQueries({ queryKey: ['favorites-status'] });
      queryClient.invalidateQueries({ queryKey: ['superlikes-listings'] });
      queryClient.invalidateQueries({ queryKey: ['navbar-favorites-listings'] });
    },
  });

  return {
    isSuperliked,
    isUpdating: mutation.isPending,
    error: mutation.error?.message || null,
    quota,
    toggle: () => mutation.mutate(),
    requireAuth: () => setAuthRequired({ show: true, message: 'Please sign in to superlike listings' }),
    authRequired: authRequired.show,
    authMessage: authRequired.message,
    quotaExceeded,
    dismissAuth: () => setAuthRequired(DEFAULT_AUTH_STATE),
    dismissQuotaError: () => setQuotaExceeded(false),
  };
}

// ============================================================================
// Favorites Listings Hook - Fetch Full Listing Data
// ============================================================================

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
  qiScore: number | null;
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
  const res = await fetch(`/api/listings/car-card?ids=${encodeURIComponent(ids.join(','))}`, {
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to fetch listing cards');
  const data = await res.json();
  return data.data || [];
}

/**
 * Fetch full listing data for favorites.
 * Caches indefinitely, refetches only after invalidation.
 */
export function useFavoritesListings() {
  const { data: favoritesData, isLoading: isLoadingStatus } = useFavoritesStatus();
  const favoriteIds = favoritesData?.favorites || [];

  const listingsQuery = useQuery({
    queryKey: ['favorites-listings'],
    queryFn: () => fetchListingCards(favoriteIds),
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    enabled: favoriteIds.length > 0,
  });

  return {
    listings: listingsQuery.data || [],
    favoriteIds,
    isLoading: isLoadingStatus || listingsQuery.isLoading,
    error: listingsQuery.error?.message || null,
  };
}

/**
 * Fetch full listing data for superlikes.
 * Caches indefinitely, refetches only after invalidation.
 */
export function useSuperlikesListings() {
  const { data: favoritesData, isLoading: isLoadingStatus } = useFavoritesStatus();
  const superlikeIds = favoritesData?.superlikes || [];

  const listingsQuery = useQuery({
    queryKey: ['superlikes-listings'],
    queryFn: () => fetchListingCards(superlikeIds),
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    enabled: superlikeIds.length > 0,
  });

  return {
    listings: listingsQuery.data || [],
    superlikeIds,
    isLoading: isLoadingStatus || listingsQuery.isLoading,
    error: listingsQuery.error?.message || null,
  };
}
