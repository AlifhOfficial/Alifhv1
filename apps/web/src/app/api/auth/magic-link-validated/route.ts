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
import { validateUserExists } from "../validation-utils";
import { createRateLimiter, getIdentifier, rateLimitResponse, RATE_LIMITS_AUTH } from "@/lib/rate-limit";

const MagicLinkSchema = z.object({
  email: z.string().email('Invalid email address'),
  callbackURL: z.string().optional(), // Can be relative path like "/dashboard"
});

const magicLinkLimiter = createRateLimiter(RATE_LIMITS_AUTH.MAGIC_LINK);

export async function POST(request: NextRequest) {
  // Rate limiting: 5 magic link requests per 10 minutes
  const identifier = getIdentifier(request);
  const rateLimitResult = await magicLinkLimiter.check(identifier);
  if (!rateLimitResult.success) {
    return rateLimitResponse(rateLimitResult);
  }
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

    const validation = await validateUserExists(email);

    if (!validation.exists) {
      console.warn("[magic-link] Attempt for non-existent user", email);
      return NextResponse.json(
        {
          error: "No account found with this email address. Magic links are only available for existing users. Please sign up first or use a different email.",
        },
        { status: 400 }
      );
    }

    console.log("📧 Proceeding with magic link for existing user:", email);

    // Send the magic link through Better Auth
    const authResult = await auth.api.signInMagicLink({
      body: { email, callbackURL },
      headers: request.headers,
    });

    return NextResponse.json(authResult);
  } catch (error: any) {
    console.error("[magic-link] Error", error);
    return NextResponse.json(
      { error: error?.message || "Failed to send magic link" },
      { status: 500 }
    );
  }
}