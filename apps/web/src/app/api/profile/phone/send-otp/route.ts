/**
 * Phone Verification API - Send OTP
 * POST /api/profile/phone/send-otp
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session-context';
import { sendOTP, generateOTP, isValidPhoneNumber } from "@/lib/otp-service";
import { otpStore } from "@/lib/otp-store";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { phoneNumber } = body;

    if (!phoneNumber || typeof phoneNumber !== 'string') {
      return NextResponse.json(
        { error: "Phone number is required" },
        { status: 400 }
      );
    }

    // Validate phone number format
    if (!(await isValidPhoneNumber(phoneNumber))) {
      return NextResponse.json(
        { error: "Invalid phone number format. Please use E.164 format (e.g., +971501234567)" },
        { status: 400 }
      );
    }

    // Check rate limiting (max 3 OTPs per 10 minutes)
    const rateLimitKey = otpStore.getRateLimitKey(user.id);
    const rateLimitData = otpStore.get(rateLimitKey);
    if (rateLimitData && rateLimitData.attempts >= 3) {
      const timeLeft = Math.ceil((rateLimitData.expiresAt - Date.now()) / 1000 / 60);
      return NextResponse.json(
        { error: `Too many attempts. Please try again in ${timeLeft} minutes.` },
        { status: 429 }
      );
    }

    // Generate OTP
    const otp = await generateOTP();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Send OTP via SMS
    const result = await sendOTP(phoneNumber, otp);

    if (!result.success) {
      console.error('[phone/send-otp] Failed to send OTP:', result.error);
      return NextResponse.json(
        { error: "Failed to send verification code. Please try again." },
        { status: 500 }
      );
    }

    // Store OTP
    const otpKey = otpStore.getOTPKey(user.id);
    otpStore.set(otpKey, { otp, expiresAt, attempts: 0, phoneNumber });

    // Update rate limit
    const currentAttempts = rateLimitData?.attempts ?? 0;
    otpStore.set(rateLimitKey, {
      otp: '',
      expiresAt: Date.now() + 10 * 60 * 1000,
      attempts: currentAttempts + 1,
    });

    return NextResponse.json({
      success: true,
      message: "Verification code sent successfully",
      expiresIn: 600, // 10 minutes in seconds
    });
  } catch (error) {
    console.error("[phone/send-otp] Error:", error);
    return NextResponse.json(
      { error: "Failed to send verification code" },
      { status: 500 }
    );
  }
}
