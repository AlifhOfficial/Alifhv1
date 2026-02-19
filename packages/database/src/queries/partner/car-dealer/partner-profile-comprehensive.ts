/**
 * Partner Profile Query
 * 
 * Partner profile for the partner dashboard and showroom page.
 * Used by contact settings and basic profile updates.
 * 
 * Note: Comprehensive form features (businessHours, features, notificationPreferences,
 * galleryImages, coverImage, showroomVideo) are deprecated in the form but kept in schema.
 * 
 * Performance optimizations:
 * - Single query for updates (no pre-fetch for partial updates)
 * 
 * @module queries/partner/car-dealer/partner-profile-comprehensive
 */

import { eq } from 'drizzle-orm';
import { db } from '../../../dbclient';
import { partner, partnerStaff } from '../../../schema/partner';


// ============================================================================
// Types
// ============================================================================

/**
 * Business Features - Services offered by the partner
 */
export interface PartnerFeatures {
  homeDelivery: boolean;
  testDriveAvailable: boolean;
  financing: boolean;
  tradeIn: boolean;
  warranty: boolean;
  insurance: boolean;
  registration: boolean;
  exportAssistance: boolean;
}

/**
 * Business Hours - Operating schedule
 */
export interface BusinessHours {
  [day: string]: { open: string; close: string; closed?: boolean };
}

/**
 * Notification Preferences
 */
export interface NotificationPreferences {
  emailNewLead: boolean;
  emailBooking: boolean;
  emailMessage: boolean;
  emailSale: boolean;
  emailReview: boolean;
  emailMarketing: boolean;
  smsNewLead: boolean;
  smsBooking: boolean;
}

/**
 * Comprehensive Partner Profile
 * All editable fields for partner dashboard form
 */
export interface PartnerProfileComprehensive {
  // === Identity & Legal ===
  id: string;
  companyNameLegal: string;
  brandName: string;
  tradeLicense: string;
  vatNumber: string | null;
  tradeLicenseExpiry: Date;
  tradeLicenseDocumentUrl: string | null;
  
  // === Status (read-only for partner) ===
  status: 'pending' | 'active' | 'suspended' | 'cancelled';
  tier: 'standard' | 'gold' | 'platinum' | 'black';
  partnerType: 'car_dealer' | 'showroom';
  isVerified: boolean;
  
  // === Contact Information ===
  email: string;
  phone: string;
  website: string | null;
  
  // === Admin Contact (fallback when staff doesn't respond) ===
  adminName: string | null;
  adminPhone: string | null;
  adminPhoneVerified: boolean;
  tollNumber: string | null;
  
  // === Location ===
  address: string | null;
  emirate: string | null;
  city: string | null;
  locationLat: number | null;
  locationLng: number | null;
  showroomCount: number;
  
  // === Branding & Media ===
  logo: string | null;
  heroImage: string | null;
  coverImage: string | null;
  galleryImages: string[];
  showroomVideoUrl: string | null;
  showroomVideoThumbnail: string | null;
  
  // === Business Description ===
  description: string | null;
  specialties: string[];
  experienceYears: number | null;
  foundedYear: number | null;
  
  // === External Reviews (read-only, fetched from Google) ===
  googleReviewUrl: string | null;
  googleRating: number | null;
  googleReviewCount: number;
  
  // === Platform Performance (read-only, computed) ===
  platformRating: number | null;
  platformReviewCount: number;
  customerSatisfaction: number | null;
  
  // === Trust & Branding ===
  badges: string[];
  tags: string[];
  
  // === Services & Features ===
  features: PartnerFeatures;
  businessHours: BusinessHours;
  
  // === Subscription (read-only for partner) ===
  subscriptionTier: string | null;
  subscriptionExpiresAt: Date | null;
  paymentTerms: string | null;
  
  // === Notifications ===
  notificationPreferences: NotificationPreferences;
  
  // === Timestamps (read-only) ===
  createdAt: Date;
  updatedAt: Date;
  activatedAt: Date | null;
}

/**
 * Editable fields for partner profile update
 * Excludes read-only fields like status, tier, analytics, etc.
 * Note: Comprehensive fields (features, businessHours, notificationPreferences,
 * coverImage, galleryImages, showroomVideo) kept in schema but not exposed in API
 */
export interface PartnerProfileUpdate {
  // Contact
  phone?: string;
  website?: string | null;
  
  // Admin Contact (fallback when staff doesn't respond)
  adminName?: string | null;
  adminPhone?: string | null;
  adminPhoneVerified?: boolean;
  tollNumber?: string | null;
  
