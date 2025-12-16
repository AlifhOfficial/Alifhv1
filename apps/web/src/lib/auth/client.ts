"use client";

import { createAuthClient } from "better-auth/react";
import { magicLinkClient } from "better-auth/client/plugins";
import { adminClient } from "better-auth/client/plugins";
import { ac, roles } from "@/lib/auth/permissions";

// Lazy initialization to ensure client-side only creation
let _authClient: ReturnType<typeof createAuthClient> | null = null;

function getAuthClient() {
  if (typeof window === 'undefined') {
    throw new Error('Auth client can only be used on the client side');
  }
  
  if (!_authClient) {
    _authClient = createAuthClient({
      baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      plugins: [
        magicLinkClient(),
        adminClient({
          ac,
          roles: {
            admin: roles.admin,
            user: roles.user,
          },
        }),
      ]
    });
  }
  
  return _authClient;
}

// Create auth client lazily
export const authClient = typeof window !== 'undefined' ? getAuthClient() : {} as any;

// Export methods - simple direct access
export const signIn = authClient.signIn;
export const signUp = authClient.signUp;
export const signOut = authClient.signOut;
export const useSession = typeof window !== 'undefined' ? authClient.useSession : () => ({ data: null, isPending: true, error: null });

export function useAuthSession() {
  const { data: session, isPending, error } = useSession();
  
  return {
    session,
    user: session?.user,
    isLoading: isPending,
    error,
    isAuthenticated: !!session,
  };
}
