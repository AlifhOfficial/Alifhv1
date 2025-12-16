/**
 * Batch Favorites Hook
 * Fetches favorite status for multiple listings at once to avoid N+1 queries
 */

'use client';

import { createContext, useContext, useState, useCallback, useRef, ReactNode } from 'react';

export interface FavoriteStatus {
  isFavorite: boolean;
  isSuperliked: boolean;
}

interface BatchFavoritesContextValue {
  statuses: Record<string, FavoriteStatus>;
  isLoading: boolean;
  fetchBatch: (listingIds: string[]) => Promise<void>;
  updateStatus: (listingId: string, status: FavoriteStatus) => void;
}

const BatchFavoritesContext = createContext<BatchFavoritesContextValue | undefined>(undefined);

export function BatchFavoritesProvider({ children }: { children: ReactNode }) {
  const [statuses, setStatuses] = useState<Record<string, FavoriteStatus>>({});
  const [isLoading, setIsLoading] = useState(false);
  
  const statusesRef = useRef<Record<string, FavoriteStatus>>({});
  const pendingRequestRef = useRef<Promise<void> | null>(null);
  
  // Keep ref in sync
  statusesRef.current = statuses;

  const fetchBatch = useCallback(async (listingIds: string[]) => {
    if (listingIds.length === 0) return;

    // Filter out already fetched IDs
    const newIds = listingIds.filter(id => !statusesRef.current[id]);
    if (newIds.length === 0) return;

    // If request pending, don't start another
    if (pendingRequestRef.current) {
      await pendingRequestRef.current;
      return;
    }

    setIsLoading(true);

    const requestPromise = (async () => {
      try {
        const idsParam = newIds.join(',');
        const res = await fetch(`/api/favorites?listingIds=${idsParam}`, {
          credentials: 'include',
        });

        if (!res.ok) throw new Error('Failed to fetch favorites');
        const data = await res.json();
        
        // Update statuses immediately
        setStatuses(prev => ({
          ...prev,
          ...data.statuses,
        }));
      } catch (err) {
        console.error('[BatchFavorites] Failed:', err);
        // Set defaults on error
        const defaults = newIds.reduce((acc, id) => {
          acc[id] = { isFavorite: false, isSuperliked: false };
          return acc;
        }, {} as Record<string, FavoriteStatus>);
        
        setStatuses(prev => ({ ...prev, ...defaults }));
      } finally {
        setIsLoading(false);
        pendingRequestRef.current = null;
      }
    })();

    pendingRequestRef.current = requestPromise;
    await requestPromise;
  }, []);

  const updateStatus = useCallback((listingId: string, status: FavoriteStatus) => {
    setStatuses(prev => ({
      ...prev,
      [listingId]: status,
    }));
  }, []);

  return (
    <BatchFavoritesContext.Provider value={{ statuses, isLoading, fetchBatch, updateStatus }}>
      {children}
    </BatchFavoritesContext.Provider>
  );
}

export function useBatchFavorites() {
  const context = useContext(BatchFavoritesContext);
  if (!context) {
    throw new Error('useBatchFavorites must be used within BatchFavoritesProvider');
  }
  return context;
}
