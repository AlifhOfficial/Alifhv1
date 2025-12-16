'use client';

import { useCallback, useState } from 'react';
import { useFavoritesContext } from '@/contexts/favorites-context';

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

interface UseFavoritesResult {
  isFavorite: boolean;
  isSuperliked: boolean;
  isUpdating: boolean;
  error: string | null;
  quota: SuperlikeQuota | null;
  toggleFavorite: () => Promise<void>;
  toggleSuperlike: () => Promise<void>;
  authRequired: boolean;
  authMessage: string;
  authFeature: 'favorites' | 'superlikes';
  closeAuthDialog: () => void;
}

export function useFavorites(listingId: string): UseFavoritesResult {
  const { statuses, updateStatus, quota, setQuota } = useFavoritesContext();
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authRequired, setAuthRequired] = useState<{ show: boolean; message: string; feature: 'favorites' | 'superlikes' }>({ show: false, message: '', feature: 'favorites' });

  const status = statuses[listingId] || { isFavorite: false, isSuperliked: false };



  const toggleFavorite = useCallback(async () => {
    if (!listingId || isUpdating) return;
    
    const currentStatus = statuses[listingId] || { isFavorite: false, isSuperliked: false };
    const previousStatus = { ...currentStatus };
    setIsUpdating(true);
    setError(null);
    
    // Optimistic update
    updateStatus(listingId, { ...currentStatus, isFavorite: !currentStatus.isFavorite });
    
    try {
      const res = await fetch('/api/favorites', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId, addedFrom: 'car-card' }),
      });

      if (res.status === 401) {
        // User not authenticated - show auth modal
        updateStatus(listingId, previousStatus);
        const data = await res.json();
        setAuthRequired({ show: true, message: data.error || 'Please sign in to add favorites', feature: 'favorites' });
        return;
      }

      if (!res.ok) throw new Error('Failed to update favorite');

      const data = await res.json();
      updateStatus(listingId, {
        isFavorite: data.status?.isFavorite ?? false,
        isSuperliked: data.status?.isSuperliked ?? false,
      });
    } catch (err) {
      updateStatus(listingId, previousStatus);
      setError(err instanceof Error ? err.message : 'Failed to update favorite');
    } finally {
      setIsUpdating(false);
    }
  }, [listingId, statuses, updateStatus, setQuota]);

  const toggleSuperlike = useCallback(async () => {
    if (!listingId || isUpdating) return;
    
    const currentStatus = statuses[listingId] || { isFavorite: false, isSuperliked: false };
    const previousStatus = { ...currentStatus };
    setIsUpdating(true);
    setError(null);
    
    // Optimistic update
    updateStatus(listingId, { ...currentStatus, isSuperliked: !currentStatus.isSuperliked });
    
    try {
      const res = await fetch('/api/superlikes', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId, addedFrom: 'car-card' }),
      });

      if (res.status === 401) {
        // User not authenticated - show auth modal
        updateStatus(listingId, previousStatus);
        const data = await res.json();
        setAuthRequired({ show: true, message: data.error || 'Please sign in to add superlikes', feature: 'superlikes' });
        return;
      }

      if (!res.ok) throw new Error('Failed to update superlike');

      const data = await res.json();
      updateStatus(listingId, {
        isFavorite: data.status?.isFavorite ?? false,
        isSuperliked: data.status?.isSuperliked ?? false,
      });
      
      // Update quota if returned
      if (data.quota) {
        const updatedQuota = {
          ...data.quota,
          remaining: (data.quota.maxSuperlikesPerMonth + data.quota.premiumSuperlikesBonus) - data.quota.currentMonthSuperlikesUsed
        };
        setQuota(updatedQuota);
      }
    } catch (err) {
      updateStatus(listingId, previousStatus);
      setError(err instanceof Error ? err.message : 'Failed to update superlike');
    } finally {
      setIsUpdating(false);
    }
  }, [listingId, statuses, updateStatus, setQuota]);

  return {
    isFavorite: status.isFavorite,
    isSuperliked: status.isSuperliked,
    isUpdating,
    error,
    quota,
    toggleFavorite,
    toggleSuperlike,
    authRequired: authRequired.show,
    authMessage: authRequired.message,
    authFeature: authRequired.feature,
    closeAuthDialog: () => setAuthRequired({ show: false, message: '', feature: 'favorites' }),
  };
}
