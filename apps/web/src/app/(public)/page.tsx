/**
 * Public Marketplace - Landing Page
 * Main entry point for all users
 */

export default function PublicMarketplacePage() {
  return (
    <div className="min-h-screen">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Alifh Marketplace</h1>
          <p className="text-gray-600 mt-2">Buy and sell vehicles with AI-powered valuations</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Find Your Perfect Vehicle</h2>
          <p className="text-xl text-gray-600">Browse thousands of vehicles from trusted dealers and owners</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <h3 className="text-xl font-semibold mb-2">Browse Vehicles</h3>
            <p className="text-gray-600">Explore our marketplace</p>
          </div>
          
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <h3 className="text-xl font-semibold mb-2">AI Valuations</h3>
            <p className="text-gray-600">Get accurate pricing</p>
          </div>
          
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <h3 className="text-xl font-semibold mb-2">Secure Transactions</h3>
            <p className="text-gray-600">Safe and trusted deals</p>
          </div>
        </div>
      </main>
    </div>
  );
}
