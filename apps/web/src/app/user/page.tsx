/**
 * User Dashboard
 * Main dashboard for regular users
 */

export default function UserDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900">My Dashboard</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900">My Listings</h3>
            <p className="text-3xl font-bold text-blue-600">2</p>
            <p className="text-sm text-gray-600">Active vehicles for sale</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900">Saved Searches</h3>
            <p className="text-3xl font-bold text-green-600">5</p>
            <p className="text-sm text-gray-600">Vehicles you're watching</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900">Messages</h3>
            <p className="text-3xl font-bold text-yellow-600">3</p>
            <p className="text-sm text-gray-600">Unread inquiries</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b">
              <h2 className="text-xl font-semibold">Recent Activity</h2>
            </div>
            <div className="p-6">
              <p className="text-gray-600">View your recent searches and activities</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b">
              <h2 className="text-xl font-semibold">Recommended for You</h2>
            </div>
            <div className="p-6">
              <p className="text-gray-600">Vehicles matching your preferences</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}