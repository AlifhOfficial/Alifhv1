/**
 * Search Types & Interfaces
 * 
 * Centralized types for the 3-tier search system:
 * - Basic: Quick text search (header)
 * - Medium: Common filters (sidebar)
 * - Advanced: All filters (drawer/modal)
 * 
 * @module packages/database/src/schema/search-types
 */

import type { 
  BodyType, 
  FuelType, 
  TransmissionType, 
  SpecsType,
  ExteriorColor,
  InteriorColor,
  EngineSize,
  UAEEmirate,
  SeatingOption,
  DoorsOption,
} from './listing-constants';

// ============================================================================
// SEARCH FILTER TIERS
// ============================================================================

/**
 * Basic Search - Header quick search
 * Simple text query with optional quick filters
 */
export interface BasicSearchParams {
  /** Free-text search (make, model, year) */
  q?: string;
  /** Quick filter presets */
  preset?: 'newest' | 'cheapest' | 'luxury' | 'electric' | 'suv';
}

/**
 * Medium Filters - Sidebar filters (most common)
 */
export interface MediumFilterParams {
  make?: string[];
  model?: string[];
  yearMin?: number;
  yearMax?: number;
  priceMin?: number;
  priceMax?: number;
  mileageMax?: number;
  emirate?: string[];
  specs?: SpecsType[];
}

/**
 * Advanced Filters - Full filter drawer
 */
export interface AdvancedFilterParams {
  bodyType?: BodyType[];
  fuelType?: FuelType[];
  transmission?: TransmissionType[];
  engineSize?: EngineSize[];
  exteriorColor?: ExteriorColor[];
  interiorColor?: InteriorColor[];
  doors?: DoorsOption[];
  seatingCapacity?: SeatingOption[];
  
  // Boolean features
  isNegotiable?: boolean;
  underWarranty?: boolean;
  isBlkListing?: boolean;
  
  // Tags (max 3 per listing)
  tags?: string[];
  
  // Seller type
  sellerType?: 'dealer' | 'private';
  
  // Partner specific
  partnerId?: string;
  partnerVerified?: boolean;
  isBlackTierPartner?: boolean;
}

/**
 * Combined Search Params - All tiers merged
 */
export interface SearchParams extends BasicSearchParams, MediumFilterParams, AdvancedFilterParams {
  // Pagination
  limit?: number;
  offset?: number;
  cursor?: string; // For cursor-based pagination (future)
  
  // Sorting
  sortBy?: SearchSortOption;
  sortOrder?: 'asc' | 'desc';
}

// ============================================================================
// SORT OPTIONS
// ============================================================================

export type SearchSortOption = 
  | 'relevance'      // Default for text search
  | 'newest'         // publishedAt desc
  | 'oldest'         // publishedAt asc  
  | 'price_low'      // price asc
  | 'price_high'     // price desc
  | 'mileage_low'    // mileage asc
  | 'year_new'       // year desc
  | 'year_old'       // year asc
  | 'popular';       // viewCount + favouriteCount

export const SORT_OPTIONS: { value: SearchSortOption; label: string }[] = [
  { value: 'relevance', label: 'Most Relevant' },
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'price_low', label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' },
  { value: 'mileage_low', label: 'Lowest Mileage' },
  { value: 'year_new', label: 'Newest Year' },
  { value: 'year_old', label: 'Oldest Year' },
  { value: 'popular', label: 'Most Popular' },
];

// ============================================================================
// FACETED SEARCH RESPONSE
// ============================================================================

/**
 * Single facet bucket
 */
export interface FacetBucket {
  value: string;
  label: string;
  count: number;
  /** For color facets */
  hex?: string;
}

/**
 * Facets for the current search results
 * Counts are filtered based on current query (drill-down)
 */
export interface SearchFacets {
  // Medium tier facets
  make: FacetBucket[];
  model: FacetBucket[];
  yearRange: { min: number; max: number };
  priceRange: { min: number; max: number };
  mileageRange: { min: number; max: number };
  emirate: FacetBucket[];
  specs: FacetBucket[];
  
  // Advanced tier facets
  bodyType: FacetBucket[];
  fuelType: FacetBucket[];
  transmission: FacetBucket[];
  engineSize: FacetBucket[];
  exteriorColor: FacetBucket[];
  interiorColor: FacetBucket[];
  sellerType: FacetBucket[];
}

/**
 * Search API Response
 * 
 * Note: `facets` and `meta.total` are optional when using skipFacets/skipTotalCount options
 */
export interface SearchResponse {
  /** Search results */
  data: SearchResultItem[];
  
