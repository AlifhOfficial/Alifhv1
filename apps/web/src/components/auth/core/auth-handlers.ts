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
 * Clears stale OAuth state cookies before starting any auth flow.
 * This prevents state_mismatch errors when old cookies exist from previous sessions.
 */
function clearStaleOAuthCookies() {
  if (typeof document === 'undefined') return;
  
  const cookies = document.cookie.split(";");
  for (const cookie of cookies) {
    const [name] = cookie.split("=");
    const trimmedName = name.trim();
    // Clear any state-related cookies (oauth state, pkce verifier, etc.)
    if (
      trimmedName.includes("state") || 
      trimmedName.includes("pkce") || 
      trimmedName.includes("oauth") ||
      trimmedName.includes("code_verifier") ||
      (trimmedName.startsWith("better-auth.") && !trimmedName.includes("session"))
    ) {
      const paths = ["/", "/api", "/api/auth", "/auth"];
      for (const path of paths) {
        document.cookie = `${trimmedName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}`;
        document.cookie = `${trimmedName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}; secure`;
      }
    }
  }
}

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
  // Clear stale OAuth cookies before any auth flow
  clearStaleOAuthCookies();
  
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

/**
 * Open Google OAuth in a popup window
 * Returns a promise that resolves when auth completes (via postMessage)
 */
export const signInWithGooglePopup = (): Promise<AuthResult> => {
  // Clear stale OAuth cookies before Google auth
  clearStaleOAuthCookies();
  
  return new Promise((resolve) => {
    // Popup dimensions
    const width = 500;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;
    
    // Open popup to our start page which initiates the OAuth flow
    // This page calls signIn.social which redirects to Google
    const popup = window.open(
      '/auth/google/start',
      'google-auth',
      `width=${width},height=${height},left=${left},top=${top},popup=1`
    );
    
    if (!popup) {
      resolve({ success: false, error: "Popup was blocked. Please allow popups for this site." });
      return;
    }

    // Listen for postMessage from popup
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type !== 'google-auth-complete') return;
      
      window.removeEventListener('message', handleMessage);
      clearInterval(pollTimer);
      
      if (event.data.success) {
        resolve({ success: true });
      } else {
        resolve({ 
          success: false, 
          error: event.data.error === 'access_denied' 
            ? 'Sign in was cancelled' 
            : 'Google sign in failed'
        });
      }
    };
    
    window.addEventListener('message', handleMessage);
    
    // Poll to check if popup was closed manually
    const pollTimer = setInterval(() => {
      if (popup.closed) {
        clearInterval(pollTimer);
        window.removeEventListener('message', handleMessage);
        resolve({ success: false, error: "Sign in window was closed" });
      }
    }, 500);
    
    // Timeout after 5 minutes
    setTimeout(() => {
      clearInterval(pollTimer);
      window.removeEventListener('message', handleMessage);
      if (!popup.closed) {
        popup.close();
      }
      resolve({ success: false, error: "Sign in timed out" });
    }, 5 * 60 * 1000);
  });
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
  // Clear stale OAuth cookies before any auth flow
  clearStaleOAuthCookies();
  
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
  // Clear stale OAuth cookies before Google auth
  clearStaleOAuthCookies();
  
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

// ============================================================================
// EMAIL OTP HANDLERS
// ============================================================================

/**
 * Verify email using OTP code
 * Used after sign-up to verify email address
 */
export const verifyEmailWithOTP = async (
  email: string,
  otp: string
): Promise<AuthResult> => {
  return safeAuthOperation(async () => {
    const result = await authClient.emailOtp.verifyEmail({
      email: normalizeEmail(email),
      otp,
    });

    if (result.error) {
      const errorMessage = result.error.message?.toLowerCase() || '';
      if (errorMessage.includes('invalid') || errorMessage.includes('expired')) {
        return { success: false, error: "Invalid or expired code. Please try again." };
      }
      if (errorMessage.includes('too_many_attempts') || errorMessage.includes('attempts')) {
        return { success: false, error: "Too many attempts. Please request a new code." };
      }
      return { success: false, error: result.error.message || "Verification failed" };
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