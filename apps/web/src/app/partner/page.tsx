/**
 * Partner Portal - Dashboard
 * Main dashboard for dealers and partners
 */

export default function PartnerDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900">Partner Dashboard</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900">Total Listings</h3>
            <p className="text-3xl font-bold text-blue-600">24</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900">Active Views</h3>
            <p className="text-3xl font-bold text-green-600">156</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900">Inquiries</h3>
            <p className="text-3xl font-bold text-yellow-600">8</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900">Sales</h3>
            <p className="text-3xl font-bold text-purple-600">3</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h2 className="text-xl font-semibold">Recent Listings</h2>
          </div>
          <div className="p-6">
            <p className="text-gray-600">Manage your vehicle inventory and track performance</p>
          </div>
        </div>
      </main>
    </div>
  );
}