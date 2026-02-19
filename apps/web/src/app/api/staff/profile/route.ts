import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session-context';
import { getStaffProfileWithPartner, getStaffIdForUser, updateStaffProfileById } from '@alifh/database';


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


  // Find staff membership where user is NOT the owner
  const staffRecord = await getStaffProfileWithPartner(user.id);

  if (!staffRecord) {
    return NextResponse.json({ error: 'No staff profile found' }, { status: 404 });
  }

  return NextResponse.json(staffRecord);
}

/**
 * PATCH /api/staff/profile
 * Update staff work identity (displayName, workPhone, usePersonalPhone)
 */
export async function PATCH(request: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }


  const body = await request.json();
  const { displayName, workPhone, usePersonalPhone, workPhoneVerified } = body;

  // Find staff ID where user is NOT the owner
  const staffId = await getStaffIdForUser(user.id);

  if (!staffId) {
    return NextResponse.json({ error: 'No staff profile found' }, { status: 404 });
  }

  // Build update object with only provided fields
  const updateData: Record<string, any> = {};
  if (displayName !== undefined) updateData.displayName = displayName || null;
  if (workPhone !== undefined) updateData.workPhone = workPhone || null;
  if (usePersonalPhone !== undefined) updateData.usePersonalPhone = usePersonalPhone;
  if (workPhoneVerified !== undefined) updateData.workPhoneVerified = workPhoneVerified;

  // Update the staff profile
  await updateStaffProfileById(staffId, updateData);

  return NextResponse.json({ success: true });
}
