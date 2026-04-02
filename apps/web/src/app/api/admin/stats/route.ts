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

// ============================================================================
// GET - Dashboard Statistics
// ============================================================================

export async function GET(_req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
      return NextResponse.json({ 
        error: 'Unauthorized',
        requiresAuth: true 
      }, { status: 401 });
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
    });

  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
