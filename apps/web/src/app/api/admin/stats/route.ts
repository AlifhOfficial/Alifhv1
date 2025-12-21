/**
 * API: Admin Dashboard Statistics
 * GET /api/admin/stats - Get user and partner counts for dashboard
 * 
 * Purpose: Admin dashboard - display overview statistics
 * Authentication: Required (Admin only)
 * Session Source: getSessionUser() from middleware cache
 * 
 * Cache Strategy: No cache (admin data)
 * 
 * Standards:
 * - Returns 401 for no auth
 * - Returns 403 for non-admin users
 * - Returns 500 for errors
 */

import { NextRequest, NextResponse } from 'next/server';
import { 
  getAdminUserCountByRole,
  getAdminPartnerCountByStatus,
} from '@alifh/database';
import { getSessionUser } from '@/lib/auth/session-context';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const CACHE_HEADERS_NO_CACHE = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, private',
  'Pragma': 'no-cache',
} as const;

// ============================================================================
// Helper: Check Admin Role
// ============================================================================

async function checkAdminAccess(user: any) {
  return user.role === 'admin' || user.role === 'super_admin';
}

// ============================================================================
// GET - Dashboard Statistics
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

    // Fetch statistics in parallel
    const [userCounts, partnerCounts] = await Promise.all([
      getAdminUserCountByRole(),
      getAdminPartnerCountByStatus(),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        users: userCounts,
        partners: partnerCounts,
      },
    }, { 
      status: 200,
      headers: CACHE_HEADERS_NO_CACHE,
    });

  } catch (error) {
    console.error('[Admin Stats API] Error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
