import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { validateUserExists } from "../validation-utils";

/**
 * Password Reset with User Validation
 * 
 * Validates user exists before sending password reset email
 * Uses shared validation logic from validation-utils.ts
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, redirectTo } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Validate user exists using shared utility
    const validation = await validateUserExists(email);
    
    if (!validation.exists) {
      console.log("🚫 Password reset request for non-existent user:", email);
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // User exists, proceed with Better Auth's password reset
    console.log("📧 Proceeding with password reset for existing user:", email);
    
    const result = await auth.api.requestPasswordReset({
      body: { email, redirectTo },
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Password reset error:", error);
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred" },
      { status: 500 }
    );
  }
}