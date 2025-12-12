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
    const result = await authClient.signIn.email({
      email,
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

export const signInWithGoogle = async (callbackURL: string = "/dashboard"): Promise<AuthResult> => {
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
    const result = await authClient.signUp.email({
      name,
      email,
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
      name, 
      email 
    };
    return { success: true, user };
  } catch (error: any) {
    return { 
      success: false, 
      error: error?.message || "An unexpected error occurred" 
    };
  }
};

export const signUpWithGoogle = async (callbackURL: string = "/dashboard"): Promise<AuthResult> => {
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
    // Use our custom validation endpoint instead of direct Better Auth call
    const response = await fetch("/api/auth/password-reset-validated", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, redirectTo }),
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
    const result = await authClient.signIn.magicLink({
      email,
      callbackURL,
    });

    if (result.error) {
      // Handle server-side validation errors (500 status from our custom validation)
      if (result.error.status === 500 && 
          result.error.message?.includes("No account found")) {
        return { 
          success: false, 
          error: "No account found with this email address. Magic links are only available for existing users. Please sign up first or use a different email." 
        };
      }
      
      // Handle other Better Auth errors
      if (result.error.status === 400 || 
          result.error.message?.includes("User not found")) {
        return { 
          success: false, 
          error: "No account found with this email address. Magic links are only available for existing users. Please sign up first or use a different email." 
        };
      }
      
      return { 
        success: false, 
        error: result.error.message || "Failed to send magic link" 
      };
    }

    return { success: true };
  } catch (error: any) {
    // Handle network or other errors
    if (error?.message?.includes("No account found")) {
      return { 
        success: false, 
        error: "No account found with this email address. Magic links are only available for existing users. Please sign up first or use a different email." 
      };
    }
    return { 
      success: false, 
      error: error?.message || "An unexpected error occurred" 
    };
  }
};