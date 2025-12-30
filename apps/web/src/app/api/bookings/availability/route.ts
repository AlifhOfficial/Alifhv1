/**
 * API: Partner Availability Settings
 * GET /api/bookings/availability - Get partner's availability rules
 * POST /api/bookings/availability - Set/update availability rules
 * 
 * Authentication: Required (must be partner owner/admin)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session-context';
import {
  getPartnerAvailability,
  setPartnerAvailability,
  initializeDefaultAvailability,
  getPartnerBookingSettings,
  upsertPartnerBookingSettings,
} from '@alifh/database';
import { createRateLimiter, getIdentifier, rateLimitResponse, RATE_LIMITS_BOOKINGS } from '@/lib/rate-limit';

export const runtime = 'nodejs';

const availabilityLimiter = createRateLimiter(RATE_LIMITS_BOOKINGS.CHECK_AVAILABILITY);

/**
 * GET /api/bookings/availability
 * Get partner's availability configuration
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting: 30 availability checks per minute
    const identifier = getIdentifier(req, user.id);
    const rateLimitResult = await availabilityLimiter.check(identifier);
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

    const [availability, settings] = await Promise.all([
      getPartnerAvailability(membership.partnerId),
      getPartnerBookingSettings(membership.partnerId),
    ]);

    return NextResponse.json({
      availability,
      settings,
    });
  } catch (error) {
    console.error('Error fetching availability:', error);
    return NextResponse.json(
      { error: 'Failed to fetch availability' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/bookings/availability
 * Update availability rules or booking settings
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const membership = user.partnerMemberships?.[0];
    if (!membership) {
      return NextResponse.json(
        { error: 'Not a partner staff member' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { action, ...data } = body;

    switch (action) {
      case 'initialize': {
        // Initialize default availability for partner
        await initializeDefaultAvailability(membership.partnerId);
        const availability = await getPartnerAvailability(membership.partnerId);
        return NextResponse.json({
          success: true,
          message: 'Default availability initialized',
          availability,
        });
      }

      case 'setDay': {
        // Set availability for a specific day
        const { dayOfWeek, startTime, endTime, slotDuration, maxConcurrentBookings, bufferTime, isActive, excludeDates } = data;

        if (dayOfWeek === undefined || !startTime || !endTime) {
          return NextResponse.json(
            { error: 'dayOfWeek, startTime, and endTime are required' },
            { status: 400 }
          );
        }

        const rule = await setPartnerAvailability(membership.partnerId, dayOfWeek, {
          startTime,
          endTime,
          slotDuration,
          maxConcurrentBookings,
          bufferTime,
          isActive,
          excludeDates,
        });

        return NextResponse.json({
          success: true,
          message: 'Availability updated',
          rule,
        });
      }

      case 'updateSettings': {
        // Update booking settings
        const settings = await upsertPartnerBookingSettings(membership.partnerId, data);
        return NextResponse.json({
          success: true,
          message: 'Booking settings updated',
          settings,
        });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action. Supported: initialize, setDay, updateSettings' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error updating availability:', error);
    return NextResponse.json(
      { error: 'Failed to update availability' },
      { status: 500 }
    );
  }
}
