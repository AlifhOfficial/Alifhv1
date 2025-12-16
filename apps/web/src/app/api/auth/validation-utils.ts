/**
 * Auth Validation Utilities
 * 
 * Shared validation logic for password reset and magic link endpoints
 * Consolidates duplicate user existence checks
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
 * Used by password reset and magic link endpoints
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
