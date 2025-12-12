'use client';

import { useUserWithPartnerRole } from '@/hooks/auth/use-auth';
import { canAccessPartnerAdminPortal } from '@alifh/shared/auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function PartnerAdminDashboard() {
  const { user, isLoading } = useUserWithPartnerRole();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user && !canAccessPartnerAdminPortal(user)) {
      router.push('/user-dashboard');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return <div className="p-6">Loading...</div>;
  }

  if (!user || !canAccessPartnerAdminPortal(user)) {
    return null;
  }

  return (
    <div className="p-6">
      {/* DEV: Yellow header for partner admin */}
      <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-6">
        <h1 className="text-2xl font-bold text-yellow-900 mb-4">Partner Admin Dashboard</h1>
        <p className="text-yellow-700">Welcome to the Partner Admin Portal. You can manage partner operations and staff. [DEV: PARTNER ADMIN - YELLOW]</p>
      </div>
    </div>
  );
}