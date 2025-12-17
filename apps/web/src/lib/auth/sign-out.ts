/**
 * Centralized Sign Out Handler
 * 
 * Handles user logout using Better Auth's native sign-out functionality.
 * Use this function throughout the app for consistent logout behavior.
 */

import { signOut as betterAuthSignOut } from './client';

export async function handleSignOut() {
  try {
    // Sign out via Better Auth - it handles all session cleanup
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
