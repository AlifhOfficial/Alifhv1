'use client';

import { useAutoDashboardRedirect } from '@/hooks/auth/use-dashboard-router';
import { useRequireAuth } from '@/hooks/auth/use-auth';

export default function DashboardPage() {
  // Require authentication first
  const { isLoading: authLoading } = useRequireAuth();
  
  // Auto-redirect based on role
  const { isLoading: redirectLoading } = useAutoDashboardRedirect();

  if (authLoading || redirectLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
              Redirecting to your dashboard...
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Please wait while we determine your dashboard access.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // This should never render as the auto-redirect should kick in
  return null;
}