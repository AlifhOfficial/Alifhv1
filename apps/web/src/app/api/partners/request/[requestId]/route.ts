/**
 * API: Partner Request by ID
 * GET /api/partners/request/[requestId] - Get specific partner request details
 * 
 * Purpose: View detailed partner request information
 * Authentication: Required (User can view their own, Admin can view all)
 * Session Source: getSessionUser() from middleware cache
 * 
 * Cache Strategy: No cache (user-specific data)
 * 
 * Standards:
 * - Returns 401 for no auth
 * - Returns 403 for unauthorized access
 * - Returns 404 for not found
 * - Returns 500 for errors
 */

import { NextRequest, NextResponse } from 'next/server';
import { getPartnerRequestById } from '@alifh/database';
import { getSessionUser } from '@/lib/auth/session-context';


export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// ============================================================================
// Helper: Check Admin Role
// ============================================================================

async function checkAdminAccess(user: any) {
  // TODO: Implement proper role check when role system is in place
  return true; // TEMPORARY - REPLACE WITH ACTUAL ADMIN CHECK
}

// ============================================================================
// GET - Get Partner Request by ID
// ============================================================================

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ requestId: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ 
        error: 'Unauthorized',
        requiresAuth: true 
      }, { status: 401 });
    }


    const { requestId } = await params;

    const request = await getPartnerRequestById(requestId);

    if (!request) {
      return NextResponse.json(
        { error: 'Partner request not found' },
        { status: 404 }
      );
    }

    // Authorization check: User can only view their own request, unless they're admin
    const isAdmin = await checkAdminAccess(user);
    const isOwner = request.request.userId === user.id;

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden: You do not have access to this request' },
        { status: 403 }
      );
    }

    return NextResponse.json({ 
      request 
    });
  } catch (error) {
    console.error('[partners/request/[requestId]] GET failed', error);
    return NextResponse.json({ 
      error: 'Failed to fetch partner request' 
    }, { status: 500 });
  }
}
