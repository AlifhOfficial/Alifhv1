'use client';

import { useDashboardRouter, useAutoDashboardRedirect } from '@/hooks/auth/use-dashboard-router';
import { useUser, useRoleCheck } from '@/hooks/auth/use-auth';

export default function DashboardDemoPage() {
  const { user, isLoading: userLoading } = useUser();
  const { isAdmin, isStaff, isUser } = useRoleCheck();
  const { getDashboardRoute, redirectToDashboard } = useDashboardRouter();

  if (userLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Dashboard Role Routing Demo
          </h1>

          {user ? (
            <div className="space-y-6">
              {/* Current User Info */}
              <div className="bg-blue-50 p-6 rounded-lg">
                <h2 className="text-xl font-semibold text-blue-900 mb-4">
                  Current User Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-blue-800">Email:</span>
                    <span className="ml-2 text-blue-700">{(user as any)?.email || 'Not available'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-blue-800">Role:</span>
                    <span className="ml-2 text-blue-700">{(user as any)?.platformRole || 'user'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-blue-800">Status:</span>
                    <span className="ml-2 text-blue-700">{(user as any)?.status || 'active'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-blue-800">Email Verified:</span>
                    <span className="ml-2 text-blue-700">
                      {(user as any)?.emailVerified ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Role Detection */}
              <div className="bg-green-50 p-6 rounded-lg">
                <h2 className="text-xl font-semibold text-green-900 mb-4">
                  Role Detection Results
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className={`p-3 rounded ${isAdmin ? 'bg-green-200 text-green-800' : 'bg-gray-200 text-gray-600'}`}>
                    <div className="font-medium">Admin Access</div>
                    <div className="text-sm">{isAdmin ? 'Granted' : 'Denied'}</div>
                  </div>
                  <div className={`p-3 rounded ${isStaff ? 'bg-yellow-200 text-yellow-800' : 'bg-gray-200 text-gray-600'}`}>
                    <div className="font-medium">Staff Access</div>
                    <div className="text-sm">{isStaff ? 'Granted' : 'Denied'}</div>
                  </div>
                  <div className={`p-3 rounded ${isUser ? 'bg-blue-200 text-blue-800' : 'bg-gray-200 text-gray-600'}`}>
                    <div className="font-medium">User Access</div>
                    <div className="text-sm">{isUser ? 'Granted' : 'Denied'}</div>
                  </div>
                </div>
              </div>

              {/* Dashboard Routing */}
              <div className="bg-purple-50 p-6 rounded-lg">
                <h2 className="text-xl font-semibold text-purple-900 mb-4">
                  Dashboard Routing
                </h2>
                <div className="space-y-4">
                  <div>
                    <span className="font-medium text-purple-800">Recommended Dashboard:</span>
                    <span className="ml-2 px-3 py-1 bg-purple-200 text-purple-800 rounded-full text-sm font-medium">
                      {getDashboardRoute() || 'Not determined'}
                    </span>
                  </div>
                  
                  <button
                    onClick={redirectToDashboard}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-md font-medium transition-colors"
                  >
                    Go to My Dashboard
                  </button>
                </div>
              </div>

              {/* Manual Dashboard Links */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Manual Dashboard Access
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <a 
                    href="/user-dashboard"
                    className="block p-4 bg-blue-100 hover:bg-blue-200 rounded-lg text-center transition-colors"
                  >
                    <div className="font-medium text-blue-900">User Dashboard</div>
                    <div className="text-sm text-blue-700">All users</div>
                  </a>
                  <a 
                    href="/admin-dashboard"
                    className="block p-4 bg-red-100 hover:bg-red-200 rounded-lg text-center transition-colors"
                  >
                    <div className="font-medium text-red-900">Admin Dashboard</div>
                    <div className="text-sm text-red-700">Admin/Staff only</div>
                  </a>
                  <a 
                    href="/partner-dashboard"
                    className="block p-4 bg-emerald-100 hover:bg-emerald-200 rounded-lg text-center transition-colors"
                  >
                    <div className="font-medium text-emerald-900">Partner Dashboard</div>
                    <div className="text-sm text-emerald-700">Partners only</div>
                  </a>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Not Authenticated
              </h2>
              <p className="text-gray-600 mb-6">
                Please sign in to see dashboard routing demo.
              </p>
              <a 
                href="/auth/signin"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium transition-colors"
              >
                Sign In
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}