/**
 * Search Utilities - Client-safe
 * 
 * URL param helpers and types for search that can be used in client components.
 * These don't require database access.
 * 
 * @module lib/search-utils
 */

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
  | 'mileage_high'
  | 'year_new'
  | 'year_old'
  | 'popular';

export const SORT_OPTIONS: { value: SearchSortOption; label: string }[] = [
  { value: 'relevance', label: 'Default' },
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

export interface SearchParams {
  q?: string;
  preset?: 'newest' | 'cheapest' | 'luxury' | 'electric' | 'suv';
  make?: string[];
  model?: string[];
  trim?: string[];
  yearMin?: number;
  yearMax?: number;
  priceMin?: number;
  priceMax?: number;
  mileageMin?: number;
  mileageMax?: number;
  emirate?: string[];
  specs?: string[];
  bodyType?: string[];
  fuelType?: string[];
  transmission?: string[];
  engineSize?: string[];
  exteriorColor?: string[];
  interiorColor?: string[];
  doors?: string[];
  seatingCapacity?: string[];
  condition?: 'new' | 'used';
  isNegotiable?: boolean;
  underWarranty?: boolean;
  isBlkListing?: boolean;
  tags?: string[];
  extras?: string[];
  sellerType?: 'dealer' | 'private';
  partnerId?: string;
  partnerName?: string;
  partnerVerified?: boolean;
  isBlackTierPartner?: boolean;
  sellerId?: string;
  randomize?: boolean;
  limit?: number;
  cursor?: string;
  pageToken?: string;
  page?: number;
  sortBy?: SearchSortOption;
  sortOrder?: 'asc' | 'desc';
}

export interface FacetBucket {
  value: string;
  label: string;
  count: number;
  hex?: string;
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
  engineSize: FacetBucket[];
  exteriorColor: FacetBucket[];
  interiorColor: FacetBucket[];
  sellerType: FacetBucket[];
}

export interface SearchResultItem {
  id: string;
  slug: string | null;
  make: string;
  model: string;
  year: number;
  trim: string | null;
  condition: string | null;
  price: number;
  mileage: number;
  emirate: string;
  specs: string | null;
  thumbnail: string | null;
  // NOTE: images array excluded from search results for performance - use detail endpoint
  qiScore: number | null;
  isBlkListing: boolean;
  sellerType: 'dealer' | 'private';
  partnerName: string | null;
  partnerLogo: string | null;
  partnerVerified: boolean | null;
  isBlackTierPartner: boolean | null;
  sellerName: string | null;
  sellerAvatarUrl: string | null;
  sellerKycVerified: boolean | null;
  relevanceScore?: number;
}

export interface SearchResponse {
  data: SearchResultItem[];
  facets: SearchFacets;
  meta: {
    total?: number;
    limit: number;
    currentPage?: number;
    nextCursor?: string | null;
    hasMore: boolean;
    took: number;
    cached?: boolean;
    cacheAge?: number;
  };
  appliedFilters: Partial<SearchParams>;
}

// ============================================================================
// URL PARAM HELPERS
// ============================================================================

/**
 * Convert search params to URL query string
 */
export function searchParamsToUrl(params: SearchParams): URLSearchParams {
  const urlParams = new URLSearchParams();
  
  if (params.q) urlParams.set('q', params.q);
  if (params.preset) urlParams.set('preset', params.preset);
  
  if (params.make?.length) urlParams.set('make', params.make.join(','));
  if (params.model?.length) urlParams.set('model', params.model.join(','));
  if (params.trim?.length) urlParams.set('trim', params.trim.join(','));
  if (params.emirate?.length) urlParams.set('emirate', params.emirate.join(','));
  if (params.specs?.length) urlParams.set('specs', params.specs.join(','));
  if (params.bodyType?.length) urlParams.set('bodyType', params.bodyType.join(','));
  if (params.fuelType?.length) urlParams.set('fuelType', params.fuelType.join(','));
  if (params.transmission?.length) urlParams.set('transmission', params.transmission.join(','));
  if (params.engineSize?.length) urlParams.set('engineSize', params.engineSize.join(','));
  if (params.exteriorColor?.length) urlParams.set('exteriorColor', params.exteriorColor.join(','));
  if (params.interiorColor?.length) urlParams.set('interiorColor', params.interiorColor.join(','));
  if (params.tags?.length) urlParams.set('tags', params.tags.join(','));
  if (params.extras?.length) urlParams.set('extras', params.extras.join(','));
  
  if (params.yearMin) urlParams.set('yearMin', String(params.yearMin));
  if (params.yearMax) urlParams.set('yearMax', String(params.yearMax));
  if (params.priceMin) urlParams.set('priceMin', String(params.priceMin));
  if (params.priceMax) urlParams.set('priceMax', String(params.priceMax));
  if (params.mileageMax) urlParams.set('mileageMax', String(params.mileageMax));
  
  if (params.isNegotiable !== undefined) urlParams.set('negotiable', String(params.isNegotiable));
  if (params.underWarranty !== undefined) urlParams.set('warranty', String(params.underWarranty));
  if (params.isBlkListing !== undefined) urlParams.set('black', String(params.isBlkListing));
  if (params.partnerVerified !== undefined) urlParams.set('verified', String(params.partnerVerified));
  if (params.isBlackTierPartner !== undefined) urlParams.set('blackTier', String(params.isBlackTierPartner));
  
  if (params.condition) urlParams.set('condition', params.condition);
  if (params.sellerType) urlParams.set('seller', params.sellerType);
  if (params.partnerId) urlParams.set('partnerId', params.partnerId);
  if (params.partnerName) urlParams.set('partnerName', params.partnerName);
  if (params.sellerId) urlParams.set('sellerId', params.sellerId);
  
  if (params.limit) urlParams.set('limit', String(params.limit));
  if (params.pageToken) urlParams.set('token', params.pageToken);
  if (params.page && params.page > 1) urlParams.set('page', String(params.page));
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
    trim: parseArray('trim'),
    emirate: parseArray('emirate'),
    specs: parseArray('specs'),
    bodyType: parseArray('bodyType'),
    fuelType: parseArray('fuelType'),
    transmission: parseArray('transmission'),
    engineSize: parseArray('engineSize'),
    exteriorColor: parseArray('exteriorColor'),
    interiorColor: parseArray('interiorColor'),
    tags: parseArray('tags'),
    extras: parseArray('extras'),
    
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
    
    condition: urlParams.get('condition') as SearchParams['condition'],
    sellerType: urlParams.get('seller') as SearchParams['sellerType'],
    partnerId: urlParams.get('partnerId') || undefined,
    partnerName: urlParams.get('partnerName') || undefined,
    sellerId: urlParams.get('sellerId') || undefined,
    
    limit: parseNumber('limit'),
    cursor: urlParams.get('cursor') || undefined,
    pageToken: urlParams.get('token') || undefined,
    page: parseNumber('page'),
    sortBy: urlParams.get('sort') as SearchParams['sortBy'],
    sortOrder: urlParams.get('order') as SearchParams['sortOrder'],
  };
}

/**
 * Count active filters for badge display
 */
export function countActiveFilters(params: SearchParams): number {
  let count = 0;
  
  if (params.q) count++;
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
  if (params.extras?.length) count++;
  if (params.isNegotiable !== undefined) count++;
  if (params.underWarranty !== undefined) count++;
  if (params.isBlkListing !== undefined) count++;
  if (params.partnerVerified !== undefined) count++;
  if (params.isBlackTierPartner !== undefined) count++;
  if (params.condition) count++;
  
  return count;
}
