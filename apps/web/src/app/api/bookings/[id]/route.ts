/**
 * API: Single Booking Operations
 * GET /api/bookings/[id] - Get booking details
 * PATCH /api/bookings/[id] - Update booking (cancel, reschedule, feedback)
 * 
 * Note: This is a convenience route. All operations can also be done via POST /api/bookings
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session-context';
import { getBookings, manageBooking, type CancellationReason } from '@alifh/database';

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
    const result = await getBookings({
      id,
      includePartnerSettings: true,
    });

    if (result.bookings.length === 0) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const booking = result.bookings[0];

    // Authorization: user can view own booking, staff can view partner's bookings
    const isOwner = booking.userId === user.id;
    const isStaff = user.partnerMemberships?.some(m => m.partnerId === booking.partnerId);

    if (!isOwner && !isStaff) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json(booking);
  } catch (error) {
    console.error('Error fetching booking:', error);
    return NextResponse.json({ error: 'Failed to fetch booking' }, { status: 500 });
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

    if (!action) {
      return NextResponse.json({ error: 'action is required' }, { status: 400 });
    }

    // Verify booking exists and user has access
    const result = await getBookings({ id });
    if (result.bookings.length === 0) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const booking = result.bookings[0];
    const isOwner = booking.userId === user.id;
    const membership = user.partnerMemberships?.find(m => m.partnerId === booking.partnerId);
    const isStaff = !!membership;

    // User-only actions (cannot be done by staff on behalf of user)
    const userOnlyActions = ['reschedule', 'feedback'];
    // Staff-only actions
    const staffOnlyActions = ['confirm', 'reject', 'complete', 'checkIn', 'noShow'];
    // Shared actions (both user and staff can do)
    const sharedActions = ['cancel'];

    // User-only actions require ownership
    if (userOnlyActions.includes(action) && !isOwner) {
      return NextResponse.json({ error: 'You can only modify your own bookings' }, { status: 403 });
    }

    // Staff-only actions require staff membership
    if (staffOnlyActions.includes(action) && !isStaff) {
      return NextResponse.json({ error: 'Staff access required' }, { status: 403 });
    }

    // Shared actions require either ownership OR staff access
    if (sharedActions.includes(action) && !isOwner && !isStaff) {
      return NextResponse.json({ error: 'You can only modify your own bookings' }, { status: 403 });
    }

    // Determine actor type for the mutation
    const isStaffAction = staffOnlyActions.includes(action) || (sharedActions.includes(action) && isStaff && !isOwner);

    const mutationResult = await manageBooking({
      action,
      actorId: user.id,
      actorType: isStaffAction ? 'staff' : 'user',
      bookingId: id,
      
      // Cancel/reject - notes is the free text, reason can be either
      reason: data.notes || data.reason,
      cancellationReason: (data.cancellationReason || 'other') as CancellationReason,
      
      // Reschedule
      newDate: data.newDate ? new Date(data.newDate) : undefined,
      newStartTime: data.newStartTime ? new Date(data.newStartTime) : undefined,
      newEndTime: data.newEndTime ? new Date(data.newEndTime) : undefined,
      
      // Staff operations
      partnerNotes: data.partnerNotes,
      checkInTime: data.checkInTime ? new Date(data.checkInTime) : undefined,
      checkOutTime: data.checkOutTime ? new Date(data.checkOutTime) : undefined,
      noShowReason: data.noShowReason,
      
      // Feedback
      feedback: data.feedback,
    });

    if (!mutationResult.success) {
      return NextResponse.json({ error: mutationResult.error }, { status: 400 });
    }

    return NextResponse.json(mutationResult);
  } catch (error) {
    console.error('Error updating booking:', error);
    return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 });
  }
}
