/**
 * Black Listings View Component
 * Clean, minimal showcase - "Less is More"
 */

'use client';

import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { CarCardBlack } from '@/components/inventory/car-listings/car-card-black';

interface BlackListing {
  id: string;
  slug: string | null;
  make: string;
  model: string;
  year: number;
  trim: string | null;
  price: number;
  mileage: number;
  emirate: string;
  specs: string;
  thumbnail: string | null;
  images: string[];
  qiScore: number | null;
  partnerName: string | null;
  partnerLogo: string | null;
  partnerVerified: boolean | null;
  sellerName: string | null;
  publishedAt: string | null;
}

// Normalize image URLs - ensure they start with / or are absolute
const normalizeImageUrl = (url: string | null): string | null => {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/')) {
    return url;
  }
  return `/${url}`;
};

export function BlackListingsView() {
  const [listings, setListings] = useState<BlackListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    async function fetchBlackListings() {
      try {
        setIsLoading(true);
        const response = await fetch('/api/listings/black?limit=50');
        if (!response.ok) {
          throw new Error('Failed to fetch listings');
        }
        const data = await response.json();
        setListings(data.data || []);
        setTotal(data.meta?.total || 0);
      } catch (err) {
        console.error('Error fetching black listings:', err);
        setError(err instanceof Error ? err.message : 'Failed to load listings');
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchBlackListings();
  }, []);

  return (
    <div className="min-h-screen bg-background pt-20">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-semibold text-foreground tracking-tight mb-3">
            Black
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Handpicked premium vehicles from trusted partners
          </p>
          {!isLoading && total > 0 && (
            <p className="text-sm text-muted-foreground/60 mt-4">
              {total} {total === 1 ? 'vehicle' : 'vehicles'}
            </p>
          )}
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-24">
            <p className="text-muted-foreground">{error}</p>
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-lg text-foreground mb-2">No listings yet</p>
            <p className="text-muted-foreground text-sm">
              Check back soon for exclusive vehicles
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {listings.map((listing, index) => (
              <CarCardBlack
                key={listing.id}
                id={listing.slug || listing.id}
                make={listing.make}
                model={listing.model}
                year={listing.year}
                thumbnail={normalizeImageUrl(listing.thumbnail)}
                images={listing.images}
                partnerName={listing.partnerName || undefined}
                partnerLogo={normalizeImageUrl(listing.partnerLogo) || undefined}
                sellerName={listing.sellerName}
                priority={index < 4}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
