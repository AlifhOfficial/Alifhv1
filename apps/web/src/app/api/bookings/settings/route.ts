/**
 * API: Booking Settings
 * GET /api/bookings/settings - Get partner availability & settings
 * POST /api/bookings/settings - Update availability rules or settings
 * 
 * For staff to manage their partner's booking configuration
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session-context';
import { managePartnerSettings } from '@alifh/database';

export const runtime = 'nodejs';

/**
 * GET /api/bookings/settings
 * Get staff's availability rules and booking settings
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get partner from user's membership
    const membership = user.partnerMemberships?.[0];
    if (!membership?.partnerId) {
      return NextResponse.json({ error: 'No partner access' }, { status: 403 });
    }

    // Get staff-specific settings for the current user
    const result = await managePartnerSettings({
      partnerId: membership.partnerId,
      staffUserId: user.id,
      action: 'get',
    });

    return NextResponse.json({
      success: true,
      availability: result.availability || [],
      settings: result.settings || null,
    });
  } catch (error) {
    console.error('[Booking Settings API] GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

/**
 * POST /api/bookings/settings
 * Update availability or settings
 * 
 * Body: { action: 'initialize' | 'setDay' | 'updateSettings', ...data }
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const membership = user.partnerMemberships?.[0];
    if (!membership?.partnerId) {
      return NextResponse.json({ error: 'No partner access' }, { status: 403 });
    }

    const body = await req.json();
    const { action, ...data } = body;

    if (!action) {
      return NextResponse.json({ error: 'action is required' }, { status: 400 });
    }

    // Map UI actions to managePartnerSettings actions
    const actionMap: Record<string, string> = {
      initialize: 'initDefaults',
      setDay: 'setDay',
      updateSettings: 'updateSettings',
    };

    const mappedAction = actionMap[action] || action;

    // Pass staffUserId so each staff member has their own settings
    const result = await managePartnerSettings({
      partnerId: membership.partnerId,
      staffUserId: user.id,
      action: mappedAction as any,
      ...data,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('[Booking Settings API] POST error:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
