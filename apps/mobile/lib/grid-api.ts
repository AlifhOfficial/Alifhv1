/**
 * Grid API - Home Feed Data Fetching
 * 
 * Provides smart API calls for home feed grids:
 * - Uses search API for car listings with various filters
 * - Uses partner API for dealer/partner grids
 * - Supports batched loading for performance
 * 
 * @module apps/mobile/lib/grid-api
 */

import { searchApi, type ListingCard, type SearchParams } from './search-api';
import { getPartnersList, type PartnerListItem } from './partner-api';
import { getShowroomsList, type ShowroomCardData } from './showroom-api';
import { 
  BODY_TYPES, 
  CAR_MAKES, 
  FUEL_TYPES,
  SPECS_TYPES,
} from './listing-constants';

// ============================================================================
// TYPES
// ============================================================================

/** Grid types supported in home feed */
export type GridType = 
  | 'blk'           // BLK signature premium cars
  | 'category'      // Category-based (body type, fuel type, etc.)
  | 'make'          // Make-based grids (German, Japanese, etc.)
  | 'partner'       // Partner inventory showcase
  | 'founding'      // Founding partners (earliest joined)
  | 'showroom'      // Showroom spotlight
  | 'newest'        // Recently listed
  | 'popular'       // Most popular/viewed
  | 'price_range'   // Price-based categories
  | 'specs'         // Regional specs (GCC, US, etc.)
  | 'hidden_gems';  // Low mileage, great price deals

/** Base grid configuration */
export interface GridConfig {
  id: string;
  type: GridType;
  title: string;
  subtitle?: string;
  searchParams?: SearchParams;
  /** For partner grids - partner IDs to show */
  partnerIds?: string[];
  /** Whether this is a "Revvup X" branded grid */
  isRevvupBranded?: boolean;
  /** Custom branding text (e.g., "BLK", "evvup") */
  brandText?: string;
}

/** Category grid config with specific filter */
export interface CategoryGridConfig extends GridConfig {
  type: 'category';
  categoryType: 'bodyType' | 'fuelType' | 'condition' | 'specs' | 'make_group';
  categoryValue: string;
  categoryLabel: string;
}

/** Make group grid config */
export interface MakeGroupGridConfig extends GridConfig {
  type: 'make';
  makes: string[];
  groupName: string;
}

/** Partner grid config */
export interface PartnerGridConfig extends GridConfig {
  type: 'partner' | 'founding';
  partnerId?: string;
}

/** Showroom showcase grid config */
export interface ShowroomGridConfig extends GridConfig {
  type: 'showroom';
  partnerId?: string;
  partnerName?: string;
  /** Index in the showroom list (0-based) */
  showroomIndex?: number;
}

/** Price range grid config */
export interface PriceRangeGridConfig extends GridConfig {
  type: 'price_range';
  minPrice?: number;
  maxPrice?: number;
  priceLabel: string;
}

export type AnyGridConfig = 
  | GridConfig 
  | CategoryGridConfig 
  | MakeGroupGridConfig 
  | PartnerGridConfig
  | PriceRangeGridConfig
  | ShowroomGridConfig;

/** Grid data result */
export interface GridData {
  config: AnyGridConfig;
  listings: ListingCard[];
  partner?: PartnerListItem;
  partners?: PartnerListItem[];
  showroom?: ShowroomCardData;
  total?: number;
  hasMore?: boolean;
}

// ============================================================================
// MAKE GROUPS - For category grids
// ============================================================================

export const MAKE_GROUPS = {
  german: {
    name: 'German Cars',
    subtitle: 'Audi, BMW, Mercedes-Benz, Porsche, Volkswagen',
    makes: ['Audi', 'BMW', 'Mercedes-Benz', 'Porsche', 'Volkswagen'],
  },
  japanese: {
    name: 'Japanese Cars',
    subtitle: 'Toyota, Honda, Nissan, Lexus, Mazda & more',
    makes: ['Toyota', 'Honda', 'Nissan', 'Lexus', 'Mazda', 'Subaru', 'Mitsubishi'],
  },
  italian: {
    name: 'Italian Cars',
    subtitle: 'Ferrari, Lamborghini, Maserati, Alfa Romeo',
    makes: ['Ferrari', 'Lamborghini', 'Maserati', 'Alfa Romeo', 'Fiat'],
  },
  american: {
    name: 'American Cars',
    subtitle: 'Ford, Chevrolet, Dodge, Cadillac, Jeep & more',
    makes: ['Ford', 'Chevrolet', 'Dodge', 'Cadillac', 'GMC', 'Jeep', 'Ram'],
  },
  british: {
    name: 'British Cars',
    subtitle: 'Bentley, Rolls-Royce, Aston Martin, Jaguar, McLaren',
    makes: ['Bentley', 'Rolls-Royce', 'Aston Martin', 'Jaguar', 'Land Rover', 'McLaren'],
  },
  korean: {
    name: 'Korean Cars',
    subtitle: 'Hyundai, Kia, Genesis',
    makes: ['Hyundai', 'Kia', 'Genesis'],
  },
  electric: {
    name: 'Electric Cars',
    subtitle: 'Tesla, Rivian, Lucid, Polestar & more EVs',
    makes: ['Tesla', 'Rivian', 'Lucid', 'Polestar', 'BYD', 'Nio', 'Xpeng'],
  },
  hypercar: {
    name: 'Hypercars',
    subtitle: 'Bugatti, Koenigsegg, Pagani & ultra-exotics',
    makes: ['Bugatti', 'Koenigsegg', 'Pagani', 'McLaren', 'Ferrari', 'Lamborghini'],
  },
} as const;

