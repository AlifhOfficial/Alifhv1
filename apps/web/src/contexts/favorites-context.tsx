/**
 * Simple Favorites Context
 * Just holds the favorite/superlike status for all listings
 */

'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

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
  quota: SuperlikeQuota | null;
  setQuota: (quota: SuperlikeQuota | null) => void;
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [statuses, setStatuses] = useState<Record<string, FavoriteStatus>>({});
  const [quota, setQuota] = useState<SuperlikeQuota | null>(null);

  const updateStatus = (listingId: string, status: FavoriteStatus) => {
    setStatuses(prev => ({ ...prev, [listingId]: status }));
  };

  return (
    <FavoritesContext.Provider value={{ statuses, setStatuses, updateStatus, quota, setQuota }}>
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
