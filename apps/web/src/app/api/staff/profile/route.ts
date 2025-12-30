import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session-context';
import { getStaffProfileWithPartner, getStaffIdForUser, updateStaffProfileById } from '@alifh/database';
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

/**
 * GET /api/staff/profile
 * Get staff profile for current user (when they are staff at a dealership, not owner)
 */
export async function GET(request: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Rate limit by user
  const identifier = getIdentifier(request, user.id);
  const rateLimitResult = await readLimiter.check(identifier);
  if (!rateLimitResult.success) {
    return rateLimitResponse(rateLimitResult);
  }

  // Find staff membership where user is NOT the owner
  const staffRecord = await getStaffProfileWithPartner(user.id);

  if (!staffRecord) {
    return NextResponse.json({ error: 'No staff profile found' }, { status: 404 });
  }

  return NextResponse.json(staffRecord);
}

/**
 * PATCH /api/staff/profile
 * Update staff work identity (displayName, workEmail, workPhone)
 */
export async function PATCH(request: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Rate limit by user
  const identifier = getIdentifier(request, user.id);
  const rateLimitResult = await updateLimiter.check(identifier);
  if (!rateLimitResult.success) {
    return rateLimitResponse(rateLimitResult);
  }

  const body = await request.json();
  const { displayName, workEmail, workPhone } = body;

  // Find staff ID where user is NOT the owner
  const staffId = await getStaffIdForUser(user.id);

  if (!staffId) {
    return NextResponse.json({ error: 'No staff profile found' }, { status: 404 });
  }

  // Update the staff profile
  await updateStaffProfileById(staffId, {
    displayName: displayName || null,
    workEmail: workEmail || null,
    workPhone: workPhone || null,
  });

  return NextResponse.json({ success: true });
}
