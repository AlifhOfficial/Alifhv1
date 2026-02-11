/**
 * Search Context
 * Manages search state between GlobalTabBar and Browse screen
 */

import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import type { SearchSortOption } from '@/lib/search-api';

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
  tags?: string[];
  extras?: string[];
  partnerId?: string;
  partnerName?: string;
  sellerId?: string;
  sellerName?: string;
};

// Filter params for browse screen
export type FilterParams = {
  priceMin?: number;
  priceMax?: number;
  yearMin?: number;
  yearMax?: number;
  mileageMin?: number;
  mileageMax?: number;
  emirate?: string[];
  bodyType?: string[];
  fuelType?: string[];
  transmission?: string[];
  specs?: string[];
  exteriorColor?: string[];
  interiorColor?: string[];
  engineSize?: string[];
  condition?: 'new' | 'used';
  isNegotiable?: boolean;
  isBlkListing?: boolean;
  isBlackTierPartner?: boolean;
  sellerType?: 'dealer' | 'private';
};

// Chip type for active search display
export type SearchChip = {
  key: string;
  label: string;
  value: string;
  index?: number; // For array items
};

// Keys that can be removed - includes compound keys for range filters
export type RemovableFilterKey = keyof FilterParams | 'price' | 'year' | 'mileage';

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
  /** Get total count of all active filters (for badge display) */
  getActiveFilterCount: () => number;
  
  /** Current sort option */
  sortBy: SearchSortOption;
  /** Apply sort from sort sheet */
  applySort: (sort: SearchSortOption) => void;
  /** Reset sort to default */
  resetSort: () => void;
  /** Subscribe to sort changes (for browse screen) */
  subscribeToSort: (callback: (sort: SearchSortOption) => void) => () => void;
  
  /** Current filter parameters */
  filterParams: FilterParams;
  /** Update filter params */
  updateFilterParams: (params: Partial<FilterParams>) => void;
  /** Clear all filter params */
  clearFilterParams: () => void;
  /** Remove a specific filter param (accepts compound keys like 'price', 'year', 'mileage') */
  removeFilterParam: (key: RemovableFilterKey, index?: number) => void;
  /** Subscribe to filter changes */
  subscribeToFilters: (callback: (params: FilterParams) => void) => () => void;
  
  /** Trigger scroll to top (from tab bar double-tap) */
  triggerScrollToTop: () => void;
  /** Subscribe to scroll to top events (for browse screen) */
  subscribeToScrollToTop: (callback: () => void) => () => void;
}

