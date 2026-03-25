/**
 * Partner Stats API
 * GET /api/partner/stats
 * 
 * Returns actionable business metrics for the partner insights dashboard.
 * 
 * Authentication: Required (must be partner owner/admin/manager)
 * 
 * Response includes:
 * - Inventory metrics (active count, value, stale, expiring)
 * - Sales metrics (sold this month, revenue, avg days to sell)
 * - Engagement metrics (views, top listings, cold listings)
 * - Booking metrics (pending, confirmed, no-show rate)
 * - Trend metrics (this month vs last month deltas)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session-context';
import { getPartnerDescriptiveStats } from '@alifh/database';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';


export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }


    // Must have partner access
    if (!user.hasPartnerAccess || !user.partnerMemberships?.[0]) {
      return NextResponse.json(
        { error: 'Partner access required' },
        { status: 403 }
      );
    }

    // Get partner ID from membership
    const membership = user.partnerMemberships[0];
    const partnerId = membership.partnerId;

    // Only owner, admin, or manager can view stats
    const allowedRoles = ['owner', 'admin', 'manager'];
    if (!allowedRoles.includes(membership.staffRole)) {
      return NextResponse.json(
        { error: 'Insufficient permissions. Manager access required.' },
        { status: 403 }
      );
    }

    // Get all stats
    const stats = await getPartnerDescriptiveStats(partnerId);

    return NextResponse.json({
      success: true,
      data: stats,
    });

  } catch (error) {
    console.error('[Partner Stats API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch partner stats' },
      { status: 500 }
    );
  }
}
