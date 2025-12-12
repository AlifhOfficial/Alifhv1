'use client';

import { useUser } from '@/hooks/auth/use-auth';

export default function PartnerAdminDashboard() {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* DEV: Yellow header for partner admin */}
      <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-6">
        <h1 className="text-2xl font-bold text-yellow-900 mb-4">Partner Admin Dashboard</h1>
        <p className="text-yellow-700">Welcome to the Partner Admin Portal. You can manage partner operations and staff.</p>
        <p className="text-sm text-yellow-600 mt-2">[DEV: PARTNER ADMIN - YELLOW]</p>
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