/**
 * API: Partner Request Management
 * POST /api/partners/request - Submit new partner application
 * GET /api/partners/request - Get user's partner request status
 * PATCH /api/partners/request - Update pending partner request
 * DELETE /api/partners/request - Cancel pending partner request
 * 
 * Purpose: Handle partner application workflow for users
 * Authentication: Required
 * Session Source: getSessionUser() from middleware cache
 * 
 * Cache Strategy: No cache (user-specific data)
 * 
 * Standards:
 * - Returns 401 for no auth
 * - Returns 400 for validation errors
 * - Returns 500 for errors
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { 
  createPartnerRequest, 
  getPartnerRequestByUserId,
  updatePartnerRequest,
  deletePartnerRequest,
  hasActivePartnerRequest,
  isTradeLicenseInUse,
} from '@alifh/database';
import { getSessionUser } from '@/lib/auth/session-context';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const CACHE_HEADERS_NO_CACHE = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, private',
  'Pragma': 'no-cache',
} as const;

// ============================================================================
// Validation Schemas
// ============================================================================

const CreatePartnerRequestSchema = z.object({
  // Required fields
  companyNameLegal: z.string().min(2, 'Company name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^\+?[0-9]{10,15}$/, 'Invalid phone number'),
  tradeLicense: z.string().min(5, 'Trade license is required'),
  tradeLicenseExpiry: z.string().datetime('Invalid date format'),
  partnerType: z.enum(['dealer', 'showroom', 'multi_brand', 'rental', 'broker', 'other']),
  
  // Optional fields
  vatNumber: z.string().optional(),
  brandName: z.string().optional(),
  tradeLicenseDocumentUrl: z.string().url().optional(),
  website: z.string().url().optional(),
  address: z.string().optional(),
  emirate: z.string().optional(),
  description: z.string().max(1000).optional(),
  experienceYears: z.number().int().min(0).max(100).optional(),
  specialties: z.array(z.string()).optional(),
});

const UpdatePartnerRequestSchema = z.object({
  brandName: z.string().optional(),
  tradeLicenseDocumentUrl: z.string().url().optional(),
  website: z.string().url().optional(),
  address: z.string().optional(),
  emirate: z.string().optional(),
  description: z.string().max(1000).optional(),
  experienceYears: z.number().int().min(0).max(100).optional(),
  specialties: z.array(z.string()).optional(),
});

// ============================================================================
// POST - Create Partner Request
// ============================================================================

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ 
        error: 'Please sign in to submit a partner application',
        requiresAuth: true 
      }, { status: 401 });
    }

    // Parse and validate input
    const payload = await req.json().catch(() => null);
    const result = CreatePartnerRequestSchema.safeParse(payload);

    if (!result.success) {
      return NextResponse.json(
        { 
          error: 'Invalid input',
          details: result.error.format()
        },
        { status: 400 }
      );
    }

    const data = result.data;

    // Check if user already has an active request
    const hasActive = await hasActivePartnerRequest(user.id);
    if (hasActive) {
      return NextResponse.json(
        { error: 'You already have an active partner request' },
        { status: 400 }
      );
    }

    // Check if trade license is already in use
    const licenseInUse = await isTradeLicenseInUse(data.tradeLicense);
    if (licenseInUse) {
      return NextResponse.json(
        { error: 'This trade license is already registered' },
        { status: 400 }
      );
    }

    // Create partner request
    const request = await createPartnerRequest({
      userId: user.id,
      companyNameLegal: data.companyNameLegal,
      email: data.email,
      phone: data.phone,
      tradeLicense: data.tradeLicense,
      tradeLicenseExpiry: new Date(data.tradeLicenseExpiry),
      partnerType: data.partnerType,
      vatNumber: data.vatNumber,
      brandName: data.brandName,
      tradeLicenseDocumentUrl: data.tradeLicenseDocumentUrl,
      website: data.website,
      address: data.address,
      emirate: data.emirate,
      description: data.description,
      experienceYears: data.experienceYears,
      specialties: data.specialties,
    });

    const response = NextResponse.json({ 
      success: true,
      request: {
        id: request.id,
        status: request.status,
        createdAt: request.createdAt,
      }
    }, { status: 201 });

    Object.entries(CACHE_HEADERS_NO_CACHE).forEach(([key, value]) => 
      response.headers.set(key, value)
    );

    return response;
  } catch (error) {
    console.error('[partners/request] POST failed', error);
    return NextResponse.json({ 
      error: 'Failed to submit partner request' 
    }, { status: 500 });
  }
}

// ============================================================================
// GET - Get User's Partner Request
// ============================================================================

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ 
        error: 'Unauthorized',
        requiresAuth: true 
      }, { status: 401 });
    }

    const request = await getPartnerRequestByUserId(user.id);

    const response = NextResponse.json({ 
      request: request || null 
    });

    Object.entries(CACHE_HEADERS_NO_CACHE).forEach(([key, value]) => 
      response.headers.set(key, value)
    );

    return response;
  } catch (error) {
    console.error('[partners/request] GET failed', error);
    return NextResponse.json({ 
      error: 'Failed to fetch partner request' 
    }, { status: 500 });
  }
}

// ============================================================================
// PATCH - Update Partner Request
// ============================================================================

export async function PATCH(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ 
        error: 'Unauthorized',
        requiresAuth: true 
      }, { status: 401 });
    }

    // Get user's request
    const existingRequest = await getPartnerRequestByUserId(user.id);
    if (!existingRequest) {
      return NextResponse.json(
        { error: 'Partner request not found' },
        { status: 404 }
      );
    }

    if (existingRequest.status !== 'pending') {
      return NextResponse.json(
        { error: 'Can only update pending requests' },
        { status: 400 }
      );
    }

    // Parse and validate input
    const payload = await req.json().catch(() => null);
    const result = UpdatePartnerRequestSchema.safeParse(payload);

    if (!result.success) {
      return NextResponse.json(
        { 
          error: 'Invalid input',
          details: result.error.format()
        },
        { status: 400 }
      );
    }

    const updated = await updatePartnerRequest(
      existingRequest.id,
      user.id,
      result.data
    );

    if (!updated) {
      return NextResponse.json(
        { error: 'Failed to update request' },
        { status: 400 }
      );
    }

    const response = NextResponse.json({ 
      success: true,
      request: updated
    });

    Object.entries(CACHE_HEADERS_NO_CACHE).forEach(([key, value]) => 
      response.headers.set(key, value)
    );

    return response;
  } catch (error) {
    console.error('[partners/request] PATCH failed', error);
    return NextResponse.json({ 
      error: 'Failed to update partner request' 
    }, { status: 500 });
  }
}

// ============================================================================
// DELETE - Cancel Partner Request
// ============================================================================

export async function DELETE(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ 
        error: 'Unauthorized',
        requiresAuth: true 
      }, { status: 401 });
    }

    // Get user's request
    const existingRequest = await getPartnerRequestByUserId(user.id);
    if (!existingRequest) {
      return NextResponse.json(
        { error: 'Partner request not found' },
        { status: 404 }
      );
    }

    const deleted = await deletePartnerRequest(existingRequest.id, user.id);

    if (!deleted) {
      return NextResponse.json(
        { error: 'Can only delete pending requests' },
        { status: 400 }
      );
    }

    const response = NextResponse.json({ 
      success: true,
      message: 'Partner request cancelled'
    });

    Object.entries(CACHE_HEADERS_NO_CACHE).forEach(([key, value]) => 
      response.headers.set(key, value)
    );

    return response;
  } catch (error) {
    console.error('[partners/request] DELETE failed', error);
    return NextResponse.json({ 
      error: 'Failed to delete partner request' 
    }, { status: 500 });
  }
}
