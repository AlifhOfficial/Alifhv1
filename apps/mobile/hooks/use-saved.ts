/**
 * Saved Listings Hook - Favorites & Superlikes
 * 
 * Manages saved listings state with API integration.
 * Provides both favorites and superlikes data.
 */

import { useState, useEffect, useCallback } from 'react';
import { savedApi, FavoritesStatusData, SavedListingCard } from '@/lib/saved-api';

// ============================================================================
// TYPES
// ============================================================================

export type SavedTab = 'favorites' | 'superlikes';

interface UseSavedOptions {
  isAuthenticated: boolean;
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
  // State
  const [activeTab, setActiveTab] = useState<SavedTab>('favorites');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Data
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [superlikeIds, setSuperlikeIds] = useState<string[]>([]);
  const [quota, setQuota] = useState<FavoritesStatusData['quota'] | null>(null);
  const [favorites, setFavorites] = useState<SavedListingCard[]>([]);
  const [superlikes, setSuperlikes] = useState<SavedListingCard[]>([]);

  // Fetch status and listings
  const fetchSaved = useCallback(async () => {
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }

    setError(null);

    try {
      // Fetch status first (API handles auth internally)
      const status = await savedApi.getFavoritesStatus();
      setFavoriteIds(status.favorites);
      setSuperlikeIds(status.superlikes);
      setQuota(status.quota);

      // Fetch listing details in parallel
      const [favListings, superListings] = await Promise.all([
        status.favorites.length > 0 
          ? savedApi.getListingCards(status.favorites) 
          : [],
        status.superlikes.length > 0 
          ? savedApi.getListingCards(status.superlikes) 
          : [],
      ]);

      setFavorites(favListings);
      setSuperlikes(superListings);
    } catch (err) {
      console.error('[useSaved] Error:', err);
      if (err instanceof Error && err.message === 'AUTH_REQUIRED') {
        setError('Please sign in to view saved listings');
      } else {
        setError(err instanceof Error ? err.message : 'Failed to load saved listings');
      }
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Toggle favorite
  const toggleFavorite = useCallback(async (listingId: string) => {
    try {
      // Optimistic update
      const isCurrentlyFavorite = favoriteIds.includes(listingId);
      if (isCurrentlyFavorite) {
        setFavoriteIds(prev => prev.filter(id => id !== listingId));
        setFavorites(prev => prev.filter(l => l.id !== listingId));
      } else {
        setFavoriteIds(prev => [...prev, listingId]);
      }

      await savedApi.toggleFavorite(listingId);
      
      // Refresh to get updated data
      await fetchSaved();
    } catch (err) {
      // Revert on error
      await fetchSaved();
      console.error('[useSaved] Toggle favorite error:', err);
    }
  }, [favoriteIds, fetchSaved]);

  // Toggle superlike
  const toggleSuperlike = useCallback(async (listingId: string) => {
    try {
      // Optimistic update
      const isCurrentlySuperliked = superlikeIds.includes(listingId);
      if (isCurrentlySuperliked) {
        setSuperlikeIds(prev => prev.filter(id => id !== listingId));
        setSuperlikes(prev => prev.filter(l => l.id !== listingId));
      } else {
        setSuperlikeIds(prev => [...prev, listingId]);
      }

      const result = await savedApi.toggleSuperlike(listingId);
      setQuota(result.quota);
      
      // Refresh to get updated data
      await fetchSaved();
    } catch (err) {
      // Revert on error
      await fetchSaved();
      console.error('[useSaved] Toggle superlike error:', err);
    }
  }, [superlikeIds, fetchSaved]);

  // Initial fetch
  useEffect(() => {
    fetchSaved();
  }, [fetchSaved]);

  return {
    favorites,
    superlikes,
    favoriteIds,
    superlikeIds,
    quota,
    activeTab,
    isLoading,
    error,
    setActiveTab,
    refresh: fetchSaved,
    toggleFavorite,
    toggleSuperlike,
  };
}
