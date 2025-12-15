import { CarCard } from '@/components/showcase/car-card';
import { carListing } from '@alifh/database';

export const metadata = {
  title: 'Showcase - Premium Luxury Cars | Alifh',
  description: 'Explore our collection of premium luxury cars available for purchase',
};

async function getListings() {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/listings?status=published&limit=50`,
      { 
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    
    if (!response.ok) {
      console.error('Failed to fetch listings:', response.status);
      return [];
    }
    
    const data = await response.json();
    return data.data || data.listings || [];
  } catch (error) {
    console.error('Error fetching listings:', error);
    return [];
  }
}

export default async function ShowcasePage() {
  const listings = await getListings();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white">
        <div className="container mx-auto px-4 py-16">
          <h1 className="text-5xl font-bold mb-4">Premium Luxury Cars</h1>
          <p className="text-xl text-gray-300 max-w-2xl">
            Discover our curated collection of the world's finest automobiles
          </p>
          <div className="mt-8 flex gap-6 text-sm">
            <div>
              <div className="text-3xl font-bold">{listings.length}</div>
              <div className="text-gray-400">Vehicles Available</div>
            </div>
            <div>
              <div className="text-3xl font-bold">100%</div>
              <div className="text-gray-400">Verified</div>
            </div>
            <div>
              <div className="text-3xl font-bold">24/7</div>
              <div className="text-gray-400">Support</div>
            </div>
          </div>
        </div>
      </div>

      {/* Listings Grid */}
      <div className="container mx-auto px-4 py-12">
        {listings.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🚗</div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">No listings available</h2>
            <p className="text-gray-600">Check back soon for new luxury vehicles</p>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900">
                Available Now ({listings.length})
              </h2>
              <p className="text-gray-600 mt-2">
                Premium vehicles, verified and ready for immediate delivery
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {listings.map((listing: typeof carListing.$inferSelect) => (
                <CarCard key={listing.id} listing={listing} />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Features Section */}
      <div className="bg-gray-50 py-16 mt-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-md">
                <span className="text-2xl">✓</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">Verified Listings</h3>
              <p className="text-gray-600 text-sm">
                Every vehicle is thoroughly inspected and verified
              </p>
            </div>
            <div className="text-center">
              <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-md">
                <span className="text-2xl">🛡️</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">Protected Transactions</h3>
              <p className="text-gray-600 text-sm">
                Secure payment processing and buyer protection
              </p>
            </div>
            <div className="text-center">
              <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-md">
                <span className="text-2xl">📞</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">24/7 Support</h3>
              <p className="text-gray-600 text-sm">
                Expert assistance available anytime you need it
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
