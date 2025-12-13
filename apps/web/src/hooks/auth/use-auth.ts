'use client';

import { useSession } from '@/lib/auth/client';
import { UserRole } from '@alifh/shared';

export function useUser() {
  const { data: session, isPending, error } = useSession();

  const user = session?.user ? {
    ...session.user,
    role: session.user.role as UserRole | null // null means regular user
  } : null;

  return {
    user,
    isLoading: isPending,
    isSignedIn: !!user,
    error,
    session,
  };
}