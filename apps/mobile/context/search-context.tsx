/**
 * Search Context
 * Manages search state between GlobalTabBar and Browse screen
 */

import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import type { SearchSortOption } from '@/lib/api';

// Sort option labels for display
const SORT_LABELS: Record<SearchSortOption, string> = {
  relevance: 'Default',
  popular: 'Most Popular',
  newest: 'Recently Listed',
  oldest: 'Oldest Listings',
  price_low: 'Price: Low to High',
  price_high: 'Price: High to Low',
  mileage_low: 'Lowest Mileage',
  year_new: 'Year: Newest',
  year_old: 'Year: Oldest',
};

export type SearchParams = {
  q?: string;
  make?: string[];
  model?: string[];
  trim?: string[];
};

// Chip type for active search display
export type SearchChip = {
  key: string;
  label: string;
  value: string;
  index?: number; // For array items
};

interface SearchContextValue {
  /** Current search parameters */
  searchParams: SearchParams | null;
  /** Apply search from search sheet */
  applySearch: (params: SearchParams) => void;
  /** Clear current search */
  clearSearch: () => void;
  /** Remove a specific search param */
  removeSearchParam: (key: keyof SearchParams, index?: number) => void;
  /** Subscribe to search changes (for browse screen) */
  subscribeToSearch: (callback: (params: SearchParams) => void) => () => void;
  /** Get active search chips */
  getSearchChips: () => SearchChip[];
  
  /** Current sort option */
  sortBy: SearchSortOption;
  /** Apply sort from sort sheet */
  applySort: (sort: SearchSortOption) => void;
  /** Reset sort to default */
  resetSort: () => void;
  /** Subscribe to sort changes (for browse screen) */
  subscribeToSort: (callback: (sort: SearchSortOption) => void) => () => void;
  
  /** Trigger scroll to top (from tab bar double-tap) */
  triggerScrollToTop: () => void;
  /** Subscribe to scroll to top events (for browse screen) */
  subscribeToScrollToTop: (callback: () => void) => () => void;
}

const SearchContext = createContext<SearchContextValue | undefined>(undefined);

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [searchParams, setSearchParams] = useState<SearchParams | null>(null);
  const [sortBy, setSortBy] = useState<SearchSortOption>('relevance');
  const listenersRef = useRef<Set<(params: SearchParams) => void>>(new Set());
  const sortListenersRef = useRef<Set<(sort: SearchSortOption) => void>>(new Set());
  const scrollToTopListenersRef = useRef<Set<() => void>>(new Set());

  const applySearch = useCallback((params: SearchParams) => {
    setSearchParams(params);
    // Notify all listeners
    listenersRef.current.forEach(listener => listener(params));
  }, []);

  const clearSearch = useCallback(() => {
    setSearchParams(null);
    // Notify listeners with empty params to reset
    listenersRef.current.forEach(listener => listener({}));
  }, []);

  const removeSearchParam = useCallback((key: keyof SearchParams, index?: number) => {
    setSearchParams(prev => {
      if (!prev) return null;
      const newParams = { ...prev };
      
      // Handle array removal
      if (index !== undefined && Array.isArray(newParams[key])) {
        const arr = [...(newParams[key] as string[])];
        arr.splice(index, 1);
        if (arr.length === 0) {
          delete newParams[key];
          // Clear downstream: if make cleared, clear model and trim
          if (key === 'make') {
            delete newParams.model;
            delete newParams.trim;
          }
          if (key === 'model') {
            delete newParams.trim;
          }
        } else {
          (newParams[key] as string[]) = arr;
        }
      } else {
        delete newParams[key];
      }
      
      // If no params left, return null
      if (Object.keys(newParams).length === 0) {
        listenersRef.current.forEach(listener => listener({}));
        return null;
      }
      // Notify listeners with updated params
      listenersRef.current.forEach(listener => listener(newParams));
      return newParams;
    });
  }, []);

  const getSearchChips = useCallback((): SearchChip[] => {
    const chips: SearchChip[] = [];
    
    // Add sort chip if not default
    if (sortBy !== 'relevance') {
      chips.push({ key: 'sort', label: SORT_LABELS[sortBy], value: sortBy });
    }
    
    if (!searchParams) return chips;
    
    if (searchParams.q) {
      chips.push({ key: 'q', label: `"${searchParams.q}"`, value: searchParams.q });
    }
    if (searchParams.make?.length) {
      searchParams.make.forEach((make, index) => {
        chips.push({ key: 'make', label: make, value: make, index });
      });
    }
    if (searchParams.model?.length) {
      searchParams.model.forEach((model, index) => {
        chips.push({ key: 'model', label: model, value: model, index });
      });
    }
    if (searchParams.trim?.length) {
      searchParams.trim.forEach((trim, index) => {
        chips.push({ key: 'trim', label: trim, value: trim, index });
      });
    }
    
    return chips;
  }, [searchParams, sortBy]);

  const subscribeToSearch = useCallback((callback: (params: SearchParams) => void) => {
    listenersRef.current.add(callback);
    return () => {
      listenersRef.current.delete(callback);
    };
  }, []);

  const applySort = useCallback((sort: SearchSortOption) => {
    setSortBy(sort);
    // Notify all listeners
    sortListenersRef.current.forEach(listener => listener(sort));
  }, []);

  const resetSort = useCallback(() => {
    setSortBy('relevance');
    // Notify all listeners
    sortListenersRef.current.forEach(listener => listener('relevance'));
  }, []);

  const subscribeToSort = useCallback((callback: (sort: SearchSortOption) => void) => {
    sortListenersRef.current.add(callback);
    return () => {
      sortListenersRef.current.delete(callback);
    };
  }, []);

  const triggerScrollToTop = useCallback(() => {
    scrollToTopListenersRef.current.forEach(listener => listener());
  }, []);

  const subscribeToScrollToTop = useCallback((callback: () => void) => {
    scrollToTopListenersRef.current.add(callback);
    return () => {
      scrollToTopListenersRef.current.delete(callback);
    };
  }, []);

  return (
    <SearchContext.Provider
      value={{
        searchParams,
        applySearch,
        clearSearch,
        removeSearchParam,
        subscribeToSearch,
        getSearchChips,
        sortBy,
        applySort,
        resetSort,
        subscribeToSort,
        triggerScrollToTop,
        subscribeToScrollToTop,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
}
