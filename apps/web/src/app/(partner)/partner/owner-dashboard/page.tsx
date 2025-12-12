'use client';

import { useUserWithPartnerRole } from '@/hooks/auth/use-auth';
import { canAccessPartnerOwnerPortal } from '@alifh/shared/auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function PartnerOwnerDashboard() {
  const { user, isLoading } = useUserWithPartnerRole();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user && !canAccessPartnerOwnerPortal(user)) {
      router.push('/user-dashboard');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return <div className="p-6">Loading...</div>;
  }

  if (!user || !canAccessPartnerOwnerPortal(user)) {
    return null; // Will redirect
  }

  return (
    <div className="p-6">
      {/* DEV: Green header for partner owner */}
      <div className="bg-green-100 border-l-4 border-green-500 p-4 mb-6">
        <h1 className="text-2xl font-bold text-green-900 mb-4">Partner Owner Dashboard</h1>
        <p className="text-green-700">Welcome to the Partner Owner Portal. You have full access to manage your partner organization. [DEV: PARTNER OWNER - GREEN]</p>
      </div>
    </div>
  );
}