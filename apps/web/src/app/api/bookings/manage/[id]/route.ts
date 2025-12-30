/**
 * API: Staff Booking Operations
 * PATCH /api/bookings/manage/[id] - Confirm, reject, complete, or report no-show
 * 
 * Authentication: Required (must be partner staff)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session-context';
import {
  getBookingById,
  confirmBooking,
  rejectBooking,
  completeBooking,
  reportNoShow,
  cancelBooking,
} from '@alifh/database';
import {
  createRateLimiter,
  getIdentifier,
  rateLimitResponse,
  RATE_LIMITS_GENERAL,
  RATE_LIMITS_PARTNER,
} from '@/lib/rate-limit';

const readLimiter = createRateLimiter(RATE_LIMITS_GENERAL.READ_AUTH);
const manageLimiter = createRateLimiter(RATE_LIMITS_PARTNER.STAFF_OPERATIONS);

export const runtime = 'nodejs';

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/bookings/manage/[id]
 * Get booking details (staff view)
 */
export async function GET(req: NextRequest, { params }: RouteContext) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limit by user
    const identifier = getIdentifier(req, user.id);
    const rateLimitResult = await readLimiter.check(identifier);
    if (!rateLimitResult.success) {
      return rateLimitResponse(rateLimitResult);
    }

    const membership = user.partnerMemberships?.[0];
    if (!membership) {
      return NextResponse.json(
        { error: 'Not a partner staff member' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const booking = await getBookingById(id);

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Verify this booking belongs to the staff's partner
    if (booking.partnerId !== membership.partnerId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json(booking);
  } catch (error) {
    console.error('Error fetching booking:', error);
    return NextResponse.json(
      { error: 'Failed to fetch booking' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/bookings/manage/[id]
 * Update booking status (confirm, reject, complete, no-show, cancel)
 */
export async function PATCH(req: NextRequest, { params }: RouteContext) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limit by user
    const identifier = getIdentifier(req, user.id);
    const rateLimitResult = await manageLimiter.check(identifier);
    if (!rateLimitResult.success) {
      return rateLimitResponse(rateLimitResult);
    }

    const membership = user.partnerMemberships?.[0];
    if (!membership) {
      return NextResponse.json(
        { error: 'Not a partner staff member' },
        { status: 403 }
      );
    }

    // Only owners, admins, and sales can manage bookings
    if (membership.staffRole === 'viewer') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await req.json();
    const { action, ...data } = body;

    // Get booking to verify ownership
    const booking = await getBookingById(id);
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    if (booking.partnerId !== membership.partnerId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    switch (action) {
      case 'confirm': {
        const result = await confirmBooking(id, user.id, data.partnerNotes);
        if (!result.success) {
          return NextResponse.json({ error: result.error }, { status: 400 });
        }
        return NextResponse.json({ success: true, message: 'Booking confirmed' });
      }

      case 'reject': {
        if (!data.reason) {
          return NextResponse.json(
            { error: 'Rejection reason is required' },
            { status: 400 }
          );
        }
        const result = await rejectBooking(id, user.id, data.reason);
        if (!result.success) {
          return NextResponse.json({ error: result.error }, { status: 400 });
        }
        return NextResponse.json({ success: true, message: 'Booking rejected' });
      }

      case 'complete': {
        const result = await completeBooking(
          id,
          user.id,
          data.checkInTime ? new Date(data.checkInTime) : undefined,
          data.checkOutTime ? new Date(data.checkOutTime) : undefined,
          data.partnerNotes
        );
        if (!result.success) {
          return NextResponse.json({ error: result.error }, { status: 400 });
        }
        return NextResponse.json({ success: true, message: 'Booking marked as complete' });
      }

      case 'no_show': {
        const result = await reportNoShow(id, user.id, data.reason);
        if (!result.success) {
          return NextResponse.json({ error: result.error }, { status: 400 });
        }
        return NextResponse.json({ success: true, message: 'No-show reported' });
      }

      case 'cancel': {
        const result = await cancelBooking(
          id,
          'partner',
          user.id,
          data.reason || 'other',
          data.notes
        );
        if (!result.success) {
          return NextResponse.json({ error: result.error }, { status: 400 });
        }
        return NextResponse.json({ success: true, message: 'Booking cancelled by partner' });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action. Supported: confirm, reject, complete, no_show, cancel' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error updating booking:', error);
    return NextResponse.json(
      { error: 'Failed to update booking' },
      { status: 500 }
    );
  }
}
