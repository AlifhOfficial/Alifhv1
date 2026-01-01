'use client';

/**
 * useSearch Hook - Search State Management
 * 
 * Manages search state with URL sync for shareable links.
 * Uses React Query for data fetching with caching.
 * 
 * @module hooks/use-search
 */

import { useCallback, useMemo } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  urlToSearchParams, 
  searchParamsToUrl, 
  countActiveFilters,
  type SearchParams, 
  type SearchResponse, 
  type SearchFacets,
  type SearchSortOption,
} from '@/lib/search-utils';

const SEARCH_STALE_TIME = 15_000; // 15 seconds
const FACET_STALE_TIME = 60_000; // 60 seconds

interface UseSearchOptions {
  /** Initial search params (overridden by URL params) */
  initialParams?: Partial<SearchParams>;
  /** Disable URL sync (useful for embedded search) */
  disableUrlSync?: boolean;
  /** Default limit */
  defaultLimit?: number;
}

interface UseSearchResult {
  // Data
  listings: SearchResponse['data'];
  facets: SearchFacets | undefined;
  meta: SearchResponse['meta'] | undefined;
  
  // State
  params: SearchParams;
  activeFilterCount: number;
  isLoading: boolean;
  isFetching: boolean;
  error: Error | null;
  
  // Actions
  setQuery: (q: string) => void;
  setFilters: (filters: Partial<SearchParams>) => void;
  setFilter: <K extends keyof SearchParams>(key: K, value: SearchParams[K]) => void;
  removeFilter: (key: keyof SearchParams) => void;
  clearFilters: () => void;
  setSort: (sortBy: SearchSortOption) => void;
  loadMore: () => void;
  refresh: () => void;
}

/**
 * Fetch search results from API
 */
async function fetchSearch(params: SearchParams): Promise<SearchResponse> {
  const urlParams = searchParamsToUrl(params);
  const response = await fetch(`/api/listings/search?${urlParams.toString()}`);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Search failed');
  }
  
  return response.json();
}

/**
 * Search hook with URL sync and React Query caching
 */
export function useSearch(options: UseSearchOptions = {}): UseSearchResult {
  const { 
    initialParams = {}, 
    disableUrlSync = false,
    defaultLimit = 30,
  } = options;

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  // Parse current params from URL (or use initial params if URL sync disabled)
  const params = useMemo<SearchParams>(() => {
    if (disableUrlSync) {
      return { limit: defaultLimit, ...initialParams };
    }
    
    const urlParams = urlToSearchParams(searchParams);
    return { 
      limit: defaultLimit, 
      ...initialParams,
      ...urlParams,
    };
  }, [searchParams, initialParams, disableUrlSync, defaultLimit]);

  // Generate stable query key
  const queryKey = useMemo(() => {
    const keyParams = { ...params };
    // Remove undefined values for consistent key
    Object.keys(keyParams).forEach(key => {
      if (keyParams[key as keyof SearchParams] === undefined) {
        delete keyParams[key as keyof SearchParams];
      }
    });
    return ['listings', 'search', keyParams];
  }, [params]);

  // Fetch search results
  const { 
    data, 
    isLoading, 
    isFetching, 
    error,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: () => fetchSearch(params),
    staleTime: SEARCH_STALE_TIME,
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  // Update URL with new params
  const updateUrl = useCallback((newParams: SearchParams) => {
    if (disableUrlSync) return;
    
    const urlParams = searchParamsToUrl(newParams);
    const newUrl = urlParams.toString() 
      ? `${pathname}?${urlParams.toString()}`
      : pathname;
    
    // Use replace to avoid adding to history for every filter change
    router.replace(newUrl, { scroll: false });
  }, [router, pathname, disableUrlSync]);

  // Set text query
  const setQuery = useCallback((q: string) => {
    const newParams = { ...params, q: q || undefined, offset: 0 };
    updateUrl(newParams);
  }, [params, updateUrl]);

  // Set multiple filters at once
  const setFilters = useCallback((filters: Partial<SearchParams>) => {
    const newParams = { ...params, ...filters, offset: 0 };
    updateUrl(newParams);
  }, [params, updateUrl]);

  // Set single filter
  const setFilter = useCallback(<K extends keyof SearchParams>(
    key: K, 
    value: SearchParams[K]
  ) => {
    const newParams = { ...params, [key]: value, offset: 0 };
    updateUrl(newParams);
  }, [params, updateUrl]);

  // Remove filter
  const removeFilter = useCallback((key: keyof SearchParams) => {
    const newParams = { ...params };
    delete newParams[key];
    newParams.offset = 0;
    updateUrl(newParams);
  }, [params, updateUrl]);

  // Clear all filters (keep sort and limit)
  const clearFilters = useCallback(() => {
    const newParams: SearchParams = {
      limit: params.limit,
      sortBy: params.sortBy,
      sortOrder: params.sortOrder,
    };
    updateUrl(newParams);
  }, [params.limit, params.sortBy, params.sortOrder, updateUrl]);

  // Set sort option
  const setSort = useCallback((sortBy: SearchSortOption) => {
    const newParams = { ...params, sortBy, offset: 0 };
    updateUrl(newParams);
  }, [params, updateUrl]);

  // Load more (pagination)
  const loadMore = useCallback(() => {
    if (!data?.meta.hasMore) return;
    
    const newOffset = (params.offset || 0) + (params.limit || defaultLimit);
    const newParams = { ...params, offset: newOffset };
    updateUrl(newParams);
  }, [params, data?.meta.hasMore, defaultLimit, updateUrl]);

  // Force refresh
  const refresh = useCallback(() => {
    refetch();
  }, [refetch]);

  // Count active filters
  const activeFilterCount = useMemo(() => countActiveFilters(params), [params]);

  return {
    // Data
    listings: data?.data ?? [],
    facets: data?.facets,
    meta: data?.meta,
    
    // State
    params,
    activeFilterCount,
    isLoading,
    isFetching,
    error: error as Error | null,
    
    // Actions
    setQuery,
    setFilters,
    setFilter,
    removeFilter,
    clearFilters,
    setSort,
    loadMore,
    refresh,
  };
}

/**
 * Quick search hook for auto-suggest
 */
interface QuickSearchResult {
  suggestions: Array<{
    type: 'make' | 'model' | 'make_model' | 'partner';
    text: string;
    make?: string;
    model?: string;
    partnerId?: string;
    partnerName?: string;
    count: number;
  }>;
  isLoading: boolean;
}

export function useQuickSearch(query: string, enabled = true): QuickSearchResult {
  const { data, isLoading } = useQuery({
    queryKey: ['listings', 'suggest', query],
    queryFn: async () => {
      if (query.length < 2) return { suggestions: [] };
      
      const response = await fetch(`/api/listings/search/suggest?q=${encodeURIComponent(query)}`);
      if (!response.ok) return { suggestions: [] };
      return response.json();
    },
    enabled: enabled && query.length >= 2,
    staleTime: 30_000, // 30 seconds
    gcTime: 5 * 60 * 1000,
  });

  return {
    suggestions: data?.suggestions ?? [],
    isLoading,
  };
}
