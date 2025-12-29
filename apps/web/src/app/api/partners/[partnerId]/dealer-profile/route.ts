/**
 * API: Partner Dealer Profile Endpoint
 * GET /api/partners/[partnerId]/dealer-profile - Fetch dealer profile for preview
 * PATCH /api/partners/[partnerId]/dealer-profile - Update dealer profile
 * 
 * Authentication: 
 * - GET: None required (public endpoint)
 * - PATCH: Required (partner staff only)
 * 
 * Session Source: getSessionUser() from middleware cache
 * 
 * Returns:
 * - Partner branding (logo, name, description)
 * - Contact info (phone, website, location)
 * - Stats (rating, reviews, active listings)
 * - Operating hours and specialties
 * 
 * Cache Strategy:
 * - GET: 60s public cache, 120s stale-while-revalidate
 * - PATCH: no-cache (immediate invalidation)
 * 
 * Standards:
 * - Returns 400 for invalid input
 * - Returns 401 for unauthenticated PATCH
 * - Returns 404 for non-existent partner
 * - Returns 500 for server errors
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getDealerBaseProfile, updateDealerBaseProfile } from '@alifh/database';
import { getSessionUser } from '@/lib/auth/session-context';

export const revalidate = 60; // Cache for 60 seconds

const CACHE_HEADERS_PUBLIC = {
  'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
} as const;

const CACHE_HEADERS_NO_CACHE = {
  'Cache-Control': 'no-cache, no-store, must-revalidate',
} as const;

/**
 * Attaches cache-busted URLs for logo and hero image
 */
function attachImageUrls(profile: any) {
  const publicUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL;
  if (!publicUrl) {
    return { ...profile, logoUrl: null, heroImageUrl: null };
  }
  
  const cacheBuster = profile.updatedAt 
    ? new Date(profile.updatedAt).getTime() 
    : Date.now();
  
  let logoUrl: string | null = null;
  if (profile.logo) {
    logoUrl = profile.logo.startsWith('http') 
      ? profile.logo 
      : `${publicUrl.replace(/\/$/, '')}/${profile.logo}?v=${cacheBuster}`;
  }
  
  let heroImageUrl: string | null = null;
  if (profile.heroImage) {
    heroImageUrl = profile.heroImage.startsWith('http') 
      ? profile.heroImage 
      : `${publicUrl.replace(/\/$/, '')}/${profile.heroImage}?v=${cacheBuster}`;
  }
  
  return { ...profile, logoUrl, heroImageUrl };
}

const UpdatePartnerProfileSchema = z.object({
  companyNameLegal: z.string().optional(),
  brandName: z.string().optional(),
  website: z.string().optional(),
  address: z.string().optional(),
  emirate: z.string().optional(),
  city: z.string().optional(),
  locationLat: z.number().nullable().optional(),
  locationLng: z.number().nullable().optional(),
  showroomCount: z.number().optional(),
  logo: z.string().nullable().optional(),
  heroImage: z.string().nullable().optional(),
  description: z.string().optional(),
  specialties: z.array(z.string()).optional(),
  experienceYears: z.number().optional(),
  foundedYear: z.number().optional(),
  googleReviewUrl: z.string().optional(),
  badges: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ partnerId: string }> }
) {
  const start = performance.now();
  try {
    const { partnerId } = await params;

    const queryStart = performance.now();
    const profile = await getDealerBaseProfile(partnerId);
    const queryTime = performance.now() - queryStart;

    if (!profile) {
      return NextResponse.json(
        { error: 'Partner not found' },
        { status: 404 }
      );
    }

    const totalTime = performance.now() - start;
    console.log(`[partner dealer-profile] GET ${partnerId.slice(0, 8)}... - Query: ${queryTime.toFixed(2)}ms, Total: ${totalTime.toFixed(2)}ms`);

    // Attach cache-busted URLs for images
    const profileWithUrls = attachImageUrls(profile);

    const response = NextResponse.json(profileWithUrls);
    Object.entries(CACHE_HEADERS_PUBLIC).forEach(([key, value]) => 
      response.headers.set(key, value)
    );
    return response;
  } catch (error) {
    console.error('[partner dealer-profile] GET failed', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ partnerId: string }> }
) {
  try {
    const user = await getSessionUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { partnerId } = await params;
    
    if (!partnerId || typeof partnerId !== 'string') {
      return NextResponse.json(
        { error: 'Invalid partner ID' },
        { status: 400 }
      );
    }

    const body = await request.json().catch(() => null);
    const validationResult = UpdatePartnerProfileSchema.safeParse(body);

    if (!validationResult.success) {
      console.error('[partner dealer-profile] PATCH validation failed:', {
        body,
        errors: validationResult.error.format()
      });
      return NextResponse.json(
        { 
          error: 'Invalid input',
          details: validationResult.error.format()
        },
        { status: 400 }
      );
    }

    const updatedProfile = await updateDealerBaseProfile(partnerId, validationResult.data);

    if (!updatedProfile) {
      return NextResponse.json(
        { error: 'Partner not found' },
        { status: 404 }
      );
    }

    // Attach cache-busted URLs for images
    const profileWithUrls = attachImageUrls(updatedProfile);

    const response = NextResponse.json(profileWithUrls);
    Object.entries(CACHE_HEADERS_NO_CACHE).forEach(([key, value]) => 
      response.headers.set(key, value)
    );
    return response;
  } catch (error) {
    console.error('[partner dealer-profile] PATCH failed', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
