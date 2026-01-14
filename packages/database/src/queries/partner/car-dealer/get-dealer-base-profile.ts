/**
 * Get Car Dealer Base Profile
 * Comprehensive query for dealer profile cards and detailed previews
 * 
 * Performance optimizations:
 * - Uses select() instead of query API for better performance
 * - Minimal normalization (arrays only) - string trimming done at write time
 * - No redundant spreads or transformations
 * - Memory cache with 5 min TTL (invalidated on profile updates)
 */

import { eq } from 'drizzle-orm';
import { db } from '../../../dbclient';
import { memoryCache, CacheKeys, CacheTTL } from '../../../caches/memory-cache';
import { partner } from '../../../schema/partner';

/**
 * Car Dealer Base Profile - For listing cards/profile preview
 * Returns all essential dealer info (30+ fields)
 * Cached for 5 min - invalidated on profile updates
 */
export type DealerBaseProfile = {
  id: string;
  companyNameLegal: string;
  brandName: string;
  tradeLicense: string;
  status: string;
  tier: string;
  email: string;
  phone: string;
  website: string | null;
  address: string | null;
  emirate: string | null;
  city: string | null;
  locationLat: number | null;
  locationLng: number | null;
  showroomCount: number;
  logo: string | null;
  heroImage: string | null;
  description: string | null;
  specialties: string[];
  experienceYears: number | null;
  foundedYear: number | null;
  googleReviewUrl: string | null;
  googlePlaceId: string | null;
  googleReviewsSyncedAt: Date | null;
  googleRating: number | null;
  googleReviewCount: number | null;
  platformRating: number | null;
  platformReviewCount: number | null;
  isVerified: boolean;
  badges: string[];
  tags: string[];
  updatedAt: Date | null; // Used for cache-busting image URLs
};

export async function getDealerBaseProfile(partnerId: string, skipCache = false): Promise<DealerBaseProfile | null> {
  const cacheKey = CacheKeys.dealerBaseProfile(partnerId);
  
  // Check cache first
  if (!skipCache) {
    const cached = memoryCache.get<DealerBaseProfile>(cacheKey);
    if (cached) {
      return cached;
    }
  }

  // Use select() for better performance - only fetches specified columns
  const [result] = await db
    .select({
      // Identity & Legal
      id: partner.id,
      companyNameLegal: partner.companyNameLegal,
      brandName: partner.brandName,
      tradeLicense: partner.tradeLicense,
      
      // Status & Tier
      status: partner.status,
      tier: partner.tier,
      
      // Contact & Location
      email: partner.email,
      phone: partner.phone,
      website: partner.website,
      address: partner.address,
      emirate: partner.emirate,
      city: partner.city,
      locationLat: partner.locationLat,
      locationLng: partner.locationLng,
      showroomCount: partner.showroomCount,
      
      // Branding & Media
      logo: partner.logo,
      heroImage: partner.heroImage,
      
      // Business Information
      description: partner.description,
      specialties: partner.specialties,
      experienceYears: partner.experienceYears,
      foundedYear: partner.foundedYear,
      
      // External Ratings
      googleReviewUrl: partner.googleReviewUrl,
      googlePlaceId: partner.googlePlaceId,
      googleReviewsSyncedAt: partner.googleReviewsSyncedAt,
      googleRating: partner.googleRating,
      googleReviewCount: partner.googleReviewCount,
      
      // Platform Performance
      platformRating: partner.platformRating,
      platformReviewCount: partner.platformReviewCount,
      
      // Trust & Tags
      isVerified: partner.isVerified,
      badges: partner.badges,
      tags: partner.tags,
      
      // Timestamps (for cache-busting image URLs)
      updatedAt: partner.updatedAt,
    })
    .from(partner)
    .where(eq(partner.id, partnerId))
    .limit(1);

  if (!result) return null;

  // Minimal normalization - mutate in place to avoid object spread overhead
  // Arrays: schema has default([]) but not notNull(), so provide fallback
  const profile: DealerBaseProfile = {
    ...result,
    specialties: result.specialties ?? [],
    badges: result.badges ?? [],
    tags: result.tags ?? [],
  };

  // Store in cache (5 min TTL - invalidated on profile updates)
  memoryCache.set(cacheKey, profile, CacheTTL.dealerBaseProfile);

  return profile;
}
