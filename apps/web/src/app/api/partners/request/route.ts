/**
 * API: Partner Request Management
 * POST /api/partners/request - Submit new partner application (logged-in users only)
 * GET /api/partners/request - Get user's partner request status
 * DELETE /api/partners/request - Cancel pending partner request
 * 
 * Purpose: Simplified partner application - collect only essential business info
 * Authentication: Required (user must be logged in)
 * Session Source: getSessionUser() from middleware cache
 * 
 * Required Fields:
 * - companyNameLegal, tradeLicense, tradeLicenseExpiry
 * - tradeLicenseDocumentUrl, vatNumber, partnerType, companySize
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
  deletePartnerRequest,
  hasActivePartnerRequest,
  isTradeLicenseInUse,
  getActivePartnerStaffMembershipByUserId,
} from '@alifh/database';
import { getSessionUser } from '@/lib/auth/session-context';
import { createRateLimiter, getIdentifier, rateLimitResponse, RATE_LIMITS_PARTNER } from '@/lib/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const CACHE_HEADERS_NO_CACHE = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, private',
  'Pragma': 'no-cache',
} as const;

const partnerRequestLimiter = createRateLimiter(RATE_LIMITS_PARTNER.REQUEST_SUBMIT);

// ============================================================================
// Validation Schemas
// ============================================================================

const CreatePartnerRequestSchema = z.object({
  // Required fields only
  companyNameLegal: z.string().min(2, 'Company name must be at least 2 characters'),
  tradeLicense: z.string().min(5, 'Trade license is required'),
  tradeLicenseExpiry: z.string().datetime('Invalid date format'),
  tradeLicenseDocumentUrl: z.string().min(1, 'Trade license document is required'),
  vatNumber: z.string().min(1, 'VAT number is required'),
  partnerType: z.enum(['car_dealer', 'showroom']),
  companySize: z.enum(['small', 'medium', 'large', 'enterprise']),
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

    // Rate limiting: 3 partner applications per day
    const identifier = getIdentifier(req, user.id);
    const rateLimitResult = await partnerRequestLimiter.check(identifier);
    if (!rateLimitResult.success) {
      return rateLimitResponse(rateLimitResult);
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

    // Check if user is currently a staff member of any partner
    // Staff must leave their organization before applying to become a partner
    const existingMembership = await getActivePartnerStaffMembershipByUserId(user.id);
    if (existingMembership) {
      return NextResponse.json(
        { 
          error: 'You are currently a staff member of an organization. Please leave your current organization before applying to become a partner.',
          code: 'ACTIVE_STAFF_MEMBER'
        },
        { status: 400 }
      );
    }

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
      tradeLicense: data.tradeLicense,
      tradeLicenseExpiry: new Date(data.tradeLicenseExpiry),
      tradeLicenseDocumentUrl: data.tradeLicenseDocumentUrl,
      vatNumber: data.vatNumber,
      partnerType: data.partnerType,
      companySize: data.companySize,
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
// DELETE - Cancel/Dismiss Partner Request
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

    // Allow deletion for pending (cancel) and rejected (dismiss) requests
    if (existingRequest.status === 'approved') {
      return NextResponse.json(
        { error: 'Cannot delete approved requests' },
        { status: 400 }
      );
    }

    const deleted = await deletePartnerRequest(existingRequest.id, user.id);

    if (!deleted) {
      return NextResponse.json(
        { error: 'Failed to delete request' },
        { status: 400 }
      );
    }

    const response = NextResponse.json({ 
      success: true,
      message: existingRequest.status === 'rejected' 
        ? 'Partner request dismissed' 
        : 'Partner request cancelled'
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
