/**
 * API: Partner Bookings
 * GET /api/bookings/partner-bookings
 * 
 * Purpose: Get all bookings for a partner's dealership with optional staff filtering
 * Authentication: Required
 * 
 * Query Params:
 * - partnerId: Partner ID (required)
 * - staffUserId: Filter bookings by specific staff member's listings
 * - status: Filter by booking status (comma-separated)
 * - includeStats: Include booking statistics (default: false)
 * - limit: Results per page (default: 50, max: 100)
 * - offset: Pagination offset (default: 0)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session-context';
import {
  getPartnerBookings,
  getStaffListingsBookings,
  getPartnerBookingStats,
  memoryCache,
  type BookingStatus,
} from '@alifh/database';
import {
  createRateLimiter,
  getIdentifier,
  rateLimitResponse,
  RATE_LIMITS_GENERAL,
} from '@/lib/rate-limit';

const partnerBookingsLimiter = createRateLimiter(RATE_LIMITS_GENERAL.READ_AUTH);

export const runtime = 'nodejs';

const PARTNER_BOOKING_STATS_TTL_SECONDS = 15;

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limit by user
    const identifier = getIdentifier(req, user.id);
    const rateLimitResult = await partnerBookingsLimiter.check(identifier);
    if (!rateLimitResult.success) {
      return rateLimitResponse(rateLimitResult);
    }

    const { searchParams } = new URL(req.url);
    
    const partnerId = searchParams.get('partnerId');
    const staffUserId = searchParams.get('staffUserId');
    const statusParam = searchParams.get('status');
    const q = searchParams.get('q');
    const includeStats = searchParams.get('includeStats') === '1' || searchParams.get('includeStats') === 'true';
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!partnerId) {
      return NextResponse.json(
        { error: 'Missing partnerId parameter' },
        { status: 400 }
      );
    }

    // Verify user has access to this partner
    const hasAccess = user.partnerMemberships?.some((m) => m.partnerId === partnerId);
    if (!hasAccess && user.role !== 'admin' && user.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Not authorized to view bookings for this partner' },
        { status: 403 }
      );
    }

    // Parse status filter
    const status = statusParam 
      ? statusParam.split(',').filter(Boolean) as BookingStatus[] 
      : undefined;

    // Fetch bookings - either for specific staff member or all partner bookings
    let bookingsData;
    
    if (staffUserId) {
      // Get bookings for specific staff member's listings
      bookingsData = await getStaffListingsBookings(staffUserId, partnerId, {
        status,
        q: q || undefined,
        limit,
        offset,
      });
    } else {
      // Get all partner bookings
      bookingsData = await getPartnerBookings(partnerId, {
        status,
        q: q || undefined,
        limit,
        offset,
      });
    }

    // Fetch stats if requested
    let stats: Awaited<ReturnType<typeof getPartnerBookingStats>> | undefined;
    if (includeStats) {
      const statsKey = `bookingStats:partner:${partnerId}`;
      stats = memoryCache.get(statsKey) ?? undefined;
      if (!stats) {
        stats = await getPartnerBookingStats(partnerId);
        memoryCache.set(statsKey, stats, PARTNER_BOOKING_STATS_TTL_SECONDS);
      }
    }

    return NextResponse.json({
      success: true,
      data: bookingsData.bookings,
      total: bookingsData.total,
      stats,
      meta: {
        count: bookingsData.bookings.length,
        limit,
        offset,
      },
    });
  } catch (error) {
    console.error('Error fetching partner bookings:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
