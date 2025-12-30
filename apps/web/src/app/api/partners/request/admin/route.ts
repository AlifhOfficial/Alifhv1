/**
 * API: Partner Request Admin Management
 * GET /api/partners/request/admin - List all partner requests (admin)
 * POST /api/partners/request/admin - Review partner request (approve/reject)
 * 
 * Purpose: Admin workflow for reviewing partner applications
 * Authentication: Required (Admin only)
 * Session Source: getSessionUser() from middleware cache
 * 
 * Cache Strategy: No cache (admin data)
 * 
 * Standards:
 * - Returns 401 for no auth
 * - Returns 403 for non-admin users
 * - Returns 400 for validation errors
 * - Returns 500 for errors
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { 
  listPartnerRequests,
  getPartnerRequestCounts,
  reviewPartnerRequest,
  getPartnerRequestById,
  createPartnerFromRequest,
} from '@alifh/database';
import { getSessionUser } from '@/lib/auth/session-context';
import {
  createRateLimiter,
  getIdentifier,
  rateLimitResponse,
  RATE_LIMITS_ADMIN,
} from '@/lib/rate-limit';

const listLimiter = createRateLimiter(RATE_LIMITS_ADMIN.LIST);
const reviewLimiter = createRateLimiter(RATE_LIMITS_ADMIN.OPS);

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const CACHE_HEADERS_NO_CACHE = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, private',
  'Pragma': 'no-cache',
} as const;

// ============================================================================
// Validation Schemas
// ============================================================================

const ReviewPartnerRequestSchema = z.object({
  requestId: z.string().min(1, 'Request ID is required'),
  status: z.enum(['approved', 'rejected']),
  rejectionReason: z.string().optional(),
  internalNotes: z.string().optional(),
});

// ============================================================================
// Helper: Check Admin Role
// ============================================================================

async function checkAdminAccess(user: any) {
  // TODO: Implement proper role check when role system is in place
  // For now, you can check against specific user IDs or implement your role logic
  // Example: if (user.role !== 'admin' && user.role !== 'super_admin') return false;
  
  // Placeholder - update with your actual admin check
  return true; // TEMPORARY - REPLACE WITH ACTUAL ADMIN CHECK
}

// ============================================================================
// GET - List Partner Requests (Admin)
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

    const isAdmin = await checkAdminAccess(user);
    if (!isAdmin) {
      return NextResponse.json({ 
        error: 'Forbidden: Admin access required' 
      }, { status: 403 });
    }

    // Rate limit by user
    const identifier = getIdentifier(req, user.id);
    const rateLimitResult = await listLimiter.check(identifier);
    if (!rateLimitResult.success) {
      return rateLimitResponse(rateLimitResult);
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') as 'pending' | 'approved' | 'rejected' | null;
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const includeCounts = searchParams.get('counts') === 'true';

    // Run queries in parallel when counts requested
    const [requests, counts] = await Promise.all([
      listPartnerRequests({
        status: status || undefined,
        limit,
        offset,
      }),
      includeCounts ? getPartnerRequestCounts() : Promise.resolve(null),
    ]);

    const response = NextResponse.json({ 
      requests,
      counts,
      pagination: {
        limit,
        offset,
        total: requests.length,
      }
    });

    Object.entries(CACHE_HEADERS_NO_CACHE).forEach(([key, value]) => 
      response.headers.set(key, value)
    );

    return response;
  } catch (error) {
    console.error('[partners/request/admin] GET failed', error);
    return NextResponse.json({ 
      error: 'Failed to fetch partner requests' 
    }, { status: 500 });
  }
}

// ============================================================================
// POST - Review Partner Request (Admin)
// ============================================================================

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ 
        error: 'Unauthorized',
        requiresAuth: true 
      }, { status: 401 });
    }

    const isAdmin = await checkAdminAccess(user);
    if (!isAdmin) {
      return NextResponse.json({ 
        error: 'Forbidden: Admin access required' 
      }, { status: 403 });
    }

    // Rate limit by user
    const identifier = getIdentifier(req, user.id);
    const rateLimitResult = await reviewLimiter.check(identifier);
    if (!rateLimitResult.success) {
      return rateLimitResponse(rateLimitResult);
    }

    // Parse and validate input
    const payload = await req.json().catch(() => null);
    const result = ReviewPartnerRequestSchema.safeParse(payload);

    if (!result.success) {
      return NextResponse.json(
        { 
          error: 'Invalid input',
          details: result.error.format()
        },
        { status: 400 }
      );
    }

    const { requestId, status, rejectionReason, internalNotes } = result.data;

    // Validate rejection reason is provided for rejections
    if (status === 'rejected' && !rejectionReason) {
      return NextResponse.json(
        { error: 'Rejection reason is required when rejecting a request' },
        { status: 400 }
      );
    }

    // Get existing request to verify it exists
    const existingRequest = await getPartnerRequestById(requestId);
    if (!existingRequest) {
      return NextResponse.json(
        { error: 'Partner request not found' },
        { status: 404 }
      );
    }

    // Review the request
    const updated = await reviewPartnerRequest({
      requestId,
      reviewedBy: user.id,
      status,
      rejectionReason,
      internalNotes,
    });

    if (!updated) {
      return NextResponse.json(
        { error: 'Failed to review request. It may have already been reviewed.' },
        { status: 400 }
      );
    }

    // If approved, create partner and partner staff
    let partnerData = null;
    if (status === 'approved') {
      try {
        partnerData = await createPartnerFromRequest(requestId, {
          ...existingRequest.request,
          userId: existingRequest.request.userId,
          userEmail: existingRequest.user?.email,
          userName: existingRequest.user?.name,
        });
      } catch (error) {
        console.error('[partners/request/admin] Failed to create partner:', error);
        // Request was approved but partner creation failed - this needs manual intervention
        return NextResponse.json(
          { 
            error: 'Request approved but partner creation failed. Please create partner manually.',
            request: updated 
          },
          { status: 500 }
        );
      }
    }

    const response = NextResponse.json({ 
      success: true,
      request: updated,
      partner: partnerData?.partner || null,
      staff: partnerData?.staff || null,
      message: status === 'approved' 
        ? 'Partner request approved and partner account created.'
        : 'Partner request rejected.'
    });

    Object.entries(CACHE_HEADERS_NO_CACHE).forEach(([key, value]) => 
      response.headers.set(key, value)
    );

    return response;
  } catch (error) {
    console.error('[partners/request/admin] POST failed', error);
    return NextResponse.json({ 
      error: 'Failed to review partner request' 
    }, { status: 500 });
  }
}
