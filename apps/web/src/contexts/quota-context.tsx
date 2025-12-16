'use client';

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';

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
  quota: SuperlikeQuota | null;
  updateQuota: (quota: SuperlikeQuota) => void;
  refreshFavorites: () => void;
  lastRefresh: number;
}

const FavoritesContext = createContext<FavoritesContextValue | undefined>(undefined);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [quota, setQuota] = useState<SuperlikeQuota | null>(null);
  const [lastRefresh, setLastRefresh] = useState(Date.now());
  const [isFetching, setIsFetching] = useState(false);

  const updateQuota = useCallback((newQuota: SuperlikeQuota) => {
    setQuota(newQuota);
  }, []);

  const refreshFavorites = useCallback(() => {
    setLastRefresh(Date.now());
  }, []);

  // Fetch quota on mount
  useEffect(() => {
    if (isFetching || quota) return;
    
    const fetchQuota = async () => {
      setIsFetching(true);
      try {
        const res = await fetch('/api/superlikes', { 
          credentials: 'include',
        });
        
        if (res.ok) {
          const data = await res.json();
          if (data?.quota) {
            const baseMax = data.quota.maxSuperlikesPerMonth || 0;
            const bonus = data.quota.premiumSuperlikesBonus || 0;
            const used = data.quota.currentMonthSuperlikesUsed || 0;
            setQuota({
              ...data.quota,
              remaining: Math.max(baseMax + bonus - used, 0),
            });
          }
        }
      } catch (err) {
        console.error('Failed to fetch quota:', err);
      } finally {
        setIsFetching(false);
      }
    };

    fetchQuota();
  }, [isFetching, quota]);

  return (
    <FavoritesContext.Provider value={{ quota, updateQuota, refreshFavorites, lastRefresh }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavoritesContext() {
  const context = useContext(FavoritesContext);
  if (!context) {
    // Return default values if not in provider (graceful degradation)
    return {
      quota: null,
      updateQuota: () => {},
      refreshFavorites: () => {},
      lastRefresh: Date.now(),
    };
  }
  return context;
}
