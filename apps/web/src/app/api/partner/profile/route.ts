/**
 * API: Partner Profile Comprehensive
 * GET/PATCH /api/partner/profile
 * 
 * Purpose: Complete partner profile management for dashboard form
 * Partners fill this form once after registration to complete their profile.
 * 
 * Authentication: Required (must be partner staff with owner/admin role)
 * 
 * GET: Returns full partner profile for form population
 * PATCH: Updates editable partner profile fields
 * 
 * Standards:
 * - Returns 401 for unauthenticated requests
 * - Returns 403 for non-partner staff or insufficient permissions
 * - Returns 404 if partner not found
 * - Returns 500 for server errors
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSessionUser } from '@/lib/auth/session-context';
import {
  getPartnerProfileByUserId,
  updatePartnerProfile,
  type PartnerProfileUpdate,
} from '@alifh/database';
import { createRateLimiter, getIdentifier, rateLimitResponse, RATE_LIMITS_PARTNER } from '@/lib/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const partnerProfileUpdateLimiter = createRateLimiter(RATE_LIMITS_PARTNER.PROFILE_UPDATE);

/**
 * Attaches cache-busted URLs for logo and hero image
 * Similar to user avatar URL resolution
 */
function attachImageUrls(profile: any) {
  const publicUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL;
  if (!publicUrl) {
    return { ...profile, logoUrl: null, heroImageUrl: null };
  }
  
  // Use updatedAt for cache busting
  const cacheBuster = profile.updatedAt 
    ? new Date(profile.updatedAt).getTime() 
    : Date.now();
  
  // Build logo URL with cache buster
  let logoUrl: string | null = null;
  if (profile.logo) {
    if (profile.logo.startsWith('http')) {
      logoUrl = profile.logo;
    } else {
      logoUrl = `${publicUrl.replace(/\/$/, '')}/${profile.logo}?v=${cacheBuster}`;
    }
  }
  
  // Build hero image URL with cache buster
  let heroImageUrl: string | null = null;
  if (profile.heroImage) {
    if (profile.heroImage.startsWith('http')) {
      heroImageUrl = profile.heroImage;
    } else {
      heroImageUrl = `${publicUrl.replace(/\/$/, '')}/${profile.heroImage}?v=${cacheBuster}`;
    }
  }
  
  return { ...profile, logoUrl, heroImageUrl };
}

// Validation schema for profile updates
const PartnerProfileUpdateSchema = z.object({
  // Contact
  phone: z.string().min(1).optional(),
  website: z.string().url().nullable().optional(),
  
  // Admin Contact (fallback when staff doesn't respond)
  adminName: z.string().nullable().optional(),
  adminPhone: z.string().nullable().optional(),
  adminPhoneVerified: z.boolean().optional(),
  tollNumber: z.string().nullable().optional(),
  
  // Location
  address: z.string().nullable().optional(),
  emirate: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  locationLat: z.number().nullable().optional(),
  locationLng: z.number().nullable().optional(),
  showroomCount: z.number().min(1).optional(),
  
  // Branding & Media (storage keys OR URLs)
  logo: z.string().nullable().optional(),
  heroImage: z.string().nullable().optional(),
  coverImage: z.string().nullable().optional(),
  galleryImages: z.array(z.string()).optional(),
  showroomVideoUrl: z.string().url().nullable().optional(),
  showroomVideoThumbnail: z.string().nullable().optional(),
  
  // Business Description
  description: z.string().max(2000).nullable().optional(),
  specialties: z.array(z.string()).optional(),
  experienceYears: z.number().min(0).max(100).nullable().optional(),
  foundedYear: z.number().min(1900).max(new Date().getFullYear()).nullable().optional(),
  
  // External Reviews
  googleReviewUrl: z.string().url().nullable().optional(),
  
  // Trust & Branding
  tags: z.array(z.string()).optional(),
  
  // Services & Features
  features: z.object({
    homeDelivery: z.boolean().optional(),
    testDriveAvailable: z.boolean().optional(),
    financing: z.boolean().optional(),
    tradeIn: z.boolean().optional(),
    warranty: z.boolean().optional(),
    insurance: z.boolean().optional(),
    registration: z.boolean().optional(),
    exportAssistance: z.boolean().optional(),
  }).optional(),
  
  // Business Hours
  businessHours: z.record(z.string(), z.object({
    open: z.string(),
    close: z.string(),
    closed: z.boolean().optional(),
  })).optional(),
  
  // Notifications
  notificationPreferences: z.object({
    emailNewLead: z.boolean().optional(),
    emailBooking: z.boolean().optional(),
    emailMessage: z.boolean().optional(),
    emailSale: z.boolean().optional(),
    emailReview: z.boolean().optional(),
    emailMarketing: z.boolean().optional(),
    smsNewLead: z.boolean().optional(),
    smsBooking: z.boolean().optional(),
  }).optional(),
});

/**
 * GET /api/partner/profile
 * Get comprehensive partner profile for dashboard form
 */
export async function GET() {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get partner profile by user ID
    const profile = await getPartnerProfileByUserId(sessionUser.id);
    
    if (!profile) {
      return NextResponse.json(
        { error: 'Partner profile not found. You may not be associated with a partner.' },
        { status: 404 }
      );
    }
    
    // Attach cache-busted URLs for images
    const profileWithUrls = attachImageUrls(profile);
    
    return NextResponse.json({ profile: profileWithUrls });
  } catch (error) {
    console.error('[partner/profile] GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch partner profile' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/partner/profile
 * Update partner profile (editable fields only)
 */
export async function PATCH(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting: 10 profile updates per hour
    const identifier = getIdentifier(req, sessionUser.id);
    const rateLimitResult = await partnerProfileUpdateLimiter.check(identifier);
    if (!rateLimitResult.success) {
      return rateLimitResponse(rateLimitResult);
    }
    
    // Get current profile to verify access and get partnerId
    const currentProfile = await getPartnerProfileByUserId(sessionUser.id);
    
    if (!currentProfile) {
      return NextResponse.json(
        { error: 'Partner profile not found. You may not be associated with a partner.' },
        { status: 404 }
      );
    }
    
    // Parse and validate request body
    const body = await req.json().catch(() => null);
    const validationResult = PartnerProfileUpdateSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid input',
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }
    
    const updates: PartnerProfileUpdate = validationResult.data;
    
    // Update the profile
    const updatedProfile = await updatePartnerProfile(currentProfile.id, updates);
    
    if (!updatedProfile) {
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      );
    }
    
    // Attach cache-busted URLs for images
    const profileWithUrls = attachImageUrls(updatedProfile);
    
    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      profile: profileWithUrls,
    });
  } catch (error) {
    console.error('[partner/profile] PATCH error:', error);
    // Log more details about the error
    if (error instanceof Error) {
      console.error('[partner/profile] Error name:', error.name);
      console.error('[partner/profile] Error message:', error.message);
      console.error('[partner/profile] Error cause:', (error as any).cause);
    }
    return NextResponse.json(
      { error: 'Failed to update partner profile' },
      { status: 500 }
    );
  }
}
