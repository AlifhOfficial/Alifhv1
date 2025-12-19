/**
 * Favorites Hook - Simple Separated Implementation
 * 
 * Completely separate from superlikes for cleaner state management.
 * Each feature has its own cache, mutations, and queries.
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

interface FavoritesData {
  favorites: string[];
}

interface AuthState {
  show: boolean;
  message: string;
}

const DEFAULT_AUTH_STATE: AuthState = { show: false, message: '' };

// Fetch user favorites only
async function fetchFavorites(): Promise<FavoritesData> {
  const res = await fetch(`/api/favorites?_t=${Date.now()}`, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to fetch favorites');
  const data = await res.json();
  return { favorites: data.favorites || [] };
}

// Hook to get all favorites
export function useFavoritesOnly() {
  return useQuery({
    queryKey: ['favorites-only'],
    queryFn: fetchFavorites,
    staleTime: 30000, // 30s - matches API revalidation
  });
}

// Hook for individual listing favorite status
export function useFavorite(listingId: string) {
  const queryClient = useQueryClient();
  const [authRequired, setAuthRequired] = useState<AuthState>(DEFAULT_AUTH_STATE);

  const { data } = useQuery({
    queryKey: ['favorites-only'],
    queryFn: fetchFavorites,
    staleTime: 30000,
  });

  const isFavorite = data?.favorites.includes(listingId) || false;

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/favorites?_t=${Date.now()}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId }),
      });

      if (res.status === 401) {
        const data = await res.json();
        throw new Error(JSON.stringify({ auth: true, message: data.error || 'Please sign in' }));
      }

      if (!res.ok) throw new Error('Failed to update favorite');
      return res.json();
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['favorites-only'] });
      const previous = queryClient.getQueryData<FavoritesData>(['favorites-only']);
      
      if (previous) {
        const willBeAdded = !isFavorite;
        queryClient.setQueryData<FavoritesData>(['favorites-only'], {
          favorites: willBeAdded
            ? [...previous.favorites, listingId]
            : previous.favorites.filter(id => id !== listingId),
        });
      }
      
      return { previous };
    },
    onError: (error: Error, _, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['favorites-only'], context.previous);
      }
      
      try {
        const parsed = JSON.parse(error.message);
        if (parsed.auth) {
          setAuthRequired({ show: true, message: parsed.message });
        }
      } catch {}
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites-only'] });
    },
  });

  return {
    isFavorite,
    isUpdating: mutation.isPending,
    error: mutation.error?.message || null,
    toggle: () => mutation.mutate(),
    authRequired: authRequired.show,
    authMessage: authRequired.message,
    closeAuthDialog: () => setAuthRequired(DEFAULT_AUTH_STATE),
  };
}
