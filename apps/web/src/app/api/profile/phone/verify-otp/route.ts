/**
 * Phone Verification API - Verify OTP
 * POST /api/profile/phone/verify-otp
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isValidOTP } from "@/lib/otp-service";
import { otpStore } from "@/lib/otp-store";
import { db } from "@alifh/database";
import { user } from "@alifh/database";
import { eq } from "drizzle-orm";

export const runtime = "nodejs";

async function requireSessionUser(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  return session?.user ?? null;
}

export async function POST(req: NextRequest) {
  try {
    const sessionUser = await requireSessionUser(req);
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { otp } = body;

    if (!otp || typeof otp !== 'string') {
      return NextResponse.json(
        { error: "OTP code is required" },
        { status: 400 }
      );
    }

    // Validate OTP format
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
