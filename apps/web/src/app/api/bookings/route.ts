/**
 * API: Bookings
 * 
 * Simplified booking API:
 * - GET /api/bookings - Get bookings (with filters)
 * - POST /api/bookings - Manage booking (create, cancel, reschedule, feedback, etc.)
 * 
 * Authentication: Required
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session-context';
import {
  getBookings,
  manageBooking,
  checkBookingRestrictions,
  runBookingMaintenance,
  type BookingStatus,
  type BookingAction,
  type CancellationReason,
} from '@alifh/database';

export const runtime = 'nodejs';

/**
 * GET /api/bookings
 * 
 * Universal booking getter with filters:
 * - ?id=xxx - Single booking by ID
 * - ?status=pending,confirmed - Filter by status
 * - ?upcoming=true - Only future bookings
 * - ?includeStats=true - Include booking counts
 * - ?limit=20&offset=0 - Pagination
 * - ?staffView=true - Staff view (partner bookings)
 * - ?myListings=true - Only bookings for staff's own listings
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fire-and-forget maintenance
    runBookingMaintenance().catch(() => {});

    const { searchParams } = new URL(req.url);
    
    // Build params from query string
    const id = searchParams.get('id') || undefined;
    const confirmationToken = searchParams.get('confirmationToken') || undefined;
    const statusParam = searchParams.get('status');
    const status = statusParam ? statusParam.split(',') as BookingStatus[] : undefined;
    const q = searchParams.get('q') || undefined;
    const sort = (searchParams.get('sort') || 'newest') as 'newest' | 'oldest' | 'soonest';
    const upcoming = searchParams.get('upcoming') === 'true';
    const includeStats = searchParams.get('includeStats') === 'true';
    const includePartnerSettings = searchParams.get('includeSettings') !== 'false';
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Check if user is staff (for partner bookings)
    const membership = user.partnerMemberships?.[0];
    const partnerId = searchParams.get('partnerId') || membership?.partnerId;
    const staffView = searchParams.get('staffView') === 'true' && membership;
    
    // Staff user ID filter - either myListings (current user) or explicit staffUserId param
    const staffUserIdParam = searchParams.get('staffUserId');
    const staffUserId = staffView 
      ? (searchParams.get('myListings') === 'true' ? user.id : staffUserIdParam || undefined)
      : undefined;

    const result = await getBookings({
      // User's own bookings OR partner bookings if staff
      userId: staffView ? undefined : user.id,
      partnerId: staffView ? partnerId : undefined,
      staffUserId,
      
      id,
      confirmationToken,
      status,
      q,
      sort,
      upcoming,
      includeStats,
      includePartnerSettings,
      limit,
      offset,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('[Bookings API] GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
  }
}

/**
 * POST /api/bookings
 * 
 * Universal booking mutation:
 * - action: create | cancel | reschedule | confirm | reject | complete | checkIn | noShow | feedback
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fire-and-forget maintenance
    runBookingMaintenance().catch(() => {});

    const body = await req.json();
    const { action = 'create', ...data } = body;

    // Determine actor type
    const membership = user.partnerMemberships?.[0];
    const staffActions: BookingAction[] = ['confirm', 'reject', 'complete', 'checkIn', 'noShow'];
    const isStaffAction = staffActions.includes(action);
    
    // Authorization checks
    if (isStaffAction) {
      if (!membership) {
        return NextResponse.json({ error: 'Not a partner staff member' }, { status: 403 });
      }
      if (membership.staffRole === 'viewer') {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
      }
    }

    // For create action, check restrictions first
    if (action === 'create') {
      const restrictions = await checkBookingRestrictions(user.id);
      if (!restrictions.canBook) {
        return NextResponse.json({ error: restrictions.reason, restrictions }, { status: 429 });
      }
    }

    // Execute action
    const result = await manageBooking({
      action,
      actorId: user.id,
      actorType: isStaffAction ? 'staff' : 'user',
      
      // Pass through all data
      listingId: data.listingId,
      scheduledDate: data.scheduledDate ? new Date(data.scheduledDate) : undefined,
      scheduledStartTime: data.scheduledStartTime ? new Date(data.scheduledStartTime) : undefined,
      scheduledEndTime: data.scheduledEndTime ? new Date(data.scheduledEndTime) : undefined,
      notes: data.notes,
      specialRequests: data.specialRequests,
      numberOfAttendees: data.numberOfAttendees,
      source: data.source || 'web',
      
      bookingId: data.bookingId || data.id,
      confirmationToken: data.confirmationToken,
      
      reason: data.reason,
      cancellationReason: data.cancellationReason as CancellationReason,
      
      newDate: data.newDate ? new Date(data.newDate) : undefined,
      newStartTime: data.newStartTime ? new Date(data.newStartTime) : undefined,
      newEndTime: data.newEndTime ? new Date(data.newEndTime) : undefined,
      
      partnerNotes: data.partnerNotes,
      checkInTime: data.checkInTime ? new Date(data.checkInTime) : undefined,
      checkOutTime: data.checkOutTime ? new Date(data.checkOutTime) : undefined,
      noShowReason: data.noShowReason,
      feedback: data.feedback,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('[Bookings API] POST error:', error);
    return NextResponse.json({ error: 'Failed to process booking action' }, { status: 500 });
  }
}
