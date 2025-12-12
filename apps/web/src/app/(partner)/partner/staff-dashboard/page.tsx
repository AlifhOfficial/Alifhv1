'use client';

import { useUser } from '@/hooks/auth/use-auth';

export default function PartnerStaffDashboard() {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* DEV: Pink header for partner staff */}
      <div className="bg-pink-100 border-l-4 border-pink-500 p-4 mb-6">
        <h1 className="text-2xl font-bold text-pink-900 mb-4">Partner Staff Dashboard</h1>
        <p className="text-pink-700">Welcome to the Partner Staff Portal. You can access your daily tasks and assigned operations.</p>
        <p className="text-sm text-pink-600 mt-2">[DEV: PARTNER STAFF - PINK]</p>
      </div>

      {user && (
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">User Info</h2>
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Platform Role:</strong> {(user as any)?.platformRole || 'user'}</p>
          <p><strong>Status:</strong> {(user as any)?.status || 'active'}</p>
          <p><strong>Active Partner:</strong> {(user as any)?.activePartnerId || 'None'}</p>
        </div>
      )}
    </div>
  );
}