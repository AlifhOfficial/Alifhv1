/**
 * API: Booking Verification (Staff)
 * POST /api/bookings/manage/verify - Verify booking by confirmation code and update status
 *
 * Use-case: customer shows confirmation code at the dealership; staff marks arrival/completion.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session-context';
import {
  checkInBookingAsStaff,
  completeBooking,
  confirmBooking,
  getBookingVerificationContextByConfirmationToken,
  reportNoShow,
} from '@alifh/database';


export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }


    const membership = user.partnerMemberships?.[0];
    if (!membership) {
      return NextResponse.json({ error: 'Not a partner staff member' }, { status: 403 });
    }

    if (membership.staffRole === 'viewer') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await req.json();
    const confirmationToken = String(body.confirmationToken || '').trim().toUpperCase();
    const action = String(body.action || 'check_in') as 'check_in' | 'confirm' | 'complete' | 'no_show';

    if (!confirmationToken) {
      return NextResponse.json({ error: 'confirmationToken is required' }, { status: 400 });
    }

    const bookingRow = await getBookingVerificationContextByConfirmationToken(confirmationToken);

    if (!bookingRow) {
      return NextResponse.json({ error: 'Booking not found for that code' }, { status: 404 });
    }

    if (bookingRow.partnerId !== membership.partnerId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (!['pending', 'confirmed'].includes(bookingRow.status)) {
      return NextResponse.json(
        { error: `Booking cannot be updated in status: ${bookingRow.status}` },
        { status: 400 }
      );
    }

    if (action === 'confirm') {
      const result = await confirmBooking(bookingRow.id, user.id);
      if (!result.success) return NextResponse.json({ error: result.error }, { status: 400 });
      return NextResponse.json({ success: true, bookingId: bookingRow.id, action });
    }

    if (action === 'check_in') {
      const result = await checkInBookingAsStaff(bookingRow.id, membership.partnerId, user.id);
      if (!result.success) return NextResponse.json({ error: result.error }, { status: 400 });

      return NextResponse.json({ success: true, bookingId: bookingRow.id, action });
    }

    if (action === 'complete') {
      const result = await completeBooking(bookingRow.id, user.id);
      if (!result.success) return NextResponse.json({ error: result.error }, { status: 400 });
      return NextResponse.json({ success: true, bookingId: bookingRow.id, action });
    }

    if (action === 'no_show') {
      const result = await reportNoShow(bookingRow.id, user.id, 'Verified by code');
      if (!result.success) return NextResponse.json({ error: result.error }, { status: 400 });
      return NextResponse.json({ success: true, bookingId: bookingRow.id, action });
    }

    return NextResponse.json(
      { error: 'Invalid action. Supported: check_in, confirm, complete, no_show' },
      { status: 400 }
    );
  } catch (error) {
    console.error('[Booking Verify API] Error:', error);
    return NextResponse.json({ error: 'Failed to verify booking' }, { status: 500 });
  }
}
