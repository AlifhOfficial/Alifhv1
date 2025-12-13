"use client";

import { createAuthClient } from "better-auth/react";
import { magicLinkClient } from "better-auth/client/plugins";
import { adminClient } from "better-auth/client/plugins";
import { ac, roles } from "./permissions";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  plugins: [
    magicLinkClient(),
    adminClient({
      ac,
      roles: {
        admin: roles.admin,
        partner: roles.partner,
        staff: roles.staff,
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
