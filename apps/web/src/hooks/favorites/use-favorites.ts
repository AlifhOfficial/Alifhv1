'use client';

import { useCallback, useEffect, useState } from 'react';
import { useFavoritesContext } from '@/contexts/quota-context';
import { useBatchFavorites } from '@/contexts/batch-favorites-context';

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
  isLoading: boolean;
  isUpdating: boolean;
  error: string | null;
  quota: SuperlikeQuota | null;
  refresh: () => Promise<void>;
  toggleFavorite: () => Promise<void>;
  toggleSuperlike: () => Promise<void>;
}

export function useFavorites(listingId: string): UseFavoritesResult {
  const { quota: globalQuota, updateQuota } = useFavoritesContext();
  const { statuses: batchStatuses, isLoading: batchLoading, updateStatus: updateBatchStatus } = useBatchFavorites();
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get status from batch context
  const status = batchStatuses[listingId] || { isFavorite: false, isSuperliked: false };
  const isLoading = batchLoading && !batchStatuses[listingId];

  const refresh = useCallback(async () => {
    if (!listingId) return;
    setError(null);
    try {
      const res = await fetch(`/api/favorites?listingIds=${listingId}`, {
        credentials: 'include',
      });

      if (!res.ok) throw new Error('Failed to load favorites');

      const data = await res.json();
      const listingStatus = data.statuses?.[listingId];
      
      // Update batch context
      updateBatchStatus(listingId, {
        isFavorite: listingStatus?.isFavorite ?? false,
        isSuperliked: listingStatus?.isSuperliked ?? false,
      });
      
      if (data.quota) {
        const { maxSuperlikesPerMonth = 0, premiumSuperlikesBonus = 0, currentMonthSuperlikesUsed = 0 } = data.quota;
        updateQuota({
          ...data.quota,
          remaining: Math.max(maxSuperlikesPerMonth + premiumSuperlikesBonus - currentMonthSuperlikesUsed, 0),
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load favorites');
    }
  }, [listingId, updateQuota, updateBatchStatus]);

  const toggleFavorite = useCallback(async () => {
    if (!listingId || isUpdating) return;
    
    const previousStatus = { ...status };
    setIsUpdating(true);
    setError(null);
    
    // Optimistic update
    updateBatchStatus(listingId, {
      isFavorite: !status.isFavorite,
      isSuperliked: status.isSuperliked,
    });
    
    try {
      const res = await fetch('/api/favorites', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId, addedFrom: 'car-card' }),
      });

      if (!res.ok) throw new Error('Failed to update favorite');

      const data = await res.json();
      updateBatchStatus(listingId, {
        isFavorite: data.status?.isFavorite ?? false,
        isSuperliked: data.status?.isSuperliked ?? false,
      });
    } catch (err) {
      updateBatchStatus(listingId, previousStatus);
      setError(err instanceof Error ? err.message : 'Failed to update favorite');
    } finally {
      setIsUpdating(false);
    }
  }, [listingId, isUpdating, status, updateBatchStatus]);

  const toggleSuperlike = useCallback(async () => {
    if (!listingId || isUpdating) return;
    
    const previousStatus = { ...status };
    const previousQuota = globalQuota;
    const willBeSuperliked = !status.isSuperliked;
    
    setIsUpdating(true);
    setError(null);
    
    // Optimistic updates
    updateBatchStatus(listingId, {
      isFavorite: status.isFavorite,
      isSuperliked: !status.isSuperliked,
    });
    
    // Only update quota when adding (not when removing - quota stays consumed)
    if (willBeSuperliked && globalQuota) {
      updateQuota({
        ...globalQuota,
        currentMonthSuperlikesUsed: globalQuota.currentMonthSuperlikesUsed + 1,
        totalSuperlikesUsed: globalQuota.totalSuperlikesUsed + 1,
        remaining: Math.max(globalQuota.remaining - 1, 0),
      });
    }
    
    try {
      const res = await fetch('/api/superlikes', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId, addedFrom: 'car-card' }),
      });

      if (!res.ok) throw new Error('Failed to update superlike');

      const data = await res.json();
      updateBatchStatus(listingId, {
        isFavorite: data.status?.isFavorite ?? false,
        isSuperliked: data.status?.isSuperliked ?? false,
      });
      
      if (data.quota) {
        const { maxSuperlikesPerMonth = 0, premiumSuperlikesBonus = 0, currentMonthSuperlikesUsed = 0 } = data.quota;
        updateQuota({
          ...data.quota,
          remaining: Math.max(maxSuperlikesPerMonth + premiumSuperlikesBonus - currentMonthSuperlikesUsed, 0),
        });
      }
    } catch (err) {
      updateBatchStatus(listingId, previousStatus);
      if (previousQuota) updateQuota(previousQuota);
      setError(err instanceof Error ? err.message : 'Failed to update superlike');
    } finally {
      setIsUpdating(false);
    }
  }, [listingId, isUpdating, status, globalQuota, updateQuota, updateBatchStatus]);

  return {
    isFavorite: status.isFavorite,
    isSuperliked: status.isSuperliked,
    isLoading,
    isUpdating,
    error,
    quota: globalQuota,
    refresh,
    toggleFavorite,
    toggleSuperlike,
  };
}
