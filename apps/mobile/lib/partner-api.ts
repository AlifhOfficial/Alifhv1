/**
 * Partner API Client - Mobile
 * 
 * Handles partner/dealer listing and browsing.
 * Used for displaying partner directories and profiles.
 */

import { API_BASE, CDN_BASE } from './config';

// ============================================================================
// TYPES
// ============================================================================

export interface PartnerListItem {
  id: string;
  slug: string;
  brandName: string;
  companyNameLegal: string;
  logo: string | null;
  logoUrl: string | null;
  heroImage: string | null;
  heroImageUrl: string | null;
  tier: string;
  partnerType: string;
  isVerified: boolean;
  emirate: string | null;
  city: string | null;
  locationLat: number | null;
  locationLng: number | null;
  description: string | null;
  specialties: string[];
  googleRating: number | null;
  googleReviewCount: number | null;
  platformRating: number | null;
  platformReviewCount: number | null;
  badges: string[];
  activeListingsCount: number;
  experienceYears: number | null;
  foundedYear: number | null;
  createdAt: string;
}

export interface PartnersListResponse {
  partners: PartnerListItem[];
}

// ============================================================================
// HELPERS
// ============================================================================

/** Convert relative path to absolute CDN URL */
function toAbsoluteUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${CDN_BASE}/${path}`;
}

/**
 * Normalize partner image URLs to absolute paths
 */
function normalizePartnerImages(partner: PartnerListItem): PartnerListItem {
  return {
    ...partner,
    logoUrl: partner.logoUrl ? toAbsoluteUrl(partner.logoUrl) : toAbsoluteUrl(partner.logo),
    heroImageUrl: partner.heroImageUrl ? toAbsoluteUrl(partner.heroImageUrl) : toAbsoluteUrl(partner.heroImage),
  };
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Fetch up to 50 partners ordered by join date (oldest first)
 * Calls: GET /api/partner/list
 */
export async function getPartnersList(): Promise<PartnerListItem[]> {
  const url = `${API_BASE}/api/partner/list`;
  console.log('[PartnerAPI] Fetching partners list');

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch partners: ${response.status}`);
  }

  const data: PartnersListResponse = await response.json();

  // Normalize image URLs
  return data.partners.map(normalizePartnerImages);
}
