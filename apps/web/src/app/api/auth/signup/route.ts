/**
 * API: Custom Sign Up Handler
 * 
 * Purpose: Handle signup with unverified user re-registration
 * Solves: User stuck when OTP not verified (can't re-register, can't login)
 * 
 * Flow:
 * 1. Check if email belongs to an unverified user
 * 2. If unverified user exists → delete (with Stripe cleanup) and allow re-registration
 * 3. If verified user exists → return "email already exists" error
 * 4. Proceed with normal Better Auth signup (no Stripe customer yet - created after verification)
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserByEmail, deleteUnverifiedUserByEmail } from "@alifh/database";
import { deleteStripeCustomerByEmail } from "@/lib/stripe/config";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

    // Validate required fields
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Email, password, and name are required" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if user exists with this email
    const existingUser = await getUserByEmail(normalizedEmail);

    if (existingUser) {
      // User exists - check if verified
      if (existingUser.emailVerified) {
        // User is verified - they should sign in instead
        return NextResponse.json(
          { 
            error: "An account with this email already exists. Please sign in instead.",
            code: "EMAIL_ALREADY_VERIFIED" 
          },
          { status: 409 }
        );
      }

      // User exists but NOT verified - clean up everything and allow re-registration
      console.log(`[Signup] Cleaning up unverified user for re-registration: ${normalizedEmail}`);
      
      // Delete any orphaned Stripe customers first (shouldn't exist since we create after verification)
      await deleteStripeCustomerByEmail(normalizedEmail);
      
      // Delete user from database (cascades to sessions, accounts, etc.)
      const deleted = await deleteUnverifiedUserByEmail(normalizedEmail);
      
      if (!deleted) {
        console.error(`[Signup] Failed to delete unverified user: ${normalizedEmail}`);
        return NextResponse.json(
          { error: "Failed to process signup. Please try again." },
          { status: 500 }
        );
      }
      
      console.log(`[Signup] Successfully cleaned up unverified user, proceeding with signup: ${normalizedEmail}`);
    }

    // Proceed with Better Auth signup
    const result = await auth.api.signUpEmail({
      body: {
        email: normalizedEmail,
        password,
        name: name.trim(),
      },
    });

    // Return success with user data
    return NextResponse.json({
      success: true,
      user: result.user,
    });

  } catch (error: any) {
    console.error("[Signup] Error:", error);

    // Handle Better Auth errors
    if (error?.message?.toLowerCase().includes("already")) {
      return NextResponse.json(
        { 
          error: "An account with this email already exists. Please sign in instead.",
          code: "EMAIL_EXISTS" 
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: error?.message || "Signup failed. Please try again." },
      { status: 500 }
    );
  }
}
