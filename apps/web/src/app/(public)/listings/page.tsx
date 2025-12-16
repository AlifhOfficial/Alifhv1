/**
 * Inventory/Listings Page - Alifh Design System
 * Public page showing all available car listings
 */

'use client';

import { Suspense, useEffect, useMemo } from 'react';
import { Navbar } from '@/components/navbar';
import { CarCard } from '@/components/inventory/car-card';
import { useListings } from '@/hooks/listings';
import { useBatchFavorites } from '@/contexts/batch-favorites-context';

export default function InventoryPage() {
  const { listings, isLoading, isLoadingMore, error, hasMore, totalCount, loadMore } = useListings();
  const { fetchBatch } = useBatchFavorites();

  // Memoize listing IDs to prevent unnecessary refetches
  const listingIds = useMemo(() => listings.map(l => l.id), [listings]);

  // Batch fetch favorites when listings change
  useEffect(() => {
    if (listingIds.length > 0) {
      fetchBatch(listingIds);
    }
  }, [listingIds, fetchBatch]);

  return (
    <>
      <Suspense fallback={<div className="h-16" />}>
        <Navbar />
      </Suspense>
      <div className="min-h-screen bg-background pt-16">
        <div className="max-w-[1600px] mx-auto px-6 py-12 space-y-8">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-xl font-medium text-foreground">Inventory</h1>
            <p className="text-sm text-muted-foreground">
              Browse our collection of premium vehicles
            </p>
          </div>

          {/* Stats Bar */}
          <div className="flex items-center gap-4 py-4 border-t border-b border-border/40">
            <div className="text-sm text-muted-foreground">
              {isLoading ? (
                'Loading...'
              ) : (
                <>
                  Showing {listings.length} {listings.length === 1 ? 'vehicle' : 'vehicles'}
                  {totalCount > listings.length && ` of ${totalCount}`}
                </>
              )}
            </div>
          </div>

          {/* Error State */}
          {error && (
            <div className="text-center py-12 bg-muted/20 border border-border/40 rounded-lg">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Loading State */}
          {isLoading && !error && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-sm text-muted-foreground">Loading vehicles...</p>
            </div>
          )}

          {/* Listings Grid */}
          {!isLoading && !error && listings.length === 0 && (
            <div className="text-center py-12">
              <p className="text-sm text-muted-foreground">No listings available at the moment</p>
            </div>
          )}

          {!isLoading && !error && listings.length > 0 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {listings.map((listing) => (
                  <CarCard
                    key={listing.id}
                    id={listing.id}
                    make={listing.make}
                    model={listing.model}
                    year={listing.year}
                    trim={listing.trim}
                    price={listing.price}
                    mileage={listing.mileage}
                    emirate={listing.emirate}
                    specs={listing.specs}
                    thumbnail={listing.thumbnail}
                    images={listing.images}
                    qiScore={listing.qiScore}
                    partnerName={listing.partnerName || undefined}
                    partnerVerified={listing.partnerVerified || undefined}
                    isBlackMember={listing.isBlackMember || false}
                  />
                ))}
              </div>

              {/* Load More Button */}
              {hasMore && (
                <div className="flex justify-center pt-8">
                  <button
                    onClick={loadMore}
                    disabled={isLoadingMore}
                    className="px-8 py-3 text-sm font-medium text-foreground bg-background border border-border/40 rounded-lg hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoadingMore ? (
                      <span className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-foreground"></div>
                        Loading more...
                      </span>
                    ) : (
                      'Load More'
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
