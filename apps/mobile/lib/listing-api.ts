/**
 * Listing API Client - Mobile
 * 
 * Handles detailed listing data fetching.
 * Single source of truth for listing detail types and API calls.
 */

import { API_BASE, CDN_BASE } from './config';

// ============================================================================
// TECHNICAL FEATURES
// ============================================================================

export interface TechnicalFeatures {
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
  userId: string;
  vin: string | null;
  vinVisibility: 'public' | 'private';
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
  // Visibility
  isPublic: boolean;
  // Timestamps
  createdAt: string;
  updatedAt?: string;
  lastEditedAt?: string | null;
  approvedAt?: string | null;
  publishedAt?: string | null;
  originalPublishedAt?: string | null;
}

export interface SellerData {
  type: 'partner' | 'user';
  partnerId?: string;
  userId?: string;
  partner?: PartnerData | null;
  staffContact?: {
    phone?: string | null;
    displayName?: string | null;
  } | null;
  userProfile?: UserSellerProfile | null;
}

export interface PartnerData {
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
}

export interface UserSellerProfile {
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
}

export interface ListingDetailed {
  listing: ListingDetailedData;
  sellerData: SellerData;
  /** True if admin is viewing a non-public listing (mobile users won't see this, but kept for type safety) */
  isAdminPreview?: boolean;
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

// ============================================================================
// API METHODS
// ============================================================================

/**
 * Get detailed listing data
 * Calls: GET /api/listings/[id]/detailed
 */
export async function getListingDetailed(id: string): Promise<ListingDetailed> {
  const url = `${API_BASE}/api/listings/${id}/detailed`;
  console.log('[ListingAPI] Fetching detailed listing:', id);
  
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
    data.listing.images = data.listing.images
      .map((img: string) => toAbsoluteUrl(img))
      .filter(Boolean);
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
      locationCity: null,
      locationEmirate: null,
      badges: p.badges ?? [],
      tags: p.tags ?? [],
      platformRating: p.platformRating ?? null,
      platformReviewCount: null,
      emailVerified: p.emailVerified ?? false,
      phoneVerified: p.phoneNumberVerified ?? false,
    };
  }
  
  return data;
}

/**
 * Get listing basic info (for cards, previews)
 * Calls: GET /api/listings/[id]
 */
export async function getListingBasic(id: string): Promise<ListingDetailedData> {
  const url = `${API_BASE}/api/listings/${id}`;
  console.log('[ListingAPI] Fetching basic listing:', id);
  
  const response = await fetch(url);
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Listing not found');
    }
    throw new Error(`Failed to fetch listing: ${response.status}`);
  }
  
  const data = await response.json();
  
  // Transform URLs
  if (data.thumbnail) {
    data.thumbnail = toAbsoluteUrl(data.thumbnail);
  }
  if (data.images) {
    data.images = data.images.map((img: string) => toAbsoluteUrl(img)).filter(Boolean);
  }
  
  return data;
}

// Session-level dedup for views (prevents re-tracking on re-renders/remounts)
const sessionTrackedViews = new Set<string>();

/**
 * Track a listing view (fire-and-forget)
 * Calls: POST /api/listings/[id]/view
 */
export async function trackView(listingId: string): Promise<void> {
  // Skip if already tracked this session
  if (sessionTrackedViews.has(listingId)) {
    return;
  }

  // Mark as tracked immediately
  sessionTrackedViews.add(listingId);

  // Fire-and-forget - don't await, don't handle errors
  fetch(`${API_BASE}/api/listings/${listingId}/view`, {
    method: 'POST',
    credentials: 'include',
  }).catch(() => {
    // Silent fail - view tracking is non-critical
  });
}

export const listingApi = {
  getDetailed: getListingDetailed,
  getBasic: getListingBasic,
  trackView,
};

export default listingApi;
