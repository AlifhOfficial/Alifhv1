/**
 * Auth Handlers - Pure Business Logic
 * 
 * Centralized authentication handlers without UI concerns
 * Uses authClient directly and provides callbacks to UI components
 */

import { authClient } from "@/lib/auth/client";

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
  try {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      return {
        success: false,
        error: "Please enter a valid email address.",
      };
    }

    const result = await authClient.signIn.email({
      email: normalizedEmail,
      password,
    });

    if (result.error) {
      if (result.error.status === 403) {
        return { 
          success: false, 
          error: "Please verify your email before signing in. Check your inbox." 
        };
      }
      return { 
        success: false, 
        error: result.error.message || "Sign in failed" 
      };
    }

    const user = result.data && 'user' in result.data ? result.data.user : undefined;
    return { success: true, user };
  } catch (error: any) {
    return { 
      success: false, 
      error: error?.message || "An unexpected error occurred" 
    };
  }
};

export const signInWithGoogle = async (callbackURL: string = "/"): Promise<AuthResult> => {
  try {
    const result = await authClient.signIn.social({
      provider: "google",
      callbackURL,
    });

    if (result.error) {
      return { 
        success: false, 
        error: result.error.message || "Google sign in failed" 
      };
    }

    const user = result.data && 'user' in result.data ? result.data.user : undefined;
    return { success: true, user };
  } catch (error: any) {
    return { 
      success: false, 
      error: error?.message || "An unexpected error occurred" 
    };
  }
};

// Sign Up Handlers
export const signUpWithEmail = async (
  name: string,
  email: string, 
  password: string
): Promise<AuthResult> => {
  try {
    const normalizedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedName) {
      return {
        success: false,
        error: "Please enter your name.",
      };
    }

    if (!normalizedEmail) {
      return {
        success: false,
        error: "Please enter a valid email address.",
      };
    }

    const result = await authClient.signUp.email({
      name: normalizedName,
      email: normalizedEmail,
      password,
    });

    if (result.error) {
      return { 
        success: false, 
        error: result.error.message || "Sign up failed" 
      };
    }

    const user = result.data && 'user' in result.data ? result.data.user : { 
      id: 'temp-user-id', // Will be populated when real user session is established
      name: normalizedName, 
      email: normalizedEmail 
    };
    return { success: true, user };
  } catch (error: any) {
    return { 
      success: false, 
      error: error?.message || "An unexpected error occurred" 
    };
  }
};

export const signUpWithGoogle = async (callbackURL: string = "/"): Promise<AuthResult> => {
  try {
    const result = await authClient.signIn.social({
      provider: "google",
      callbackURL,
    });

    if (result.error) {
      return { 
        success: false, 
        error: result.error.message || "Google sign up failed" 
      };
    }

    const user = result.data && 'user' in result.data ? result.data.user : undefined;
    return { success: true, user };
  } catch (error: any) {
    return { 
      success: false, 
      error: error?.message || "An unexpected error occurred" 
    };
  }
};

// Password Reset Handler - Uses custom validation endpoint
export const requestPasswordReset = async (
  email: string,
  redirectTo: string = "/reset-password"
): Promise<{ success: boolean; error?: string }> => {
  try {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      return {
        success: false,
        error: "Please enter a valid email address.",
      };
    }

    // Use our custom validation endpoint instead of direct Better Auth call
    const response = await fetch("/api/auth/password-reset-validated", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: normalizedEmail, redirectTo }),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.error || "Failed to send reset email"
      };
    }

    return { success: true };
  } catch (error: any) {
    return { 
      success: false, 
      error: error?.message || "An unexpected error occurred" 
    };
  }
};

// Magic Link Handler
export const sendMagicLink = async (
  email: string,
  callbackURL: string = "/dashboard"
): Promise<{ success: boolean; error?: string }> => {
  try {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      return {
        success: false,
        error: "Please enter a valid email address.",
      };
    }

    const response = await fetch("/api/auth/magic-link-validated", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: normalizedEmail, callbackURL }),
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      const message = result?.error || "Failed to send magic link";
      return {
        success: false,
        error: message,
      };
    }

    return { success: true };
  } catch (error: any) {
    return { 
      success: false, 
      error: error?.message || "An unexpected error occurred" 
    };
  }
};