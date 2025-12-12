'use client';

import { useUserWithPartnerRole } from '@/hooks/auth/use-auth';
import { canAccessPartnerStaffPortal } from '@alifh/shared/auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function PartnerStaffDashboard() {
  const { user, isLoading } = useUserWithPartnerRole();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user && !canAccessPartnerStaffPortal(user)) {
      router.push('/user-dashboard');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return <div className="p-6">Loading...</div>;
  }

  if (!user || !canAccessPartnerStaffPortal(user)) {
    return null;
  }

  return (
    <div className="p-6">
      {/* DEV: Pink header for partner staff */}
      <div className="bg-pink-100 border-l-4 border-pink-500 p-4 mb-6">
        <h1 className="text-2xl font-bold text-pink-900 mb-4">Partner Staff Dashboard</h1>
        <p className="text-pink-700">Welcome to the Partner Staff Portal. You can access your daily tasks and assigned operations. [DEV: PARTNER STAFF - PINK]</p>
      </div>
    </div>
  );
}