export type MakeGroupKey = keyof typeof MAKE_GROUPS;

// ============================================================================
// PRICE RANGES
// ============================================================================

export const PRICE_RANGES = {
  budget: { min: 0, max: 50000, label: 'Under 50K', subtitle: 'Budget-friendly options under AED 50,000' },
  affordable: { min: 50000, max: 100000, label: '50K - 100K', subtitle: 'Mid-range cars from AED 50K to 100K' },
  mid_range: { min: 100000, max: 250000, label: '100K - 250K', subtitle: 'Premium cars from AED 100K to 250K' },
  premium: { min: 250000, max: 500000, label: '250K - 500K', subtitle: 'Luxury cars from AED 250K to 500K' },
  luxury: { min: 500000, max: 1000000, label: '500K - 1M', subtitle: 'High-end luxury from AED 500K to 1M' },
  ultra_luxury: { min: 1000000, max: undefined, label: 'Over 1M', subtitle: 'Ultra-luxury cars over AED 1 million' },
} as const;

export type PriceRangeKey = keyof typeof PRICE_RANGES;

// ============================================================================
// CACHE - 15 minute TTL
// ============================================================================

const CACHE_TTL = 15 * 60 * 1000; // 15 minutes

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const cache = new Map<string, CacheEntry<unknown>>();
const inFlightListingRequests = new Map<string, Promise<ListingCard[]>>();
const inFlightPartnersRequest = new Map<string, Promise<PartnerListItem[]>>();
const inFlightGridDataRequests = new Map<string, Promise<GridData>>();

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL) {
    cache.delete(key);
    return null;
  }
  return entry.data as T;
}

function setCache<T>(key: string, data: T): void {
  cache.set(key, { data, timestamp: Date.now() });
}

export function clearGridCache(): void {
  cache.clear();
}

// ============================================================================
// CATEGORY SUBTITLES - Clear descriptions for each filter type
// ============================================================================

/** Body type descriptions */
export const BODY_TYPE_SUBTITLES: Record<string, string> = {
  sedan: '4-door cars with separate trunk',
  suv: 'Sport Utility Vehicles - spacious & versatile',
  coupe: '2-door sporty cars with sleek design',
  convertible: 'Cars with retractable roofs',
  hatchback: 'Compact cars with rear liftgate',
  wagon: 'Station wagons with extended cargo',
  pickup: 'Trucks with open cargo bed',
  van: 'Multi-purpose passenger vehicles',
  sports: 'High-performance sports cars',
  luxury: 'Premium luxury vehicles',
  other: 'Specialty & unique vehicles',
};

/** Fuel type descriptions */
export const FUEL_TYPE_SUBTITLES: Record<string, string> = {
  petrol: 'Gasoline-powered vehicles',
  diesel: 'Diesel engine vehicles',
  hybrid: 'Petrol + electric hybrid cars',
  electric: 'Fully electric vehicles (EVs)',
  plugin_hybrid: 'Plug-in hybrid electric vehicles',
};

/** Specs type descriptions */
export const SPECS_SUBTITLES: Record<string, string> = {
  gcc: 'GCC-spec vehicles for Gulf region',
  american: 'US-spec imported vehicles',
  european: 'European-spec vehicles',
  japanese: 'Japanese domestic market (JDM)',
  other: 'Other regional specifications',
};

// ============================================================================
// GRID GENERATORS - Create dynamic grid configs
// ============================================================================

