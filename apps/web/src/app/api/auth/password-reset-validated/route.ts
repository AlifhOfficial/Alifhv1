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

    const validation = await validateUserExists(email);
    
    if (!validation.exists) {
      console.log("🚫 Password reset request for non-existent user:", email);
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    console.log("📧 Proceeding with password reset for existing user:", email);
    
    const authResult = await auth.api.requestPasswordReset({
      body: { email, redirectTo },
    });

    return NextResponse.json(authResult);
  } catch (error: any) {
    console.error("Password reset error:", error);
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred" },
      { status: 500 }
    );
  }
}