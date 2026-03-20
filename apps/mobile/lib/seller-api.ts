/**
 * Seller API Client - Mobile
 * 
 * Handles seller data, contact actions, and related operations.
 * Separated for clean concerns and reusability.
 */

import { API_BASE, getAppImageUrl } from './config';
import { getStoredSession } from './auth-api';

// ============================================================================
// TYPES
// ============================================================================

export interface PartnerProfile {
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
  memberSince?: string | null;
  totalListings?: number;
  activeListings?: number;
}

export interface PrivateSellerProfile {
  id?: string;
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
  totalListings?: number;
  activeListings?: number;
}

export interface SellerInfo {
  type: 'partner' | 'user';
  // Normalized fields for easy access
  id: string;
  name: string;
  avatar: string | null;
  heroImage: string | null;
  isVerified: boolean;
  isDealer: boolean;
  tier: string | null;
  phone: string | null;
  contactName: string | null;
  location: string;
  city: string | null;
  emirate: string | null;
  lat: number | null;
  lng: number | null;
  rating: number | null;
  reviewCount: number | null;
  badges: string[];
  specialties: string[];
  tags: string[];  // User tags (interests, preferences)
  description: string | null;
  website: string | null;
  memberSince: string | null;
  emailVerified: boolean;  // Email verification status
  phoneVerified: boolean;  // Phone verification status
  totalListings?: number;
  activeListings?: number;
  // Raw data for full access
  partner?: PartnerProfile | null;
  userProfile?: PrivateSellerProfile | null;
  staffContact?: {
    phone?: string | null;
    displayName?: string | null;
  } | null;
}

export interface SellerListingsResponse {
  listings: SellerListingCard[];
  meta: {
    total: number;
    limit: number;
    page: number;
    hasMore: boolean;
  };
}

export interface SellerListingCard {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  thumbnail: string | null;
  isBlkListing: boolean;
}

// ============================================================================
// HELPERS
// ============================================================================

/** Convert relative path to absolute URL */
function toAbsoluteUrl(path: string | null | undefined): string | null {
  return getAppImageUrl(path);
}

/**
 * Normalize seller data from API into a consistent SellerInfo shape
 */
export function normalizeSellerData(sellerData: {
  type: 'partner' | 'user';
  partnerId?: string;
  userId?: string;
  partner?: PartnerProfile | null;
  staffContact?: { phone?: string | null; displayName?: string | null } | null;
  userProfile?: PrivateSellerProfile | null;
}): SellerInfo {
  if (sellerData.type === 'partner' && sellerData.partner) {
    const p = sellerData.partner;
    return {
      type: 'partner',
      id: sellerData.partnerId || p.id || '',
      name: p.brandName ?? 'Dealer',
      avatar: toAbsoluteUrl(p.logo),
      heroImage: toAbsoluteUrl(p.heroImage),
      isVerified: p.isVerified,
      isDealer: true,
      tier: p.tier,
      phone: sellerData.staffContact?.phone ?? p.phone ?? null,
      contactName: sellerData.staffContact?.displayName ?? null,
      location: [p.address, p.city, p.emirate].filter(Boolean).join(', '),
      city: p.city ?? null,
      emirate: p.emirate ?? null,
      lat: p.locationLat ?? null,
      lng: p.locationLng ?? null,
      rating: p.googleRating ?? p.platformRating ?? null,
      reviewCount: p.googleReviewCount ?? p.platformReviewCount ?? null,
      badges: p.badges ?? [],
      specialties: p.specialties ?? [],
      tags: [],  // Partners don't have tags
      description: p.description ?? null,
      website: p.website ?? null,
      memberSince: p.memberSince ?? null,
      emailVerified: true,  // Partners are always verified
      phoneVerified: true,  // Partners are always verified
      totalListings: p.totalListings,
      activeListings: p.activeListings,
      partner: p,
      staffContact: sellerData.staffContact,
    };
  }

  const u = sellerData.userProfile;
  return {
    type: 'user',
    id: sellerData.userId || u?.id || '',
    name: u?.displayName ?? 'Private Seller',
    avatar: toAbsoluteUrl(u?.avatarUrl),
    heroImage: null,  // Users don't have hero images
    isVerified: u?.isKycVerified ?? false,
    isDealer: false,
    tier: null,
    phone: u?.phone ?? null,
    contactName: null,
    location: [u?.locationCity, u?.locationEmirate].filter(Boolean).join(', '),
    city: u?.locationCity ?? null,
    emirate: u?.locationEmirate ?? null,
    lat: u?.locationLat ?? null,
    lng: u?.locationLng ?? null,
    rating: u?.platformRating ?? null,
    reviewCount: u?.platformReviewCount ?? null,
    badges: u?.badges ?? [],
    specialties: [],
    tags: u?.tags ?? [],
    description: u?.description ?? null,
    website: null,
    memberSince: u?.memberSince ?? null,
    emailVerified: u?.emailVerified ?? false,
    phoneVerified: u?.phoneVerified ?? false,
    totalListings: u?.totalListings,
    activeListings: u?.activeListings,
    userProfile: u ?? null,
  };
}

