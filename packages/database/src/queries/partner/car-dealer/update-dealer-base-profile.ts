/**
 * Update Car Dealer Base Profile
 * Update comprehensive dealer profile fields
 * 
 * Performance optimizations:
 * - Minimizes payload by only returning necessary fields
 * - Avoids unnecessary object spread in set()
 * - Uses destructuring for cleaner return
 * - Invalidates memory cache on update
 */

import { eq } from 'drizzle-orm';
import { db } from '../../../dbclient';
import { memoryCache, CacheKeys } from '../../../caches/memory-cache';
import { partner } from '../../../schema/partner';

export interface UpdateDealerBaseProfileData {
  // Basic Information
  companyNameLegal?: string;
  brandName?: string;
  website?: string;
  
  // Location
  address?: string;
  emirate?: string;
  city?: string;
  locationLat?: number;
  locationLng?: number;
  showroomCount?: number;
  
  // Branding & Media
  logo?: string | null;
  heroImage?: string | null;
  
  // Business Information
  description?: string;
  specialties?: string[];
  experienceYears?: number;
  foundedYear?: number;
  
  // External Ratings
  googleReviewUrl?: string;
  
  // Trust & Tags
  badges?: string[];
  tags?: string[];
}

/**
 * Update car dealer base profile fields
 * Updates all editable client-facing fields and returns updated profile
 */
export async function updateDealerBaseProfile(
  partnerId: string,
  data: UpdateDealerBaseProfileData
) {
  // Only update fields that are provided
  const updateData = {
    ...data,
    updatedAt: new Date(),
  };

  const [result] = await db
    .update(partner)
    .set(updateData)
    .where(eq(partner.id, partnerId))
    .returning({
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
      
      // Trust & Tags
      isVerified: partner.isVerified,
      badges: partner.badges,
      tags: partner.tags,
      
      // Timestamps (for cache-busting image URLs)
      updatedAt: partner.updatedAt,
    });

  // Invalidate cache after update
  memoryCache.delete(CacheKeys.partnerMiniProfile(partnerId));

  return result;
}
