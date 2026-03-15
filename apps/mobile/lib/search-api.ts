/**
 * Search API - Mobile Client
 * 
 * Thin wrapper around the web API that:
 * 1. Defines search types locally (to avoid Node.js deps from @alifh/database)
 * 2. Handles URL transformation (relative → absolute for images)
 * 3. Provides mobile-friendly API methods
 * 
 * @module apps/mobile/lib/search-api
 */

import { API_BASE, CDN_BASE } from './config';

// ============================================================================
// SEARCH TYPES (Local definitions to avoid @alifh/database Node.js deps)
// ============================================================================

export type SearchSortOption =
  | 'relevance'
  | 'popular'
  | 'newest'
  | 'oldest'
  | 'price_low'
  | 'price_high'
  | 'mileage_low'
  | 'mileage_high'
  | 'year_new'
  | 'year_old';

export interface FacetBucket {
  value: string;
  count: number;
  label?: string;
}

export interface SearchFacets {
  make?: FacetBucket[];
  model?: FacetBucket[];
  trim?: FacetBucket[];
  bodyType?: FacetBucket[];
  fuelType?: FacetBucket[];
  transmission?: FacetBucket[];
  emirate?: FacetBucket[];
  specs?: FacetBucket[];
  sellerType?: FacetBucket[];
  yearRange?: { min: number; max: number };
  priceRange?: { min: number; max: number };
  mileageRange?: { min: number; max: number };
  engineSize?: FacetBucket[];
  exteriorColor?: FacetBucket[];
  interiorColor?: FacetBucket[];
}

interface DBSearchParams {
  q?: string;
  make?: string | string[];
  model?: string | string[];
  trim?: string | string[];
  priceMin?: number;
  priceMax?: number;
  yearMin?: number;
  yearMax?: number;
  mileageMax?: number;
  bodyType?: string | string[];
  fuelType?: string | string[];
  transmission?: string | string[];
  emirate?: string | string[];
  specs?: string | string[];
  engineSize?: string | string[];
  exteriorColor?: string | string[];
  interiorColor?: string | string[];
  tags?: string | string[];
  extras?: string | string[];
  condition?: string;
  sellerType?: string;
  isBlkListing?: boolean;
  isBlackTierPartner?: boolean;
  isNegotiable?: boolean;
  partnerId?: string;
  partnerName?: string;
  sellerId?: string;
  sortBy?: SearchSortOption;
  limit?: number;
  cursor?: string;
}

