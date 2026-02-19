/**
 * Get Partners List
 * Public query to fetch up to 50 partners ordered by join date (oldest first)
 * 
 * Used by: /api/partner/list (public endpoint for mobile & web)
 * 
 * Performance optimizations:
 * - Select only needed columns (no heavy JSONB fields)
 * - Ordered by createdAt ASC (first partner joined = first in list)
 * 
 * @module queries/partner/car-dealer/get-partners-list
 */

import { eq, asc } from 'drizzle-orm';
import { db } from '../../../dbclient';
import { partner } from '../../../schema/partner';

// ============================================================================
// Types
// ============================================================================

export interface PartnerListItem {
  id: string;
  slug: string;
  brandName: string;
  companyNameLegal: string;
  logo: string | null;
  heroImage: string | null;
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
  createdAt: Date;
}

// ============================================================================
// Query
// ============================================================================

/**
 * Fetch up to 50 active partners ordered by join date (oldest first)
 * Only returns partners with status = 'active'
 */
export async function getPartnersList(): Promise<PartnerListItem[]> {
  const results = await db
    .select({
      id: partner.id,
      slug: partner.slug,
      brandName: partner.brandName,
      companyNameLegal: partner.companyNameLegal,
      logo: partner.logo,
      heroImage: partner.heroImage,
      tier: partner.tier,
      partnerType: partner.partnerType,
      isVerified: partner.isVerified,
      emirate: partner.emirate,
      city: partner.city,
      locationLat: partner.locationLat,
      locationLng: partner.locationLng,
      description: partner.description,
      specialties: partner.specialties,
      googleRating: partner.googleRating,
      googleReviewCount: partner.googleReviewCount,
      platformRating: partner.platformRating,
      platformReviewCount: partner.platformReviewCount,
      badges: partner.badges,
      activeListingsCount: partner.activeListingsCount,
      experienceYears: partner.experienceYears,
      foundedYear: partner.foundedYear,
      createdAt: partner.createdAt,
    })
    .from(partner)
    .where(eq(partner.status, 'active'))
    .orderBy(asc(partner.createdAt))
    .limit(50);

  // Normalize JSONB fields
  const normalized: PartnerListItem[] = results.map((r) => ({
    ...r,
    specialties: (r.specialties as string[] | null) ?? [],
    badges: (r.badges as string[] | null) ?? [],
  }));

  return normalized;
}