/** Generate BLK premium grid config */
export function createBlkGridConfig(): GridConfig {
  return {
    id: 'blk',
    type: 'blk',
    title: 'BLK',
    subtitle: 'Signature Line',
    isRevvupBranded: true,
    brandText: 'BLK',
    searchParams: {
      isBlkListing: true,
      sortBy: 'relevance',
      limit: 8,
    },
  };
}

/** Generate category grid config */
export function createCategoryGridConfig(
  categoryType: CategoryGridConfig['categoryType'],
  categoryValue: string,
  categoryLabel: string
): CategoryGridConfig {
  const searchParams: SearchParams = { limit: 6, sortBy: 'popular' };
  let subtitle = '';
  
  switch (categoryType) {
    case 'bodyType':
      searchParams.bodyType = categoryValue;
      subtitle = BODY_TYPE_SUBTITLES[categoryValue] || `Browse ${categoryLabel}`;
      break;
    case 'fuelType':
      searchParams.fuelType = categoryValue;
      subtitle = FUEL_TYPE_SUBTITLES[categoryValue] || `Browse ${categoryLabel}`;
      break;
    case 'condition':
      searchParams.condition = categoryValue;
      subtitle = categoryValue === 'new' ? 'Brand new, never registered' : 'Pre-owned vehicles';
      break;
    case 'specs':
      searchParams.specs = categoryValue;
      subtitle = SPECS_SUBTITLES[categoryValue] || `Browse ${categoryLabel}`;
      break;
    case 'make_group':
      // Handled separately in make group config
      subtitle = `Browse ${categoryLabel}`;
      break;
  }

  return {
    id: `category-${categoryType}-${categoryValue}`,
    type: 'category',
    title: categoryLabel,
    subtitle,
    categoryType,
    categoryValue,
    categoryLabel,
    isRevvupBranded: true,
    searchParams,
  };
}

/** Generate make group grid config */
export function createMakeGroupGridConfig(groupKey: MakeGroupKey): MakeGroupGridConfig {
  const group = MAKE_GROUPS[groupKey];
  return {
    id: `make-${groupKey}`,
    type: 'make',
    title: group.name,
    subtitle: group.subtitle,
    makes: [...group.makes],
    groupName: group.name,
    isRevvupBranded: true,
    searchParams: {
      make: [...group.makes],
      sortBy: 'popular',
      limit: 6,
    },
  };
}

/** Generate partner grid config */
export function createPartnerGridConfig(partner: PartnerListItem): PartnerGridConfig {
  return {
    id: `partner-${partner.id}`,
    type: 'partner',
    title: partner.brandName,
    subtitle: 'Partner Inventory',
    partnerId: partner.id,
    isRevvupBranded: false,
  };
}

/** Generate founding partners grid config */
export function createFoundingPartnersGridConfig(): PartnerGridConfig {
  return {
    id: 'founding',
    type: 'founding',
    title: 'Founding Partners',
    subtitle: 'Our earliest partners',
    isRevvupBranded: true,
  };
}

/** Generate price range grid config */
export function createPriceRangeGridConfig(rangeKey: PriceRangeKey): PriceRangeGridConfig {
  const range = PRICE_RANGES[rangeKey];
  return {
    id: `price-${rangeKey}`,
    type: 'price_range',
    title: range.label,
    subtitle: range.subtitle,
    minPrice: range.min,
    maxPrice: range.max,
    priceLabel: range.label,
    searchParams: {
      priceMin: range.min,
      priceMax: range.max,
      sortBy: 'popular',
      limit: 6,
    },
  };
}

/** Generate newest listings grid config */
export function createNewestGridConfig(): GridConfig {
  return {
    id: 'newest',
    type: 'newest',
    title: 'Just Listed',
    subtitle: 'Latest cars added to the marketplace',
    isRevvupBranded: true,
    searchParams: {
      sortBy: 'newest',
      limit: 6,
    },
  };
}

/** Generate popular listings grid config */
export function createPopularGridConfig(): GridConfig {
  return {
    id: 'popular',
    type: 'popular',
    title: 'Most Popular',
    subtitle: 'Top picks based on views & interest',
    isRevvupBranded: true,
    searchParams: {
      sortBy: 'popular',
      limit: 6,
    },
  };
}

/** Generate showroom showcase grid config */
export function createShowroomGridConfig(index: number = 0): ShowroomGridConfig {
  return {
    id: `showroom-showcase-${index}`,
    type: 'showroom',
    title: 'Showroom Spotlight',
    subtitle: 'Visit our premium showrooms',
    isRevvupBranded: true,
    showroomIndex: index,
  };
}

