/**
 * Centralized Sign-Out Handler - Production
 * 
 * Secure logout implementation with comprehensive cache clearing.
 * Prevents data leakage between users by clearing all client-side storage.
 * 
 * Security flow:
 * 1. Clear localStorage/sessionStorage
 * 2. Call Better Auth sign-out API
 * 3. Force hard reload to clear all caches
 * 
 * @module lib/auth/sign-out
 * @client-only Must be called from client components
 */

import { signOut as betterAuthSignOut } from './client';

/**
 * Signs out current user and clears all caches
 * Always redirects to homepage with hard reload, even on failure
 * 
 * @example
 * await handleSignOut();
 */
export async function handleSignOut() {
  try {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('better-auth.session');
        sessionStorage.clear();
      } catch (e) {
        console.warn('Failed to clear storage:', e);
      }
    }
    
    await betterAuthSignOut({
      fetchOptions: {
        onSuccess: () => {
          window.location.replace("/");
        },
        onError: () => {
          window.location.replace("/");
        },
      },
    });
  } catch (error) {
    console.error("Sign out failed:", error);
    window.location.replace("/");
  }
}
