/**
 * API Client - Calls web API endpoints directly
 * 
 * Transforms web API response shape to mobile-friendly format.
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
// DETAILED LISTING TYPES
// ============================================================================

interface TechnicalFeatures {
  abs?: boolean;
  airbags?: number;
  parkingSensors?: boolean;
  rearCamera?: boolean;
  blindSpotMonitor?: boolean;
  laneAssist?: boolean;
  adaptiveCruise?: boolean;
  collisionWarning?: boolean;
  leatherSeats?: boolean;
  heatedSeats?: boolean;
  ventilatedSeats?: boolean;
  sunroof?: boolean;
  panoramicRoof?: boolean;
  climateControl?: boolean;
  powerSeats?: boolean;
  memorySeats?: boolean;
  touchscreen?: boolean;
  screenSize?: string;
  appleCarPlay?: boolean;
  androidAuto?: boolean;
  bluetooth?: boolean;
  navigation?: boolean;
  soundSystem?: string;
  wirelessCharging?: boolean;
  sportMode?: boolean;
  paddleShifters?: boolean;
  allWheelDrive?: boolean;
  adjustableSuspension?: boolean;
  launchControl?: boolean;
}

export interface SpecialNotes {
  ownerRemarks?: string[];
  serviceHistory?: boolean;
  singleOwner?: boolean;
  accidentFree?: boolean;
  underWarranty?: boolean;
  registeredUntil?: string;
  customizations?: string[];
  recentServices?: string[];
  knownIssues?: string[];
}

export interface ListingDetailedData {
  id: string;
  vin: string | null;
  slug: string | null;
  make: string;
  model: string;
  year: number;
  trim: string | null;
  condition: 'new' | 'used';
  description: string | null;
  price: number;
  currency: string;
  isNegotiable: boolean;
  viewCount: number;
  favouriteCount: number;
  superlikeCount: number;
  bodyType: string | null;
  fuelType: string | null;
  transmission: string | null;
  specs: string;
  steeringSide: string;
  engineSize: string | null;
  engineType: string | null;
  cylinders: number | null;
  powerRange: string | null;
  torque: string | null;
  fuelEconomy: string | null;
  doors: string | null;
  seatingCapacity: string | null;
  exteriorColor: string | null;
  interiorColor: string | null;
  mileage: number;
  emirate: string;
  city: string | null;
  thumbnail: string | null;
  images: string[];
  videoUrl: string | null;
  technicalFeatures: TechnicalFeatures;
  extras: string[];
  specialNotes: SpecialNotes;
  badges: string[];
  tags: string[];
  partnerId: string | null;
  partnerBrandName: string | null;
  partnerVerified: boolean;
  isBlkListing: boolean;
  // Timestamps
  createdAt: string;
  updatedAt?: string;
  lastEditedAt?: string | null;
  approvedAt?: string | null;
}

export interface SellerData {
  type: 'partner' | 'user';
  partnerId?: string;
  partner?: {
    id?: string;
    brandName: string | null;
    logo: string | null;
    heroImage?: string | null;
    isVerified: boolean;
    tier: string | null;
    description?: string | null;
    website?: string | null;
    phone?: string | null;
    email?: string | null;
    address?: string | null;
    city?: string | null;
    emirate?: string | null;
    locationLat?: number | null;
    locationLng?: number | null;
    badges?: string[];
    specialties?: string[];
    googleRating?: number | null;
    googleReviewCount?: number | null;
    platformRating?: number | null;
    platformReviewCount?: number | null;
  } | null;
  staffContact?: {
    phone?: string | null;
    displayName?: string | null;
  } | null;
  userId?: string;
  userProfile?: {
    displayName: string | null;
    firstName?: string | null;
    lastName?: string | null;
    avatarUrl: string | null;
    isKycVerified: boolean;
    description?: string | null;
    phone?: string | null;
    memberSince?: string | null;
    locationCity?: string | null;
    locationEmirate?: string | null;
    locationLat?: number | null;
    locationLng?: number | null;
    badges?: string[];
    tags?: string[];
    platformRating?: number | null;
    platformReviewCount?: number | null;
    emailVerified?: boolean;
    phoneVerified?: boolean;
  } | null;
}

export interface ListingDetailed {
  listing: ListingDetailedData;
  sellerData: SellerData;
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

  /**
   * Get detailed listing data
   * Calls: GET /api/listings/[id]/detailed
   */
  async getListingDetailed(id: string): Promise<ListingDetailed> {
    const url = `${API_BASE}/api/listings/${id}/detailed`;
    console.log('[API] Fetching detailed listing:', url);
    
    const response = await fetch(url);
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Listing not found');
      }
      throw new Error(`Failed to fetch listing: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Transform image URLs to absolute
    if (data.listing?.images) {
      data.listing.images = data.listing.images.map((img: string) => toAbsoluteUrl(img)).filter(Boolean);
    }
    if (data.listing?.thumbnail) {
      data.listing.thumbnail = toAbsoluteUrl(data.listing.thumbnail);
    }
    if (data.sellerData?.partner?.logo) {
      data.sellerData.partner.logo = toAbsoluteUrl(data.sellerData.partner.logo);
    }
    
    // Transform user profile from API format to mobile format
    if (data.sellerData?.type === 'user' && data.sellerData.userProfile) {
      const p = data.sellerData.userProfile;
      data.sellerData.userProfile = {
        displayName: p.userName ?? ([p.firstName, p.lastName].filter(Boolean).join(' ') || null),
        firstName: p.firstName ?? null,
        lastName: p.lastName ?? null,
        avatarUrl: toAbsoluteUrl(p.avatar),
        isKycVerified: p.kycVerified ?? false,
        description: p.description ?? null,
        phone: p.phone ?? null,
        memberSince: p.memberSince ?? null,
        locationCity: p.locationCity ?? null,
        locationEmirate: p.locationEmirate ?? null,
        locationLat: p.locationLat ?? null,
        locationLng: p.locationLng ?? null,
        badges: p.badges ?? [],
        tags: p.tags ?? [],
        platformRating: p.platformRating ?? null,
        platformReviewCount: p.platformReviewCount ?? 0,
        emailVerified: p.emailVerified ?? false,
        phoneVerified: p.phoneNumberVerified ?? false,
      };
    }
    
    return data;
  },
};

export default api;
