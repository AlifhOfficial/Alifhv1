/**
 * Favorites Context - Global favorites & superlikes state
 * 
 * Provides favorites/superlikes state accessible from any card component.
 * Syncs with API and provides optimistic updates.
 * 
 * Usage:
 *   const { isFavorite, toggleFavorite } = useFavorites();
 *   <Heart fill={isFavorite(listingId) ? 'red' : 'none'} />
 */

import { useAlert } from '@/components/ui';
import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode, useMemo, useRef } from 'react';
import { savedApi, FavoritesStatusData } from '@/lib/saved-api';
import { useAuth } from '@/context/auth-context';

// ============================================================================
// TYPES
// ============================================================================

interface FavoritesContextType {
  // State
  favoriteIds: string[];
  superlikeIds: string[];
  quota: FavoritesStatusData['quota'] | null;
  isLoading: boolean;
  
  // Helpers
  isFavorite: (listingId: string) => boolean;
  isSuperliked: (listingId: string) => boolean;
  isPending: (listingId: string) => boolean;
  
  // Actions
  toggleFavorite: (listingId: string) => Promise<void>;
  toggleSuperlike: (listingId: string) => Promise<void>;
  refresh: () => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

// ============================================================================
// CONSTANTS
// ============================================================================

const DEBOUNCE_MS = 500; // Minimum time between toggles for same listing

// ============================================================================
// PROVIDER
// ============================================================================

interface FavoritesProviderProps {
  children: ReactNode;
}

export function FavoritesProvider({ children }: FavoritesProviderProps) {
  const { isAuthenticated, user, isLoading: isAuthLoading } = useAuth();
  const { showAlert } = useAlert();
  
  // State - using arrays for stable references
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [superlikeIds, setSuperlikeIds] = useState<string[]>([]);
  const [quota, setQuota] = useState<FavoritesStatusData['quota'] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Track pending requests to prevent duplicates and rate limiting
  const pendingFavoritesRef = useRef<Set<string>>(new Set());
  const pendingSuperlikesRef = useRef<Set<string>>(new Set());
  const lastToggleTimeRef = useRef<Map<string, number>>(new Map());
  
  // Track current user to detect changes
  const prevUserIdRef = useRef<string | undefined>(undefined);

  // Helper: Check if a listing has a pending operation
  const isPending = useCallback((listingId: string): boolean => {
    return pendingFavoritesRef.current.has(listingId) || pendingSuperlikesRef.current.has(listingId);
  }, []);

  // Fetch favorites status from API
  const fetchStatus = useCallback(async () => {
    console.log('[FavoritesContext] fetchStatus called, isAuthenticated:', isAuthenticated, 'userId:', user?.id);
    
    if (!isAuthenticated || !user?.id) {
      console.log('[FavoritesContext] Clearing favorites - not authenticated');
      setFavoriteIds([]);
      setSuperlikeIds([]);
      setQuota(null);
      return;
    }

    setIsLoading(true);
    try {
      console.log('[FavoritesContext] Fetching favorites from API...');
      const status = await savedApi.getFavoritesStatus();
      console.log('[FavoritesContext] Got favorites:', status.favorites.length, 'superlikes:', status.superlikes.length);
      setFavoriteIds(status.favorites);
      setSuperlikeIds(status.superlikes);
      setQuota(status.quota);
    } catch (err) {
      console.error('[FavoritesContext] Failed to fetch status:', err);
      // Keep existing data on error
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user?.id]);

  // Fetch when auth state changes
  useEffect(() => {
    // Wait for auth to finish loading
    if (isAuthLoading) {
      console.log('[FavoritesContext] Waiting for auth to load...');
      return;
    }
    
    // Detect user change (login/logout/switch)
    const currentUserId = user?.id;
    const prevUserId = prevUserIdRef.current;
    
    console.log('[FavoritesContext] Auth state changed:', { 
      isAuthenticated, 
      currentUserId, 
      prevUserId,
      isAuthLoading 
    });
    
    // Update ref
    prevUserIdRef.current = currentUserId;
    
    // Fetch on user change
    if (currentUserId !== prevUserId) {
      fetchStatus();
    }
  }, [isAuthenticated, user?.id, isAuthLoading, fetchStatus]);

  // Helper: Check if listing is favorited
  const isFavorite = useCallback((listingId: string): boolean => {
    return favoriteIds.includes(listingId);
  }, [favoriteIds]);

  // Helper: Check if listing is superliked
  const isSuperliked = useCallback((listingId: string): boolean => {
    return superlikeIds.includes(listingId);
  }, [superlikeIds]);

  // Action: Toggle favorite with optimistic update
  const toggleFavorite = useCallback(async (listingId: string) => {
    console.log('[FavoritesContext] toggleFavorite:', listingId);
    
    if (!isAuthenticated) {
      throw new Error('AUTH_REQUIRED');
    }

    // Debounce: check if we toggled this listing recently
    const now = Date.now();
    const lastToggle = lastToggleTimeRef.current.get(`fav:${listingId}`);
    if (lastToggle && now - lastToggle < DEBOUNCE_MS) {
      console.log('[FavoritesContext] Debounced - too soon since last toggle');
      return;
    }

    // Check if already pending
    if (pendingFavoritesRef.current.has(listingId)) {
      console.log('[FavoritesContext] Skipping - request already pending');
      return;
    }

    // Mark as pending and record time
    pendingFavoritesRef.current.add(listingId);
    lastToggleTimeRef.current.set(`fav:${listingId}`, now);

    const wasActive = favoriteIds.includes(listingId);

    // Optimistic update
    setFavoriteIds(prev => 
      wasActive 
        ? prev.filter(id => id !== listingId)
        : [...prev, listingId]
    );

    try {
      await savedApi.toggleFavorite(listingId);
      console.log('[FavoritesContext] Toggle favorite success');
    } catch (err) {
      // Revert on error
      console.error('[FavoritesContext] Toggle favorite failed:', err);
      setFavoriteIds(prev => 
        wasActive 
          ? [...prev, listingId]
          : prev.filter(id => id !== listingId)
      );
      
      // Handle rate limit error gracefully
      if (err instanceof Error && err.message === 'RATE_LIMITED') {
        showAlert(
          'Please slow down',
          'You\'re saving too fast. Please wait a moment and try again.'
        );
        return; // Don't rethrow for rate limit
      }
      
      throw err;
    } finally {
      pendingFavoritesRef.current.delete(listingId);
    }
  }, [isAuthenticated, favoriteIds, showAlert]);

  // Action: Toggle superlike with optimistic update
  const toggleSuperlike = useCallback(async (listingId: string) => {
    console.log('[FavoritesContext] toggleSuperlike:', listingId);
    
    if (!isAuthenticated) {
      throw new Error('AUTH_REQUIRED');
    }

    // Debounce: check if we toggled this listing recently
    const now = Date.now();
    const lastToggle = lastToggleTimeRef.current.get(`superlike:${listingId}`);
    if (lastToggle && now - lastToggle < DEBOUNCE_MS) {
      console.log('[FavoritesContext] Debounced - too soon since last toggle');
      return;
    }

    // Check if already pending
    if (pendingSuperlikesRef.current.has(listingId)) {
      console.log('[FavoritesContext] Skipping - request already pending');
      return;
    }

    // Mark as pending and record time
    pendingSuperlikesRef.current.add(listingId);
    lastToggleTimeRef.current.set(`superlike:${listingId}`, now);

    const wasActive = superlikeIds.includes(listingId);

    // Optimistic update
    setSuperlikeIds(prev => 
      wasActive 
        ? prev.filter(id => id !== listingId)
        : [...prev, listingId]
    );

    // Update quota optimistically (only when adding - no refunds on removal)
    if (quota && !wasActive) {
      setQuota(prev => prev ? {
        ...prev,
        currentMonthSuperlikesUsed: prev.currentMonthSuperlikesUsed + 1,
        remaining: prev.remaining - 1,
      } : null);
    }

    try {
      const result = await savedApi.toggleSuperlike(listingId);
      console.log('[FavoritesContext] Toggle superlike success');
      // Update quota with server response
      setQuota(result.quota);
    } catch (err) {
      // Revert on error
      console.error('[FavoritesContext] Toggle superlike failed:', err);
      setSuperlikeIds(prev => 
        wasActive 
          ? [...prev, listingId]
          : prev.filter(id => id !== listingId)
      );
      // Refresh to get correct quota
      fetchStatus();
      
      // Handle quota exceeded gracefully
      if (err instanceof Error && err.message === 'QUOTA_EXCEEDED') {
        showAlert(
          'Superlike limit reached',
          'You\'ve used all your superlikes for this month. Upgrade to Premium for more!'
        );
        return; // Don't rethrow for quota exceeded
      }
      
      // Handle rate limit error gracefully
      if (err instanceof Error && err.message === 'RATE_LIMITED') {
        showAlert(
          'Please slow down',
          'You\'re acting too fast. Please wait a moment and try again.'
        );
        return; // Don't rethrow for rate limit
      }
      
      throw err;
    } finally {
      pendingSuperlikesRef.current.delete(listingId);
    }
  }, [isAuthenticated, superlikeIds, quota, fetchStatus, showAlert]);

  // Memoize context value
  const value = useMemo<FavoritesContextType>(() => ({
    favoriteIds,
    superlikeIds,
    quota,
    isLoading,
    isFavorite,
    isSuperliked,
    isPending,
    toggleFavorite,
    toggleSuperlike,
    refresh: fetchStatus,
  }), [
    favoriteIds,
    superlikeIds,
    quota,
    isLoading,
    isFavorite,
    isSuperliked,
    isPending,
    toggleFavorite,
    toggleSuperlike,
    fetchStatus,
  ]);

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

// ============================================================================
// HOOK
// ============================================================================

export function useFavorites(): FavoritesContextType {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}

/**
 * Convenience hook for a single listing's favorite state
 * Reduces re-renders by only returning state for one listing
 */
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
