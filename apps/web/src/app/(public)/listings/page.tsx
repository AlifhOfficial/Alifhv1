/**
 * Inventory/Listings Page - Alifh Design System
 * Public page showing all available car listings
 */

'use client';

import { Suspense, useState, useEffect, useCallback, useRef } from 'react';
import { Navbar } from '@/components/navbar';
import { CarCard } from '@/components/inventory';
import { CarListItem } from '@/components/inventory';
import { LayoutGrid, List } from 'lucide-react';

const LIMIT = 30;

interface Listing {
  id: string;
  make: string;
  model: string;
  year: number;
  trim?: string | null;
  price: number;
  mileage: number;
  emirate: string;
  specs?: string | null;
  thumbnail?: string | null;
  images?: string[];
  qiScore?: number | null;
  isBlackMember?: boolean;
  status?: string;
  partnerName?: string | null;
  partnerVerified?: boolean | null;
}

export default function InventoryPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [offset, setOffset] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const hasFetchedRef = useRef(false);

  const fetchListings = useCallback(async (currentOffset = 0, append = false) => {
    try {
      if (append) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      const response = await fetch(
        `/api/listings/car-card?status=published&limit=${LIMIT}&offset=${currentOffset}`,
        { credentials: 'include' }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to fetch listings: ${response.status}`);
      }

      const data = await response.json();
      const newListings = data.data ?? [];
      
      setListings(prev => append ? [...prev, ...newListings] : newListings);
      setTotalCount(data.meta?.total ?? newListings.length);
      setHasMore(newListings.length === LIMIT);
      setOffset(currentOffset + newListings.length);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch listings');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, []);

  const loadMore = useCallback(async () => {
    if (!isLoadingMore && hasMore) {
      await fetchListings(offset, true);
    }
  }, [offset, isLoadingMore, hasMore, fetchListings]);

  useEffect(() => {
    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchListings();
    }
  }, [fetchListings]);

  // NOTE: Favorites/superlikes state is now handled automatically by React Query
  // Each car-card component uses useFavorites(id) which reads from the shared cache

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
          <div className="flex items-center justify-between py-4 border-t border-b border-border/40">
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
            
            {/* View Toggle */}
            <div className="flex items-center gap-1 bg-muted/20 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                aria-label="Grid view"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'list'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                aria-label="List view"
              >
                <List className="h-4 w-4" />
              </button>
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
              {/* Grid View */}
              {viewMode === 'grid' && (
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
              )}

              {/* List View */}
              {viewMode === 'list' && (
                <div className="space-y-4">
                  {listings.map((listing) => (
                    <CarListItem
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
              )}

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
