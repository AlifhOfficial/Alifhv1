/**
 * Didit KYC Session API
 * 
 * Creates a verification session with Didit and returns the URL
 * for the user to complete their KYC verification.
 * 
 * POST /api/kyc/didit/session
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session-context';
import { createVerificationSession, isDiditConfigured } from '@/lib/kyc/didit-client';
import { createRateLimiter, getIdentifier, rateLimitResponse, RATE_LIMITS_KYC } from '@/lib/rate-limit';
import { 
  createKycRecord, 
  getLatestKycRecordForUser,
  db,
  userProfile,
  eq,
  memoryCache,
  CacheKeys,
} from '@alifh/database';

export const runtime = 'nodejs';

const kycSessionLimiter = createRateLimiter(RATE_LIMITS_KYC.SUBMIT);

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!isDiditConfigured()) {
      return NextResponse.json(
        { error: 'KYC service not configured' },
        { status: 503 }
      );
    }

    const identifier = getIdentifier(req, user.id);
    const rateLimitResult = await kycSessionLimiter.check(identifier);
    if (!rateLimitResult.success) {
      return rateLimitResponse(rateLimitResult);
    }

    const existingKyc = await getLatestKycRecordForUser(user.id);
    if (existingKyc) {
      if (existingKyc.status === 'approved') {
        return NextResponse.json(
          { error: 'KYC already verified', status: 'approved' },
          { status: 400 }
        );
      }
      
      // If there's a VALID pending Didit session (with session ID and URL), return it
      if (existingKyc.status === 'pending' && existingKyc.diditSessionId && existingKyc.diditSessionUrl) {
        return NextResponse.json({
          success: true,
          sessionId: existingKyc.diditSessionId,
          verificationUrl: existingKyc.diditSessionUrl,
          status: 'pending',
          isExisting: true,
        });
      }
    }

    const body = await req.json().catch(() => ({}));
    const callbackUrl = body.callbackUrl || process.env.NEXT_PUBLIC_DIDIT_CALLBACK_URL;

    const session = await createVerificationSession({
      userId: user.id,
      callbackUrl,
      metadata: {
        email: user.email,
        name: user.name || '',
      },
    });

    const newKycRecord = await createKycRecord({
      userId: user.id,
      type: 'full',
      diditSessionId: session.id,
      diditSessionUrl: session.url,
      metadata: {
        initiatedAt: new Date().toISOString(),
      },
    });

    await db
      .update(userProfile)
      .set({
        kycStatus: 'pending',
        updatedAt: new Date(),
      })
      .where(eq(userProfile.userId, user.id));

    // Invalidate user profile cache
    memoryCache.delete(CacheKeys.userProfile(user.id));

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      verificationUrl: session.url,
      recordId: newKycRecord.id,
      status: 'created',
    });

  } catch {
    return NextResponse.json(
      { error: 'Failed to create verification session' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/kyc/didit/session
 * 
 * Get the current user's KYC status
 */
export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const kycRecord = await getLatestKycRecordForUser(user.id);

    if (!kycRecord) {
      return NextResponse.json({
        hasKyc: false,
        status: null,
        message: 'No KYC verification started',
      });
    }

    return NextResponse.json({
      hasKyc: true,
      status: kycRecord.status,
      type: kycRecord.type,
      sessionId: kycRecord.diditSessionId,
      verificationUrl: kycRecord.diditSessionUrl,
      verifiedAt: kycRecord.verifiedAt,
      createdAt: kycRecord.createdAt,
    });

  } catch {
    return NextResponse.json(
      { error: 'Failed to get KYC status' },
      { status: 500 }
    );
  }
}