// Re-export sort options (mobile-friendly labels)
export const SORT_OPTIONS: { value: SearchSortOption; label: string }[] = [
  { value: 'relevance', label: 'Most Relevant' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'newest', label: 'Recently Listed' },
  { value: 'oldest', label: 'Oldest Listings' },
  { value: 'price_low', label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' },
  { value: 'mileage_low', label: 'Lowest Mileage' },
  { value: 'mileage_high', label: 'Highest Mileage' },
  { value: 'year_new', label: 'Year: Newest' },
  { value: 'year_old', label: 'Year: Oldest' },
];

export interface SearchParams extends DBSearchParams {
  page?: number;
}

// Mobile-friendly listing card (with absolute URLs)
export interface ListingCard {
  id: string;
  slug: string | null;
  make: string;
  model: string;
  year: number;
  trim: string | null;
  price: number;
  mileage: number;
  emirate: string;
  specs: string | null;
  thumbnail: string | null;
  isBlkListing: boolean;
  sellerType: 'dealer' | 'private' | null;
  partnerName: string | null;
  partnerLogo: string | null;
  partnerVerified: boolean;
  isBlackTierPartner: boolean;
  sellerName: string | null;
  sellerAvatarUrl: string | null;
  sellerKycVerified: boolean;
}

interface SearchResultItem {
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
  sellerType: 'dealer' | 'private' | null;
  partnerName: string | null;
  partnerLogo: string | null;
  partnerVerified: boolean | null;
  isBlackTierPartner: boolean | null;
  sellerName: string | null;
  sellerAvatarUrl: string | null;
  sellerKycVerified: boolean | null;
}

interface DBSearchResponse {
  data: SearchResultItem[];
  facets?: SearchFacets;
  meta: {
    total?: number;
    limit: number;
    hasMore: boolean;
    nextCursor?: string | null;
  };
}

// Mobile search response
export interface SearchResponse {
  listings: ListingCard[];
  facets?: SearchFacets;
  meta: {
    total?: number;
    limit: number;
    hasMore: boolean;
    nextCursor?: string | null;
  };
}

// Suggestion type (re-mapped from database)
export interface Suggestion {
  type: 'make' | 'model' | 'make_model' | 'make_model_trim' | 'partner' | 'tag' | 'extra' | 'bodyType' | 'fuelType' | 'transmission' | 'specs' | 'condition' | 'sellerType';
  text: string;
  make?: string;
  model?: string;
  trim?: string;
  partnerId?: string;
  tag?: string;
  extra?: string;
  bodyType?: string;
  fuelType?: string;
  transmission?: string;
  specs?: string;
  condition?: 'new' | 'used';
  sellerType?: 'dealer' | 'private';
  count?: number;
}

// ============================================================================
// HELPERS
// ============================================================================

/** Convert relative path to absolute URL */
function toAbsoluteUrl(path: string | null): string | null {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  if (path.startsWith('/')) return `${API_BASE}${path}`;
  return `${CDN_BASE}/${path}`;
}

/** 
 * Map internal param names to API URL param names
 * The web API uses different param names than our internal SearchParams
 */
const PARAM_KEY_MAP: Record<string, string> = {
  sortBy: 'sort',
  sortOrder: 'order',
  isNegotiable: 'negotiable',
  underWarranty: 'warranty',
  isBlkListing: 'black',
  partnerVerified: 'verified',
  isBlackTierPartner: 'blackTier',
  sellerType: 'seller',
};

/** Convert SearchParams to URLSearchParams for API call */
function paramsToUrl(params: SearchParams): URLSearchParams {
  const urlParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    
    // Map internal param name to API param name
    const urlKey = PARAM_KEY_MAP[key] || key;
    
    // Handle arrays (multi-select) - join with comma
    if (Array.isArray(value)) {
      if (value.length > 0) {
        urlParams.set(urlKey, value.join(','));
      }
      return;
    }
    
    urlParams.set(urlKey, String(value));
  });
  
  return urlParams;
}

/** Transform web API item to mobile ListingCard (with absolute URLs) */
function transformItem(item: SearchResultItem): ListingCard {
  return {
    id: item.id,
    slug: item.slug,
    make: item.make || 'Unknown',
    model: item.model || 'Unknown',
    year: item.year || 0,
    trim: item.trim,
    price: item.price || 0,
    mileage: item.mileage || 0,
    emirate: item.emirate || 'Unknown',
    specs: item.specs,
    thumbnail: toAbsoluteUrl(item.thumbnail),
    isBlkListing: item.isBlkListing || false,
    sellerType: item.sellerType,
    partnerName: item.partnerName,
    partnerLogo: toAbsoluteUrl(item.partnerLogo),
    partnerVerified: item.partnerVerified || false,
    isBlackTierPartner: item.isBlackTierPartner || false,
    sellerName: item.sellerName,
    sellerAvatarUrl: toAbsoluteUrl(item.sellerAvatarUrl),
    sellerKycVerified: item.sellerKycVerified || false,
  };
}

function toArray(value?: string | string[]): string[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

// ============================================================================
// HELPERS
// ============================================================================

/** Retry fetch with exponential backoff */
async function fetchWithRetry(
  url: string, 
  options: RequestInit = {}, 
  maxRetries: number = 2
): Promise<Response> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (options.signal?.aborted) {
        throw new DOMException('Request aborted', 'AbortError');
      }

      const response = await fetch(url, options);
      
      // Retry on 5xx server errors
      if (response.status >= 500 && attempt < maxRetries) {
        console.log(`[SearchAPI] Server error ${response.status}, retrying (${attempt + 1}/${maxRetries})...`);
        await new Promise(resolve => setTimeout(resolve, 500 * Math.pow(2, attempt)));
        continue;
      }
      
      return response;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (lastError.name === 'AbortError') {
        throw lastError;
      }
      
      if (attempt < maxRetries) {
        console.log(`[SearchAPI] Fetch failed, retrying (${attempt + 1}/${maxRetries})...`);
        await new Promise(resolve => setTimeout(resolve, 500 * Math.pow(2, attempt)));
      }
    }
  }
  
  throw lastError || new Error('Fetch failed after retries');
}

