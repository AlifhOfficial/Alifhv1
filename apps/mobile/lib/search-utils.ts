/**
 * Search Utilities - Mobile
 * 
 * Types and helpers for search/filter functionality
 * Matches web's search-utils.ts for API compatibility
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
  | 'year_new'
  | 'year_old'
  | 'popular';

export const SORT_OPTIONS: { value: SearchSortOption; label: string }[] = [
  { value: 'relevance', label: 'Default' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'price_low', label: 'Price: Low → High' },
  { value: 'price_high', label: 'Price: High → Low' },
  { value: 'mileage_low', label: 'Lowest Mileage' },
  { value: 'year_new', label: 'Newest Year' },
  { value: 'year_old', label: 'Oldest Year' },
];

export interface SearchParams {
  q?: string;
  make?: string[];
  model?: string[];
  trim?: string[];
  yearMin?: number;
  yearMax?: number;
  priceMin?: number;
  priceMax?: number;
  mileageMax?: number;
  emirate?: string[];
  specs?: string[];
  bodyType?: string[];
  fuelType?: string[];
  condition?: 'new' | 'used';
  isBlkListing?: boolean;
  sellerType?: 'dealer' | 'private';
  isBlackTierPartner?: boolean;
  partnerId?: string;
  limit?: number;
  offset?: number;
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
  bodyType: FacetBucket[];
  fuelType: FacetBucket[];
  sellerType: FacetBucket[];
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Convert search params to URL query string
 */
export function searchParamsToQuery(params: SearchParams): string {
  const urlParams = new URLSearchParams();
  
  if (params.q) urlParams.set('q', params.q);
  if (params.make?.length) urlParams.set('make', params.make.join(','));
  if (params.model?.length) urlParams.set('model', params.model.join(','));
  if (params.trim?.length) urlParams.set('trim', params.trim.join(','));
  if (params.emirate?.length) urlParams.set('emirate', params.emirate.join(','));
  if (params.bodyType?.length) urlParams.set('bodyType', params.bodyType.join(','));
  if (params.fuelType?.length) urlParams.set('fuelType', params.fuelType.join(','));
  
  if (params.yearMin) urlParams.set('yearMin', String(params.yearMin));
  if (params.yearMax) urlParams.set('yearMax', String(params.yearMax));
  if (params.priceMin) urlParams.set('priceMin', String(params.priceMin));
  if (params.priceMax) urlParams.set('priceMax', String(params.priceMax));
  if (params.mileageMax) urlParams.set('mileageMax', String(params.mileageMax));
  
  if (params.isBlkListing !== undefined) urlParams.set('black', String(params.isBlkListing));
  if (params.isBlackTierPartner !== undefined) urlParams.set('blackTier', String(params.isBlackTierPartner));
  if (params.condition) urlParams.set('condition', params.condition);
  if (params.sellerType) urlParams.set('seller', params.sellerType);
  if (params.partnerId) urlParams.set('partnerId', params.partnerId);
  
  if (params.limit) urlParams.set('limit', String(params.limit));
  if (params.offset) urlParams.set('offset', String(params.offset));
  if (params.sortBy) urlParams.set('sort', params.sortBy);
  
  return urlParams.toString();
}

/**
 * Count active filters for badge display
 */
export function countActiveFilters(params: SearchParams): number {
  let count = 0;
  
  if (params.make?.length) count++;
  if (params.model?.length) count++;
  if (params.yearMin || params.yearMax) count++;
  if (params.priceMin || params.priceMax) count++;
  if (params.mileageMax) count++;
  if (params.emirate?.length) count++;
  if (params.bodyType?.length) count++;
  if (params.fuelType?.length) count++;
  if (params.sellerType) count++;
  if (params.isBlkListing !== undefined) count++;
  if (params.isBlackTierPartner !== undefined) count++;
  if (params.condition) count++;
  
  return count;
}

/**
 * Get active filter chips for display
 */
export function getActiveFilterChips(params: SearchParams): Array<{ key: string; label: string }> {
  const chips: Array<{ key: string; label: string }> = [];

  if (params.condition === 'new') {
    chips.push({ key: 'condition', label: 'New Cars' });
  }
  if (params.isBlkListing) {
    chips.push({ key: 'isBlkListing', label: 'Black Listings' });
  }
  if (params.isBlackTierPartner) {
    chips.push({ key: 'isBlackTierPartner', label: 'Black Members' });
  }
  if (params.sortBy && params.sortBy !== 'relevance') {
    const sortLabel = SORT_OPTIONS.find(s => s.value === params.sortBy)?.label || 'Sorted';
    chips.push({ key: 'sortBy', label: sortLabel });
  }
  if (params.q) {
    chips.push({ key: 'q', label: `"${params.q}"` });
  }
  if (params.make?.length) {
    chips.push({ key: 'make', label: params.make[0] });
  }
  if (params.model?.length) {
    chips.push({ key: 'model', label: params.model[0] });
  }
  if (params.trim?.length) {
    chips.push({ key: 'trim', label: params.trim[0] });
  }
  if (params.yearMin || params.yearMax) {
    const label = params.yearMin && params.yearMax
      ? `${params.yearMin} - ${params.yearMax}`
      : params.yearMin
      ? `From ${params.yearMin}`
      : `Up to ${params.yearMax}`;
    chips.push({ key: 'yearMin', label: `Year: ${label}` });
  }
  if (params.priceMin || params.priceMax) {
    const formatPrice = (v: number) => v >= 1000 ? `${Math.round(v / 1000)}K` : String(v);
    const label = params.priceMin && params.priceMax
      ? `${formatPrice(params.priceMin)} - ${formatPrice(params.priceMax)}`
      : params.priceMin
      ? `From ${formatPrice(params.priceMin)}`
      : `Up to ${formatPrice(params.priceMax!)}`;
    chips.push({ key: 'priceMin', label: `${label} AED` });
  }
  if (params.mileageMax) {
    chips.push({ key: 'mileageMax', label: `Under ${Math.round(params.mileageMax / 1000)}K km` });
  }
  if (params.emirate?.length) {
    chips.push({ key: 'emirate', label: params.emirate.join(', ') });
  }
  if (params.bodyType?.length) {
    chips.push({ key: 'bodyType', label: params.bodyType.join(', ') });
  }
  if (params.fuelType?.length) {
    chips.push({ key: 'fuelType', label: params.fuelType.join(', ') });
  }
  if (params.sellerType) {
    chips.push({ key: 'sellerType', label: params.sellerType === 'dealer' ? 'Dealers' : 'Private' });
  }

  return chips;
}
