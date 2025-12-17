/**
 * Get Partner Full Profile
 * Complete partner data for dedicated profile page
 */

import { eq } from 'drizzle-orm';
import { db } from '../../dbclient';
import { partner } from '../../schema/partner';

/**
 * Full Partner Profile - For dedicated partner profile page
 * Returns all client-facing fields for rich profile display
 */
export async function getPartnerFullProfile(partnerId: string) {
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
      
      // Contact
      email: true,
      phone: true,
      website: true,
      
      // Location
      address: true,
      emirate: true,
      city: true,
      locationLat: true,
      locationLng: true,
      showroomCount: true,
      
      // Branding & Media
      logo: true,
      heroImage: true,
      coverImage: true,
      galleryImages: true,
      
      // Business Info
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
      customerSatisfaction: true,
      
      // Inventory & Sales
      totalInventory: true,
      activeListings: true,
      soldListings: true,
      
      // Response Metrics
      avgResponseTime: true,
      responseRate: true,
      
      // Trust & Verification
      isVerified: true,
      verifiedAt: true,
      
      // Badges & Tags
      badges: true,
      tags: true,
      
      // Services
      features: true,
      businessHours: true,
      
      // Team Size
      teamSize: true,
      activeStaffCount: true,
      
      // Timestamps
      createdAt: true,
      activatedAt: true,
    },
  });

  return result;
}
