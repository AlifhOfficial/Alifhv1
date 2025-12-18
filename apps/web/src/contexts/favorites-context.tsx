/**
 * Favorites Context - Production
 * 
 * Manages favorite and superlike status for listings with quota tracking.
 * Provides centralized state management for user-specific listing interactions.
 * 
 * @module contexts/favorites-context
 * @client-only
 */

'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

interface FavoriteStatus {
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

interface FavoritesContextValue {
  statuses: Record<string, FavoriteStatus>;
  setStatuses: (statuses: Record<string, FavoriteStatus>) => void;
  updateStatus: (listingId: string, status: FavoriteStatus) => void;
  clearStatuses: () => void;
  quota: SuperlikeQuota | null;
  setQuota: (quota: SuperlikeQuota | null) => void;
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [statuses, setStatuses] = useState<Record<string, FavoriteStatus>>({});
  const [quota, setQuota] = useState<SuperlikeQuota | null>(null);

  const updateStatus = useCallback((listingId: string, status: FavoriteStatus) => {
    setStatuses(prev => ({ ...prev, [listingId]: status }));
  }, []);

  const clearStatuses = useCallback(() => {
    setStatuses({});
    setQuota(null);
  }, []);

  return (
    <FavoritesContext.Provider value={{ statuses, setStatuses, updateStatus, clearStatuses, quota, setQuota }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavoritesContext() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavoritesContext must be used within FavoritesProvider');
  }
  return context;
}
