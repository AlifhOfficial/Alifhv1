/**
 * User Portal
 * User dashboard with their set of features
 */

export default function UserPortal() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">User Portal</h1>
        <p className="text-gray-600">Your personal dashboard and user features</p>
        
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Your Features:</h2>
          <ul className="list-disc pl-6 space-y-2 text-gray-600">
            <li>Profile management</li>
            <li>Order history</li>
            <li>Preferences settings</li>
            <li>Support tickets</li>
            <li>Notifications</li>
          </ul>
        </div>
      </div>
    </div>
  );
}