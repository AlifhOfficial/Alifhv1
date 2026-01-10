/**
 * Cancel KYC Verification
 * 
 * Cancels a pending KYC verification and allows user to start fresh.
 * 
 * POST /api/kyc/cancel
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session-context';
import { db, kycRecord, eq, and } from '@alifh/database';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate user
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Update pending KYC record to cancelled and clear session data
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

    console.log(`[KYC/Cancel] User ${user.id} cancelled KYC record ${result[0].id}`);

    return NextResponse.json({ 
      success: true,
      message: 'Verification cancelled successfully'
    });

  } catch (error) {
    console.error('[KYC/Cancel] Error:', error);
    return NextResponse.json(
      { error: 'Failed to cancel verification' },
      { status: 500 }
    );
  }
}
