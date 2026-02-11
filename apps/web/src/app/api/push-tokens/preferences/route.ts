/**
 * Notification Preferences API
 * GET: Get user notification preferences
 * PATCH: Update user notification preferences
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session-context';
import { getNotificationPreferences, updateNotificationPreferences } from '@alifh/database';

export const runtime = 'nodejs';

// ============================================================================
// GET /api/push-tokens/preferences
// Get notification preferences for the authenticated user
// ============================================================================

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const preferences = await getNotificationPreferences(user.id);

    return NextResponse.json({
      success: true,
      preferences,
    });
  } catch (error) {
    console.error('[Push API] Get preferences error:', error);
    return NextResponse.json(
      { error: 'Failed to get notification preferences' },
      { status: 500 }
    );
  }
}

// ============================================================================
// PATCH /api/push-tokens/preferences
// Update notification preferences for the authenticated user
// ============================================================================

export async function PATCH(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { 
      newMessage,
      listingApproved,
      listingRejected,
      listingViewed,
      listingSaved,
      newEnquiry,
      priceDrops,
      bookingRequest,
      bookingConfirmed,
      bookingReminder,
      promotions,
    } = body;

    // Build updates object with only provided values
    const updates: Record<string, boolean> = {};
    if (newMessage !== undefined) updates.newMessage = newMessage;
    if (listingApproved !== undefined) updates.listingApproved = listingApproved;
    if (listingRejected !== undefined) updates.listingRejected = listingRejected;
    if (listingViewed !== undefined) updates.listingViewed = listingViewed;
    if (listingSaved !== undefined) updates.listingSaved = listingSaved;
    if (newEnquiry !== undefined) updates.newEnquiry = newEnquiry;
    if (priceDrops !== undefined) updates.priceDrops = priceDrops;
    if (bookingRequest !== undefined) updates.bookingRequest = bookingRequest;
    if (bookingConfirmed !== undefined) updates.bookingConfirmed = bookingConfirmed;
    if (bookingReminder !== undefined) updates.bookingReminder = bookingReminder;
    if (promotions !== undefined) updates.promotions = promotions;

    // Validate at least one preference is provided
    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'At least one preference setting is required' },
        { status: 400 }
      );
    }

    await updateNotificationPreferences(user.id, updates);

    console.log(`[Push API] Updated preferences for user ${user.id}`);

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error('[Push API] Update preferences error:', error);
    return NextResponse.json(
      { error: 'Failed to update notification preferences' },
      { status: 500 }
    );
  }
}
