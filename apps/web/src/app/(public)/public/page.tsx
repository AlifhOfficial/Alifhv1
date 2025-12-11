/**
 * Public Marketplace
 * General marketplace for all visitors
 */

export default function PublicMarketplace() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Public Marketplace</h1>
        <p className="text-gray-600">Welcome to our general marketplace - accessible to everyone!</p>
        
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Features Coming Soon:</h2>
          <ul className="list-disc pl-6 space-y-2 text-gray-600">
            <li>Browse products and services</li>
            <li>View partner listings</li>
            <li>Public company information</li>
            <li>Contact forms</li>
          </ul>
        </div>
      </div>
    </div>
  );
}