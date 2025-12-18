/**
 * API: Magic Link Validation Endpoint
 * POST /api/auth/magic-link-validated
 * 
 * Purpose: Pre-validates user existence before magic link flow
 * Authentication: None required (pre-auth validation)
 * 
 * Flow:
 * 1. Validates email exists in database
 * 2. Returns success/error to client
 * 3. Client proceeds to Better Auth's /api/auth/[...auth]/magic-link
 * 
 * Standards:
 * - Returns 400 for validation errors
 * - Returns 500 for server errors
 * - Logs validation attempts for security monitoring
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { validateUserExists } from "../validation-utils";

const MagicLinkSchema = z.object({
  email: z.string().email('Invalid email address'),
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

    const { email } = result.data;

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

    return NextResponse.json({ 
      success: true,
      message: "User validated. Proceed with magic link request."
    });
  } catch (error: any) {
    console.error("[magic-link] Error", error);
    return NextResponse.json(
      { error: error?.message || "Failed to validate user for magic link" },
      { status: 500 }
    );
  }
}