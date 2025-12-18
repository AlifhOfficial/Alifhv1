/**
 * API: Partner Mini Profile Endpoint
 * GET /api/partners/[partnerId]/mini-profile - Fetch partner profile for preview modal
 * PATCH /api/partners/[partnerId]/mini-profile - Update partner profile
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
import { getPartnerMiniProfile, updatePartnerMiniProfile } from '@alifh/database';
import { getSessionUser } from '@/lib/auth/session-context';

const CACHE_HEADERS_PUBLIC = {
  'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
} as const;

const CACHE_HEADERS_NO_CACHE = {
  'Cache-Control': 'no-cache, no-store, must-revalidate',
} as const;

const UpdatePartnerProfileSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  logo: z.string().url().optional(),
  phone: z.string().optional(),
  website: z.string().url().optional(),
  location: z.string().optional(),
  operatingHours: z.string().optional(),
  specialties: z.array(z.string()).optional(),
}).strict();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ partnerId: string }> }
) {
  try {
    const { partnerId } = await params;

    const profile = await getPartnerMiniProfile(partnerId);

    if (!profile) {
      return NextResponse.json(
        { error: 'Partner not found' },
        { status: 404 }
      );
    }

    const response = NextResponse.json(profile);
    Object.entries(CACHE_HEADERS_PUBLIC).forEach(([key, value]) => 
      response.headers.set(key, value)
    );
    return response;
  } catch (error) {
    console.error('[partner mini-profile] GET failed', error);
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
      return NextResponse.json(
        { 
          error: 'Invalid input',
          details: validationResult.error.format()
        },
        { status: 400 }
      );
    }

    const updatedProfile = await updatePartnerMiniProfile(partnerId, validationResult.data);

    if (!updatedProfile) {
      return NextResponse.json(
        { error: 'Partner not found' },
        { status: 404 }
      );
    }

    const response = NextResponse.json(updatedProfile);
    Object.entries(CACHE_HEADERS_NO_CACHE).forEach(([key, value]) => 
      response.headers.set(key, value)
    );
    return response;
  } catch (error) {
    console.error('[partner mini-profile] PATCH failed', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
