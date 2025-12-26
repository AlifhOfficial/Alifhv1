import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session-context';
import { getStaffProfileWithPartner, getStaffIdForUser, updateStaffProfileById } from '@alifh/database';

export const runtime = 'nodejs';

/**
 * GET /api/staff/profile
 * Get staff profile for current user (when they are staff at a dealership, not owner)
 */
export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