const SearchContext = createContext<SearchContextValue | undefined>(undefined);

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [searchParams, setSearchParams] = useState<SearchParams | null>(null);
  const [sortBy, setSortBy] = useState<SearchSortOption>('relevance');
  const [filterParams, setFilterParams] = useState<FilterParams>({});
  const listenersRef = useRef<Set<(params: SearchParams) => void>>(new Set());
  const sortListenersRef = useRef<Set<(sort: SearchSortOption) => void>>(new Set());
  const filterListenersRef = useRef<Set<(params: FilterParams) => void>>(new Set());
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
        // Clear partnerId + partnerName together
        if (key === 'partnerId') {
          delete newParams.partnerName;
        }
        if (key === 'partnerName') {
          delete newParams.partnerId;
        }
        // Clear sellerId + sellerName together
        if (key === 'sellerId') {
          delete newParams.sellerName;
        }
        if (key === 'sellerName') {
          delete newParams.sellerId;
        }
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
    
    if (searchParams) {
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
      // Tags chip
      if (searchParams.tags?.length) {
        searchParams.tags.forEach((tag, index) => {
          chips.push({ key: 'tags', label: tag, value: tag, index });
        });
      }
      // Extras/features chip
      if (searchParams.extras?.length) {
        searchParams.extras.forEach((extra, index) => {
          chips.push({ key: 'extras', label: extra, value: extra, index });
        });
      }
      // Partner/dealer chip
      if (searchParams.partnerId && searchParams.partnerName) {
        chips.push({ key: 'partnerId', label: `Dealer: ${searchParams.partnerName}`, value: searchParams.partnerId });
      }
      // Private seller chip
      if (searchParams.sellerId && searchParams.sellerName) {
        chips.push({ key: 'sellerId', label: `Seller: ${searchParams.sellerName}`, value: searchParams.sellerId });
      }
    }
    
    // Add filter chips
    if (filterParams.priceMin || filterParams.priceMax) {
      const min = filterParams.priceMin ? `${(filterParams.priceMin / 1000).toFixed(0)}K` : '0';
      const max = filterParams.priceMax ? `${(filterParams.priceMax / 1000).toFixed(0)}K` : 'Any';
      chips.push({ key: 'price', label: `AED ${min}-${max}`, value: 'price' });
    }
    if (filterParams.yearMin || filterParams.yearMax) {
      const min = filterParams.yearMin || 'Any';
      const max = filterParams.yearMax || 'Any';
      chips.push({ key: 'year', label: `${min}-${max}`, value: 'year' });
    }
    if (filterParams.mileageMin || filterParams.mileageMax) {
      const max = filterParams.mileageMax ? `${(filterParams.mileageMax / 1000).toFixed(0)}K km` : 'Any';
      chips.push({ key: 'mileage', label: `Under ${max}`, value: 'mileage' });
    }
    if (filterParams.emirate?.length) {
      filterParams.emirate.forEach((emirate, index) => {
        chips.push({ key: 'emirate', label: emirate, value: emirate, index });
      });
    }
    if (filterParams.bodyType?.length) {
      filterParams.bodyType.forEach((type, index) => {
        chips.push({ key: 'bodyType', label: type, value: type, index });
      });
    }
    if (filterParams.fuelType?.length) {
      filterParams.fuelType.forEach((type, index) => {
        chips.push({ key: 'fuelType', label: type, value: type, index });
      });
    }
    if (filterParams.transmission?.length) {
      filterParams.transmission.forEach((type, index) => {
        chips.push({ key: 'transmission', label: type, value: type, index });
      });
    }
    if (filterParams.specs?.length) {
      filterParams.specs.forEach((spec, index) => {
        chips.push({ key: 'specs', label: spec, value: spec, index });
      });
    }
    if (filterParams.condition) {
      chips.push({ key: 'condition', label: filterParams.condition === 'new' ? 'New' : 'Used', value: filterParams.condition });
    }
    if (filterParams.isNegotiable) {
      chips.push({ key: 'isNegotiable', label: 'Negotiable', value: 'true' });
    }
    if (filterParams.isBlkListing) {
      chips.push({ key: 'isBlkListing', label: 'BLK', value: 'true' });
    }
    if (filterParams.isBlackTierPartner) {
      chips.push({ key: 'isBlackTierPartner', label: 'Black Tier', value: 'true' });
    }
    if (filterParams.sellerType) {
      chips.push({ key: 'sellerType', label: filterParams.sellerType === 'dealer' ? 'Dealer' : 'Private', value: filterParams.sellerType });
    }
    if (filterParams.exteriorColor?.length) {
      filterParams.exteriorColor.forEach((color, index) => {
        chips.push({ key: 'exteriorColor', label: `Ext: ${color.charAt(0).toUpperCase() + color.slice(1)}`, value: color, index });
      });
    }
    if (filterParams.interiorColor?.length) {
      filterParams.interiorColor.forEach((color, index) => {
        chips.push({ key: 'interiorColor', label: `Int: ${color.charAt(0).toUpperCase() + color.slice(1)}`, value: color, index });
      });
    }
    if (filterParams.engineSize?.length) {
      filterParams.engineSize.forEach((size, index) => {
        chips.push({ key: 'engineSize', label: `${size}L`, value: size, index });
      });
    }
    
    return chips;
  }, [searchParams, sortBy, filterParams]);

  // Get total count of active filters (for badge display)
  const getActiveFilterCount = useCallback((): number => {
    let count = 0;
    
    // Count search params
    if (searchParams?.q) count++;
    count += searchParams?.make?.length ?? 0;
    count += searchParams?.model?.length ?? 0;
    count += searchParams?.trim?.length ?? 0;
    
    // Count filter params
    if (filterParams.priceMin || filterParams.priceMax) count++;
    if (filterParams.yearMin || filterParams.yearMax) count++;
    if (filterParams.mileageMin || filterParams.mileageMax) count++;
    count += filterParams.emirate?.length ?? 0;
    count += filterParams.bodyType?.length ?? 0;
    count += filterParams.fuelType?.length ?? 0;
    count += filterParams.transmission?.length ?? 0;
    count += filterParams.specs?.length ?? 0;
    if (filterParams.condition) count++;
    if (filterParams.isNegotiable) count++;
    if (filterParams.isBlkListing) count++;
    if (filterParams.isBlackTierPartner) count++;
    if (filterParams.sellerType) count++;
    count += filterParams.exteriorColor?.length ?? 0;
    count += filterParams.interiorColor?.length ?? 0;
    count += filterParams.engineSize?.length ?? 0;
    
    // Count non-default sort
    if (sortBy !== 'relevance') count++;
    
    return count;
  }, [searchParams, filterParams, sortBy]);

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

  // Filter params functions
  const updateFilterParams = useCallback((params: Partial<FilterParams>) => {
    setFilterParams(prev => {
      const newParams = { ...prev };
      // Clean up undefined values
      Object.entries(params).forEach(([key, value]) => {
        if (value === undefined || value === null || (Array.isArray(value) && value.length === 0)) {
          delete newParams[key as keyof FilterParams];
        } else {
          (newParams as any)[key] = value;
        }
      });
      // Notify listeners
      filterListenersRef.current.forEach(listener => listener(newParams));
      return newParams;
    });
  }, []);

  const clearFilterParams = useCallback(() => {
    setFilterParams({});
    filterListenersRef.current.forEach(listener => listener({}));
  }, []);

  const removeFilterParam = useCallback((key: RemovableFilterKey, index?: number) => {
    setFilterParams(prev => {
      const newParams = { ...prev };
      
      // Handle compound range filters - remove both min and max
      if (key === 'price') {
        delete newParams.priceMin;
        delete newParams.priceMax;
      } else if (key === 'year') {
        delete newParams.yearMin;
        delete newParams.yearMax;
      } else if (key === 'mileage') {
        delete newParams.mileageMin;
        delete newParams.mileageMax;
      } else if (index !== undefined && Array.isArray(newParams[key as keyof FilterParams])) {
        // Handle array removal
        const arr = [...(newParams[key as keyof FilterParams] as string[])];
        arr.splice(index, 1);
        if (arr.length === 0) {
          delete newParams[key as keyof FilterParams];
        } else {
          (newParams[key as keyof FilterParams] as string[]) = arr;
        }
      } else {
        delete newParams[key as keyof FilterParams];
      }
      
      // Notify listeners
      filterListenersRef.current.forEach(listener => listener(newParams));
      return newParams;
    });
  }, []);

  const subscribeToFilters = useCallback((callback: (params: FilterParams) => void) => {
    filterListenersRef.current.add(callback);
    return () => {
      filterListenersRef.current.delete(callback);
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
        getActiveFilterCount,
        sortBy,
        applySort,
        resetSort,
        subscribeToSort,
        filterParams,
        updateFilterParams,
        clearFilterParams,
        removeFilterParam,
        subscribeToFilters,
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
