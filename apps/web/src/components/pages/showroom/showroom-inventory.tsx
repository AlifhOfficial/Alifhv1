/**
 * Showroom Inventory
 * Horizontal carousel preview, expands to full inventory experience.
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowRight, ChevronUp } from 'lucide-react';
import Link from 'next/link';
import { ListingsHeader } from '@/components/listings/listings-header';
import { ListingsSidebar } from '@/components/listings/listings-sidebar';
import { ListingsContent } from '@/components/listings/listings-content';
import { ListingsPagination } from '@/components/listings/listings-pagination';
import { useSearch } from '@/hooks/use-search';
import { useUser } from '@/hooks/auth/use-auth';
import { useFavoritesStatus } from '@/hooks/engagement';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { getAppThumbUrl } from '@/utils';
import type { ShowroomData } from './types';
import { getAmbientTheme } from './types';

// ============================================================================
// Types
// ============================================================================

interface ShowroomInventoryProps {
  showroom: ShowroomData;
  /**
   * Initial listings data from server-side fetch.
   * Avoids client-side waterfall.
   */
  initialListings?: any | null;
}

// ============================================================================
// Main Component
// ============================================================================

export function ShowroomInventory({ showroom, initialListings }: ShowroomInventoryProps) {
  const partnerId = showroom.partner?.id;
  const partnerName = showroom.partner?.brandName;
  
  // Expanded state - starts collapsed showing preview
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Listings state
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'minimal'>('list');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  const { isSignedIn } = useUser();
  useFavoritesStatus({ enabled: isSignedIn });

  // Force grid view on mobile
  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 1024px)');
    const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
      if (!e.matches && viewMode === 'list') {
        setViewMode('grid');
      }
    };
    handleChange(mediaQuery);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [viewMode]);

  // Search hook with partner filter locked in
  const {
    listings,
    facets,
    meta,
    params,
    activeFilterCount,
    isLoading,
    isFetching,
    error,
    currentPage,
    canGoBack,
    hasNextPage,
    setFilters,
    clearFilters,
    setSort,
    loadMore,
    goToNextPage,
    goToPreviousPage,
  } = useSearch({ 
    // Use forcedParams to lock partnerId - cannot be removed or overwritten
    forcedParams: { 
      partnerId: partnerId || undefined,
      partnerName: partnerName || undefined,
    },
    initialData: initialListings,
    disableUrlSync: true,
    defaultLimit: 24,
  });

  // Scroll to section when expanding
  const handleExpand = useCallback(() => {
    setIsExpanded(true);
  }, []);

  const handleCollapse = useCallback(() => {
    setIsExpanded(false);
  }, []);

  // Don't render if no partner
  if (!partnerId) return null;

  const totalCount = meta?.total || 0;
  const theme = getAmbientTheme(showroom.ambientStyle);

  return (
    <section 
      id="inventory"
      className={theme.sectionSpacing}
    >
      <div className="max-w-[1600px] mx-auto">
        
        {/* Section Header */}
        <div className="px-4 sm:px-6 lg:px-8 mb-10">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
            {/* Left: Title & Count */}
            <div className="space-y-4">
              <span className="text-sm font-semibold uppercase tracking-wider text-primary block">
                Inventory
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight">
                Our Collection
              </h2>
              {totalCount > 0 && (
                <p className="text-sm text-muted-foreground">
                  {totalCount} {totalCount === 1 ? 'vehicle' : 'vehicles'} available
                </p>
              )}
            </div>
            
            {/* Right: Actions */}
            <div className="flex items-center gap-3">
              {!isExpanded && totalCount > 0 && (
                <Button
                  onClick={handleExpand}
                  className="h-11 px-6 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors"
                >
                  View All
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
              
              {isExpanded && (
                <Button
                  variant="ghost"
                  onClick={handleCollapse}
                  className="h-11 px-6 text-sm font-medium text-muted-foreground hover:text-foreground rounded-lg"
                >
                  <ChevronUp className="w-4 h-4 mr-2" />
                  Show Less
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        {isExpanded ? (
          <div className="px-4 sm:px-6 lg:px-8">
            <TooltipProvider>
              <div className={cn(
                'rounded-xl bg-background/80 backdrop-blur-sm',
                'overflow-hidden',
                'animate-in fade-in-0 slide-in-from-bottom-4 duration-300'
              )}>
                {/* Mobile Layout */}
                <div className="lg:hidden max-h-[100vh] overflow-y-auto scrollbar-hide">
                  <ListingsHeader
                    params={params}
                    facets={facets}
                    meta={meta}
                    activeFilterCount={activeFilterCount}
                    isLoading={isLoading}
                    listings={listings}
                    sidebarOpen={false}
                    onSidebarToggle={setSidebarOpen}
                    mobileFiltersOpen={mobileFiltersOpen}
                    onMobileFiltersToggle={setMobileFiltersOpen}
                    viewMode={viewMode}
                    onViewModeChange={setViewMode}
                    setFilters={setFilters}
                    clearFilters={clearFilters}
                    setSort={setSort}
                  />
                  <main className="p-4">
                    <ListingsContent
                      listings={listings}
                      meta={meta}
                      isLoading={isLoading}
                      isFetching={isFetching}
                      error={error}
                      activeFilterCount={activeFilterCount}
                      viewMode={viewMode}
                      clearFilters={clearFilters}
                      loadMore={loadMore}
                      currentPage={currentPage}
                    />
                  </main>
                  {/* Pagination - outside content panel */}
                  {!isLoading && !isFetching && listings.length > 0 && (
                    <ListingsPagination
                      currentPage={currentPage}
                      canGoBack={canGoBack}
                      hasNextPage={hasNextPage}
                      isFetching={isFetching}
                      goToPreviousPage={goToPreviousPage}
                      goToNextPage={goToNextPage}
                    />
                  )}
                </div>

                {/* Desktop Layout */}
                <div className="hidden lg:flex max-h-[100vh]">
                  {sidebarOpen && (
                    <div className="w-64 shrink-0 overflow-y-auto scrollbar-hide border-r border-border/10">
                      <ListingsSidebar
                        params={params}
                        facets={facets}
                        activeFilterCount={activeFilterCount}
                        isLoading={isLoading}
                        embedded={true}
                        sidebarOpen={sidebarOpen}
                        onSidebarToggle={setSidebarOpen}
                        setFilters={setFilters}
                        onClearAll={clearFilters}
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0 flex flex-col">
                    <ListingsHeader
                      params={params}
                      facets={facets}
                      meta={meta}
                      activeFilterCount={activeFilterCount}
                      isLoading={isLoading}
                      listings={listings}
                      sidebarOpen={sidebarOpen}
                      onSidebarToggle={setSidebarOpen}
                      mobileFiltersOpen={mobileFiltersOpen}
                      onMobileFiltersToggle={setMobileFiltersOpen}
                      viewMode={viewMode}
                      onViewModeChange={setViewMode}
                      setFilters={setFilters}
                      clearFilters={clearFilters}
                      setSort={setSort}
                    />
                    <main className="p-4 sm:p-6 flex-1 overflow-y-auto scrollbar-hide">
                      <ListingsContent
                        listings={listings}
                        meta={meta}
                        isLoading={isLoading}
                        isFetching={isFetching}
                        error={error}
                        activeFilterCount={activeFilterCount}
                        viewMode={viewMode}
                        clearFilters={clearFilters}
                        loadMore={loadMore}
                        currentPage={currentPage}
                      />
                    </main>
                    {/* Pagination - outside content panel */}
                    {!isLoading && !isFetching && listings.length > 0 && (
                      <ListingsPagination
                        currentPage={currentPage}
                        canGoBack={canGoBack}
                        hasNextPage={hasNextPage}
                        isFetching={isFetching}
                        goToPreviousPage={goToPreviousPage}
                        goToNextPage={goToNextPage}
                      />
                    )}
                  </div>
                </div>
              </div>
            </TooltipProvider>
          </div>
        ) : (
          <InventoryCarousel 
            listings={listings} 
            isLoading={isLoading} 
            error={error}
            theme={theme}
          />
        )}

        {/* Description - Below Content */}
        <div className="px-4 sm:px-6 lg:px-8 mt-8">
          <p className="text-base text-muted-foreground max-w-2xl leading-relaxed">
            Curated selection of vehicles.
          </p>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// Carousel Preview (Collapsed State)
// ============================================================================

interface InventoryCarouselProps {
  listings: any[];
  isLoading: boolean;
  error: Error | null;
  theme: ReturnType<typeof getAmbientTheme>;
}

function InventoryCarousel({ 
  listings, 
  isLoading, 
  error,
  theme,
}: InventoryCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (isLoading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex gap-4 overflow-hidden">
          {[...Array(4)].map((_, i) => (
            <div 
              key={i} 
              className="flex-shrink-0 w-[300px] sm:w-[340px] rounded-xl bg-sidebar border border-border/40 overflow-hidden" 
            >
              <div className="aspect-[16/9] bg-muted/30 animate-pulse" />
              <div className="p-4 space-y-2">
                <div className="h-4 w-3/4 bg-muted/30 rounded animate-pulse" />
                <div className="h-3 w-1/2 bg-muted/30 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || listings.length === 0) {
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <p className="text-sm text-muted-foreground">
          {error ? 'Unable to load inventory' : 'No vehicles currently available'}
        </p>
      </div>
    );
  }

  const previewListings = listings.slice(0, 8);

  return (
    <div className="relative group/scroll">
      {/* Carousel - Match achievements pattern */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-4 px-4 sm:px-6 lg:px-8"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {previewListings.map((listing, idx) => (
          <ShowroomCarCard 
            key={listing.id}
            listing={listing}
            index={idx}
            theme={theme}
          />
        ))}
      </div>
      
      {/* Progress Dots (mobile) */}
      {previewListings.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-4 sm:hidden">
          {previewListings.slice(0, 5).map((_, idx) => (
            <div 
              key={idx} 
              className="w-1.5 h-1.5 rounded-full bg-sidebar-border"
            />
          ))}
          {previewListings.length > 5 && (
            <span className="text-xs text-muted-foreground ml-1">+{previewListings.length - 5}</span>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Showroom Car Card - Clean & Minimal
// ============================================================================

interface ShowroomCarCardProps {
  listing: any;
  priority?: boolean;
  index: number;
  theme: ReturnType<typeof getAmbientTheme>;
}

function ShowroomCarCard({ listing, priority = false, index, theme }: ShowroomCarCardProps) {
  const displayImage = listing.thumbnail
    ? getAppThumbUrl(listing.thumbnail)
    : listing.images?.[0]
      ? getAppThumbUrl(listing.images[0])
      : null;

  const price = listing.price ? `AED ${listing.price.toLocaleString()}` : null;

  return (
    <Link
      href={`/listings/${listing.id}`}
      className="flex-shrink-0 w-[300px] sm:w-[340px] rounded-xl bg-sidebar border border-border/40 hover:border-primary/30 transition-all duration-300 group overflow-hidden"
    >
      {/* Image Container */}
      <div className="relative aspect-[16/9] overflow-hidden">
        {displayImage ? (
          <img
            src={displayImage}
            alt={`${listing.year} ${listing.make} ${listing.model}`}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading={priority ? 'eager' : 'lazy'}
            fetchPriority={priority ? 'high' : 'auto'}
            decoding="async"
          />
        ) : (
          <div className="absolute inset-0 bg-muted/30" />
        )}
      </div>
      
      {/* Info */}
      <div className="p-4">
        {/* Make & Model */}
        <h3 className="text-base font-semibold text-foreground leading-snug">
          {listing.make} {listing.model}
        </h3>
        
        {/* Year & Variant */}
        <p className="text-sm text-muted-foreground mt-1">
          {listing.year}{listing.variant ? ` · ${listing.variant}` : ''}
        </p>
        
        {/* Price */}
        {price && (
          <p className="text-sm font-medium text-foreground mt-3">
            {price}
          </p>
        )}
      </div>
    </Link>
  );
}

// Skeleton
function ShowroomInventorySkeleton() {
  return (
    <section className="py-16 sm:py-20 lg:py-24">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-10">
          <div className="space-y-3">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-8 w-40" />
          </div>
          <Skeleton className="h-10 w-32 rounded-xl" />
        </div>
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex-shrink-0 w-[300px] sm:w-[340px] rounded-xl bg-sidebar border border-border/40 overflow-hidden">
              <Skeleton className="aspect-[16/9]" />
              <div className="p-4 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
ShowroomInventory.Skeleton = ShowroomInventorySkeleton;
