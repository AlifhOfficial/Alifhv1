/**
 * API: Magic Link Validation Endpoint
 * POST /api/auth/magic-link-validated
 * 
 * Purpose: Pre-validates user existence before magic link flow
 * Authentication: None required (pre-auth validation)
 * 
 * Flow:
 * 1. Validates email exists in database
 * 2. If valid, triggers Better Auth magic link email
 * 3. Returns result to client
 * 
 * Standards:
 * - Returns 400 for validation errors
 * - Returns 500 for server errors
 * - Logs validation attempts for security monitoring
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { AUTH_CONFIG } from "@/lib/auth/config";
import { getAuthRateLimitSource } from "@/lib/auth/email-otp-rate-limit";
import { getActionRateLimitStatus, recordActionRequest } from "@/lib/auth/request-rate-limit";
import { validateUserExists } from "../validation-utils";

const MagicLinkSchema = z.object({
  email: z.string().email('Invalid email address'),
  callbackURL: z.string().optional(), // Can be relative path like "/dashboard"
});


export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const result = MagicLinkSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { 
          error: 'Invalid input',
          details: result.error.format()
        },
        { status: 400 }
      );
    }

    const { email, callbackURL } = result.data;
    const normalizedEmail = email.trim().toLowerCase();
    const source = getAuthRateLimitSource(request.headers);

    const rateLimit = getActionRateLimitStatus('magic-link', normalizedEmail, source);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: `Please wait ${rateLimit.retryAfterSeconds} seconds before requesting another magic link.`,
          code: rateLimit.code,
          retryAfterSeconds: rateLimit.retryAfterSeconds,
        },
        { status: 429 }
      );
    }

    const validation = await validateUserExists(normalizedEmail);

    if (!validation.exists) {
      console.warn("[magic-link] Attempt for non-existent user", email);
      return NextResponse.json(
        {
          error: "No account found with this email address. Magic links are only available for existing users. Please sign up first or use a different email.",
        },
        { status: 400 }
      );
    }

    console.warn("📧 Proceeding with magic link for existing user:", normalizedEmail);

    // Send the magic link through Better Auth
    const authResult = await auth.api.signInMagicLink({
      body: { email: normalizedEmail, callbackURL },
      headers: request.headers,
    });

    recordActionRequest('magic-link', normalizedEmail, source);

    return NextResponse.json({
      ...authResult,
      retryAfterSeconds: AUTH_CONFIG.MAGIC_LINK.COOLDOWN_SECONDS,
    });
  } catch (error: any) {
    console.error("[magic-link] Error", error);
    return NextResponse.json(
      { error: error?.message || "Failed to send magic link" },
      { status: 500 }
    );
  }
}