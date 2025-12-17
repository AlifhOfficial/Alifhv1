"use client";

import { createAuthClient } from "better-auth/react";
import { magicLinkClient } from "better-auth/client/plugins";
import { adminClient } from "better-auth/client/plugins";
import { customSessionClient } from "better-auth/client/plugins";
import { ac, roles } from "@/lib/auth/permissions";
import type { auth } from "@/lib/auth";

// Lazy initialization to ensure client-side only creation
let _authClient: ReturnType<typeof createAuthClient> | null = null;

function getAuthClient() {
  if (typeof window === 'undefined') {
    throw new Error('Auth client can only be used on the client side');
  }
  
  if (!_authClient) {
    // Use window.location.origin to support both localhost and network IPs
    const baseURL = typeof window !== 'undefined' 
      ? window.location.origin 
      : (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000");
    
    _authClient = createAuthClient({
      baseURL,
      plugins: [
        magicLinkClient(),
        adminClient({
          ac,
          roles: {
            admin: roles.admin,
            user: roles.user,
          },
        }),
        // Add custom session client to infer role/partner data
        customSessionClient<typeof auth>(),
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