  // Location
  address?: string | null;
  emirate?: string | null;
  city?: string | null;
  locationLat?: number | null;
  locationLng?: number | null;
  showroomCount?: number;
  
  // Branding & Media
  logo?: string | null;
  heroImage?: string | null;
  
  // Business Description
  description?: string | null;
  specialties?: string[];
  experienceYears?: number | null;
  foundedYear?: number | null;
  
  // External Reviews
  googleReviewUrl?: string | null;
  
  // Trust & Branding
  tags?: string[];
}

// ============================================================================
// Query Functions
// ============================================================================

// Default values for JSONB fields (used when normalizing)
const DEFAULT_FEATURES: PartnerFeatures = {
  homeDelivery: false,
  testDriveAvailable: true,
  financing: false,
  tradeIn: false,
  warranty: false,
  insurance: false,
  registration: false,
  exportAssistance: false,
};

const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  emailNewLead: true,
  emailBooking: true,
  emailMessage: true,
  emailSale: true,
  emailReview: true,
  emailMarketing: false,
  smsNewLead: true,
  smsBooking: true,
};

/**
 * Get comprehensive partner profile by partner ID
 * Used for partner dashboard and showroom page
 */
export async function getPartnerProfileComprehensive(
  partnerId: string
): Promise<PartnerProfileComprehensive | null> {
  const queryStart = performance.now();
  
  try {
    const [result] = await db
      .select({
        // Identity & Legal
        id: partner.id,
        companyNameLegal: partner.companyNameLegal,
        brandName: partner.brandName,
        tradeLicense: partner.tradeLicense,
        vatNumber: partner.vatNumber,
      tradeLicenseExpiry: partner.tradeLicenseExpiry,
      tradeLicenseDocumentUrl: partner.tradeLicenseDocumentUrl,
      
      // Status
      status: partner.status,
      tier: partner.tier,
      partnerType: partner.partnerType,
      isVerified: partner.isVerified,
      
      // Contact
      email: partner.email,
      phone: partner.phone,
      website: partner.website,
      
      // Admin Contact (fallback)
      adminName: partner.adminName,
      adminPhone: partner.adminPhone,
      adminPhoneVerified: partner.adminPhoneVerified,
      tollNumber: partner.tollNumber,
      
      // Location
      address: partner.address,
      emirate: partner.emirate,
      city: partner.city,
      locationLat: partner.locationLat,
      locationLng: partner.locationLng,
      showroomCount: partner.showroomCount,
      
      // Branding & Media
      logo: partner.logo,
      heroImage: partner.heroImage,
      coverImage: partner.coverImage,
      galleryImages: partner.galleryImages,
      showroomVideoUrl: partner.showroomVideoUrl,
      showroomVideoThumbnail: partner.showroomVideoThumbnail,
      
      // Business Description
      description: partner.description,
      specialties: partner.specialties,
      experienceYears: partner.experienceYears,
      foundedYear: partner.foundedYear,
      
      // External Reviews
      googleReviewUrl: partner.googleReviewUrl,
      googleRating: partner.googleRating,
      googleReviewCount: partner.googleReviewCount,
      
      // Platform Performance
      platformRating: partner.platformRating,
      platformReviewCount: partner.platformReviewCount,
      customerSatisfaction: partner.customerSatisfaction,
      
      // Trust & Branding
      badges: partner.badges,
      tags: partner.tags,
      
      // Services & Features
      features: partner.features,
      businessHours: partner.businessHours,
      
      // Subscription
      subscriptionTier: partner.subscriptionTier,
      subscriptionExpiresAt: partner.subscriptionExpiresAt,
      paymentTerms: partner.paymentTerms,
      
      // Notifications
      notificationPreferences: partner.notificationPreferences,
      
      // Timestamps
      createdAt: partner.createdAt,
      updatedAt: partner.updatedAt,
      activatedAt: partner.activatedAt,
    })
    .from(partner)
    .where(eq(partner.id, partnerId))
    .limit(1);
  
  const queryTime = performance.now() - queryStart;
  console.log(`[getPartnerProfileComprehensive] Query for ${partnerId.slice(0, 8)}... completed in ${queryTime.toFixed(2)}ms`);
  
  if (!result) return null;
  
  // Normalize the result - minimal transformations
  const profile: PartnerProfileComprehensive = {
    ...result,
    // Arrays: provide fallback for nullable JSONB
    galleryImages: result.galleryImages ?? [],
    specialties: result.specialties ?? [],
    badges: result.badges ?? [],
    tags: result.tags ?? [],
    // Objects: provide defaults for nullable JSONB
    features: result.features ?? DEFAULT_FEATURES,
    businessHours: result.businessHours ?? {},
    notificationPreferences: result.notificationPreferences ?? DEFAULT_NOTIFICATION_PREFERENCES,
  };
  
  return profile;
  } catch (error) {
    const queryTime = performance.now() - queryStart;
    console.error(`[getPartnerProfileComprehensive] Query FAILED for ${partnerId.slice(0, 8)}... after ${queryTime.toFixed(2)}ms`);
    console.error('[getPartnerProfileComprehensive] Error details:', error);
    throw error;
  }
}

