/**
 * Update Partner Mini Profile
 * Update comprehensive partner profile fields
 */

import { eq } from 'drizzle-orm';
import { db } from '../../dbclient';
import { partner } from '../../schema/partner';

export interface UpdatePartnerMiniProfileData {
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
  logo?: string;
  heroImage?: string;
  
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
 * Update partner mini profile fields
 * Updates all editable client-facing fields
 */
export async function updatePartnerMiniProfile(
  partnerId: string,
  data: UpdatePartnerMiniProfileData
) {
  const result = await db
    .update(partner)
    .set({
      ...data,
      updatedAt: new Date(),
    })
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
    });

  return result[0];
}
