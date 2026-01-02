/**
 * Compare Context - Global state for car comparison tool
 * Stores selected cars (max 3) with URL sync for shareability
 */

'use client';

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import type { CarDetailedData } from '@alifh/database';

// ============================================================================
// Types
// ============================================================================

export interface CompareItem {
  id: string;
  data: CarDetailedData | null; // null = loading
}

interface CompareContextType {
  items: CompareItem[];
  isLoading: boolean;
  addCar: (id: string) => void;
  removeCar: (id: string) => void;
  clearAll: () => void;
  canAdd: boolean;
  isInCompare: (id: string) => boolean;
  getShareUrl: () => string;
}

const MAX_COMPARE = 3;

const CompareContext = createContext<CompareContextType | undefined>(undefined);

// ============================================================================
// Provider
// ============================================================================

export function CompareProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CompareItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Sync from URL on mount (for shared links)
  useEffect(() => {
    const idsParam = searchParams.get('ids');
    if (idsParam && items.length === 0) {
      const ids = idsParam.split(',').slice(0, MAX_COMPARE);
      if (ids.length > 0) {
        loadCars(ids);
      }
    }
  }, [searchParams]);

  // Load car data by IDs
  const loadCars = async (ids: string[]) => {
    setIsLoading(true);
    
    // Initialize with loading state
    setItems(ids.map(id => ({ id, data: null })));

    try {
      // Fetch each car's detailed data
      const results = await Promise.all(
        ids.map(async (id) => {
          try {
            const res = await fetch(`/api/listings/${id}/detailed`);
            if (!res.ok) return null;
            const data = await res.json();
            return data.listing || data;
          } catch {
            return null;
          }
        })
      );

      // Update with fetched data
      setItems(ids.map((id, i) => ({ id, data: results[i] })));
    } finally {
      setIsLoading(false);
    }
  };

  // Update URL when items change
  const updateUrl = useCallback((newIds: string[]) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newIds.length > 0) {
      params.set('ids', newIds.join(','));
    } else {
      params.delete('ids');
    }
    const query = params.toString();
    router.replace(`${pathname}${query ? `?${query}` : ''}`, { scroll: false });
  }, [pathname, router, searchParams]);

  // Add a car to compare
  const addCar = useCallback(async (id: string) => {
    if (items.length >= MAX_COMPARE) return;
    if (items.some(item => item.id === id)) return;

    // Add with loading state
    const newItems = [...items, { id, data: null }];
    setItems(newItems);
    updateUrl(newItems.map(i => i.id));

    // Fetch the car's detailed data
    try {
      const res = await fetch(`/api/listings/${id}/detailed`);
      if (res.ok) {
        const data = await res.json();
        setItems(prev => 
          prev.map(item => 
            item.id === id ? { id, data: data.listing || data } : item
          )
        );
      }
    } catch (error) {
      console.error('Failed to load car:', error);
    }
  }, [items, updateUrl]);

  // Remove a car from compare
  const removeCar = useCallback((id: string) => {
    const newItems = items.filter(item => item.id !== id);
    setItems(newItems);
    updateUrl(newItems.map(i => i.id));
  }, [items, updateUrl]);

  // Clear all
  const clearAll = useCallback(() => {
    setItems([]);
    updateUrl([]);
  }, [updateUrl]);

  // Check if a car is in compare
  const isInCompare = useCallback((id: string) => {
    return items.some(item => item.id === id);
  }, [items]);

  // Get shareable URL
  const getShareUrl = useCallback(() => {
    if (typeof window === 'undefined') return '';
    const ids = items.map(i => i.id).join(',');
    return `${window.location.origin}/tools/compare?ids=${ids}`;
  }, [items]);

  return (
    <CompareContext.Provider value={{
      items,
      isLoading,
      addCar,
      removeCar,
      clearAll,
      canAdd: items.length < MAX_COMPARE,
      isInCompare,
      getShareUrl,
    }}>
      {children}
    </CompareContext.Provider>
  );
}

// ============================================================================
// Hook
// ============================================================================

export function useCompare() {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error('useCompare must be used within CompareProvider');
  }
  return context;
}

// ============================================================================
// Constants
// ============================================================================

export { MAX_COMPARE };
