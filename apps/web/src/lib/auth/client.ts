"use client";

import { createAuthClient } from "better-auth/react";
import { magicLinkClient } from "better-auth/client/plugins";
import { adminClient } from "better-auth/client/plugins";
import { ac, roles } from "@alifh/shared/auth";

// Use window.location.origin in browser to support both localhost and network access
const getBaseURL = () => {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
};

export const authClient = createAuthClient({
  baseURL: getBaseURL(),
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

export const {
  signIn,
  signUp,
  signOut,
  useSession,
} = authClient;

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
