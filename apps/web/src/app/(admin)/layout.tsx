'use client';

import { AdminDashboardNav } from '@/components/ui/navigation/admin-dashboard-nav';
import { useProtectedRoute } from '@/hooks/auth/use-auth';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoading } = useProtectedRoute({
    allowedRoles: ['admin', 'super-admin', 'staff'],
    requireEmailVerified: true,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Left Navigation */}
      <div className="w-64 flex-shrink-0">
        <AdminDashboardNav />
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="h-2 w-2 bg-green-400 rounded-full"></span>
                <span className="text-sm text-gray-600">System Online</span>
              </div>
              <button className="p-2 text-gray-400 hover:text-gray-500">
                <span className="sr-only">Admin Notifications</span>
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5z" />
                </svg>
              </button>
              <div className="h-8 w-8 rounded-full bg-red-500 flex items-center justify-center">
                <span className="text-sm font-medium text-white">A</span>
              </div>
            </div>
          </div>
        </header>
        
        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}