  /** Faceted counts (undefined if skipFacets=true) */
  facets?: SearchFacets;
  
  /** Pagination meta */
  meta: {
    /** Total count (undefined if skipTotalCount=true) */
    total?: number;
    limit: number;
    offset: number;
    hasMore: boolean;
    /** Time to execute search in ms */
    took: number;
  };
  
  /** Applied filters for reference */
  appliedFilters: Partial<SearchParams>;
}

/**
 * Minimal listing data for search results
 * (same as car-card endpoint)
 */
export interface SearchResultItem {
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
  images: string[];
  qiScore: number | null;
  isBlkListing: boolean;
  
  // Seller info
  sellerType: 'dealer' | 'private';
  partnerName: string | null;
  partnerLogo: string | null;
  partnerVerified: boolean | null;
  isBlackTierPartner: boolean | null;
  sellerName: string | null;
  sellerAvatarUrl: string | null;
  sellerKycVerified: boolean | null;
  
  // Search relevance
  relevanceScore?: number;
}

// ============================================================================
// QUICK SEARCH SUGGESTIONS
// ============================================================================

/**
 * Auto-suggest result for header search
 */
export interface SearchSuggestion {
  type: 'make' | 'model' | 'make_model' | 'listing';
  text: string;
  /** For make_model type */
  make?: string;
  model?: string;
  /** Number of matching listings */
  count?: number;
  /** For listing type - direct link */
  listingId?: string;
  thumbnail?: string;
}

// ============================================================================
// PRICE RANGES (for quick filter buttons)
// ============================================================================

export const PRICE_RANGES = [
  { value: '0-50000', label: 'Under 50K', min: 0, max: 50000 },
  { value: '50000-100000', label: '50K - 100K', min: 50000, max: 100000 },
  { value: '100000-200000', label: '100K - 200K', min: 100000, max: 200000 },
  { value: '200000-500000', label: '200K - 500K', min: 200000, max: 500000 },
  { value: '500000+', label: '500K+', min: 500000, max: undefined },
] as const;

export const MILEAGE_RANGES = [
  { value: '0-20000', label: 'Under 20K km', max: 20000 },
  { value: '20000-50000', label: '20K - 50K km', max: 50000 },
  { value: '50000-100000', label: '50K - 100K km', max: 100000 },
  { value: '100000-150000', label: '100K - 150K km', max: 150000 },
  { value: '150000+', label: '150K+ km', max: undefined },
] as const;

export const YEAR_RANGES = [
  { value: '2024-2026', label: '2024+', min: 2024 },
  { value: '2020-2023', label: '2020 - 2023', min: 2020, max: 2023 },
  { value: '2015-2019', label: '2015 - 2019', min: 2015, max: 2019 },
  { value: '2010-2014', label: '2010 - 2014', min: 2010, max: 2014 },
  { value: 'pre-2010', label: 'Before 2010', max: 2009 },
] as const;

// ============================================================================
// URL PARAM HELPERS
// ============================================================================

/**
 * Convert search params to URL query string
 */
export function searchParamsToUrl(params: SearchParams): URLSearchParams {
  const urlParams = new URLSearchParams();
  
  // Text search
  if (params.q) urlParams.set('q', params.q);
  if (params.preset) urlParams.set('preset', params.preset);
  
  // Arrays - join with comma
  if (params.make?.length) urlParams.set('make', params.make.join(','));
  if (params.model?.length) urlParams.set('model', params.model.join(','));
  if (params.emirate?.length) urlParams.set('emirate', params.emirate.join(','));
  if (params.specs?.length) urlParams.set('specs', params.specs.join(','));
  if (params.bodyType?.length) urlParams.set('bodyType', params.bodyType.join(','));
  if (params.fuelType?.length) urlParams.set('fuelType', params.fuelType.join(','));
  if (params.transmission?.length) urlParams.set('transmission', params.transmission.join(','));
  if (params.engineSize?.length) urlParams.set('engineSize', params.engineSize.join(','));
  if (params.exteriorColor?.length) urlParams.set('exteriorColor', params.exteriorColor.join(','));
  if (params.interiorColor?.length) urlParams.set('interiorColor', params.interiorColor.join(','));
  if (params.tags?.length) urlParams.set('tags', params.tags.join(','));
  
  // Ranges
  if (params.yearMin) urlParams.set('yearMin', String(params.yearMin));
  if (params.yearMax) urlParams.set('yearMax', String(params.yearMax));
  if (params.priceMin) urlParams.set('priceMin', String(params.priceMin));
  if (params.priceMax) urlParams.set('priceMax', String(params.priceMax));
  if (params.mileageMax) urlParams.set('mileageMax', String(params.mileageMax));
  
  // Booleans
  if (params.isNegotiable !== undefined) urlParams.set('negotiable', String(params.isNegotiable));
  if (params.underWarranty !== undefined) urlParams.set('warranty', String(params.underWarranty));
  if (params.isBlkListing !== undefined) urlParams.set('black', String(params.isBlkListing));
  if (params.partnerVerified !== undefined) urlParams.set('verified', String(params.partnerVerified));
  if (params.isBlackTierPartner !== undefined) urlParams.set('blackTier', String(params.isBlackTierPartner));
  
  // Seller
  if (params.sellerType) urlParams.set('seller', params.sellerType);
  if (params.partnerId) urlParams.set('partnerId', params.partnerId);
  
  // Pagination & Sort
  if (params.limit) urlParams.set('limit', String(params.limit));
  if (params.offset) urlParams.set('offset', String(params.offset));
  if (params.sortBy) urlParams.set('sort', params.sortBy);
  if (params.sortOrder) urlParams.set('order', params.sortOrder);
  
  return urlParams;
}

