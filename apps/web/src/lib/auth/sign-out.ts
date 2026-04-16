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
import { getQueryClient } from '@/lib/query-client';
import { clearFavoritesStore } from '@/hooks/engagement/favorites/use-favorites-unified';

/**
 * Clears all Better Auth cookies including OAuth state cookies.
 * This prevents state_mismatch errors on subsequent sign-ins.
 */
function clearAllBetterAuthCookies() {
  if (typeof document === 'undefined') return;
  
  const cookies = document.cookie.split(";");
  for (const cookie of cookies) {
    const [name] = cookie.split("=");
    const trimmedName = name.trim();
    
    // Clear all better-auth related cookies
    // This includes: session_token, state, pkce_code_verifier, oauth cookies
    if (
      trimmedName.startsWith("better-auth") ||
      trimmedName.includes("state") ||
      trimmedName.includes("pkce") ||
      trimmedName.includes("oauth") ||
      trimmedName.includes("code_verifier")
    ) {
      // Clear with various path combinations to ensure removal
      const paths = ["/", "/api", "/api/auth", "/auth"];
      for (const path of paths) {
        document.cookie = `${trimmedName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}`;
        document.cookie = `${trimmedName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}; secure`;
      }
    }
  }
}

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
        // Clear all Better Auth cookies (session, OAuth state, PKCE, etc.)
        clearAllBetterAuthCookies();
        
        localStorage.removeItem('better-auth.session');
        sessionStorage.clear();
      } catch (e) {
        console.warn('Failed to clear storage:', e);
      }
    }

    // Clear client-side caches for favorites/superlikes to avoid reuse after logout
    try {
      clearFavoritesStore();
      const queryClient = getQueryClient();
      queryClient.clear();
    } catch (e) {
      console.warn('Failed to clear query cache:', e);
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
