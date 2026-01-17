'use client';

/**
 * useSearch Hook - Search State Management
 * 
 * Manages search state with URL sync for shareable links.
 * Uses React Query for data fetching with caching.
 * 
 * @module hooks/use-search
 */

import { useCallback, useMemo, useRef } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { 
  urlToSearchParams, 
  searchParamsToUrl, 
  countActiveFilters,
  type SearchParams, 
  type SearchResponse, 
  type SearchFacets,
  type SearchSortOption,
} from '@/lib/search-utils';

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
  
  // Pagination
  currentPage: number;
  totalPages: number;
  
  // Actions
  setQuery: (q: string) => void;
  setFilters: (filters: Partial<SearchParams>) => void;
  setFilter: <K extends keyof SearchParams>(key: K, value: SearchParams[K]) => void;
  removeFilter: (key: keyof SearchParams) => void;
  clearFilters: () => void;
  setSort: (sortBy: SearchSortOption) => void;
  loadMore: () => void;
  goToPage: (page: number) => void;
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
    staleTime: 0, // Always fetch fresh - server handles caching
    gcTime: 30 * 1000, // Keep previous data for 30s during navigation
    refetchOnWindowFocus: false,
    placeholderData: (previousData) => previousData, // Keep previous data visible while fetching
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

  // Clear all filters (keep only limit, reset sort to default)
  const clearFilters = useCallback(() => {
    const newParams: SearchParams = {
      limit: params.limit,
    };
    updateUrl(newParams);
  }, [params.limit, updateUrl]);

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

  // Go to specific page (1-indexed)
  const goToPage = useCallback((page: number) => {
    const limit = params.limit || defaultLimit;
    const total = data?.meta.total || 0;
    const maxPage = Math.ceil(total / limit);
    
    // Clamp page to valid range
    const validPage = Math.max(1, Math.min(page, maxPage));
    const newOffset = (validPage - 1) * limit;
    
    const newParams = { ...params, offset: newOffset };
    updateUrl(newParams);
  }, [params, data?.meta.total, defaultLimit, updateUrl]);

  // Calculate current page and total pages
  const currentPage = useMemo(() => {
    const limit = params.limit || defaultLimit;
    const offset = params.offset || 0;
    return Math.floor(offset / limit) + 1;
  }, [params.limit, params.offset, defaultLimit]);

  const totalPages = useMemo(() => {
    const limit = params.limit || defaultLimit;
    const total = data?.meta.total || 0;
    return Math.max(1, Math.ceil(total / limit));
  }, [params.limit, data?.meta.total, defaultLimit]);

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
    
    // Pagination
    currentPage,
    totalPages,
    
    // Actions
    setQuery,
    setFilters,
    setFilter,
    removeFilter,
    clearFilters,
    setSort,
    loadMore,
    goToPage,
    refresh,
  };
}

/**
 * Quick search hook for auto-suggest (hierarchical)
 */
interface QuickSearchResult {
  suggestions: Array<{
    type: 'make' | 'model' | 'make_model' | 'make_model_trim' | 'partner';
    text: string;
    make?: string;
    model?: string;
    trim?: string;
    partnerId?: string;
    partnerName?: string;
    count: number;
  }>;
  isLoading: boolean;
}

// Static popular makes for instant display (no API call)
// Only show top 3 to avoid cluttering the dropdown
const TOP_POPULAR_MAKES = ['Audi', 'BMW', 'Tesla'] as const;

const STATIC_POPULAR_SUGGESTIONS = TOP_POPULAR_MAKES.map(make => ({
  type: 'make' as const,
  text: make,
  make: make,
  count: -1, // -1 signals "don't show count" in UI
}));

export function useQuickSearch(
  query: string, 
  enabled = true,
  context?: { make?: string; model?: string }
): QuickSearchResult {
  // Only call API when user has typed 2+ chars
  const shouldFetchFromApi = query.length >= 2;
  
  const { data, isLoading } = useQuery({
    queryKey: ['listings', 'suggest', query, context?.make, context?.model],
    queryFn: async () => {
      // Build query params
      const params = new URLSearchParams();
      params.set('q', query);
      
      // Add context for hierarchical search
      if (context?.make) params.set('make', context.make);
      if (context?.model) params.set('model', context.model);
      
      const endpoint = `/api/listings/search/suggest?${params.toString()}`;
      
      const response = await fetch(endpoint);
      if (!response.ok) return { suggestions: [] };
      return response.json();
    },
    enabled: enabled && shouldFetchFromApi,
    staleTime: 0, // Always fetch fresh - server handles caching
    gcTime: 0, // No client-side caching
  });

  // Return static suggestions when no query, API suggestions when typing
  return {
    suggestions: shouldFetchFromApi 
      ? (data?.suggestions ?? [])
      : STATIC_POPULAR_SUGGESTIONS,
    isLoading: shouldFetchFromApi ? isLoading : false,
  };
}
