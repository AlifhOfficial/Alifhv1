/**
 * Auth Provider - Session Singleton
 * 
 * Custom implementation to prevent Better Auth's automatic session polling.
 * Fetches session ONCE on mount and caches it.
 * All components should use this provider's context instead of calling useSession directly.
 * 
 * @module providers/auth-provider
 */

'use client';

import { createContext, useContext, useEffect, useState, useCallback, useRef, type ReactNode } from 'react';
import type { Session } from '@/lib/auth';

interface AuthContextValue {
  session: Session['user'] | null;
  isLoading: boolean;
  error: Error | null;
  isAuthenticated: boolean;
  refetch: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session['user'] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const fetchedRef = useRef(false);

  const fetchSession = useCallback(async (force = false) => {
    // Skip if already fetched (unless force refresh)
    if (fetchedRef.current && !force) {
      return;
    }

    try {
      setIsLoading(true);
      // Use Better Auth's session endpoint (note: it's "get-session", not "session")
      const url = '/api/auth/get-session';
      
      const res = await fetch(url, {
        method: 'GET',
        credentials: 'include',
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });
      
      if (!res.ok) {
        if (res.status === 401) {
          fetchedRef.current = true;
          setSession(null);
          setIsLoading(false);
          return;
        }
        throw new Error('Failed to fetch session');
      }
      
      const data = await res.json();
      const user = data?.user ?? null;
      fetchedRef.current = true;
      setSession(user);
      
      if (process.env.NODE_ENV === 'development') {
        console.log('[AuthProvider] Session fetched', { 
          hasSession: !!user,
          userId: user?.id?.slice(0, 8),
          avatarUrl: user?.avatarUrl?.slice(0, 50),
          force,
        });
      }
    } catch (err) {
      setError(err as Error);
      fetchedRef.current = true;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Manual refetch function (for sign-in/sign-out)
  const refetch = useCallback(async () => {
    fetchedRef.current = false;
    await fetchSession(true);
  }, [fetchSession]);

  // Fetch session ONCE on mount
  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  const value: AuthContextValue = {
    session,
    isLoading,
    error,
    isAuthenticated: !!session,
    refetch,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  
  return context;
}
