/**
 * API: Staff/Partner Booking Management
 * GET /api/bookings/manage - Get bookings for current staff member's listings
 * 
 * Authentication: Required (must be partner staff)
 * 
 * Note: This endpoint always returns bookings for the current user's listings only.
 * For all partner bookings (owner/admin view), use /api/bookings/partner-bookings
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session-context';
import {
  getStaffListingsBookings,
  getStaffBookingStats,
  runBookingMaintenance,
  memoryCache,
} from '@alifh/database';

export const runtime = 'nodejs';

const BOOKING_MAINTENANCE_TTL_SECONDS = 300;
const PARTNER_BOOKING_STATS_TTL_SECONDS = 15;

/**
 * GET /api/bookings/manage
 * Get bookings for the current staff member's listings only
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is staff/partner
    const membership = user.partnerMemberships?.[0];
    if (!membership) {
      return NextResponse.json(
        { error: 'Not a partner staff member' },
        { status: 403 }
      );
    }

    // Best-effort cleanup (fire-and-forget, don't block response)
    if (!memoryCache.get<boolean>('maintenance:booking')) {
      memoryCache.set('maintenance:booking', true, BOOKING_MAINTENANCE_TTL_SECONDS);
      runBookingMaintenance().catch(() => {});
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status')?.split(',');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const includeStats = searchParams.get('stats') === 'true';

    // Staff dashboard always shows bookings for the current user's listings only
    // This endpoint is for personal staff view - use /api/bookings/partner-bookings for all partner bookings
    const result = await getStaffListingsBookings(user.id, membership.partnerId, {
      status,
      limit,
      offset,
    });

    // Staff always see only their own listings' booking stats
    let stats: Awaited<ReturnType<typeof getStaffBookingStats>> | null = null;
    if (includeStats) {
      const statsKey = `bookingStats:staff:${user.id}:${membership.partnerId}`;
      stats = memoryCache.get(statsKey);
      if (!stats) {
        stats = await getStaffBookingStats(user.id, membership.partnerId);
        memoryCache.set(statsKey, stats, PARTNER_BOOKING_STATS_TTL_SECONDS);
      }
    }

    return NextResponse.json({
      ...result,
      stats,
      role: membership.staffRole,
    });
  } catch (error) {
    console.error('Error fetching partner bookings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}
