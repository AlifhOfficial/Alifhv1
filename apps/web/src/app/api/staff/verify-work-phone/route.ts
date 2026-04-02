/**
 * Staff Work Phone Verification API
 * 
 * Separate from Better Auth's phone verification - this verifies work phones
 * for staff members without affecting their personal account phone.
 * 
 * POST /api/staff/verify-work-phone
 * - action: 'send' | 'verify'
 * - phoneNumber: string (for both actions)
 * - code: string (for verify action only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session-context';
import { updateStaffProfileById } from '@alifh/database';
import twilio from 'twilio';

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
);

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { action, phoneNumber, code } = body;

    // Validate phone number format
    if (!phoneNumber || !/^\+971[0-9]{9}$/.test(phoneNumber)) {
      return NextResponse.json({ error: 'Invalid UAE phone number' }, { status: 400 });
    }

    const membership = user.partnerMemberships?.[0];
    const staffId = membership?.staffId;

    if (!staffId) {
      return NextResponse.json({ error: 'Not a staff member' }, { status: 403 });
    }

    if (action === 'send') {
      // Send OTP via WhatsApp first, fallback to SMS
      try {
        await twilioClient.verify.v2
          .services(process.env.TWILIO_VERIFY_SERVICE_SID!)
          .verifications.create({
            to: phoneNumber,
            channel: 'whatsapp',
          });
        console.warn('[StaffWorkPhone] OTP sent via WhatsApp to:', phoneNumber);
      } catch (whatsappError: any) {
        console.warn('[StaffWorkPhone] WhatsApp failed, trying SMS:', whatsappError?.message);
        await twilioClient.verify.v2
          .services(process.env.TWILIO_VERIFY_SERVICE_SID!)
          .verifications.create({
            to: phoneNumber,
            channel: 'sms',
          });
        console.warn('[StaffWorkPhone] OTP sent via SMS to:', phoneNumber);
      }

      return NextResponse.json({ success: true, message: 'OTP sent' });
    }

    if (action === 'verify') {
      if (!code || code.length !== 6) {
        return NextResponse.json({ error: 'Invalid code' }, { status: 400 });
      }

      try {
        const check = await twilioClient.verify.v2
          .services(process.env.TWILIO_VERIFY_SERVICE_SID!)
          .verificationChecks.create({
            to: phoneNumber,
            code,
          });

        if (check.status !== 'approved') {
          return NextResponse.json({ error: 'Invalid code' }, { status: 400 });
        }

        // Update staff member's work phone as verified
        await updateStaffProfileById(staffId, {
          workPhone: phoneNumber,
          workPhoneVerified: true,
        });

        console.warn('[StaffWorkPhone] Work phone verified for staff:', staffId);
        return NextResponse.json({ success: true, verified: true });
      } catch (error: any) {
        if (error?.code === 20404) {
          return NextResponse.json({ 
            error: 'Code expired or not found. Please request a new code.' 
          }, { status: 400 });
        }
        console.error('[StaffWorkPhone] Verification error:', error);
        return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
      }
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('[StaffWorkPhone] Error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
