/**
 * Inventory/Listings Page - Alifh Design System
 * Public page showing all available car listings
 */

'use client';

import { Suspense, useState, useEffect, useCallback, useRef } from 'react';
import { Navbar } from '@/components/navbar';
import { CarCard } from '@/components/inventory';
import { CarListItem } from '@/components/inventory';
import { LayoutGrid, List, SlidersHorizontal } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

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
  partnerLogo?: string | null;
  partnerVerified?: boolean | null;
  sellerName?: string | null;
  sellerAvatarUrl?: string | null;
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

      const response = await fetch(`/api/listings/car-card?status=published&limit=${LIMIT}&offset=${currentOffset}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to fetch listings: ${response.status}`);
      }

      const data = await response.json();
      const newListings = data.data ?? [];
      const meta = data.meta ?? {};
      
      // Deduplicate listings by ID to prevent duplicate key errors
      setListings(prev => {
        if (!append) return newListings;
        
        // Create a Set of existing IDs for fast lookup
        const existingIds = new Set(prev.map(listing => listing.id));
        
        // Filter out duplicates from new listings
        const uniqueNewListings = newListings.filter(
          (listing: Listing) => !existingIds.has(listing.id)
        );
        
        return [...prev, ...uniqueNewListings];
      });
      
      // The API does not return a full total count (edge runtime). Use returned + hasMore.
      setTotalCount(meta.returned ?? newListings.length);
      setHasMore(meta.hasMore ?? (newListings.length === LIMIT));
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
      <div className="min-h-screen bg-background pt-28 pb-20 px-4">
        <div className="max-w-[1400px] mx-auto">
          {/* Header */}
          <div className="text-center mb-12 space-y-4">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              Inventory
            </p>
            <h1 className="text-3xl sm:text-4xl font-medium text-foreground tracking-tight">
              Browse Cars
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xl mx-auto">
              Explore our collection of premium vehicles
            </p>
          </div>

          {/* Main Layout */}
          <div className="space-y-6">
            {/* Stats Bar */}
            <div className="flex items-center justify-between py-3 border-b border-border/40">
              <div className="flex items-center gap-4">
                {/* Filters Drawer Trigger */}
                <Sheet>
                  <SheetTrigger asChild>
                    <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-foreground bg-muted/30 border border-border/40 rounded-lg hover:bg-muted/50 transition-colors">
                      <SlidersHorizontal className="h-4 w-4" />
                      Filters
                    </button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80 sm:w-96 overflow-y-auto">
                    <SheetHeader className="mb-6">
                      <SheetTitle>Filters</SheetTitle>
                    </SheetHeader>
                    
                    <div className="space-y-6">
                      {/* Mock Filter: Make */}
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Make</label>
                        <div className="h-10 bg-muted/30 rounded-md border border-border/40" />
                      </div>

                      {/* Mock Filter: Model */}
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Model</label>
                        <div className="h-10 bg-muted/30 rounded-md border border-border/40" />
                      </div>

                      {/* Mock Filter: Year */}
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Year</label>
                        <div className="flex gap-2">
                          <div className="h-10 flex-1 bg-muted/30 rounded-md border border-border/40" />
                          <div className="h-10 flex-1 bg-muted/30 rounded-md border border-border/40" />
                        </div>
                      </div>

                      {/* Mock Filter: Price Range */}
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Price Range</label>
                        <div className="flex gap-2">
                          <div className="h-10 flex-1 bg-muted/30 rounded-md border border-border/40" />
                          <div className="h-10 flex-1 bg-muted/30 rounded-md border border-border/40" />
                        </div>
                      </div>

                      {/* Mock Filter: Mileage */}
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Mileage</label>
                        <div className="h-10 bg-muted/30 rounded-md border border-border/40" />
                      </div>

                      {/* Mock Filter: Specs */}
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Specs</label>
                        <div className="flex flex-wrap gap-2">
                          <div className="h-8 w-16 bg-muted/30 rounded-md border border-border/40" />
                          <div className="h-8 w-20 bg-muted/30 rounded-md border border-border/40" />
                          <div className="h-8 w-14 bg-muted/30 rounded-md border border-border/40" />
                        </div>
                      </div>

                      {/* Mock Filter: Emirate */}
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Location</label>
                        <div className="h-10 bg-muted/30 rounded-md border border-border/40" />
                      </div>

                      {/* Action Buttons */}
                      <div className="pt-4 space-y-3">
                        <button className="w-full py-2.5 text-sm font-medium text-primary-foreground bg-primary rounded-lg hover:bg-primary/90 transition-colors">
                          Apply Filters
                        </button>
                        <button className="w-full py-2.5 text-sm font-medium text-muted-foreground border border-border/40 rounded-lg hover:bg-muted/20 transition-colors">
                          Reset Filters
                        </button>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>

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

            {/* Empty State */}
            {!isLoading && !error && listings.length === 0 && (
              <div className="text-center py-12">
                <p className="text-sm text-muted-foreground">No listings available at the moment</p>
              </div>
            )}

            {/* Listings */}
            {!isLoading && !error && listings.length > 0 && (
              <>
                {/* Grid View */}
                {viewMode === 'grid' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {listings.map((listing, index) => (
                      <CarCard
                        key={`${listing.id}-${index}`}
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
                        partnerLogo={listing.partnerLogo || undefined}
                        partnerVerified={listing.partnerVerified || undefined}
                        sellerName={listing.sellerName || undefined}
                        sellerAvatarUrl={listing.sellerAvatarUrl || undefined}
                        isBlackMember={listing.isBlackMember || false}
                      />
                    ))}
                  </div>
                )}

                {/* List View */}
                {viewMode === 'list' && (
                  <div className="space-y-4">
                    {listings.map((listing, index) => (
                      <CarListItem
                        key={`${listing.id}-${index}`}
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
                        partnerLogo={listing.partnerLogo || undefined}
                        partnerVerified={listing.partnerVerified || undefined}
                        sellerName={listing.sellerName || undefined}
                        sellerAvatarUrl={listing.sellerAvatarUrl || undefined}
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
      </div>
    </>
  );
}
