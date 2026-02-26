/**
 * Cancel KYC Verification
 * 
 * Cancels any non-approved KYC verification and allows user to start fresh.
 * More aggressive than before - clears ANY record that isn't approved.
 * 
 * POST /api/kyc/cancel
 */

import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session-context';
import { db, kycRecord, userProfile, eq, and, ne } from '@alifh/database';

export const runtime = 'nodejs';

export async function POST() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Cancel ALL non-approved records (pending, rejected, or any stuck state)
    const result = await db
      .update(kycRecord)
      .set({
        status: 'cancelled',
        rejectionReason: 'Cancelled by user',
        diditSessionId: null,
        diditSessionUrl: null,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(kycRecord.userId, user.id),
          ne(kycRecord.status, 'approved'),
          ne(kycRecord.status, 'cancelled')
        )
      )
      .returning({ id: kycRecord.id });

    // ALWAYS reset userProfile kycStatus to 'none' (unless already approved/verified)
    await db
      .update(userProfile)
      .set({
        kycStatus: 'none',
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(userProfile.userId, user.id),
          ne(userProfile.kycStatus, 'approved')
        )
      );

    return NextResponse.json({ 
      success: true,
      message: result.length > 0 
        ? 'Verification cancelled successfully' 
        : 'Ready for fresh verification'
    });

  } catch {
    return NextResponse.json(
      { error: 'Failed to cancel verification' },
      { status: 500 }
    );
  }
}
