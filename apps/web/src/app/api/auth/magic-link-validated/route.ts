import { NextRequest, NextResponse } from "next/server";
import { validateUserExists } from "../validation-utils";

/**
 * Magic Link with User Validation
 * 
 * Validates user exists before allowing magic link flow
 * Better Auth handles the actual magic link sending through /api/auth/[...auth]
 * This endpoint just validates and returns success/error for the client
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body ?? {};

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Validate user exists using shared utility
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

    // User exists, client should proceed to call Better Auth's magic link endpoint
    // The actual magic link is sent by Better Auth through /api/auth/[...auth]/magic-link
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