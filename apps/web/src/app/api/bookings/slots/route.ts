/**
 * API: Available Booking Slots
 * GET /api/bookings/slots - Get available slots for a listing/partner
 * 
 * Public endpoint (no auth required) - shows available times
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getAvailableSlots,
  getAvailableDates,
  getPartnerBookingSettings,
  getPartnerAvailability,
  getListingBookingContext,
  initializeDefaultAvailability,
} from '@alifh/database';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function noStoreJson(data: unknown, init?: { status?: number }) {
  return NextResponse.json(data, {
    status: init?.status,
    headers: { 'Cache-Control': 'no-store' },
  });
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
      return noStoreJson({ error: 'listingId is required' }, { status: 400 });
    }

    // Get listing to find partner
    const listing = await getListingBookingContext(listingId);

    if (!listing) {
      return noStoreJson({ error: 'Listing not found' }, { status: 404 });
    }

    if (!listing.partnerId) {
      return noStoreJson({ error: 'This listing does not support bookings' }, { status: 400 });
    }

    // Check if partner accepts bookings
    const settings = await getPartnerBookingSettings(listing.partnerId);
    if (settings && !settings.bookingEnabled) {
      return noStoreJson({
        available: false,
        reason: 'This dealer is not accepting bookings at this time',
        dates: [],
        slots: [],
      });
    }

    // Auto-initialize default availability if partner has none set up
    const existingAvailability = await getPartnerAvailability(listing.partnerId);
    if (existingAvailability.length === 0) {
      await initializeDefaultAvailability(listing.partnerId);
    }

    if (mode === 'dates') {
      // Return available dates for the next 30 days
      const dates = await getAvailableDates(listing.partnerId);
      
      return noStoreJson({
        available: true,
        partnerId: listing.partnerId,
        dates,
        settings: settings ? {
          minLeadTimeHours: settings.minLeadTimeHours,
          maxLeadTimeDays: settings.maxLeadTimeDays,
          defaultSlotDuration: settings.defaultSlotDuration,
          preparationInstructions: settings.preparationInstructions,
          directions: settings.directions,
          parkingInstructions: settings.parkingInstructions,
        } : null,
      });
    }

    // Get slots for specific date
    const date = dateStr ? new Date(dateStr) : new Date();
    date.setUTCHours(0, 0, 0, 0);
    const slots = await getAvailableSlots(listing.partnerId, date, listingId);
    const now = new Date();

    const filtered = slots.filter((s) => {
      if (!s.isAvailable) return false;
      if (settings?.minLeadTimeHours) {
        const minTime = new Date(now.getTime() + settings.minLeadTimeHours * 60 * 60 * 1000);
        if (s.startTime < minTime) return false;
      }
      if (settings?.maxLeadTimeDays) {
        const maxTime = new Date(now.getTime() + settings.maxLeadTimeDays * 24 * 60 * 60 * 1000);
        if (s.startTime > maxTime) return false;
      }
      return true;
    });

    return noStoreJson({
      available: true,
      partnerId: listing.partnerId,
      date: date.toISOString().split('T')[0],
      slots: filtered.map(slot => ({
        id: slot.id,
        startTime: slot.startTime.toISOString(),
        endTime: slot.endTime.toISOString(),
        duration: slot.duration,
        status: slot.status,
        isAvailable: slot.isAvailable,
      })),
      settings: settings ? {
        minLeadTimeHours: settings.minLeadTimeHours,
        maxLeadTimeDays: settings.maxLeadTimeDays,
        defaultSlotDuration: settings.defaultSlotDuration,
        preparationInstructions: settings.preparationInstructions,
        directions: settings.directions,
        parkingInstructions: settings.parkingInstructions,
      } : null,
    });
  } catch (error) {
    console.error('Error fetching available slots:', error);
    return noStoreJson({ error: 'Failed to fetch available slots' }, { status: 500 });
  }
}