// ============================================================================
// API METHODS
// ============================================================================

/**
 * Get partner profile by ID
 * Calls: GET /api/partners/[id]
 */
export async function getPartnerProfile(partnerId: string): Promise<PartnerProfile> {
  const url = `${API_BASE}/api/partners/${partnerId}`;
  console.log('[SellerAPI] Fetching partner:', partnerId);
  
  const response = await fetch(url);
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Partner not found');
    }
    throw new Error(`Failed to fetch partner: ${response.status}`);
  }
  
  const data = await response.json();
  
  // Transform URLs
  if (data.logo) data.logo = toAbsoluteUrl(data.logo);
  if (data.heroImage) data.heroImage = toAbsoluteUrl(data.heroImage);
  
  return data;
}

/**
 * Get user seller profile by ID
 * Calls: GET /api/users/[id]/public-profile
 */
export async function getUserSellerProfile(userId: string): Promise<PrivateSellerProfile> {
  const url = `${API_BASE}/api/users/${userId}/public-profile`;
  console.log('[SellerAPI] Fetching user profile:', userId);
  
  const response = await fetch(url);
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('User not found');
    }
    throw new Error(`Failed to fetch user: ${response.status}`);
  }
  
  const data = await response.json();
  
  // Transform from API format (kycVerified, avatar) to mobile format (isKycVerified, avatarUrl)
  return {
    id: data.id ?? data.userId,
    displayName: data.userName ?? ([data.firstName, data.lastName].filter(Boolean).join(' ') || null),
    firstName: data.firstName ?? null,
    lastName: data.lastName ?? null,
    avatarUrl: toAbsoluteUrl(data.avatar),
    isKycVerified: data.kycVerified ?? false,
    description: data.description ?? null,
    phone: data.phone ?? null,
    memberSince: data.memberSince ?? null,
    locationCity: null,
    locationEmirate: null,
    badges: data.badges ?? [],
    tags: data.tags ?? [],
    platformRating: data.platformRating ?? null,
    platformReviewCount: null,
    emailVerified: data.emailVerified ?? false,
    phoneVerified: data.phoneNumberVerified ?? false,
    totalListings: data.totalListings,
    activeListings: data.activeListings,
  };
}

/**
 * Get seller's other listings
 * Calls: GET /api/listings/search with sellerId filter
 */
export async function getSellerListings(
  sellerId: string,
  sellerType: 'partner' | 'user',
  options: { limit?: number; page?: number; excludeListingId?: string } = {}
): Promise<SellerListingsResponse> {
  const { limit = 6, page = 1, excludeListingId } = options;
  const offset = (page - 1) * limit;
  
  const params = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
  });
  
  if (sellerType === 'partner') {
    params.set('partnerId', sellerId);
  } else {
    params.set('sellerId', sellerId);
  }
  
  if (excludeListingId) {
    params.set('exclude', excludeListingId);
  }
  
  const url = `${API_BASE}/api/listings/search?${params}`;
  console.log('[SellerAPI] Fetching seller listings:', sellerId);
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch seller listings: ${response.status}`);
  }
  
  const data = await response.json();
  
  return {
    listings: (data.data || []).map((item: any) => ({
      id: item.id,
      make: item.make || 'Unknown',
      model: item.model || 'Unknown',
      year: item.year || 0,
      price: item.price || 0,
      mileage: item.mileage || 0,
      thumbnail: toAbsoluteUrl(item.thumbnail),
      isBlkListing: item.isBlkListing || false,
    })),
    meta: {
      total: data.meta?.total ?? (data.data?.length || 0),
      limit,
      page,
      hasMore: data.meta?.hasMore || false,
    },
  };
}

/**
 * Report a seller
 * Calls: POST /api/reports/seller
 */
export async function reportSeller(
  sellerId: string,
  sellerType: 'partner' | 'user',
  reason: string,
  details?: string
): Promise<{ success: boolean }> {
  const session = await getStoredSession();
  if (!session?.token) {
    throw new Error('Authentication required');
  }
  
  const url = `${API_BASE}/api/reports/seller`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.token}`,
    },
    body: JSON.stringify({
      sellerId,
      sellerType,
      reason,
      details,
    }),
  });
  
  if (!response.ok) {
    throw new Error(`Failed to report seller: ${response.status}`);
  }
  
  return { success: true };
}

export const sellerApi = {
  getPartnerProfile,
  getUserSellerProfile,
  getSellerListings,
  reportSeller,
  normalizeSellerData,
};

export default sellerApi;
