/**
 * Get Partner Mini Profile
 * Comprehensive query for partner profile cards and detailed previews
 * 
 * Performance optimizations:
 * - Uses select() instead of query API for better performance
 * - Minimizes data normalization overhead
 * - Reduces object spread operations
 * - Memory cache with 60s TTL (matches API revalidate time)
 */

import { eq } from 'drizzle-orm';
import { db } from '../../dbclient';
import { memoryCache, CacheKeys, CacheTTL } from '../../caches/memory-cache';
import { partner } from '../../schema/partner';

/**
 * Mini Partner Profile - For listing cards/profile preview
 * Returns all essential partner info (30 fields)
 * Cached for 60s to reduce database load
 */
export async function getPartnerMiniProfile(partnerId: string) {
  const cacheKey = CacheKeys.partnerMiniProfile(partnerId);
  
  // Check cache first
  const cached = memoryCache.get(cacheKey);
  if (cached) {
    return cached;
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
      
      // Inventory
      totalInventory: partner.totalInventory,
      activeListings: partner.activeListings,
      
      // Response Metrics
      avgResponseTime: partner.avgResponseTime,
      responseRate: partner.responseRate,
      
      // Trust & Tags
      isVerified: partner.isVerified,
      badges: partner.badges,
      tags: partner.tags,
    })
    .from(partner)
    .where(eq(partner.id, partnerId))
    .limit(1);

  if (!result) return null;

  // Minimal normalization - only handle essential transformations
  // Early returns reduce unnecessary processing
  const normalized: typeof result = {
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
