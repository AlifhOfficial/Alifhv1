/**
 * API Client - Calls web API endpoints directly
 * 
 * Transforms web API response shape to mobile-friendly format.
 */

// TODO: Use env variable for production
const API_BASE = 'http://192.168.1.14:3000';
const CDN_BASE = 'https://cdn.alifh.ae';

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
  preset?: 'newest' | 'cheapest' | 'luxury' | 'electric' | 'suv';
  make?: string;
  model?: string;
  trim?: string;
  yearMin?: number;
  yearMax?: number;
  priceMin?: number;
  priceMax?: number;
  mileageMax?: number;
  emirate?: string;
  specs?: string;
  bodyType?: string;
  fuelType?: string;
  transmission?: string;
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

/** Listing card data for display */
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

export interface Suggestion {
  type: 'make' | 'model' | 'make_model' | 'make_model_trim' | 'partner';
  text: string;
  make?: string;
  model?: string;
  trim?: string;
  count?: number;
}

// ============================================================================
// WEB API RESPONSE TYPES (what the API actually returns)
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

function paramsToUrl(params: SearchParams): URLSearchParams {
  const urlParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    
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

/** Convert relative path to absolute URL */
function toAbsoluteUrl(path: string | null): string | null {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  // Local static files (e.g. /Black_cars/car7.webp)
  if (path.startsWith('/')) return `${API_BASE}${path}`;
  // CDN paths (e.g. brands/xxx/logo.webp, avatars/xxx.webp)
  return `${CDN_BASE}/${path}`;
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
// API METHODS
// ============================================================================

export const api = {
  /**
   * Search listings with filters and facets
   * Calls: GET /api/listings/search
   * Transforms web API response to mobile format
   */
  async search(params: SearchParams = {}): Promise<SearchResponse> {
    const urlParams = paramsToUrl(params);
    const url = `${API_BASE}/api/listings/search?${urlParams}`;
    
    console.log('[API] Fetching:', url);
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Search failed: ${response.status}`);
    }
    
    const webResponse: WebSearchResponse = await response.json();
    const limit = params.limit || 20;
    const page = params.page || 1;
    
    // Debug: log first item's thumbnail
    if (webResponse.data?.[0]) {
      console.log('[API] First item thumbnail from web:', webResponse.data[0].thumbnail);
      console.log('[API] Transformed thumbnail:', toAbsoluteUrl(webResponse.data[0].thumbnail));
    }
    
    // Transform web response to mobile format
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
   * Get search suggestions (autocomplete)
   * Calls: GET /api/listings/search/suggest
   */
  async suggest(q: string, context?: { make?: string; model?: string }): Promise<{ suggestions: Suggestion[] }> {
    const params = new URLSearchParams({ q });
    if (context?.make) params.set('make', context.make);
    if (context?.model) params.set('model', context.model);
    
    const url = `${API_BASE}/api/listings/search/suggest?${params}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Suggest failed: ${response.status}`);
    }
    return response.json();
  },

  /**
   * Get popular makes (empty search state)
   * Calls: GET /api/listings/search/suggest?popular=true
   */
  async popularMakes(limit = 5): Promise<{ suggestions: Suggestion[] }> {
    const params = new URLSearchParams({ popular: 'true', limit: String(limit) });
    
    const url = `${API_BASE}/api/listings/search/suggest?${params}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Popular makes failed: ${response.status}`);
    }
    return response.json();
  },
};

export default api;
