/**
 * Authentication Hook
 * 
 * Provides user authentication state and session information.
 * Built on top of better-auth's useSession hook.
 * 
 * @returns Authentication state with user, loading status, and error information
 */

'use client';

import { useSession } from '@/lib/auth/client';

export function useUser() {
  const { data: session, isPending, error } = useSession();

  return {
    user: session?.user ?? null,
    isLoading: isPending,
    isSignedIn: !!session?.user,
    error,
    session,
  };
}