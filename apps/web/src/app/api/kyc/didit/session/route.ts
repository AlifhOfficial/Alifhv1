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
import { createVerificationSession, isDiditConfigured, getDiditConfig } from '@/lib/kyc/didit-client';
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
    // 1. Authenticate user
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Check if Didit is configured
    if (!isDiditConfigured()) {
      const config = getDiditConfig();
      console.error('[KYC/Didit] Not configured:', config);
      return NextResponse.json(
        { error: 'KYC service not configured' },
        { status: 503 }
      );
    }

    // 3. Rate limiting
    const identifier = getIdentifier(req, user.id);
    const rateLimitResult = await kycSessionLimiter.check(identifier);
    if (!rateLimitResult.success) {
      return rateLimitResponse(rateLimitResult);
    }

    // 4. Check if user already has a pending or approved KYC
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
        console.log(`[KYC/Didit] Returning existing session ${existingKyc.diditSessionId} for user ${user.id}`);
        return NextResponse.json({
          success: true,
          sessionId: existingKyc.diditSessionId,
          verificationUrl: existingKyc.diditSessionUrl,
          status: 'pending',
          isExisting: true,
        });
      }
    }

    // 5. Get callback URL from request or environment
    const body = await req.json().catch(() => ({}));
    const callbackUrl = body.callbackUrl || process.env.NEXT_PUBLIC_DIDIT_CALLBACK_URL;

    // 6. Create Didit verification session
    const session = await createVerificationSession({
      userId: user.id,
      callbackUrl,
      metadata: {
        email: user.email,
        name: user.name || '',
      },
    });

    // 7. Create KYC record in database
    const kycRecord = await createKycRecord({
      userId: user.id,
      type: 'full',
      diditSessionId: session.id,
      diditSessionUrl: session.url,
      metadata: {
        initiatedAt: new Date().toISOString(),
      },
    });

    // 8. Update user profile to show pending KYC status
    await db
      .update(userProfile)
      .set({
        kycStatus: 'pending',
        updatedAt: new Date(),
      })
      .where(eq(userProfile.userId, user.id));

    // Invalidate user profile cache so next fetch gets fresh data
    memoryCache.delete(CacheKeys.userProfile(user.id));

    console.log(`[KYC/Didit] Session created for user ${user.id}: ${session.id}`);

    // 9. Return the verification URL
    return NextResponse.json({
      success: true,
      sessionId: session.id,
      verificationUrl: session.url,
      recordId: kycRecord.id,
      status: 'created',
    });

  } catch (error) {
    console.error('[KYC/Didit] Session creation failed:', error);
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
export async function GET(req: NextRequest) {
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

  } catch (error) {
    console.error('[KYC/Didit] Status check failed:', error);
    return NextResponse.json(
      { error: 'Failed to get KYC status' },
      { status: 500 }
    );
  }
}
