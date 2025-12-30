/**
 * API: User Bookings
 * GET /api/bookings - Get user's bookings
 * POST /api/bookings - Create a new booking
 * 
 * Authentication: Required
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session-context';
import {
  getUserBookings,
  createBooking,
  checkUserBookingRestrictions,
  runBookingMaintenance,
  memoryCache,
  getPartnerBookingSettings,
  type BookingStatus,
} from '@alifh/database';
import { createRateLimiter, getIdentifier, rateLimitResponse, RATE_LIMITS_BOOKINGS } from '@/lib/rate-limit';

export const runtime = 'nodejs';

const bookingCreateLimiter = createRateLimiter(RATE_LIMITS_BOOKINGS.CREATE);

const BOOKING_MAINTENANCE_TTL_SECONDS = 300;

/**
 * GET /api/bookings
 * Get current user's bookings
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Best-effort cleanup (fire-and-forget, don't block response)
    // Throttled to avoid write-heavy work on every request in serverless.
    if (!memoryCache.get<boolean>('maintenance:booking')) {
      memoryCache.set('maintenance:booking', true, BOOKING_MAINTENANCE_TTL_SECONDS);
      runBookingMaintenance().catch(() => {});
    }

    const { searchParams } = new URL(req.url);
    const statusParam = searchParams.get('status')?.split(',');
    const status = statusParam as BookingStatus[] | undefined;
    const upcoming = searchParams.get('upcoming') === 'true';
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    const result = await getUserBookings(user.id, {
      status,
      limit,
      offset,
      upcoming,
    });

    // Enrich bookings with partner settings for cancellation/reschedule policies
    const partnerIds = [...new Set(result.bookings.map(b => b.partnerId))];
    const settingsMap = new Map<string, Awaited<ReturnType<typeof getPartnerBookingSettings>>>();
    
    await Promise.all(
      partnerIds.map(async (partnerId) => {
        const settings = await getPartnerBookingSettings(partnerId);
        settingsMap.set(partnerId, settings);
      })
    );

    const enrichedBookings = result.bookings.map(booking => ({
      ...booking,
      partnerSettings: settingsMap.get(booking.partnerId) ? {
        allowUserCancellation: settingsMap.get(booking.partnerId)!.allowUserCancellation,
        cancellationDeadlineHours: settingsMap.get(booking.partnerId)!.cancellationDeadlineHours ?? 2,
        allowReschedule: settingsMap.get(booking.partnerId)!.allowReschedule,
        maxRescheduleCount: settingsMap.get(booking.partnerId)!.maxRescheduleCount,
        rescheduleDeadlineHours: settingsMap.get(booking.partnerId)!.rescheduleDeadlineHours ?? 4,
        preparationInstructions: settingsMap.get(booking.partnerId)!.preparationInstructions,
        directions: settingsMap.get(booking.partnerId)!.directions,
        parkingInstructions: settingsMap.get(booking.partnerId)!.parkingInstructions,
        contactPersonName: settingsMap.get(booking.partnerId)!.contactPersonName,
        contactPersonPhone: settingsMap.get(booking.partnerId)!.contactPersonPhone,
      } : undefined,
    }));

    return NextResponse.json({
      bookings: enrichedBookings,
      total: result.total,
    });
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/bookings
 * Create a new booking
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting: 10 booking creations per hour
    const identifier = getIdentifier(req, user.id);
    const rateLimitResult = await bookingCreateLimiter.check(identifier);
    if (!rateLimitResult.success) {
      return rateLimitResponse(rateLimitResult);
    }

    // Best-effort cleanup (fire-and-forget, don't block response)
    if (!memoryCache.get<boolean>('maintenance:booking')) {
      memoryCache.set('maintenance:booking', true, BOOKING_MAINTENANCE_TTL_SECONDS);
      runBookingMaintenance().catch(() => {});
    }

    const body = await req.json();
    const { listingId, scheduledDate, scheduledStartTime, scheduledEndTime, notes, specialRequests, numberOfAttendees } = body;

    // Validate required fields
    if (!listingId || !scheduledDate || !scheduledStartTime || !scheduledEndTime) {
      return NextResponse.json(
        { error: 'Missing required fields: listingId, scheduledDate, scheduledStartTime, scheduledEndTime' },
        { status: 400 }
      );
    }

    // Check user restrictions first
    const restrictions = await checkUserBookingRestrictions(user.id);
    if (!restrictions.canBook) {
      return NextResponse.json(
        { error: restrictions.reason, restrictions },
        { status: 429 }
      );
    }

    // Create booking
    const result = await createBooking({
      userId: user.id,
      listingId,
      scheduledDate: new Date(scheduledDate),
      scheduledStartTime: new Date(scheduledStartTime),
      scheduledEndTime: new Date(scheduledEndTime),
      notes,
      specialRequests,
      numberOfAttendees: numberOfAttendees || 1,
      source: 'web',
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      bookingId: result.bookingId,
      confirmationToken: result.confirmationToken,
      message: 'Booking created successfully',
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    );
  }
}
