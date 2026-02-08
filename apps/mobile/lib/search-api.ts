/**
 * Search API - Dedicated search functionality
 * 
 * Handles all search-related API calls including:
 * - Faceted search with make/model/trim hierarchy
 * - Suggestions and autocomplete
 * - Popular makes
 * - Dynamic facet fetching for multi-select
 */

import { API_BASE, CDN_BASE } from './config';

// ============================================================================
// TYPES
// ============================================================================

export type SearchSortOption = 
  | 'relevance'
  | 'newest'
  | 'oldest'
  | 'price_low'
  | 'price_high'
  | 'mileage_low'
  | 'year_new'
  | 'year_old'
  | 'popular';

export interface SearchParams {
  q?: string;
  make?: string[];  // Support multi-select
  model?: string[]; // Support multi-select
  trim?: string[];  // Support multi-select
  yearMin?: number;
  yearMax?: number;
  priceMin?: number;
  priceMax?: number;
  mileageMax?: number;
  emirate?: string[];
  specs?: string[];
  bodyType?: string[];
  fuelType?: string[];
  transmission?: string[];
  condition?: 'new' | 'used';
  isNegotiable?: boolean;
  isBlkListing?: boolean;
  isBlackTierPartner?: boolean;
  limit?: number;
  page?: number;
  sortBy?: SearchSortOption;
}

export interface FacetBucket {
  value: string;
  label: string;
  count: number;
}

export interface SearchFacets {
  make: FacetBucket[];
  model: FacetBucket[];
  trim: FacetBucket[];
  yearRange: { min: number; max: number };
  priceRange: { min: number; max: number };
  mileageRange: { min: number; max: number };
  emirate: FacetBucket[];
  specs: FacetBucket[];
  bodyType: FacetBucket[];
  fuelType: FacetBucket[];
  transmission: FacetBucket[];
}

export interface Suggestion {
  type: 'make' | 'model' | 'make_model' | 'make_model_trim' | 'partner';
  text: string;
  make?: string;
  model?: string;
  trim?: string;
  count?: number;
}

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

export interface SearchResponse {
  listings: ListingCard[];
  facets?: SearchFacets;
  meta: {
    total: number;
    limit: number;
    page: number;
    hasMore: boolean;
  };
}

// ============================================================================
// INTERNAL TYPES (Web API Response shapes)
// ============================================================================

interface WebSearchResultItem {
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

interface WebSearchResponse {
  data: WebSearchResultItem[];
  facets?: SearchFacets;
  meta: {
    total?: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
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

/** Convert SearchParams to URLSearchParams for API call */
function paramsToUrl(params: SearchParams): URLSearchParams {
  const urlParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    
    // Handle arrays (multi-select) - join with comma
    if (Array.isArray(value)) {
      if (value.length > 0) {
        urlParams.set(key, value.join(','));
      }
      return;
    }
    
    // Convert page to offset for web API
    if (key === 'page') {
      const limit = params.limit || 20;
      const offset = ((value as number) - 1) * limit;
      urlParams.set('offset', String(offset));
    } else {
      urlParams.set(key, String(value));
    }
  });
  
  return urlParams;
}

/** Transform web API item to mobile ListingCard */
function transformItem(item: WebSearchResultItem): ListingCard {
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

// ============================================================================
// SEARCH API
// ============================================================================

export const searchApi = {
  /**
   * Full search with facets
   * Supports multi-select for make/model/trim
   */
  async search(params: SearchParams = {}): Promise<SearchResponse> {
    const urlParams = paramsToUrl(params);
    const url = `${API_BASE}/api/listings/search?${urlParams}`;
    
    console.log('[SearchAPI] Fetching:', url);
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Search failed: ${response.status}`);
    }
    
    const webResponse: WebSearchResponse = await response.json();
    const page = params.page || 1;
    
    return {
      listings: webResponse.data.map(transformItem),
      facets: webResponse.facets,
      meta: {
        total: webResponse.meta.total || 0,
        limit: webResponse.meta.limit,
        page,
        hasMore: webResponse.meta.hasMore,
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
    
    const webResponse: WebSearchResponse = await response.json();
    return webResponse.facets || null;
  },

  /**
   * Get models for selected makes
   * Returns models filtered by the selected makes
   */
  async getModelsForMakes(makes: string[]): Promise<FacetBucket[]> {
    if (!makes.length) return [];
    
    const urlParams = new URLSearchParams({
      make: makes.join(','),
      limit: '0',
    });
    const url = `${API_BASE}/api/listings/search?${urlParams}`;
    
    const response = await fetch(url);
    if (!response.ok) return [];
    
    const webResponse: WebSearchResponse = await response.json();
    return webResponse.facets?.model || [];
  },

  /**
   * Get trims for selected makes and models
   * Returns trims filtered by selected makes and models
   */
  async getTrimsForModels(makes: string[], models: string[]): Promise<FacetBucket[]> {
    if (!makes.length || !models.length) return [];
    
    const urlParams = new URLSearchParams({
      make: makes.join(','),
      model: models.join(','),
      limit: '0',
    });
    const url = `${API_BASE}/api/listings/search?${urlParams}`;
    
    const response = await fetch(url);
    if (!response.ok) return [];
    
    const webResponse: WebSearchResponse = await response.json();
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
    const url = `${API_BASE}/api/listings/search?${urlParams}`;
    
    const response = await fetch(url);
    if (!response.ok) return 0;
    
    const webResponse: WebSearchResponse = await response.json();
    return webResponse.meta.total || 0;
  },
};

// ============================================================================
// SORT OPTIONS
// ============================================================================

export const SORT_OPTIONS: { value: SearchSortOption; label: string }[] = [
  { value: 'relevance', label: 'Most Relevant' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'newest', label: 'Recently Listed' },
  { value: 'oldest', label: 'Oldest Listings' },
  { value: 'price_low', label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' },
  { value: 'mileage_low', label: 'Lowest Mileage' },
  { value: 'year_new', label: 'Year: Newest' },
  { value: 'year_old', label: 'Year: Oldest' },
];

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

  // Make chips
  if (params.make?.length) {
    params.make.forEach(make => {
      chips.push({ key: 'make', label: make, value: make });
    });
  }

  // Model chips
  if (params.model?.length) {
    params.model.forEach(model => {
      chips.push({ key: 'model', label: model, value: model });
    });
  }

  // Trim chips
  if (params.trim?.length) {
    params.trim.forEach(trim => {
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
  if (params.emirate?.length) {
    chips.push({ key: 'emirate', label: params.emirate.join(', '), value: params.emirate });
  }

  // Body type
  if (params.bodyType?.length) {
    chips.push({ key: 'bodyType', label: params.bodyType.join(', '), value: params.bodyType });
  }

  // Fuel type
  if (params.fuelType?.length) {
    chips.push({ key: 'fuelType', label: params.fuelType.join(', '), value: params.fuelType });
  }

  // Transmission
  if (params.transmission?.length) {
    chips.push({ key: 'transmission', label: params.transmission.join(', '), value: params.transmission });
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
        newParams.make = newParams.make.filter(m => m !== value);
        if (!newParams.make.length) {
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
        newParams.model = newParams.model.filter(m => m !== value);
        if (!newParams.model.length) {
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
        newParams.trim = newParams.trim.filter(t => t !== value);
        if (!newParams.trim.length) delete newParams.trim;
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
