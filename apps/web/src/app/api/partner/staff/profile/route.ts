/**
 * Staff Profile API
 * GET - Get current staff member's profile
 * PATCH - Update staff profile (displayName, workPhone)
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getStaffProfile, updateStaffProfile } from '@alifh/database';
import { getSessionUser } from '@/lib/auth/session-context';
import {
  createRateLimiter,
  getIdentifier,
  rateLimitResponse,
  RATE_LIMITS_GENERAL,
  RATE_LIMITS_PARTNER,
} from '@/lib/rate-limit';

const readLimiter = createRateLimiter(RATE_LIMITS_GENERAL.READ_AUTH);
const updateLimiter = createRateLimiter(RATE_LIMITS_PARTNER.PROFILE_UPDATE);

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Rate limit by user
    const identifier = getIdentifier(req, user.id);
    const rateLimitResult = await readLimiter.check(identifier);
    if (!rateLimitResult.success) {
      return rateLimitResponse(rateLimitResult);
    }

    if (!user.hasPartnerAccess || !user.partnerMemberships?.[0]) {
      return NextResponse.json(
        { error: 'Only staff members can access this' },
        { status: 403 }
      );
    }

    const membership = user.partnerMemberships[0];

    // Get the staff record
    const staffRecord = await getStaffProfile(membership.partnerId, user.id);

    if (!staffRecord) {
      return NextResponse.json(
        { error: 'Staff record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: staffRecord,
    });
  } catch (error) {
    console.error('[Staff Profile GET] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

const updateSchema = z.object({
  displayName: z.string().max(100).optional(),
  workPhone: z.string().max(20).optional(),
  usePersonalPhone: z.boolean().optional(),
  workPhoneVerified: z.boolean().optional(),
});

export async function PATCH(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Rate limit by user
    const identifier = getIdentifier(req, user.id);
    const rateLimitResult = await updateLimiter.check(identifier);
    if (!rateLimitResult.success) {
      return rateLimitResponse(rateLimitResult);
    }

    if (!user.hasPartnerAccess || !user.partnerMemberships?.[0]) {
      return NextResponse.json(
        { error: 'Only staff members can update their profile' },
        { status: 403 }
      );
    }

    const membership = user.partnerMemberships[0];
    const body = await req.json();
    const validated = updateSchema.parse(body);

    // Update the staff record
    const updated = await updateStaffProfile(membership.partnerId, user.id, {
      displayName: validated.displayName || null,
      workPhone: validated.workPhone || null,
      usePersonalPhone: validated.usePersonalPhone,
      workPhoneVerified: validated.workPhoneVerified,
    });

    if (!updated) {
      return NextResponse.json(
        { error: 'Staff record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    console.error('[Staff Profile PATCH] Error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
