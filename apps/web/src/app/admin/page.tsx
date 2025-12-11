/**
 * Admin Portal - Dashboard
 * Main dashboard for administrators
 */

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900">Total Users</h3>
            <p className="text-3xl font-bold text-blue-600">1,234</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900">Active Listings</h3>
            <p className="text-3xl font-bold text-green-600">567</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900">Partners</h3>
            <p className="text-3xl font-bold text-yellow-600">89</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900">Revenue</h3>
            <p className="text-3xl font-bold text-purple-600">$45.2K</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b">
              <h2 className="text-xl font-semibold">User Management</h2>
            </div>
            <div className="p-6">
              <p className="text-gray-600">Manage users, partners, and permissions</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b">
              <h2 className="text-xl font-semibold">System Analytics</h2>
            </div>
            <div className="p-6">
              <p className="text-gray-600">View platform metrics and performance</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}