'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useRoleCheck, useUserWithPartnerRole } from '@/hooks/auth/use-auth';

/**
 * Dashboard Router Hook
 * Automatically redirects users to their appropriate dashboard based on role
 */
export function useDashboardRouter() {
  const { user, isLoading } = useUserWithPartnerRole();
  const { isAdmin, isStaff, isUser, hasAnyRole } = useRoleCheck();
  const router = useRouter();

  const getDashboardRoute = () => {
    if (!user) return null;

    // Priority order for role-based routing:
    
    // 1. Alifh Admin users (super-admin, admin) - highest priority
    if (isAdmin) {
      return '/admin-dashboard';
    }

    // 2. Alifh Staff users - admin dashboard with limited access
    if (isStaff) {
      return '/admin-dashboard';
    }

    // 3. Partner users - redirect to specific partner portal based on role
    if (user.activePartnerId && user.partnerRole) {
      if (user.partnerRole === 'owner') {
        return '/partner/owner-dashboard';
      }
      if (user.partnerRole === 'admin') {
        return '/partner/admin-dashboard';
      }
      if (user.partnerRole === 'staff') {
        return '/partner/staff-dashboard';
      }
    }

    // If partner user but no specific role determined, go to user dashboard
    if (user.activePartnerId) {
      return '/user-dashboard';
    }

    // 4. Regular users - user portal
    if (isUser) {
      return '/user-dashboard';
    }

    // Fallback for unrecognized roles
    return '/user-dashboard';
  };

  return {
    getDashboardRoute,
    isLoading,
    redirectToDashboard: () => {
      const route = getDashboardRoute();
      if (route) {
        router.push(route);
      }
    }
  };
}

/**
 * Auto Dashboard Redirect Hook
 * Use this in pages that should automatically redirect based on user role
 */
export function useAutoDashboardRedirect() {
  const { getDashboardRoute, isLoading } = useDashboardRouter();
  const router = useRouter();
  const { user } = useUserWithPartnerRole();

  useEffect(() => {
    if (!isLoading && user) {
      const dashboardRoute = getDashboardRoute();
      if (dashboardRoute) {
        router.push(dashboardRoute);
      }
    }
  }, [isLoading, user, getDashboardRoute, router]);

  return { isLoading };
}