/**
 * Parse URL query string to search params
 */
export function urlToSearchParams(urlParams: URLSearchParams): SearchParams {
  const parseArray = (key: string) => {
    const val = urlParams.get(key);
    return val ? val.split(',').filter(Boolean) : undefined;
  };
  
  const parseNumber = (key: string) => {
    const val = urlParams.get(key);
    return val ? Number(val) : undefined;
  };
  
  const parseBoolean = (key: string) => {
    const val = urlParams.get(key);
    if (val === 'true') return true;
    if (val === 'false') return false;
    return undefined;
  };
  
  return {
    q: urlParams.get('q') || undefined,
    preset: urlParams.get('preset') as SearchParams['preset'],
    
    make: parseArray('make'),
    model: parseArray('model'),
    emirate: parseArray('emirate'),
    specs: parseArray('specs') as SearchParams['specs'],
    bodyType: parseArray('bodyType') as SearchParams['bodyType'],
    fuelType: parseArray('fuelType') as SearchParams['fuelType'],
    transmission: parseArray('transmission') as SearchParams['transmission'],
    engineSize: parseArray('engineSize') as SearchParams['engineSize'],
    exteriorColor: parseArray('exteriorColor') as SearchParams['exteriorColor'],
    interiorColor: parseArray('interiorColor') as SearchParams['interiorColor'],
    tags: parseArray('tags'),
    
    yearMin: parseNumber('yearMin'),
    yearMax: parseNumber('yearMax'),
    priceMin: parseNumber('priceMin'),
    priceMax: parseNumber('priceMax'),
    mileageMax: parseNumber('mileageMax'),
    
    isNegotiable: parseBoolean('negotiable'),
    underWarranty: parseBoolean('warranty'),
    isBlkListing: parseBoolean('black'),
    partnerVerified: parseBoolean('verified'),
    isBlackTierPartner: parseBoolean('blackTier'),
    
    sellerType: urlParams.get('seller') as SearchParams['sellerType'],
    partnerId: urlParams.get('partnerId') || undefined,
    
    limit: parseNumber('limit'),
    offset: parseNumber('offset'),
    sortBy: urlParams.get('sort') as SearchParams['sortBy'],
    sortOrder: urlParams.get('order') as SearchParams['sortOrder'],
  };
}

/**
 * Count active filters for badge display
 */
export function countActiveFilters(params: SearchParams): number {
  let count = 0;
  
  // Don't count q, limit, offset, sort
  if (params.make?.length) count++;
  if (params.model?.length) count++;
  if (params.yearMin || params.yearMax) count++;
  if (params.priceMin || params.priceMax) count++;
  if (params.mileageMax) count++;
  if (params.emirate?.length) count++;
  if (params.specs?.length) count++;
  if (params.bodyType?.length) count++;
  if (params.fuelType?.length) count++;
  if (params.transmission?.length) count++;
  if (params.engineSize?.length) count++;
  if (params.exteriorColor?.length) count++;
  if (params.interiorColor?.length) count++;
  if (params.sellerType) count++;
  if (params.tags?.length) count++;
  if (params.isNegotiable !== undefined) count++;
  if (params.underWarranty !== undefined) count++;
  if (params.isBlkListing !== undefined) count++;
  if (params.partnerVerified !== undefined) count++;
  if (params.isBlackTierPartner !== undefined) count++;
  
  return count;
}