/** Generate hidden gems grid config (low mileage, good prices) */
export function createHiddenGemsGridConfig(): GridConfig {
  return {
    id: 'hidden-gems',
    type: 'hidden_gems',
    title: 'Hidden Gems',
    subtitle: 'Low mileage cars under 20,000 km',
    isRevvupBranded: true,
    searchParams: {
      mileageMax: 20000,
      sortBy: 'price_low',
      limit: 6,
    },
  };
}

// ============================================================================
// API FETCHING
// ============================================================================

/** Fetch listings for a grid config */
export async function fetchGridListings(config: AnyGridConfig): Promise<ListingCard[]> {
  if (!config.searchParams) return [];
  
  const cacheKey = `listings:${JSON.stringify(config.searchParams)}`;
  const cached = getCached<ListingCard[]>(cacheKey);
  if (cached) return cached;

  const existingRequest = inFlightListingRequests.get(cacheKey);
  if (existingRequest) return existingRequest;
  
  const request = (async () => {
    try {
      const response = await searchApi.search(config.searchParams);
      setCache(cacheKey, response.listings);
      return response.listings;
    } catch (error) {
      console.error(`[GridAPI] Failed to fetch listings for ${config.id}:`, error);
      return [];
    }
  })();

  inFlightListingRequests.set(cacheKey, request);

  try {
    return await request;
  } finally {
    inFlightListingRequests.delete(cacheKey);
  }
}

/** Fetch partner data */
export async function fetchPartners(): Promise<PartnerListItem[]> {
  const cacheKey = 'partners';
  const cached = getCached<PartnerListItem[]>(cacheKey);
  if (cached) return cached;

  const existingRequest = inFlightPartnersRequest.get(cacheKey);
  if (existingRequest) return existingRequest;
  
  const request = (async () => {
    try {
      const partners = await getPartnersList();
      setCache(cacheKey, partners);
      return partners;
    } catch (error) {
      console.error('[GridAPI] Failed to fetch partners:', error);
      return [];
    }
  })();

  inFlightPartnersRequest.set(cacheKey, request);

  try {
    return await request;
  } finally {
    inFlightPartnersRequest.delete(cacheKey);
  }
}

/** Fetch full grid data (config + data) */
export async function fetchGridData(config: AnyGridConfig): Promise<GridData> {
  // Check cache first
  const cacheKey = `grid:${config.type}:${(config as PartnerGridConfig).partnerId || ''}:${JSON.stringify(config.searchParams || {})}`;
  const cached = getCached<GridData>(cacheKey);
  if (cached) return cached;

  const existingRequest = inFlightGridDataRequests.get(cacheKey);
  if (existingRequest) return existingRequest;

  const request = (async () => {
    const result: GridData = {
      config,
      listings: [],
    };

    // Handle partner-specific grids
    if (config.type === 'founding') {
      const partners = await fetchPartners();
      // Sort by createdAt (oldest first = founding partners)
      result.partners = partners
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        .slice(0, 10);
      setCache(cacheKey, result);
      return result;
    }

    if (config.type === 'partner' && (config as PartnerGridConfig).partnerId) {
      const partnerId = (config as PartnerGridConfig).partnerId!;
      console.log('[fetchGridData] Fetching partner grid for partnerId:', partnerId);
      
      const partners = await fetchPartners();
      const partner = partners.find(p => p.id === partnerId);
      
      if (partner) {
        console.log('[fetchGridData] Found partner:', partner.brandName);
        result.partner = partner;
        
        // Fetch partner's listings using partnerId filter
        try {
          const response = await searchApi.search({
            partnerId: partnerId,
            partnerName: partner.brandName,
            sortBy: 'newest',
            limit: 6,
          });
          console.log('[fetchGridData] Partner listings fetched:', response.listings.length);
          result.listings = response.listings;
          result.total = response.meta.total;
          result.hasMore = response.meta.hasMore;
        } catch (err) {
          console.error('[fetchGridData] Failed to fetch partner listings:', err);
        }
      } else {
        console.log('[fetchGridData] Partner not found for id:', partnerId);
      }
      setCache(cacheKey, result);
      return result;
    }

    // Handle showroom grids - fetch showroom at specified index
    if (config.type === 'showroom') {
      const showroomIndex = (config as ShowroomGridConfig).showroomIndex || 0;
      try {
        // Fetch enough showrooms to get the one at index (page 1, limit = index + 1)
        const showroomData = await getShowroomsList(1, showroomIndex + 1);
        if (showroomData.showrooms.length > showroomIndex) {
          result.showroom = showroomData.showrooms[showroomIndex];
        }
      } catch (err) {
        console.error('[fetchGridData] Failed to fetch showroom:', err);
      }
      setCache(cacheKey, result);
      return result;
    }

    // Fetch listings for other grid types
    if (config.searchParams) {
      try {
        const response = await searchApi.search(config.searchParams);
        result.listings = response.listings;
        result.total = response.meta.total;
        result.hasMore = response.meta.hasMore;
      } catch (err) {
        console.error(`[fetchGridData] Failed to fetch listings for ${config.type}:`, err);
        // Return empty result instead of failing
        result.listings = [];
        result.total = 0;
        result.hasMore = false;
      }
    }

    setCache(cacheKey, result);
    return result;
  })();

  inFlightGridDataRequests.set(cacheKey, request);

  try {
    return await request;
  } finally {
    inFlightGridDataRequests.delete(cacheKey);
  }
}

