/**
 * Auth Hooks - Client-side Authentication Helpers
 * 
 * Custom hooks for handling authentication in React components.
 * Provides role checking, status validation, and partner permissions.
 */

'use client';

import { useSession } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { type PlatformRole, type UserStatus, type PartnerRole } from '@alifh/shared/auth';

// Hook for requiring authentication
export function useRequireAuth(redirectTo: string = '/auth/signin') {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isPending && !session) {
      router.push(`${redirectTo}?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
    }
  }, [session, isPending, router, redirectTo]);

  return {
    session,
    user: session?.user,
    isLoading: isPending,
    isAuthenticated: !!session?.user,
  };
}

// Hook for checking platform roles
export function useRequireRole(
  allowedRoles: PlatformRole[],
  redirectTo: string = '/auth/unauthorized'
) {
  const { session, user, isLoading, isAuthenticated } = useRequireAuth();
  const router = useRouter();

  const hasValidRole = user && allowedRoles.includes((user as any).platformRole as PlatformRole);

  useEffect(() => {
    if (!isLoading && isAuthenticated && !hasValidRole) {
      router.push(redirectTo);
    }
  }, [isLoading, isAuthenticated, hasValidRole, router, redirectTo]);

  return {
    session,
    user,
    isLoading: isLoading || (!hasValidRole && isAuthenticated),
    isAuthenticated,
    hasValidRole,
    userRole: (user as any)?.platformRole as PlatformRole,
  };
}

// Hook for checking user status
export function useRequireStatus(
  allowedStatuses: UserStatus[],
  redirectMap?: Partial<Record<UserStatus, string>>
) {
  const { session, user, isLoading, isAuthenticated } = useRequireAuth();
  const router = useRouter();

  const hasValidStatus = user && allowedStatuses.includes((user as any).status as UserStatus);
  const currentStatus = (user as any)?.status as UserStatus;

  useEffect(() => {
    if (!isLoading && isAuthenticated && !hasValidStatus) {
      const redirectTo = redirectMap?.[currentStatus] || getDefaultRedirectForStatus(currentStatus);
      router.push(redirectTo);
    }
  }, [isLoading, isAuthenticated, hasValidStatus, currentStatus, router, redirectMap]);

  return {
    session,
    user,
    isLoading: isLoading || (!hasValidStatus && isAuthenticated),
    isAuthenticated,
    hasValidStatus,
    userStatus: currentStatus,
  };
}

// Hook for checking email verification
export function useRequireEmailVerified(redirectTo: string = '/auth/verify-email') {
  const { session, user, isLoading, isAuthenticated } = useRequireAuth();
  const router = useRouter();

  const isEmailVerified = (user as any)?.emailVerified;

  useEffect(() => {
    if (!isLoading && isAuthenticated && !isEmailVerified) {
      router.push(redirectTo);
    }
  }, [isLoading, isAuthenticated, isEmailVerified, router, redirectTo]);

  return {
    session,
    user,
    isLoading: isLoading || (!isEmailVerified && isAuthenticated),
    isAuthenticated,
    isEmailVerified,
  };
}

// Combined hook for most protected routes
export function useProtectedRoute(options: {
  allowedRoles?: PlatformRole[];
  allowedStatuses?: UserStatus[];
  requireEmailVerified?: boolean;
}) {
  const { allowedRoles, allowedStatuses, requireEmailVerified } = options;
  
  // Start with base auth requirement
  const { session, user, isLoading, isAuthenticated } = useRequireAuth();
  const router = useRouter();

  // Check all requirements
  const hasValidRole = !allowedRoles || (user && allowedRoles.includes((user as any).platformRole as PlatformRole));
  const hasValidStatus = !allowedStatuses || (user && allowedStatuses.includes((user as any).status as UserStatus));
  const hasVerifiedEmail = !requireEmailVerified || (user as any)?.emailVerified;

  const isValid = hasValidRole && hasValidStatus && hasVerifiedEmail;

  useEffect(() => {
    if (!isLoading && isAuthenticated && !isValid) {
      // Prioritize redirects
      if (requireEmailVerified && !hasVerifiedEmail) {
        router.push('/auth/verify-email');
        return;
      }
      
      if (allowedStatuses && !hasValidStatus) {
        const status = (user as any)?.status as UserStatus;
        const redirectTo = getDefaultRedirectForStatus(status);
        router.push(redirectTo);
        return;
      }
      
      if (allowedRoles && !hasValidRole) {
        router.push('/auth/unauthorized');
        return;
      }
    }
  }, [
    isLoading, 
    isAuthenticated, 
    isValid, 
    hasVerifiedEmail, 
    hasValidStatus, 
    hasValidRole,
    router,
    user,
    requireEmailVerified,
    allowedStatuses,
    allowedRoles,
  ]);

  return {
    session,
    user,
    isLoading: isLoading || (!isValid && isAuthenticated),
    isAuthenticated,
    isAuthorized: isValid,
    userRole: (user as any)?.platformRole as PlatformRole,
    userStatus: (user as any)?.status as UserStatus,
    isEmailVerified: hasVerifiedEmail,
  };
}

// Role checking utilities
export function useRoleCheck() {
  const { data: session } = useSession();
  const user = session?.user;

  return {
    isAdmin: (user as any)?.platformRole === 'admin' || (user as any)?.platformRole === 'super-admin',
    isStaff: (user as any)?.platformRole === 'staff',
    isUser: (user as any)?.platformRole === 'user',
    hasRole: (role: PlatformRole) => (user as any)?.platformRole === role,
    hasAnyRole: (roles: PlatformRole[]) => user && roles.includes((user as any).platformRole as PlatformRole),
    isActive: (user as any)?.status === 'active',
    isPending: (user as any)?.status === 'pending',
    isSuspended: (user as any)?.status === 'suspended',
    isEmailVerified: (user as any)?.emailVerified,
  };
}

// User utilities
export function useUser() {
  const { data: session, isPending } = useSession();
  
  return {
    user: session?.user || null,
    isLoading: isPending,
    isSignedIn: !!session?.user,
  };
}

// Helper function to get default redirect based on status
function getDefaultRedirectForStatus(status: UserStatus): string {
  switch (status) {
    case 'pending':
      return '/auth/pending-approval';
    case 'suspended':
      return '/auth/suspended';
    case 'inactive':
      return '/auth/inactive';
    default:
      return '/auth/unauthorized';
  }
}

// Hook for partner-specific operations (would require additional database queries)
export function usePartnerPermissions(partnerId?: string) {
  const { user, isLoading } = useUser();
  
  // TODO: Implement database queries to check partner memberships
  // This would require API calls to check if user is member of specific partner
  
  return {
    isLoading,
    canAccessPartner: false, // TODO: Implement
    partnerRole: null as PartnerRole | null, // TODO: Implement
    isPartnerOwner: false, // TODO: Implement
    isPartnerAdmin: false, // TODO: Implement
    isPartnerMember: false, // TODO: Implement
  };
}