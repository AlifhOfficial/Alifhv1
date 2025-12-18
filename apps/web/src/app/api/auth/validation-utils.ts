/**
 * API: Auth Validation Utilities
 * 
 * Purpose: Shared validation logic for password reset and magic link endpoints
 * Used By: password-reset-validated/route.ts, magic-link-validated/route.ts
 * 
 * Standards:
 * - Validates user existence before auth operations
 * - Returns consistent error messages
 * - No session required (pre-auth validation)
 */

import { db } from "@alifh/database";
import * as schema from "@alifh/database";
import { eq } from "drizzle-orm";

export interface ValidationResult {
  exists: boolean;
  error?: string;
}

/**
 * Check if user exists by email
 */
export async function validateUserExists(email: string): Promise<ValidationResult> {
  try {
    const existingUser = await db.query.user.findFirst({
      where: eq(schema.user.email, email),
    });

    if (!existingUser) {
      return {
        exists: false,
        error: "No account found with this email address. Please check your email or sign up for a new account."
      };
    }

    return { exists: true };
  } catch (error) {
    console.error("[validateUserExists] Database error:", error);
    return {
      exists: false,
      error: "Failed to validate email address"
    };
  }
}
