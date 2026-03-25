/**
 * API: Available Booking Slots
 * GET /api/bookings/slots - Get available slots for a listing/partner
 * 
 * Public endpoint (no auth required) - shows available times
 */

import { NextRequest, NextResponse } from 'next/server';
import { getPublicBookingAvailability } from '@/lib/bookings/public-availability';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function cachedJson(data: unknown, init?: { status?: number }) {
  return NextResponse.json(data, { status: init?.status });
}

/**
 * GET /api/bookings/slots
 * Get available time slots for a listing
 * 
 * Query params:
 * - listingId: Required - the listing to book
 * - date: Optional - specific date (YYYY-MM-DD), defaults to today
 * - mode: Optional - 'dates' to get available dates, 'slots' for time slots
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const listingId = searchParams.get('listingId');
    const dateStr = searchParams.get('date');
    const mode = searchParams.get('mode') || 'slots';

    if (!listingId) {
      return cachedJson({ error: 'listingId is required' }, { status: 400 });
    }

    const result = await getPublicBookingAvailability(listingId, {
      mode: mode === 'dates' ? 'dates' : 'slots',
      date: dateStr,
    });

    if (!result.available) {
      if (result.reason === 'Listing not found') {
        return cachedJson({ error: result.reason }, { status: 404 });
      }

      if (result.reason === 'This listing does not support bookings') {
        return cachedJson({ error: result.reason }, { status: 400 });
      }
    }

    return cachedJson(result);
  } catch (error) {
    console.error('Error fetching available slots:', error);
    return cachedJson({ error: 'Failed to fetch available slots' }, { status: 500 });
  }
}
