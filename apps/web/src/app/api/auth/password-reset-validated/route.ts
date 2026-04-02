/**
 * API: Password Reset Validation Endpoint
 * POST /api/auth/password-reset-validated
 * 
 * Purpose: Pre-validates user existence before password reset email
 * Authentication: None required (pre-auth validation)
 * 
 * Flow:
 * 1. Validates email exists in database
 * 2. If valid, triggers Better Auth password reset email
 * 3. Returns result to client
 * 
 * Standards:
 * - Returns 400 for validation errors
 * - Returns 500 for server errors
 * - Logs all password reset attempts for security
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { AUTH_CONFIG } from "@/lib/auth/config";
import { getAuthRateLimitSource } from "@/lib/auth/email-otp-rate-limit";
import { getActionRateLimitStatus, recordActionRequest } from "@/lib/auth/request-rate-limit";
import { validateUserExists } from "../validation-utils";

const PasswordResetSchema = z.object({
  email: z.string().email('Invalid email address'),
  redirectTo: z.string().optional(), // Can be relative path like "/reset-password"
});


export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const result = PasswordResetSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { 
          error: 'Invalid input',
          details: result.error.format()
        },
        { status: 400 }
      );
    }

    const { email, redirectTo } = result.data;
    const normalizedEmail = email.trim().toLowerCase();
    const source = getAuthRateLimitSource(request.headers);

    const rateLimit = getActionRateLimitStatus('password-reset', normalizedEmail, source);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: `Please wait ${rateLimit.retryAfterSeconds} seconds before requesting another reset email.`,
          code: rateLimit.code,
          retryAfterSeconds: rateLimit.retryAfterSeconds,
        },
        { status: 429 }
      );
    }

    const validation = await validateUserExists(normalizedEmail);
    
    if (!validation.exists) {
      console.log("🚫 Password reset request for non-existent user:", email);
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    console.log("📧 Proceeding with password reset for existing user:", normalizedEmail);
    
    const authResult = await auth.api.requestPasswordReset({
      body: { email: normalizedEmail, redirectTo },
    });

    recordActionRequest('password-reset', normalizedEmail, source);

    return NextResponse.json({
      ...authResult,
      retryAfterSeconds: AUTH_CONFIG.PASSWORD_RESET.COOLDOWN_SECONDS,
    });
  } catch (error: any) {
    console.error("Password reset error:", error);
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred" },
      { status: 500 }
    );
  }
}