/**
 * Update partner profile
 * Only updates allowed editable fields
 */
export async function updatePartnerProfile(
  partnerId: string,
  updates: PartnerProfileUpdate
): Promise<PartnerProfileComprehensive | null> {
  // Clean undefined values
  const cleanUpdates = Object.fromEntries(
    Object.entries(updates).filter(([, value]) => value !== undefined)
  ) as Record<string, any>;
  
  if (Object.keys(cleanUpdates).length === 0) {
    return getPartnerProfileComprehensive(partnerId);
  }
  
  // Sanitize string fields at write time
  if (cleanUpdates.website !== undefined) cleanUpdates.website = cleanUpdates.website?.trim() || null;
  if (cleanUpdates.address !== undefined) cleanUpdates.address = cleanUpdates.address?.trim() || null;
  if (cleanUpdates.logo !== undefined) cleanUpdates.logo = cleanUpdates.logo?.trim() || null;
  if (cleanUpdates.heroImage !== undefined) cleanUpdates.heroImage = cleanUpdates.heroImage?.trim() || null;
  if (cleanUpdates.description !== undefined) cleanUpdates.description = cleanUpdates.description?.trim() || null;
  if (cleanUpdates.googleReviewUrl !== undefined) cleanUpdates.googleReviewUrl = cleanUpdates.googleReviewUrl?.trim() || null;
  
  const queryStart = performance.now();
  
  console.log(`[updatePartnerProfile] Starting update for ${partnerId.slice(0, 8)}... with keys:`, Object.keys(cleanUpdates));
  
  try {
    await db
      .update(partner)
      .set({
        ...cleanUpdates,
        updatedAt: new Date(),
      })
      .where(eq(partner.id, partnerId));
    
    const queryTime = performance.now() - queryStart;
    console.log(`[updatePartnerProfile] Update for ${partnerId.slice(0, 8)}... completed in ${queryTime.toFixed(2)}ms`);
    
  } catch (updateError) {
    console.error(`[updatePartnerProfile] Update FAILED for ${partnerId.slice(0, 8)}...`, updateError);
    throw updateError;
  }
  
  // Return fresh profile
  return getPartnerProfileComprehensive(partnerId);
}

/**
 * Get partner profile by user ID (for staff/owner access)
 * Looks up the partner through partnerStaff relationship
 * 
 */
export async function getPartnerProfileByUserId(
  userId: string
): Promise<PartnerProfileComprehensive | null> {
  const queryStart = performance.now();
  
  // Lookup partnerId from staff relationship
  const [staffResult] = await db
    .select({ partnerId: partnerStaff.partnerId })
    .from(partnerStaff)
    .where(eq(partnerStaff.userId, userId))
    .limit(1);
  
  const queryTime = performance.now() - queryStart;
  
  if (!staffResult) {
    console.log(`[getPartnerProfileByUserId] No partner found for user ${userId.slice(0, 8)}... (${queryTime.toFixed(2)}ms)`);
    return null;
  }
  
  const partnerId = staffResult.partnerId;
  
  console.log(`[getPartnerProfileByUserId] Staff lookup for ${userId.slice(0, 8)}... → ${partnerId.slice(0, 8)}... (${queryTime.toFixed(2)}ms)`);
  
  return getPartnerProfileComprehensive(partnerId);
}

/**
 * Get showroom page data (public-facing)
 * Same as comprehensive but could add additional public stats in future
 */
export async function getShowroomPageData(
  partnerId: string
): Promise<PartnerProfileComprehensive | null> {
  const profile = await getPartnerProfileComprehensive(partnerId);
  
  // Only return if partner is active
  if (!profile || profile.status !== 'active') {
    return null;
  }
  
  return profile;
}
