/**
 * Authentication Client - Production
 * 
 * Centralized authentication client for Better Auth integration.
 * Provides magic link authentication, role-based access control, and session management.
 * 
 * @module lib/auth/client
 * @requires better-auth/react
 * @client-only This module must only be used in client components
 */

"use client";

import { createAuthClient } from "better-auth/react";
import { magicLinkClient, adminClient, customSessionClient, phoneNumberClient } from "better-auth/client/plugins";
import { passkeyClient } from "@better-auth/passkey/client";
import { ac, roles } from "@/lib/auth/permissions";
import type { auth } from "@/lib/auth";

/**
 * Singleton auth client instance
 * Lazy-initialized on first access to ensure client-side only execution
 */
let _authClient: ReturnType<typeof createAuthClient> | null = null;

/**
 * Initializes and returns the auth client instance
 * @throws {Error} If called on server side
 * @returns {AuthClient} Configured Better Auth client
 */
function getAuthClient() {
  if (typeof window === 'undefined') {
    throw new Error('Auth client can only be used on the client side');
  }
  
  if (!_authClient) {
    _authClient = createAuthClient({
      baseURL: window.location.origin,
      fetchOptions: {
        onError(context) {
          if (context.error.status === 401) {
            console.warn('[Auth] Unauthorized request');
          }
        },
      },
      session: {
        refetchOnWindowFocus: false,
        refetchInterval: false, // Disable automatic polling
      },
      plugins: [
        magicLinkClient(),
        phoneNumberClient(),
        passkeyClient(),
        adminClient({
          ac,
          roles: {
            admin: roles.admin,
            user: roles.user,
          },
        }),
        customSessionClient<typeof auth>(),
      ]
    });
  }
  
  return _authClient;
}

/**
 * Main auth client instance
 * Auto-initializes on client side, returns empty object on server
 */
export const authClient = typeof window !== 'undefined' ? getAuthClient() : {} as any;

/**
 * Authentication method exports
 * Direct access to Better Auth core functionality
 * Server-side safe: returns undefined on server, actual functions on client
 */
export const signIn = authClient.signIn;
export const signUp = authClient.signUp;
export const signOut = authClient.signOut;

/**
 * DEPRECATED: Do not use useSession directly - it causes excessive polling.
 * Use useAuth() from @/providers/auth-provider instead.
 */
export const useSession = authClient.useSession || (() => ({ data: null, isPending: false, error: null }));

/**
 * DEPRECATED: Use useAuth() from @/providers/auth-provider instead.
 * This function causes excessive session polling.
 */
export function useAuthSession() {
  console.warn('[DEPRECATED] useAuthSession causes polling. Use useAuth() from @/providers/auth-provider');
  const { data: session, isPending, error } = useSession();
  
  return {
    session,
    user: session?.user,
    isLoading: isPending,
    error,
    isAuthenticated: !!session,
  };
}
