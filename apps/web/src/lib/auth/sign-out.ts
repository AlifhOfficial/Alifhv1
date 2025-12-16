/**
 * Centralized Sign Out Handler
 * 
 * Handles user logout with proper session cleanup and cache clearing.
 * Use this function throughout the app for consistent logout behavior.
 */

import { signOut as betterAuthSignOut } from './client';

export async function handleSignOut() {
  try {
    await betterAuthSignOut({
      fetchOptions: {
        onSuccess: () => {
          // Force a complete page reload to clear all cached session data
          window.location.href = "/";
        },
      },
    });
  } catch (error) {
    console.error("Sign out failed:", error);
    // Even if logout fails on server, clear local state and redirect
    window.location.href = "/";
  }
}
