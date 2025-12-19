/**
 * Auth Provider - Session Singleton
 * 
 * Wraps Better Auth's session management to prevent duplicate fetches.
 * Implements client-side caching to minimize API calls.
 * All components should use this provider's context instead of calling useSession directly.
 * 
 * @module providers/auth-provider
 */

'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useSession } from '@/lib/auth/client';
import type { Session } from '@/lib/auth';

interface AuthContextValue {
  session: Session['user'] | null;
  isLoading: boolean;
  error: Error | null;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  // useSession from Better Auth - relies on cookie cache for performance
  const { data: session, isPending, error } = useSession();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!isPending && !initialized) {
      setInitialized(true);
      if (process.env.NODE_ENV === 'development') {
        console.log('[AuthProvider] Session initialized', { 
          hasSession: !!session?.user,
          userId: session?.user?.id?.slice(0, 8)
        });
      }
    }
  }, [isPending, initialized, session]);

  const value: AuthContextValue = {
    session: session?.user ?? null,
    isLoading: isPending,
    error: error as Error | null,
    isAuthenticated: !!session?.user,
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
