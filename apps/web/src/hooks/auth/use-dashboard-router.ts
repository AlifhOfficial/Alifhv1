'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useRoleCheck, useUser } from '@/hooks/auth/use-auth';

/**
 * Dashboard Router Hook
 * Automatically redirects users to their appropriate dashboard based on role
 */
export function useDashboardRouter() {
  const { user, isLoading } = useUser();
  const { isAdmin, isStaff, isUser, hasAnyRole } = useRoleCheck();
  const router = useRouter();

  const getDashboardRoute = () => {
    if (!user) return null;

    // Admin users get admin dashboard (super-admin, admin)
    if (isAdmin) {
      return '/admin-dashboard';
    }

    // Staff users also get admin dashboard with limited access
    if (isStaff) {
      return '/admin-dashboard';
    }

    // Check if user has partner role/permissions
    // TODO: Add partner role detection when implemented
    // if (isPartner) {
    //   return '/partner-dashboard';
    // }

    // Default to user dashboard for regular users
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
  const { user } = useUser();

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