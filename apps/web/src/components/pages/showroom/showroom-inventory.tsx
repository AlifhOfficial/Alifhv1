/**
 * Showroom Inventory
 * Horizontal carousel preview, expands to full inventory experience.
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowRight, Car, ChevronLeft, ChevronRight, ChevronUp } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { ListingsHeader } from '@/components/listings/listings-header';
import { ListingsSidebar } from '@/components/listings/listings-sidebar';
import { ListingsContent } from '@/components/listings/listings-content';
import { useSearch } from '@/hooks/use-search';
import { useUser } from '@/hooks/auth/use-auth';
import { useFavoritesStatus } from '@/hooks/engagement';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getPublicUrl } from '@/utils';
import type { ShowroomData } from './types';
import { getAmbientTheme } from './types';

// ============================================================================
// Types
// ============================================================================

interface ShowroomInventoryProps {
  showroom: ShowroomData;
}

// ============================================================================
// Main Component
// ============================================================================

export function ShowroomInventory({ showroom }: ShowroomInventoryProps) {
  const partnerId = showroom.partner?.id;
  const partnerName = showroom.partner?.brandName;
  
  // Expanded state - starts collapsed showing preview
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Listings state
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'minimal'>('grid');
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
    totalPages,
    setFilters,
    clearFilters,
    setSort,
    loadMore,
    goToPage,
  } = useSearch({ 
    initialParams: { 
      partnerId: partnerId || undefined,
      partnerName: partnerName || undefined,
    },
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
            <div className="space-y-3">
              <p className={cn(
                'text-xs uppercase tracking-widest',
                theme.labelClass,
                'text-muted-foreground'
              )}>
                Inventory
              </p>
              <h2 className={cn(
                'text-xl sm:text-2xl lg:text-3xl',
                theme.headingClass,
                'text-foreground tracking-tight leading-tight'
              )}>
                Our Collection
              </h2>
              {totalCount > 0 && (
                <p className={cn('text-sm', theme.bodyClass, 'text-muted-foreground')}>
                  {totalCount} {totalCount === 1 ? 'vehicle' : 'vehicles'} available
                </p>
              )}
            </div>
            
            {/* Right: Actions */}
            <div className="flex items-center gap-3">
              {!isExpanded && totalCount > 0 && (
                <Button
                  onClick={handleExpand}
                  className="h-11 px-6 bg-primary text-primary-foreground text-sm font-medium rounded-full hover:bg-primary/90 transition-colors"
                >
                  View All
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
              
              {isExpanded && (
                <Button
                  variant="ghost"
                  onClick={handleCollapse}
                  className="h-11 px-6 text-sm font-medium text-muted-foreground hover:text-foreground rounded-full"
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
                <div className="lg:hidden max-h-[75vh] overflow-y-auto scrollbar-hide">
                  <ListingsHeader
                    params={params}
                    facets={facets}
                    meta={meta}
                    activeFilterCount={activeFilterCount}
                    isLoading={isLoading}
                    listings={listings}
                    embedded={true}
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
                      totalPages={totalPages}
                      goToPage={goToPage}
                    />
                  </main>
                </div>

                {/* Desktop Layout */}
                <div className="hidden lg:flex max-h-[75vh]">
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
                      embedded={true}
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
                        totalPages={totalPages}
                        goToPage={goToPage}
                      />
                    </main>
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
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  }, []);

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (el) {
      el.addEventListener('scroll', checkScroll);
      window.addEventListener('resize', checkScroll);
      return () => {
        el.removeEventListener('scroll', checkScroll);
        window.removeEventListener('resize', checkScroll);
      };
    }
  }, [checkScroll, listings]);

  const scroll = (direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = 340;
    const scrollAmount = direction === 'left' ? -cardWidth : cardWidth;
    el.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  if (isLoading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex gap-4 overflow-hidden">
          {[...Array(4)].map((_, i) => (
            <div 
              key={i} 
              className="flex-none w-[300px] sm:w-[340px] aspect-[4/3] rounded-2xl bg-muted/30 animate-pulse" 
            />
          ))}
        </div>
      </div>
    );
  }

  if (error || listings.length === 0) {
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <div className={cn(
          'flex flex-col items-center justify-center py-20',
          'border border-dashed border-border/40 rounded-2xl',
          'bg-muted/5'
        )}>
          <Car className="w-12 h-12 text-muted-foreground/20 mb-4" />
          <p className="text-sm text-muted-foreground/60">
            {error ? 'Unable to load inventory' : 'No vehicles currently available'}
          </p>
        </div>
      </div>
    );
  }

  const previewListings = listings.slice(0, 8);

  return (
    <div className="relative group">
      {/* Navigation Arrows */}
      {canScrollLeft && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-background/90 backdrop-blur-sm border border-border/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background shadow-lg"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-5 h-5 text-foreground" />
        </button>
      )}
      
      {canScrollRight && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-background/90 backdrop-blur-sm border border-border/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background shadow-lg"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-5 h-5 text-foreground" />
        </button>
      )}

      {/* Carousel */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth px-4 sm:px-6 lg:px-8"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {previewListings.map((listing, idx) => (
          <ShowroomCarCard 
            key={listing.id}
            listing={listing}
            priority={idx < 3}
            index={idx}
          />
        ))}
      </div>
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
}

function ShowroomCarCard({ listing, priority = false, index }: ShowroomCarCardProps) {
  const displayImage = listing.thumbnail 
    ? getPublicUrl(listing.thumbnail) 
    : listing.images?.[0] 
      ? getPublicUrl(listing.images[0]) 
      : '/assets/cars/car1.avif';

  return (
    <Link
      href={`/listings/${listing.id}`}
      className={cn(
        "flex-none w-[280px] sm:w-[320px]",
        "group block",
        "rounded-2xl overflow-hidden",
        "bg-sidebar border border-sidebar-border",
        "hover:border-sidebar-accent transition-colors",
        "animate-in fade-in-0 duration-500"
      )}
      style={{ 
        scrollSnapAlign: 'start',
        animationDelay: `${index * 75}ms`, 
        animationFillMode: 'both' 
      }}
    >
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={displayImage}
          alt={`${listing.year} ${listing.make} ${listing.model}`}
          fill
          priority={priority}
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 280px, 320px"
        />
        
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      
      {/* Info - Compact Card Footer */}
      <div className="p-4">
        <h3 className="text-base font-medium text-sidebar-foreground group-hover:text-primary transition-colors truncate">
          {listing.make} {listing.model}
        </h3>
        <p className="text-sm font-normal text-sidebar-foreground/60 mt-1">
          {listing.year}
        </p>
      </div>
    </Link>
  );
}
