'use client';

import { useSession } from '@/lib/auth/client';
import { UserRole } from '@/lib/auth/types';
import { useEffect, useState } from 'react';

export function useUser() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const { data: session, isPending, error } = useSession();

  const user = session?.user ? {
    ...session.user,
    role: session.user.role as UserRole | null // null means regular user
  } : null;

  // During SSR or before hydration, return safe loading state
  if (!mounted) {
    return {
      user: null,
      isLoading: true,
      isSignedIn: false,
      error: null,
      session: null,
    };
  }

  return {
    user,
    isLoading: isPending,
    isSignedIn: !!user,
    error,
    session,
  };
}