/** Batch fetch multiple grids - continues even if some fail */
export async function fetchGridsBatch(configs: AnyGridConfig[]): Promise<GridData[]> {
  const results = await Promise.allSettled(configs.map(fetchGridData));
  
  return results.map((result, index) => {
    if (result.status === 'fulfilled') {
      return result.value;
    }
    
    // Return empty grid data for failed fetches
    console.error(`[fetchGridsBatch] Grid ${configs[index].id} failed:`, result.reason);
    return {
      config: configs[index],
      listings: [],
      total: 0,
      hasMore: false,
    };
  });
}

// ============================================================================
// DEFAULT GRID SEQUENCE
// ============================================================================

/**
 * Generate the default home feed grid sequence
 * Returns grid configs in display order
 */
export function generateHomeGridSequence(): AnyGridConfig[] {
  const sequence: AnyGridConfig[] = [];
  
  // 1. Showroom Spotlight (top priority)
  sequence.push(createShowroomGridConfig(0));
  
  // 2. BLK Signature Collection (premium)
  sequence.push(createBlkGridConfig());
  
  // 3. Founding Partners
  sequence.push(createFoundingPartnersGridConfig());
  
  // 4. Second showroom (index 1)
  sequence.push(createShowroomGridConfig(1));
  
  // 5. Discovery/Meaningful categories
  sequence.push(createNewestGridConfig()); // Just Listed - most important
  sequence.push(createPopularGridConfig()); // Most Popular
  
  // 6. Third showroom (index 2)
  sequence.push(createShowroomGridConfig(2));
  
  sequence.push(createHiddenGemsGridConfig()); // Hidden Gems
  
  // 7. Interleave make groups, body types, and price ranges
  const makeGroups: MakeGroupKey[] = ['german', 'japanese', 'italian', 'american', 'british', 'korean', 'electric'];
  const bodyTypes = BODY_TYPES.slice(0, 6); // First 6 body types
  const priceRanges: PriceRangeKey[] = ['luxury', 'premium', 'mid_range', 'affordable'];
  
  // Create interleaved sequence
  const maxLength = Math.max(makeGroups.length, bodyTypes.length, priceRanges.length);
  
  for (let i = 0; i < maxLength; i++) {
    // Add make group
    if (i < makeGroups.length) {
      sequence.push(createMakeGroupGridConfig(makeGroups[i]));
    }
    
    // Add body type category
    if (i < bodyTypes.length) {
      sequence.push(createCategoryGridConfig(
        'bodyType',
        bodyTypes[i].value,
        bodyTypes[i].label
      ));
    }
    
    // Add price range (every other iteration)
    if (i % 2 === 0 && i / 2 < priceRanges.length) {
      sequence.push(createPriceRangeGridConfig(priceRanges[Math.floor(i / 2)]));
    }
  }
  
  return sequence;
}

/**
 * Create a paginated grid sequence generator
 * Yields batches of grid configs for lazy loading
 */
export function* createGridBatchGenerator(batchSize: number = 4) {
  const allGrids = generateHomeGridSequence();
  let offset = 0;
  
  while (offset < allGrids.length) {
    yield allGrids.slice(offset, offset + batchSize);
    offset += batchSize;
  }
}

export default {
  fetchGridData,
  fetchGridListings,
  fetchPartners,
  fetchGridsBatch,
  generateHomeGridSequence,
  createGridBatchGenerator,
  clearGridCache,
  // Grid creators
  createBlkGridConfig,
  createCategoryGridConfig,
  createMakeGroupGridConfig,
  createPartnerGridConfig,
  createFoundingPartnersGridConfig,
  createPriceRangeGridConfig,
  createNewestGridConfig,
  createPopularGridConfig,
  createHiddenGemsGridConfig,
  createShowroomGridConfig,
};
