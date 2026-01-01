/**
 * Auth Handlers - Pure Business Logic
 * 
 * Centralized authentication handlers without UI concerns
 * Uses authClient directly and provides callbacks to UI components
 * Refactored to use shared error handling utilities (DRY)
 */

import { authClient } from "@/lib/auth/client";
import { 
  handleAuthResult, 
  safeAuthOperation, 
  validateEmail,
  normalizeEmail,
  normalizeName 
} from "@/utils/auth";
import { AUTH_CONFIG } from "@/lib/auth/config";

export interface AuthUser {
  id: string;
  name?: string;
  email?: string;
  image?: string;
}

export interface AuthResult {
  success: boolean;
  user?: AuthUser;
  error?: string;
}

export interface EmailData {
  email: string;
  type: "verification" | "reset" | "magic-link";
}

// Sign In Handlers
export const signInWithEmail = async (
  email: string, 
  password: string
): Promise<AuthResult> => {
  return safeAuthOperation(async () => {
    const validation = validateEmail(email);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    const result = await authClient.signIn.email({
      email: normalizeEmail(email),
      password,
    });

    // Special handling for unverified email
    if (result.error?.status === 403) {
      // Check if it's a banned user error
      const errorMessage = result.error?.message?.toLowerCase() || '';
      if (errorMessage.includes('banned') || errorMessage.includes('suspended') || errorMessage.includes('blocked')) {
        return { 
          success: false, 
          error: "Your account has been suspended. Please contact support for more information." 
        };
      }
      return { 
        success: false, 
        error: "Please verify your email before signing in. Check your inbox." 
      };
    }

    const authResult = handleAuthResult(result, "Sign in failed");
    if (authResult.success && result.data) {
      const user = 'user' in result.data ? result.data.user : undefined;
      return { success: true, user };
    }

    return authResult;
  }, "Sign in failed");
};

export const signInWithGoogle = async (callbackURL: string = "/"): Promise<AuthResult> => {
  return safeAuthOperation(async () => {
    const result = await authClient.signIn.social({
      provider: "google",
      callbackURL,
    });

    const authResult = handleAuthResult(result, "Google sign in failed");
    if (authResult.success && result.data) {
      const user = 'user' in result.data ? result.data.user : undefined;
      return { success: true, user };
    }

    return authResult;
  }, "Google sign in failed");
};

// Sign Up Handlers
export const signUpWithEmail = async (
  name: string,
  email: string, 
  password: string
): Promise<AuthResult> => {
  return safeAuthOperation(async () => {
    const normalizedName = normalizeName(name);
    
    if (!normalizedName) {
      return { success: false, error: "Please enter your name." };
    }

    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      return { success: false, error: emailValidation.error };
    }

    const result = await authClient.signUp.email({
      name: normalizedName,
      email: normalizeEmail(email),
      password,
    });

    const authResult = handleAuthResult(result, "Sign up failed");
    if (authResult.success) {
      const user = result.data && 'user' in result.data ? result.data.user : { 
        id: 'temp-user-id',
        name: normalizedName, 
        email: normalizeEmail(email)
      };
      return { success: true, user };
    }

    return authResult;
  }, "Sign up failed");
};

export const signUpWithGoogle = async (callbackURL: string = "/"): Promise<AuthResult> => {
  return safeAuthOperation(async () => {
    const result = await authClient.signIn.social({
      provider: "google",
      callbackURL,
    });

    const authResult = handleAuthResult(result, "Google sign up failed");
    if (authResult.success && result.data) {
      const user = 'user' in result.data ? result.data.user : undefined;
      return { success: true, user };
    }

    return authResult;
  }, "Google sign up failed");
};

// Password Reset Handler - Uses custom validation endpoint
export const requestPasswordReset = async (
  email: string,
  redirectTo: string = "/reset-password"
): Promise<{ success: boolean; error?: string }> => {
  return safeAuthOperation(async () => {
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      return { success: false, error: emailValidation.error };
    }

    // Use our custom validation endpoint
    const response = await fetch(AUTH_CONFIG.ENDPOINTS.PASSWORD_RESET, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        email: normalizeEmail(email), 
        redirectTo 
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.error || "Failed to send reset email"
      };
    }

    return { success: true };
  }, "Failed to send reset email");
};

// Magic Link Handler
export const sendMagicLink = async (
  email: string,
  callbackURL: string = "/dashboard"
): Promise<{ success: boolean; error?: string }> => {
  return safeAuthOperation(async () => {
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      return { success: false, error: emailValidation.error };
    }

    const response = await fetch(AUTH_CONFIG.ENDPOINTS.MAGIC_LINK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        email: normalizeEmail(email), 
        callbackURL 
      }),
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      return {
        success: false,
        error: result?.error || "Failed to send magic link"
      };
    }

    return { success: true };
  }, "Failed to send magic link");
};