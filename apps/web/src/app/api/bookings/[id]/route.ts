/**
 * API: Booking Operations
 * GET /api/bookings/[id] - Get booking details
 * PATCH /api/bookings/[id] - Update booking (cancel, reschedule)
 * 
 * Authentication: Required (user must own the booking)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session-context';
import {
  getBookingById,
  cancelBooking,
  rescheduleBooking,
  submitBookingFeedback,
} from '@alifh/database';


export const runtime = 'nodejs';

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/bookings/[id]
 * Get booking details
 */
export async function GET(req: NextRequest, { params }: RouteContext) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }


    const { id } = await params;
    const booking = await getBookingById(id);

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Only allow user to view their own booking
    if (booking.userId !== user.id) {
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
 * PATCH /api/bookings/[id]
 * Update booking - cancel, reschedule, or submit feedback
 */
export async function PATCH(req: NextRequest, { params }: RouteContext) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }


    const { id } = await params;
    const body = await req.json();
    const { action, ...data } = body;

    // Get booking to verify ownership
    const booking = await getBookingById(id);
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    if (booking.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    switch (action) {
      case 'cancel': {
        const { reason, notes } = data;

        const result = await cancelBooking(id, 'user', user.id, reason || 'other', notes);
        if (!result.success) {
          return NextResponse.json({ error: result.error }, { status: 400 });
        }

        return NextResponse.json({ success: true, message: 'Booking cancelled' });
      }

      case 'reschedule': {
        const { newDate, newStartTime, newEndTime } = data;
        if (!newDate || !newStartTime || !newEndTime) {
          return NextResponse.json(
            { error: 'New date and time are required for rescheduling' },
            { status: 400 }
          );
        }

        const result = await rescheduleBooking(
          id,
          user.id,
          new Date(newDate),
          new Date(newStartTime),
          new Date(newEndTime)
        );

        if (!result.success) {
          return NextResponse.json({ error: result.error }, { status: 400 });
        }

        return NextResponse.json({ success: true, message: 'Booking rescheduled' });
      }

      case 'feedback': {
        const { feedback } = data;
        if (!feedback || !feedback.overallRating) {
          return NextResponse.json(
            { error: 'Feedback with overall rating is required' },
            { status: 400 }
          );
        }

        const result = await submitBookingFeedback(id, user.id, feedback);
        if (!result.success) {
          return NextResponse.json({ error: result.error }, { status: 400 });
        }

        return NextResponse.json({ success: true, message: 'Feedback submitted' });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action. Supported: cancel, reschedule, feedback' },
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
