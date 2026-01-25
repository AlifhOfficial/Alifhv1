/**
 * useSearch Hook
 * 
 * Manages search state, filters, and fetches listings with facets
 * Uses /api/listings/search endpoint for full faceted search
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { apiUrl, API_ENDPOINTS } from '@/lib/api-config';
import { 
  SearchParams, 
  SearchFacets, 
  searchParamsToQuery, 
  countActiveFilters,
  SearchSortOption 
} from '@/lib/search-utils';

// ============================================================================
// TYPES
// ============================================================================

export interface CarCardData {
  id: string;
  slug: string | null;
  make: string | null;
  model: string | null;
  year: number | null;
  trim: string | null;
  price: number | null;
  mileage: number | null;
  emirate: string | null;
  specs: string | null;
  thumbnail: string | null;
  isBlkListing: boolean | null;
  sellerType: 'private' | 'dealer' | null;
  partnerName: string | null;
  partnerLogo: string | null;
  partnerVerified: boolean | null;
  isBlackTierPartner: boolean | null;
  sellerName: string | null;
  sellerAvatarUrl: string | null;
  sellerKycVerified: boolean | null;
}

interface SearchResponse {
  data: CarCardData[];
  facets: SearchFacets;
  meta: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
    took?: number;
  };
}

interface UseSearchResult {
  // Data
  listings: CarCardData[];
  facets: SearchFacets | null;
  meta: { total: number } | null;
  
  // State
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  hasMore: boolean;
  
  // Params
  params: SearchParams;
  activeFilterCount: number;
  
  // Actions
  setFilters: (filters: Partial<SearchParams>) => void;
  clearFilters: () => void;
  setSort: (sort: SearchSortOption) => void;
  setSearch: (q: string) => void;
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const DEFAULT_LIMIT = 20;

const EMPTY_FACETS: SearchFacets = {
  make: [],
  model: [],
  trim: [],
  yearRange: { min: 2000, max: 2026 },
  priceRange: { min: 0, max: 1000000 },
  mileageRange: { min: 0, max: 500000 },
  emirate: [],
  bodyType: [],
  fuelType: [],
  sellerType: [],
};

// ============================================================================
// HOOK
// ============================================================================

export function useSearch(initialParams: Partial<SearchParams> = {}): UseSearchResult {
  // State
  const [listings, setListings] = useState<CarCardData[]>([]);
  const [facets, setFacets] = useState<SearchFacets | null>(null);
  const [meta, setMeta] = useState<{ total: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  
  // Search params state (without offset - managed separately)
  const [params, setParams] = useState<SearchParams>({
    limit: DEFAULT_LIMIT,
    sortBy: 'relevance',
    ...initialParams,
  });
  
  // Track initial mount
  const isMounted = useRef(false);

  // Computed
  const activeFilterCount = useMemo(() => countActiveFilters(params), [params]);

  // Stable params key for dependency tracking
  const paramsKey = useMemo(() => JSON.stringify(params), [params]);

  // Fetch function that accepts params directly
  const doFetch = useCallback(async (searchParams: SearchParams, currentOffset: number, reset: boolean) => {
    try {
      const fetchParams = { ...searchParams, offset: currentOffset };
      
      // Use the search endpoint with full query params (returns facets)
      const queryString = searchParamsToQuery(fetchParams);
      const url = apiUrl(`${API_ENDPOINTS.search}?${queryString}`);
      
      console.log('[useSearch] Fetching:', url);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status}`);
      }

      const json: SearchResponse = await response.json();

      if (reset) {
        setListings(json.data);
        setOffset(DEFAULT_LIMIT);
      } else {
        setListings(prev => [...prev, ...json.data]);
        setOffset(prev => prev + DEFAULT_LIMIT);
      }

      setFacets(json.facets || EMPTY_FACETS);
      setMeta({ total: json.meta.total });
      setHasMore(json.meta.hasMore);
      setError(null);
    } catch (err) {
      console.error('[useSearch] Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch listings');
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await doFetch(params, 0, true);
      setIsLoading(false);
      isMounted.current = true;
    };
    init();
  }, []);

  // Re-fetch when params change
  useEffect(() => {
    // Skip initial load (handled above)
    if (!isMounted.current) return;
    
    const refetch = async () => {
      setIsLoading(true);
      setOffset(0);
      await doFetch(params, 0, true);
      setIsLoading(false);
    };
    refetch();
  }, [paramsKey, doFetch]);

  // Actions
  const setFilters = useCallback((newFilters: Partial<SearchParams>) => {
    setParams(prev => ({
      ...prev,
      ...newFilters,
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setParams({
      limit: DEFAULT_LIMIT,
      sortBy: 'relevance',
    });
  }, []);

  const setSort = useCallback((sort: SearchSortOption) => {
    setParams(prev => ({
      ...prev,
      sortBy: sort,
    }));
  }, []);

  const setSearch = useCallback((q: string) => {
    setParams(prev => ({
      ...prev,
      q: q || undefined,
    }));
  }, []);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    await doFetch(params, 0, true);
    setOffset(DEFAULT_LIMIT);
    setIsRefreshing(false);
  }, [params, doFetch]);

  const loadMore = useCallback(async () => {
    if (!hasMore || isLoading || isRefreshing) return;
    await doFetch(params, offset, false);
  }, [hasMore, isLoading, isRefreshing, params, offset, doFetch]);

  return {
    listings,
    facets,
    meta,
    isLoading,
    isRefreshing,
    error,
    hasMore,
    params: { ...params, offset },
    activeFilterCount,
    setFilters,
    clearFilters,
    setSort,
    setSearch,
    refresh,
    loadMore,
  };
}
