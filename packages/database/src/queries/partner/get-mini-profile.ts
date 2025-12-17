/**
 * Get Partner Mini Profile
 * Comprehensive query for partner profile cards and detailed previews
 */

import { eq } from 'drizzle-orm';
import { db } from '../../dbclient';
import { partner } from '../../schema/partner';

/**
 * Mini Partner Profile - For listing cards/profile preview
 * Returns all essential partner info (30 fields)
 */
export async function getPartnerMiniProfile(partnerId: string) {
  const result = await db.query.partner.findFirst({
    where: eq(partner.id, partnerId),
    columns: {
      // Identity & Legal
      id: true,
      companyNameLegal: true,
      brandName: true,
      tradeLicense: true,
      
      // Status & Tier
      status: true,
      tier: true,
      
      // Contact & Location
      website: true,
      address: true,
      emirate: true,
      city: true,
      locationLat: true,
      locationLng: true,
      showroomCount: true,
      
      // Branding & Media
      logo: true,
      heroImage: true,
      
      // Business Information
      description: true,
      specialties: true,
      experienceYears: true,
      foundedYear: true,
      
      // External Ratings
      googleReviewUrl: true,
      googleRating: true,
      googleReviewCount: true,
      
      // Platform Performance
      platformRating: true,
      platformReviewCount: true,
      
      // Inventory
      totalInventory: true,
      activeListings: true,
      
      // Response Metrics
      avgResponseTime: true,
      responseRate: true,
      
      // Trust & Tags
      isVerified: true,
      badges: true,
      tags: true,
    },
  });

  if (!result) return null;

  // Normalize the data: convert empty strings to null, handle zeros, ensure arrays
  return {
    ...result,
    // Convert empty strings to null
    website: result.website?.trim() || null,
    address: result.address?.trim() || null,
    logo: result.logo?.trim() || null,
    heroImage: result.heroImage?.trim() || null,
    description: result.description?.trim() || null,
    googleReviewUrl: result.googleReviewUrl?.trim() || null,
    
    // Handle location coordinates: 0 should be null
    locationLat: result.locationLat === 0 ? null : result.locationLat,
    locationLng: result.locationLng === 0 ? null : result.locationLng,
    
    // Handle numeric fields: 0 should be null for some fields
    experienceYears: result.experienceYears === 0 ? null : result.experienceYears,
    
    // Ensure showroomCount defaults to 1, not 0
    showroomCount: result.showroomCount === 0 ? 1 : result.showroomCount,
    
    // Ensure arrays are always arrays, never null
    specialties: Array.isArray(result.specialties) ? result.specialties : [],
    badges: Array.isArray(result.badges) ? result.badges : [],
    tags: Array.isArray(result.tags) ? result.tags : [],
  };
}
