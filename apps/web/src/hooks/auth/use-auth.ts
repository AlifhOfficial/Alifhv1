/**
 * Authentication Hook
 * 
 * Provides user authentication state and session information.
 * Uses AuthProvider context to prevent duplicate session fetches.
 * 
 * @returns Authentication state with user, loading status, and error information
 */

'use client';

import { useAuth } from '@/providers/auth-provider';

export function useUser() {
  const { session: user, isLoading, error, isAuthenticated, refetch, setSessionUser } = useAuth();

  return {
    user,
    isLoading,
    isSignedIn: isAuthenticated,
    error,
    session: user ? { user } : null,
    refetch,
    setSessionUser,
  };
}
