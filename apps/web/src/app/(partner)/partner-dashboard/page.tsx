export default function PartnerDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">Partner Dashboard</h2>
        <p className="mt-2 text-gray-600">
          Manage your partnerships and organizational relationships.
        </p>
      </div>

      {/* Partnership Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-emerald-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-medium">A</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Active Partnerships
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">12</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-blue-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-medium">O</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Organizations
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">8</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-purple-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-medium">U</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Connected Users
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">1,234</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Partnership Management */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Partnership Overview
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
                <div>
                  <p className="font-medium text-emerald-900">TechCorp Partnership</p>
                  <p className="text-sm text-emerald-700">1,200 active users</p>
                </div>
                <span className="px-2 py-1 text-xs font-medium bg-emerald-100 text-emerald-800 rounded-full">
                  Active
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div>
                  <p className="font-medium text-blue-900">DataFlow Inc.</p>
                  <p className="text-sm text-blue-700">850 active users</p>
                </div>
                <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                  Active
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div>
                  <p className="font-medium text-yellow-900">StartupHub</p>
                  <p className="text-sm text-yellow-700">Pending approval</p>
                </div>
                <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                  Pending
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Quick Actions
            </h3>
            <div className="space-y-3">
              <button className="w-full flex items-center justify-between px-4 py-3 border border-emerald-300 rounded-md text-sm font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100">
                <span>Create New Partnership</span>
                <span className="text-emerald-500">+</span>
              </button>
              <button className="w-full flex items-center justify-between px-4 py-3 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                <span>Manage Organizations</span>
                <span className="text-gray-400">→</span>
              </button>
              <button className="w-full flex items-center justify-between px-4 py-3 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                <span>View Analytics</span>
                <span className="text-gray-400">→</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}