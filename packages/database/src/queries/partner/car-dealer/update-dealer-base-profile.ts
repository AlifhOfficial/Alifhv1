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
import { invalidateUserSessions } from '../../../caches/memory-cache';
import { invalidateDealerBaseProfile, invalidatePartnerListingsInSearch } from '../../../caches/invalidation';
import { partner } from '../../../schema/partner';
import { partnerStaff } from '../../../schema/partner';

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
  googlePlaceId?: string | null;
  
  // Trust & Tags
  badges?: string[];
  tags?: string[];
}

/**
 * Update car dealer base profile fields
 * Updates all editable client-facing fields and returns updated profile
 * Trims string fields at write time to ensure clean data storage
 * Only updates fields that are explicitly provided (not undefined)
 */
export async function updateDealerBaseProfile(
  partnerId: string,
  data: UpdateDealerBaseProfileData
) {
  // Build update object with only provided fields
  // This prevents undefined fields from overwriting existing data
  const updateData: Record<string, unknown> = {
    updatedAt: new Date(),
  };
  
  // Only include fields that were explicitly provided
  if (data.companyNameLegal !== undefined) updateData.companyNameLegal = data.companyNameLegal;
  if (data.brandName !== undefined) updateData.brandName = data.brandName;
  if (data.website !== undefined) updateData.website = data.website?.trim() || null;
  if (data.address !== undefined) updateData.address = data.address?.trim() || null;
  if (data.emirate !== undefined) updateData.emirate = data.emirate;
  if (data.city !== undefined) updateData.city = data.city;
  if (data.locationLat !== undefined) updateData.locationLat = data.locationLat;
  if (data.locationLng !== undefined) updateData.locationLng = data.locationLng;
  if (data.showroomCount !== undefined) updateData.showroomCount = data.showroomCount;
  if (data.logo !== undefined) updateData.logo = data.logo?.trim() || null;
  if (data.heroImage !== undefined) updateData.heroImage = data.heroImage?.trim() || null;
  if (data.description !== undefined) updateData.description = data.description?.trim() || null;
  if (data.specialties !== undefined) updateData.specialties = data.specialties;
  if (data.experienceYears !== undefined) updateData.experienceYears = data.experienceYears;
  if (data.foundedYear !== undefined) updateData.foundedYear = data.foundedYear;
  if (data.googleReviewUrl !== undefined) updateData.googleReviewUrl = data.googleReviewUrl?.trim() || null;
  if (data.googlePlaceId !== undefined) updateData.googlePlaceId = data.googlePlaceId;
  if (data.badges !== undefined) updateData.badges = data.badges;
  if (data.tags !== undefined) updateData.tags = data.tags;

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
      googlePlaceId: partner.googlePlaceId,
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

  // Invalidate dealer profile cache after update
  invalidateDealerBaseProfile(partnerId);
  
  // Invalidate search caches when partner-visible fields change
  // This ensures car cards show updated partner logo/name
  if (data.brandName !== undefined || data.logo !== undefined) {
    invalidatePartnerListingsInSearch(partnerId);
  }
  
  // Invalidate session cache for all staff if brand-related fields changed
  if (data.brandName || data.logo) {
    const staff = await db.query.partnerStaff.findMany({
      where: eq(partnerStaff.partnerId, partnerId),
      columns: { userId: true },
    });
    for (const s of staff) {
      invalidateUserSessions(s.userId);
    }
  }

  return result;
}
