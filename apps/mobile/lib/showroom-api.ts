/**
 * Showroom API Client - Mobile
 * 
 * Handles showroom listing for Black tier directory.
 * Used for displaying showroom showcases in home feed.
 */

import { API_BASE, CDN_BASE } from './config';

// ============================================================================
// TYPES
// ============================================================================

export interface ShowroomPartner {
  brandName: string;
  logoUrl: string | null;
  heroImageUrl: string | null;
  isVerified: boolean;
  tier: string;
  googleRating: number | null;
  googleReviewCount: number;
  city: string | null;
  emirate: string | null;
}

export interface ShowroomCardData {
  id: string;
  partnerId: string;
  slug: string | null;
  heroVideoUrl: string | null;
  heroVideoFileUrl: string | null;
  heroImageUrl: string | null;
  heroTagline: string | null;
  partner: ShowroomPartner;
  totalCarsSold: number | null;
  yearsInBusiness: number | null;
  publishedAt: string | null;
}

export interface ShowroomListResponse {
  showrooms: ShowroomCardData[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

// ============================================================================
// HELPERS
// ============================================================================

/** Convert relative path to absolute CDN URL */
function toAbsoluteUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${CDN_BASE}/${url}`;
}

/**
 * Normalize showroom URLs to absolute paths
 */
function normalizeShowroomUrls(showroom: ShowroomCardData): ShowroomCardData {
  return {
    ...showroom,
    heroVideoUrl: toAbsoluteUrl(showroom.heroVideoUrl),
    heroVideoFileUrl: toAbsoluteUrl(showroom.heroVideoFileUrl),
    heroImageUrl: toAbsoluteUrl(showroom.heroImageUrl),
    partner: {
      ...showroom.partner,
      logoUrl: toAbsoluteUrl(showroom.partner.logoUrl),
      heroImageUrl: toAbsoluteUrl(showroom.partner.heroImageUrl),
    },
  };
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Fetch published showrooms for directory/showcase
 * Calls: GET /api/showroom
 */
export async function getShowroomsList(page = 1, limit = 10): Promise<ShowroomListResponse> {
  const url = `${API_BASE}/api/showroom?page=${page}&limit=${limit}`;
  console.log('[ShowroomAPI] Fetching showrooms list');

  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data: ShowroomListResponse = await response.json();
    
    // Normalize URLs
    return {
      ...data,
      showrooms: data.showrooms.map(normalizeShowroomUrls),
    };
  } catch (error) {
    console.error('[ShowroomAPI] Failed to fetch showrooms:', error);
    throw error;
  }
}

/**
 * Fetch a single showroom by partnerId or slug
 * Calls: GET /api/showroom/[partnerId]
 */
export async function getShowroom(partnerIdOrSlug: string): Promise<ShowroomCardData | null> {
  const url = `${API_BASE}/api/showroom/${partnerIdOrSlug}`;
  console.log('[ShowroomAPI] Fetching showroom:', partnerIdOrSlug);

  try {
    const response = await fetch(url);
    
    if (response.status === 404) {
      return null;
    }
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    return normalizeShowroomUrls(data.showroom);
  } catch (error) {
    console.error('[ShowroomAPI] Failed to fetch showroom:', error);
    throw error;
  }
}
