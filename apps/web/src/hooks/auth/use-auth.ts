/**
 * Auth Hooks - Simple Authentication Helpers
 * 
 * Basic authentication hooks for React components.
 * Clean implementation using Better Auth session management.
 */

'use client';

import { useSession } from '@/lib/auth/client';

// Simple hook to get current user session
export function useUser() {
  const { data: session, isPending, error } = useSession();

  return {
    user: session?.user || null,
    isLoading: isPending,
    isSignedIn: !!session?.user,
    error,
    session,
  };
}