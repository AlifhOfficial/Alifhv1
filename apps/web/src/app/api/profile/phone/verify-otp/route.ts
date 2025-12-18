/**
 * API: Phone Verification - Verify OTP
 * POST /api/profile/phone/verify-otp
 * 
 * Purpose: Verify OTP code and mark phone as verified
 * Authentication: Required
 * Session Source: getSessionUser() from middleware cache
 * 
 * Features:
 * - 6-digit OTP validation
 * - Max 5 verification attempts
 * - Updates user.phoneVerified and phoneVerifiedAt
 * - Auto-cleanup on success/failure
 * 
 * Standards:
 * - Returns 400 for invalid/expired OTP
 * - Returns 401 for unauthenticated requests
 * - Returns 404 for missing OTP (not sent yet)
 * - Returns 429 for too many attempts
 * - Returns 500 for server errors
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSessionUser } from '@/lib/auth/session-context';
import { isValidOTP } from "@/lib/otp-service";
import { otpStore } from "@/lib/otp-store";
import { db } from "@alifh/database";
import { user } from "@alifh/database";
import { eq } from "drizzle-orm";

export const runtime = "edge";

const VerifyOTPSchema = z.object({
  otp: z.string().regex(/^\d{6}$/, 'OTP must be a 6-digit code'),
});

export async function POST(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    const validationResult = VerifyOTPSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Invalid input',
          details: validationResult.error.format()
        },
        { status: 400 }
      );
    }

    const { otp } = validationResult.data;

    // Additional validation via service
    if (!(await isValidOTP(otp))) {
      return NextResponse.json(
        { error: "Invalid OTP format. Please enter a 6-digit code." },
        { status: 400 }
      );
    }

    // Get stored OTP
    const otpKey = otpStore.getOTPKey(sessionUser.id);
    const storedData = otpStore.get(otpKey);

    if (!storedData) {
      return NextResponse.json(
        { error: "No verification code found. Please request a new code." },
        { status: 404 }
      );
    }

    // Check if OTP expired
    if (storedData.expiresAt < Date.now()) {
      otpStore.delete(otpKey);
      return NextResponse.json(
        { error: "Verification code expired. Please request a new code." },
        { status: 400 }
      );
    }

    // Check attempts (max 5 attempts)
    if (storedData.attempts >= 5) {
      otpStore.delete(otpKey);
      return NextResponse.json(
        { error: "Too many failed attempts. Please request a new code." },
        { status: 429 }
      );
    }

    // Verify OTP
    if (storedData.otp !== otp) {
      // Increment attempts
      otpStore.set(otpKey, {
        ...storedData,
        attempts: storedData.attempts + 1,
      });

      const attemptsLeft = 5 - (storedData.attempts + 1);
      return NextResponse.json(
        { 
          error: `Invalid verification code. ${attemptsLeft} attempts remaining.`,
          attemptsLeft,
        },
        { status: 400 }
      );
    }

    // OTP is correct! Update user's phone verification status
    await db
      .update(user)
      .set({
        phoneVerified: true,
        phoneVerifiedAt: new Date(),
      })
      .where(eq(user.id, sessionUser.id));

    // Clean up OTP
    otpStore.delete(otpKey);

    return NextResponse.json({
      success: true,
      message: "Phone number verified successfully",
    });
  } catch (error) {
    console.error("[phone/verify-otp] Error:", error);
    return NextResponse.json(
      { error: "Failed to verify code" },
      { status: 500 }
    );
  }
}
