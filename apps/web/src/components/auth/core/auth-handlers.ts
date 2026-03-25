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

/**
 * Better Auth handles OAuth state internally.
 * Previous implementations of clearStaleOAuthCookies() were causing state_mismatch
 * errors by over-aggressively clearing cookies. Better Auth manages state cookies
 * with appropriate expiry, so manual clearing is not needed.
 */

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
): Promise<AuthResult & { needsVerification?: boolean }> => {
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
      // User exists but email not verified - return special flag
      // This allows flow controller to show OTP verification instead of error
      return { 
        success: false, 
        error: "EMAIL_NOT_VERIFIED",
        needsVerification: true
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

/**
 * Sign in with Google OAuth
 * Uses Better Auth's redirect flow - user will be redirected away and back
 * Note: This function triggers a redirect, so code after the call won't execute
 */
export const signInWithGooglePopup = async (): Promise<AuthResult> => {
  try {
    // This triggers an immediate redirect to Google OAuth
    // The browser will navigate away, so this promise never resolves normally
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "/", // Redirect to home after successful auth
    });
    
    // This code won't execute due to redirect, but TypeScript needs a return
    return { success: true };
  } catch (error) {
    // Only reaches here if redirect failed (very rare)
    console.error('[Auth] Google sign in failed:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to start Google sign in" 
    };
  }
};

/**
 * Sign in with Apple OAuth
 * Uses Better Auth's redirect flow - user will be redirected away and back
 * Note: This function triggers a redirect, so code after the call won't execute
 */
export const signInWithApplePopup = async (): Promise<AuthResult> => {
  try {
    // This triggers an immediate redirect to Apple OAuth
    // The browser will navigate away, so this promise never resolves normally
    await authClient.signIn.social({
      provider: "apple",
      callbackURL: "/", // Redirect to home after successful auth
    });
    
    // This code won't execute due to redirect, but TypeScript needs a return
    return { success: true };
  } catch (error) {
    // Only reaches here if redirect failed (very rare)
    console.error('[Auth] Apple sign in failed:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to start Apple sign in" 
    };
  }
};

/**
 * Sign in with Passkey (WebAuthn)
 * Uses the device's biometric/security key
 */
export const signInWithPasskey = async (): Promise<AuthResult> => {
  return safeAuthOperation(async () => {
    const result = await authClient.signIn.passkey();
    
    if (result.error) {
      // Handle user cancellation gracefully
      const errorMessage = result.error?.message?.toLowerCase() || '';
      if (errorMessage.includes('cancel') || errorMessage.includes('aborted') || errorMessage.includes('not allowed')) {
        return { success: false, error: "Passkey sign in was cancelled" };
      }
      return { success: false, error: result.error.message || "Passkey sign in failed" };
    }

    const authResult = handleAuthResult(result, "Passkey sign in failed");
    if (authResult.success && result.data) {
      const user = 'user' in result.data ? result.data.user : undefined;
      return { success: true, user };
    }

    return authResult;
  }, "Passkey sign in failed");
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

    // Use custom signup endpoint that handles unverified user re-registration
    // This solves the issue where user closes tab before OTP verification
    // and then can't re-register or login
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: normalizedName,
        email: normalizeEmail(email),
        password,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      return { 
        success: false, 
        error: result.error || "Sign up failed" 
      };
    }

    return { 
      success: true, 
      user: result.user || { 
        id: 'temp-user-id',
        name: normalizedName, 
        email: normalizeEmail(email)
      }
    };
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
  callbackURL: string = "/"
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

// ============================================================================
// EMAIL OTP HANDLERS
// ============================================================================

/**
 * Verify email using OTP code
 * Uses custom API endpoint to also create Stripe customer after verification
 */
export const verifyEmailWithOTP = async (
  email: string,
  otp: string
): Promise<AuthResult> => {
  return safeAuthOperation(async () => {
    const response = await fetch('/api/auth/verify-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: normalizeEmail(email),
        otp,
      }),
    });

    const result = await response.json();

    if (!response.ok || result.error) {
      return { success: false, error: result.error || "Verification failed" };
    }

    return { success: true };
  }, "Email verification failed");
};

/**
 * Resend OTP verification code
 */
export const resendVerificationOTP = async (
  email: string,
  type: "email-verification" | "sign-in" | "forget-password" = "email-verification"
): Promise<{ success: boolean; error?: string }> => {
  return safeAuthOperation(async () => {
    const result = await authClient.emailOtp.sendVerificationOtp({
      email: normalizeEmail(email),
      type,
    });

    if (result.error) {
      return { success: false, error: result.error.message || "Failed to resend code" };
    }

    return { success: true };
  }, "Failed to resend verification code");
};