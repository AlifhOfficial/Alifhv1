/**
 * Get Car Dealer Base Profile
 * Comprehensive query for dealer profile cards and detailed previews
 * 
 * Performance optimizations:
 * - Uses select() instead of query API for better performance
 * - Minimizes data normalization overhead
 * - Reduces object spread operations
 * - Memory cache with 60s TTL (matches API revalidate time)
 */

import { eq } from 'drizzle-orm';
import { db } from '../../../dbclient';
import { memoryCache, CacheKeys, CacheTTL } from '../../../caches/memory-cache';
import { partner } from '../../../schema/partner';

/**
 * Car Dealer Base Profile - For listing cards/profile preview
 * Returns all essential dealer info (30+ fields)
 * Cached for 60s to reduce database load
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
  googleRating: number | null;
  googleReviewCount: number | null;
  platformRating: number | null;
  platformReviewCount: number | null;
  isVerified: boolean;
  badges: string[];
  tags: string[];
  updatedAt: Date | null; // Used for cache-busting image URLs
};

export async function getDealerBaseProfile(partnerId: string): Promise<DealerBaseProfile | null> {
  const cacheKey = CacheKeys.partnerMiniProfile(partnerId);
  
  // Check cache first
  const cached = memoryCache.get<DealerBaseProfile>(cacheKey);
  if (cached) {
    console.log(`[getDealerBaseProfile] Cache HIT for ${partnerId.slice(0, 8)}...`);
    return cached;
  }

  // Use select() for better performance - only fetches specified columns
  const queryStart = performance.now();
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
  
  const queryTime = performance.now() - queryStart;
  console.log(`[getDealerBaseProfile] Cache MISS for ${partnerId.slice(0, 8)}... - DB query: ${queryTime.toFixed(2)}ms`);

  if (!result) return null;

  // Minimal normalization - only handle essential transformations
  const normalized: DealerBaseProfile = {
    ...result,
    // String normalization - only if values exist
    website: result.website?.trim() || null,
    address: result.address?.trim() || null,
    logo: result.logo?.trim() || null,
    heroImage: result.heroImage?.trim() || null,
    description: result.description?.trim() || null,
    googleReviewUrl: result.googleReviewUrl?.trim() || null,
    
    // Numeric normalization
    locationLat: result.locationLat === 0 ? null : result.locationLat,
    locationLng: result.locationLng === 0 ? null : result.locationLng,
    experienceYears: result.experienceYears === 0 ? null : result.experienceYears,
    showroomCount: result.showroomCount || 1,
    
    // Array normalization - ensure arrays (PostgreSQL should handle this)
    specialties: result.specialties || [],
    badges: result.badges || [],
    tags: result.tags || [],
  };

  // Store in cache (60s TTL matches API revalidate)
  memoryCache.set(cacheKey, normalized, CacheTTL.partnerMiniProfile);

  return normalized;
}
