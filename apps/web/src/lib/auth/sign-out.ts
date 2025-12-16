/**
 * Centralized Sign Out Handler
 * 
 * Handles user logout with proper session cleanup and cache clearing.
 * Use this function throughout the app for consistent logout behavior.
 */

import { signOut as betterAuthSignOut } from './client';

export async function handleSignOut() {
  try {
    // IMPORTANT: Clear session cache BEFORE calling Better Auth signOut
    // This prevents middleware from serving stale cached session data
    try {
      await fetch('/api/auth/sign-out-clear-cache', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (cacheError) {
      // Continue even if cache clear fails
      console.warn("Failed to clear session cache:", cacheError);
    }
    
    // Now sign out via Better Auth
    await betterAuthSignOut({
      fetchOptions: {
        onSuccess: () => {
          // Force a complete page reload to clear all client-side state
          window.location.href = "/";
        },
        onError: () => {
          // Even if logout fails on server, clear local state and redirect
          window.location.href = "/";
        },
      },
    });
  } catch (error) {
    console.error("Sign out failed:", error);
    // Even if everything fails, clear local state and redirect
    window.location.href = "/";
  }
}
