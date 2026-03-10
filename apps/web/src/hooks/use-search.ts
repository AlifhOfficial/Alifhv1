'use client';

/**
 * useSearch Hook - Search State Management
 * 
 * Manages search state with URL sync for shareable links.
 * Uses React Query for data fetching with caching.
 * 
 * @module hooks/use-search
 */

import { useCallback, useMemo, useRef, useEffect, useState } from 'react';
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
  /** Forced params that cannot be overridden by URL (applied last) */
  forcedParams?: Partial<SearchParams>;
  /** Disable URL sync (useful for embedded search) */
  disableUrlSync?: boolean;
  /** Default limit */
  defaultLimit?: number;
  /** Server-fetched initial data (for instant display) */
  initialData?: SearchResponse | null;
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
    forcedParams = {},
    disableUrlSync = false,
    defaultLimit = 30,
    initialData,
  } = options;

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Local state for params when URL sync is disabled
  const [localParams, setLocalParams] = useState<SearchParams>(() => ({
    limit: defaultLimit,
    ...initialParams,
    ...forcedParams,
  }));

  // Parse current params from URL (or use local state if URL sync disabled)
  const params = useMemo<SearchParams>(() => {
    if (disableUrlSync) {
      // Use local state, but always apply forced params
      return { ...localParams, ...forcedParams };
    }
    
    const urlParams = urlToSearchParams(searchParams);
    return { 
      limit: defaultLimit, 
      ...initialParams,
      ...urlParams,
      // Always default sortBy to 'relevance' for consistent state
      sortBy: urlParams.sortBy || 'relevance',
      // Apply forced params last - cannot be overridden by URL
      ...forcedParams,
    };
  }, [searchParams, initialParams, forcedParams, disableUrlSync, defaultLimit, localParams]);

  // Sync default sort to URL on initial load (better UX - URL reflects actual state)
  // Use native history API to avoid interfering with browser scroll restoration
  const hasInitializedSort = useRef(false);
  useEffect(() => {
    if (disableUrlSync || hasInitializedSort.current) return;
    
    // If no sort param in URL, add 'relevance' as default
    if (!searchParams.get('sort')) {
      hasInitializedSort.current = true;
      const newUrlParams = new URLSearchParams(searchParams.toString());
      newUrlParams.set('sort', 'relevance');
      // Use native replaceState to avoid triggering Next.js navigation/scroll logic
      window.history.replaceState(null, '', `${pathname}?${newUrlParams.toString()}`);
    }
  }, [searchParams, pathname, disableUrlSync]);

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

  // Track the initial query key to know when we've moved away from it
  // initialData should only be used for the exact initial query
  const initialQueryKeyRef = useRef<string | null>(null);
  const currentQueryKeyString = JSON.stringify(queryKey);
  
  // Set initial query key on first render only
  if (initialQueryKeyRef.current === null && initialData) {
    initialQueryKeyRef.current = currentQueryKeyString;
  }
  
  // Only use initialData if we're still on the initial query
  const isInitialQuery = initialQueryKeyRef.current === currentQueryKeyString;
  const effectiveInitialData = isInitialQuery ? initialData : undefined;

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
    // Server-side data for instant display - only for the initial query
    initialData: effectiveInitialData ?? undefined,
    initialDataUpdatedAt: effectiveInitialData ? Date.now() : undefined,
    // Cache settings for smooth back navigation
    // Use 30s stale time when we have initial data (server already fetched fresh data)
    staleTime: effectiveInitialData ? 30_000 : 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000, // 30 minutes - keep in cache for back navigation
    refetchOnWindowFocus: false,
    refetchOnMount: false, // Don't refetch on mount if we have cached data
    placeholderData: (previousData) => previousData, // Keep previous data visible while fetching
  });

  // Update URL with new params (or local state if URL sync disabled)
  const updateUrl = useCallback((newParams: SearchParams) => {
    if (disableUrlSync) {
      // Update local state instead of URL
      setLocalParams(newParams);
      return;
    }
    
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

  // Clear all filters (keep limit and initialParams, reset sort to default)
  const clearFilters = useCallback(() => {
    const newParams: SearchParams = {
      limit: params.limit,
      // When URL sync is disabled, preserve initial params (e.g., partnerId)
      ...(disableUrlSync ? initialParams : {}),
    };
    updateUrl(newParams);
  }, [params.limit, updateUrl, disableUrlSync, initialParams]);

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
    type: 'make' | 'model' | 'make_model' | 'make_model_trim' | 'partner' | 'tag' | 'extra' | 'bodyType' | 'fuelType' | 'transmission' | 'specs' | 'condition' | 'sellerType';
    text: string;
    make?: string;
    model?: string;
    trim?: string;
    partnerId?: string;
    partnerName?: string;
    tag?: string;
    extra?: string;
    bodyType?: string;
    fuelType?: string;
    transmission?: string;
    specs?: string;
    condition?: 'new' | 'used';
    sellerType?: 'dealer' | 'private';
    count: number;
  }>;
  isLoading: boolean;
}

// Fallback for SSR or initial render before popular makes load
const FALLBACK_MAKES = ['Audi', 'BMW', 'Tesla'] as const;

const FALLBACK_SUGGESTIONS = FALLBACK_MAKES.map(make => ({
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
  // Fetch popular makes when no query (dropdown open with empty input)
  const { data: popularData, isLoading: popularLoading } = useQuery({
    queryKey: ['listings', 'suggest', 'popular'],
    queryFn: async () => {
      const response = await fetch('/api/listings/search/suggest?popular=true&limit=5');
      if (!response.ok) return { suggestions: FALLBACK_SUGGESTIONS };
      return response.json();
    },
    enabled: enabled && query.length < 2, // Only fetch when showing defaults
  });

  // Fetch search suggestions when user types 2+ chars
  const shouldFetchSearch = query.length >= 2;
  
  const { data: searchData, isLoading: searchLoading } = useQuery({
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
    enabled: enabled && shouldFetchSearch,
  });

  // Return search suggestions when typing, popular makes otherwise
  // Only show data once loaded - no static fallback on initial render
  return {
    suggestions: shouldFetchSearch 
      ? (searchData?.suggestions ?? [])
      : (popularData?.suggestions ?? []), // Empty until loaded
    isLoading: shouldFetchSearch ? searchLoading : popularLoading,
  };
}