// ============================================================================
// SEARCH API
// ============================================================================

export const searchApi = {
  /**
   * Full search with facets
   * Supports multi-select for make/model/trim
   */
  async search(params: SearchParams = {}, signal?: AbortSignal): Promise<SearchResponse> {
    const urlParams = paramsToUrl(params);
    const url = `${API_BASE}/api/listings/search?${urlParams}`;
    
    console.log('[SearchAPI] Fetching:', url);
    
    const response = await fetchWithRetry(url, { signal });
    if (!response.ok) {
      throw new Error(`Search failed: ${response.status}`);
    }
    
    const webResponse: DBSearchResponse = await response.json();
    return {
      listings: webResponse.data.map(transformItem),
      facets: webResponse.facets,
      meta: {
        total: webResponse.meta.total,
        limit: webResponse.meta.limit,
        hasMore: webResponse.meta.hasMore,
        nextCursor: webResponse.meta.nextCursor,
      },
    };
  },

  /**
   * Get facets only (for filter UI)
   * Fetches with limit=0 to get facets without listings
   */
  async getFacets(params: Omit<SearchParams, 'limit' | 'page'> = {}): Promise<SearchFacets | null> {
    const urlParams = paramsToUrl({ ...params, limit: 0 });
    const url = `${API_BASE}/api/listings/search?${urlParams}`;
    
    console.log('[SearchAPI] Fetching facets:', url);
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Facets failed: ${response.status}`);
    }
    
    const webResponse: DBSearchResponse = await response.json();
    return webResponse.facets || null;
  },

  /**
   * Get models for selected makes
   * Returns models filtered by the selected makes + any active filter context
   */
  async getModelsForMakes(makes: string[], filterContext: Record<string, any> = {}): Promise<FacetBucket[]> {
    if (!makes.length) return [];
    
    const urlParams = paramsToUrl({
      ...filterContext,
      make: makes,
      limit: 0,
    });
    const url = `${API_BASE}/api/listings/search?${urlParams}`;
    
    const response = await fetch(url);
    if (!response.ok) return [];
    
    const webResponse: DBSearchResponse = await response.json();
    return webResponse.facets?.model || [];
  },

  /**
   * Get trims for selected makes and models
   * Returns trims filtered by selected makes and models + any active filter context
   */
  async getTrimsForModels(makes: string[], models: string[], filterContext: Record<string, any> = {}): Promise<FacetBucket[]> {
    if (!makes.length || !models.length) return [];
    
    const urlParams = paramsToUrl({
      ...filterContext,
      make: makes,
      model: models,
      limit: 0,
    });
    const url = `${API_BASE}/api/listings/search?${urlParams}`;
    
    const response = await fetch(url);
    if (!response.ok) return [];
    
    const webResponse: DBSearchResponse = await response.json();
    return webResponse.facets?.trim || [];
  },

  /**
   * Get search suggestions (autocomplete)
   * Enhanced with context for hierarchical suggestions
   */
  async suggest(
    q: string, 
    context?: { make?: string[]; model?: string[] }
  ): Promise<{ suggestions: Suggestion[] }> {
    const params = new URLSearchParams({ q });
    
    // Add context for better suggestions
    if (context?.make?.length) {
      params.set('make', context.make.join(','));
    }
    if (context?.model?.length) {
      params.set('model', context.model.join(','));
    }
    
    const url = `${API_BASE}/api/listings/search/suggest?${params}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Suggest failed: ${response.status}`);
    }
    return response.json();
  },

  /**
   * Get popular makes for empty state
   */
  async popularMakes(limit = 8): Promise<{ suggestions: Suggestion[] }> {
    const params = new URLSearchParams({ 
      popular: 'true', 
      limit: String(limit) 
    });
    
    const url = `${API_BASE}/api/listings/search/suggest?${params}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Popular makes failed: ${response.status}`);
    }
    return response.json();
  },

  /**
   * Get result count for current filters (without fetching listings)
   */
  async getResultCount(params: SearchParams): Promise<number> {
    const urlParams = paramsToUrl({ ...params, limit: 0 });
    urlParams.set('includeTotal', 'true');
    const url = `${API_BASE}/api/listings/search?${urlParams}`;
    
    const response = await fetch(url);
    if (!response.ok) return 0;
    
    const webResponse: DBSearchResponse = await response.json();
    return webResponse.meta.total || 0;
  },

  /**
   * AI Search: Parse natural language into structured search filters.
   * Returns parsed intent with search params and a redirect URL.
   */
  async aiSearch(query: string): Promise<{
    intent: {
      confidence: number;
      summary: string;
      message?: string;
      make?: string[];
      model?: string[];
      trim?: string[];
      priceMin?: number;
      priceMax?: number;
      yearMin?: number;
      yearMax?: number;
      mileageMax?: number;
      bodyType?: string[];
      fuelType?: string[];
      transmission?: string[];
      specs?: string[];
      exteriorColor?: string[];
      interiorColor?: string[];
      engineSize?: string[];
      tags?: string[];
      extras?: string[];
      emirate?: string[];
      condition?: 'new' | 'used';
      sellerType?: 'dealer' | 'private';
      sortBy?: string;
      q?: string;
    };
    searchParams: Record<string, any>;
    searchUrl: string;
    cached: boolean;
    processingTimeMs: number;
  }> {
    const url = `${API_BASE}/api/listings/search/ai`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });
    if (!response.ok) {
      throw new Error(`AI search failed: ${response.status}`);
    }
    return response.json();
  },
};

// ============================================================================
// FILTER CHIP HELPERS
// ============================================================================

export interface FilterChip {
  key: string;
  label: string;
  value: string | string[];
}

/**
 * Generate filter chips from search params
 */
export function getFilterChips(params: SearchParams): FilterChip[] {
  const chips: FilterChip[] = [];
  const makes = toArray(params.make);
  const models = toArray(params.model);
  const trims = toArray(params.trim);
  const emirates = toArray(params.emirate);
  const bodyTypes = toArray(params.bodyType);
  const fuelTypes = toArray(params.fuelType);
  const transmissions = toArray(params.transmission);

  // Make chips
  if (makes.length) {
    makes.forEach((make) => {
      chips.push({ key: 'make', label: make, value: make });
    });
  }

  // Model chips
  if (models.length) {
    models.forEach((model) => {
      chips.push({ key: 'model', label: model, value: model });
    });
  }

  // Trim chips
  if (trims.length) {
    trims.forEach((trim) => {
      chips.push({ key: 'trim', label: trim, value: trim });
    });
  }

  // Query chip
  if (params.q) {
    chips.push({ key: 'q', label: `"${params.q}"`, value: params.q });
  }

  // Year range
  if (params.yearMin || params.yearMax) {
    const label = params.yearMin && params.yearMax
      ? `${params.yearMin} - ${params.yearMax}`
      : params.yearMin
      ? `From ${params.yearMin}`
      : `Up to ${params.yearMax}`;
    chips.push({ key: 'year', label: `Year: ${label}`, value: label });
  }

  // Price range
  if (params.priceMin || params.priceMax) {
    const formatPrice = (v: number) => v >= 1000 ? `${Math.round(v / 1000)}K` : String(v);
    const label = params.priceMin && params.priceMax
      ? `${formatPrice(params.priceMin)} - ${formatPrice(params.priceMax)}`
      : params.priceMin
      ? `From ${formatPrice(params.priceMin)}`
      : `Up to ${formatPrice(params.priceMax!)}`;
    chips.push({ key: 'price', label: `Price: ${label}`, value: label });
  }

  // Mileage
  if (params.mileageMax) {
    chips.push({ 
      key: 'mileage', 
      label: `Under ${Math.round(params.mileageMax / 1000)}K km`, 
      value: String(params.mileageMax) 
    });
  }

  // Emirates
  if (emirates.length) {
    chips.push({ key: 'emirate', label: emirates.join(', '), value: emirates });
  }

  // Body type
  if (bodyTypes.length) {
    chips.push({ key: 'bodyType', label: bodyTypes.join(', '), value: bodyTypes });
  }

  // Fuel type
  if (fuelTypes.length) {
    chips.push({ key: 'fuelType', label: fuelTypes.join(', '), value: fuelTypes });
  }

  // Transmission
  if (transmissions.length) {
    chips.push({ key: 'transmission', label: transmissions.join(', '), value: transmissions });
  }

  // Condition
  if (params.condition === 'new') {
    chips.push({ key: 'condition', label: 'New Cars', value: 'new' });
  }

  // Premium filters
  if (params.isBlkListing) {
    chips.push({ key: 'isBlkListing', label: 'Black Listings', value: 'true' });
  }
  if (params.isBlackTierPartner) {
    chips.push({ key: 'isBlackTierPartner', label: 'Black Members', value: 'true' });
  }

  // Sort (only if not default)
  if (params.sortBy && params.sortBy !== 'relevance') {
    const sortLabel = SORT_OPTIONS.find(s => s.value === params.sortBy)?.label || 'Sorted';
    chips.push({ key: 'sortBy', label: `Sort: ${sortLabel}`, value: params.sortBy });
  }

  return chips;
}

/**
 * Remove a filter from params
 */
export function removeFilter(
  params: SearchParams, 
  key: string, 
  value?: string
): SearchParams {
  const newParams = { ...params };

  switch (key) {
    case 'make':
      if (value && newParams.make) {
        const nextMakes = toArray(newParams.make).filter((make) => make !== value);
        newParams.make = nextMakes;
        if (!nextMakes.length) {
          delete newParams.make;
          // Clear downstream
          delete newParams.model;
          delete newParams.trim;
        }
      } else {
        delete newParams.make;
        delete newParams.model;
        delete newParams.trim;
      }
      break;
    case 'model':
      if (value && newParams.model) {
        const nextModels = toArray(newParams.model).filter((model) => model !== value);
        newParams.model = nextModels;
        if (!nextModels.length) {
          delete newParams.model;
          delete newParams.trim;
        }
      } else {
        delete newParams.model;
        delete newParams.trim;
      }
      break;
    case 'trim':
      if (value && newParams.trim) {
        const nextTrims = toArray(newParams.trim).filter((trim) => trim !== value);
        newParams.trim = nextTrims;
        if (!nextTrims.length) delete newParams.trim;
      } else {
        delete newParams.trim;
      }
      break;
    case 'q':
      delete newParams.q;
      break;
    case 'year':
      delete newParams.yearMin;
      delete newParams.yearMax;
      break;
    case 'price':
      delete newParams.priceMin;
      delete newParams.priceMax;
      break;
    case 'mileage':
      delete newParams.mileageMax;
      break;
    case 'emirate':
      delete newParams.emirate;
      break;
    case 'bodyType':
      delete newParams.bodyType;
      break;
    case 'fuelType':
      delete newParams.fuelType;
      break;
    case 'transmission':
      delete newParams.transmission;
      break;
    case 'condition':
      delete newParams.condition;
      break;
    case 'isBlkListing':
      delete newParams.isBlkListing;
      break;
    case 'isBlackTierPartner':
      delete newParams.isBlackTierPartner;
      break;
    case 'sortBy':
      delete newParams.sortBy;
      break;
  }

  return newParams;
}

/**
 * Toggle a value in a multi-select array
 */
export function toggleArrayValue<T extends string>(
  arr: T[] | undefined,
  value: T
): T[] | undefined {
  const current = arr || [];
  const updated = current.includes(value)
    ? current.filter(v => v !== value)
    : [...current, value];
  return updated.length ? updated : undefined;
}

export default searchApi;
