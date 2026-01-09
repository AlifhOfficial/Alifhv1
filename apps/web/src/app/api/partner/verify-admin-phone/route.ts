/**
 * API: Verify Partner Admin Phone
 * POST /api/partner/verify-admin-phone
 * 
 * Verifies OTP for admin phone without updating user's personal phone.
 * Uses Twilio Verify service directly.
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSessionUser } from '@/lib/auth/session-context';
import { getPartnerProfileByUserId, updatePartnerProfile } from '@alifh/database';
import twilio from 'twilio';

export const runtime = 'nodejs';

const VerifySchema = z.object({
  phoneNumber: z.string().min(10),
  code: z.string().length(6),
});

export async function POST(request: NextRequest) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = VerifySchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const { phoneNumber, code } = parsed.data;

    // Get partner profile to verify ownership
    const profile = await getPartnerProfileByUserId(sessionUser.id);
    if (!profile) {
      return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
    }

    // Verify the phone matches what they're trying to verify
    if (profile.adminPhone !== phoneNumber) {
      return NextResponse.json({ error: 'Phone number mismatch' }, { status: 400 });
    }

    // Verify OTP with Twilio
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const verifySid = process.env.TWILIO_VERIFY_SERVICE_SID;

    if (!accountSid || !authToken || !verifySid) {
      console.error('Twilio credentials not configured');
      return NextResponse.json({ error: 'Verification service unavailable' }, { status: 500 });
    }

    const client = twilio(accountSid, authToken);

    try {
      const verification = await client.verify.v2
        .services(verifySid)
        .verificationChecks.create({
          to: phoneNumber,
          code: code,
        });

      if (verification.status !== 'approved') {
        return NextResponse.json({ error: 'Invalid code' }, { status: 400 });
      }
    } catch (twilioError: any) {
      console.error('Twilio verification error:', twilioError);
      
      // Handle common Twilio errors
      if (twilioError.code === 20404) {
        return NextResponse.json({ error: 'Code expired. Please request a new code.' }, { status: 400 });
      }
      
      return NextResponse.json({ error: 'Verification failed' }, { status: 400 });
    }

    // Update partner's adminPhoneVerified
    await updatePartnerProfile(profile.id, { adminPhoneVerified: true });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin phone verification error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
