/**
 * Cancel KYC Verification
 * 
 * Cancels a pending KYC verification and allows user to start fresh.
 * 
 * POST /api/kyc/cancel
 */

import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session-context';
import { db, kycRecord, userProfile, eq, and, memoryCache, CacheKeys } from '@alifh/database';

export const runtime = 'nodejs';

export async function POST() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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
          eq(kycRecord.status, 'pending')
        )
      )
      .returning({ id: kycRecord.id });

    if (result.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'No pending verification to cancel' 
      });
    }

    // 3. Reset userProfile kycStatus back to 'none' so UI shows "Get verified" again
    await db
      .update(userProfile)
      .set({
        kycStatus: 'none',
        updatedAt: new Date(),
      })
      .where(eq(userProfile.userId, user.id));

    // Invalidate cache
    memoryCache.delete(CacheKeys.userProfile(user.id));

    return NextResponse.json({ 
      success: true,
      message: 'Verification cancelled successfully'
    });

  } catch {
    return NextResponse.json(
      { error: 'Failed to cancel verification' },
      { status: 500 }
    );
  }
}
