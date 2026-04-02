/**
 * API: Email OTP Verification with Stripe Customer Creation
 * 
 * Purpose: Verify email OTP and create Stripe customer after successful verification
 * This ensures Stripe customers are only created for verified users
 * 
 * Flow:
 * 1. Verify OTP via Better Auth emailOTP plugin
 * 2. If successful, create Stripe customer (if not exists)
 * 3. Update user record with Stripe customer ID
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { AUTH_CONFIG } from "@/lib/auth/config";
import {
  clearOtpVerifyAttempts,
  getOtpVerifyStatus,
  recordFailedOtpVerifyAttempt,
} from "@/lib/auth/email-otp-rate-limit";
import { getUserForStripeCustomer, updateUserStripeCustomerId } from "@alifh/database";
import { createStripeCustomerForUser } from "@/lib/stripe/config";

export async function POST(request: NextRequest) {
  let normalizedEmail = '';

  try {
    const body = await request.json();
    const { email, otp } = body;

    // Validate required fields
    if (!email || !otp) {
      return NextResponse.json(
        { error: "Email and OTP are required" },
        { status: 400 }
      );
    }

    normalizedEmail = email.trim().toLowerCase();
    const verifyStatus = getOtpVerifyStatus(normalizedEmail);

    if (!verifyStatus.allowed) {
      return NextResponse.json(
        {
          error: 'Too many attempts. Request a new code to continue.',
          code: 'TOO_MANY_ATTEMPTS',
          attemptsRemaining: 0,
          retryAfterSeconds: verifyStatus.retryAfterSeconds || AUTH_CONFIG.EMAIL_OTP.LOCKOUT_SECONDS_AFTER_MAX_ATTEMPTS,
        },
        { status: 429 }
      );
    }

    // Verify OTP via Better Auth's internal emailOTP endpoint
    // We call the internal auth handler directly
    const verifyResponse = await auth.handler(
      new Request(`${process.env.BETTER_AUTH_URL}/api/auth/email-otp/verify-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: normalizedEmail,
          otp,
        }),
      })
    );

    const responseData = await verifyResponse.json().catch(() => ({}));

    // If verification failed, return error
    if (!verifyResponse.ok) {
      const errorMessage = responseData?.message?.toLowerCase() || responseData?.error?.toLowerCase() || '';
      
      if (errorMessage.includes('invalid') || errorMessage.includes('expired')) {
        const attemptStatus = recordFailedOtpVerifyAttempt(normalizedEmail);
        return NextResponse.json(
          {
            error: attemptStatus.blocked
              ? 'Too many attempts. Request a new code to continue.'
              : 'Invalid or expired code. Please try again.',
            code: attemptStatus.blocked ? 'TOO_MANY_ATTEMPTS' : 'INVALID_OTP',
            attemptsRemaining: attemptStatus.attemptsRemaining,
            retryAfterSeconds: attemptStatus.retryAfterSeconds || undefined,
          },
          { status: attemptStatus.blocked ? 429 : 400 }
        );
      }
      if (errorMessage.includes('too_many') || errorMessage.includes('attempts')) {
        return NextResponse.json(
          {
            error: 'Too many attempts. Request a new code to continue.',
            code: 'TOO_MANY_ATTEMPTS',
            attemptsRemaining: 0,
            retryAfterSeconds: AUTH_CONFIG.EMAIL_OTP.LOCKOUT_SECONDS_AFTER_MAX_ATTEMPTS,
          },
          { status: 429 }
        );
      }
      
      return NextResponse.json(
        { error: responseData?.message || "Verification failed", code: "VERIFICATION_FAILED" },
        { status: 400 }
      );
    }

    clearOtpVerifyAttempts(normalizedEmail);

    // Verification successful - now create Stripe customer
    console.log(`[VerifyEmail] Email verified successfully: ${normalizedEmail}`);

    // Get the user to create Stripe customer (using query function)
    const user = await getUserForStripeCustomer(normalizedEmail);

    if (user && !user.stripeCustomerId) {
      // Create Stripe customer for verified user
      const stripeCustomerId = await createStripeCustomerForUser({
        id: user.id,
        email: user.email,
        name: user.name,
      });

      // Update user with Stripe customer ID (using query function)
      if (stripeCustomerId) {
        await updateUserStripeCustomerId(user.id, stripeCustomerId);
        console.log(`[VerifyEmail] Stripe customer ${stripeCustomerId} linked to user ${user.id}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Email verified successfully",
    });

  } catch (error: any) {
    console.error("[VerifyEmail] Error:", error);

    // Handle specific Better Auth errors
    const errorMessage = error?.message?.toLowerCase() || '';
    
    if (normalizedEmail && (errorMessage.includes('invalid') || errorMessage.includes('expired'))) {
      const attemptStatus = recordFailedOtpVerifyAttempt(normalizedEmail);
      return NextResponse.json(
        {
          error: attemptStatus.blocked
            ? 'Too many attempts. Request a new code to continue.'
            : 'Invalid or expired code. Please try again.',
          code: attemptStatus.blocked ? 'TOO_MANY_ATTEMPTS' : 'INVALID_OTP',
          attemptsRemaining: attemptStatus.attemptsRemaining,
          retryAfterSeconds: attemptStatus.retryAfterSeconds || undefined,
        },
        { status: attemptStatus.blocked ? 429 : 400 }
      );
    }

    return NextResponse.json(
      { error: error?.message || "Verification failed. Please try again." },
      { status: 500 }
    );
  }
}
