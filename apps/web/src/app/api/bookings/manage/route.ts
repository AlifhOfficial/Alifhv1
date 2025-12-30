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
  type BookingStatus,
} from '@alifh/database';
import { createRateLimiter, getIdentifier, rateLimitResponse, RATE_LIMITS_BOOKINGS } from '@/lib/rate-limit';

export const runtime = 'nodejs';

const BOOKING_MAINTENANCE_TTL_SECONDS = 300;
const PARTNER_BOOKING_STATS_TTL_SECONDS = 15;
const BOOKINGS_LIST_TTL_SECONDS = 5; // Short TTL for list freshness

const bookingManageLimiter = createRateLimiter(RATE_LIMITS_BOOKINGS.MANAGE);

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
    const statusParam = searchParams.get('status')?.split(',');
    const status = statusParam as BookingStatus[] | undefined;
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const includeStats = searchParams.get('stats') === 'true';

    // Run bookings and stats queries in parallel for better performance
    const bookingsKey = `bookings:staff:${user.id}:${membership.partnerId}:${status?.join(',') || 'all'}:${limit}:${offset}`;
    
    const [result, stats] = await Promise.all([
      // Bookings list (with short-lived cache)
      (async () => {
        let cachedBookings = memoryCache.get<Awaited<ReturnType<typeof getStaffListingsBookings>>>(bookingsKey);
        if (!cachedBookings) {
          cachedBookings = await getStaffListingsBookings(user.id, membership.partnerId, {
            status,
            limit,
            offset,
          });
          memoryCache.set(bookingsKey, cachedBookings, BOOKINGS_LIST_TTL_SECONDS);
        }
        return cachedBookings;
      })(),
      // Stats (with caching)
      includeStats
        ? (async () => {
            const statsKey = `bookingStats:staff:${user.id}:${membership.partnerId}`;
            let cachedStats = memoryCache.get<Awaited<ReturnType<typeof getStaffBookingStats>>>(statsKey);
            if (!cachedStats) {
              cachedStats = await getStaffBookingStats(user.id, membership.partnerId);
              memoryCache.set(statsKey, cachedStats, PARTNER_BOOKING_STATS_TTL_SECONDS);
            }
            return cachedStats;
          })()
        : Promise.resolve(null),
    ]);

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
