/**
 * Admin Portal
 * Admin moderation portal for administrators
 */

export default function AdminPortal() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Admin Portal</h1>
        <p className="text-gray-600">Administrative moderation and management tools</p>
        
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Admin Features:</h2>
          <ul className="list-disc pl-6 space-y-2 text-gray-600">
            <li>User management</li>
            <li>Partner approvals</li>
            <li>Content moderation</li>
            <li>System monitoring</li>
            <li>Reports and analytics</li>
          </ul>
        </div>
      </div>
    </div>
  );
}