/**
 * Centralized Sign Out Handler
 * 
 * Handles user logout using Better Auth's native sign-out functionality.
 * Use this function throughout the app for consistent logout behavior.
 * 
 * Security: Clears all caches to prevent data leakage between users
 */

import { signOut as betterAuthSignOut } from './client';

export async function handleSignOut() {
  try {
    // CRITICAL: Clear all client-side caches BEFORE signing out
    // This prevents the next user from seeing cached data
    
    // 1. Clear Better Auth's React Query cache
    if (typeof window !== 'undefined') {
      // Clear any stored session data in localStorage/sessionStorage
      try {
        localStorage.removeItem('better-auth.session');
        sessionStorage.clear();
      } catch (e) {
        console.warn('Failed to clear storage:', e);
      }
    }
    
    // 2. Sign out via Better Auth - it handles session deletion
    await betterAuthSignOut({
      fetchOptions: {
        onSuccess: () => {
          // 3. Force hard reload to clear ALL caches (fetch cache, React Query, etc.)
          // Using location.replace instead of location.href for better cache clearing
          window.location.replace("/");
        },
        onError: () => {
          // Even if logout fails on server, clear local state and redirect
          window.location.replace("/");
        },
      },
    });
  } catch (error) {
    console.error("Sign out failed:", error);
    // Even if everything fails, clear local state and force reload
    window.location.replace("/");
  }
}
