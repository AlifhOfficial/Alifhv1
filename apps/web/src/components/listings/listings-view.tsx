/**
 * Inventory/Listings Page Client Component
 * Contains all interactive client-side logic
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { ListingsHeader } from './listings-header';
import { ListingsSidebar } from './listings-sidebar';
import { ListingsContent } from './listings-content';
import { ListingsPagination } from './listings-pagination';
import { useSearch } from '@/hooks/use-search';
import { useUser } from '@/hooks/auth/use-auth';
import { useFavoritesStatus } from '@/hooks/engagement';
import { TooltipProvider } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface ListingsViewProps {
  /** When true, removes top padding for embedding in dashboards */
  embedded?: boolean;
  /** When false, starts with filters sidebar closed (default: true) */
  defaultFiltersOpen?: boolean;
}

export function ListingsView({ embedded = false, defaultFiltersOpen = true }: ListingsViewProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'minimal'>('list'); // Default to list
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(defaultFiltersOpen);

  const { isSignedIn } = useUser();

  // Fetch favorites status once at the parent level (only if signed in)
  // Child components (CarCard) will subscribe to this data without triggering refetch
  useFavoritesStatus({ enabled: isSignedIn });

  // Force grid view on screens smaller than lg (1024px)
  // List view is only available on desktop/large tablets
  // Minimal view is allowed on all screen sizes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 1024px)');
    
    const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
      if (!e.matches && viewMode === 'list') {
        setViewMode('grid');
      }
    };
    
    // Check on mount
    handleChange(mediaQuery);
    
    // Listen for changes
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [viewMode]);

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
  } = useSearch({ defaultLimit: 30 });

  // Scroll to top when page changes
  const prevPageRef = useRef(currentPage);
  useEffect(() => {
    if (prevPageRef.current !== currentPage && !isFetching) {
      window.scrollTo({ top: 0, behavior: 'instant' });
      prevPageRef.current = currentPage;
    }
  }, [currentPage, isFetching]);

  return (
    <TooltipProvider>
      <div className={cn(
        "min-h-screen bg-background",
        embedded ? "" : "pt-14 sm:pt-16"
      )}>
        {/* Main Layout Container - respects max-width */}
        <div className={cn(
          "mx-auto px-4 sm:px-6 lg:px-8",
          !embedded && "max-w-[1600px] pt-4 sm:pt-6"
        )}>
          {/* Mobile Layout (no resizable) */}
          <div className="lg:hidden">
            {/* TOP: Sticky Search Header */}
            <ListingsHeader
              params={params}
              facets={facets}
              meta={meta}
              activeFilterCount={activeFilterCount}
              isLoading={isLoading}
              listings={listings}
              embedded={embedded}
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

            {/* Content */}
            <main className="py-3 sm:py-6">
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
              />
            </main>

            {/* Pagination - outside content panel */}
            {!isLoading && !isFetching && listings.length > 0 && (
              <ListingsPagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalResults={meta?.total ?? 0}
                isFetching={isFetching}
                goToPage={goToPage}
              />
            )}
          </div>

          {/* Desktop Layout - Simple Flex */}
          <div className="hidden lg:flex gap-6">
            {/* LEFT: Sidebar */}
            {sidebarOpen && (
              <ListingsSidebar
                params={params}
                facets={facets}
                activeFilterCount={activeFilterCount}
                isLoading={isLoading}
                embedded={embedded}
                sidebarOpen={sidebarOpen}
                onSidebarToggle={setSidebarOpen}
                setFilters={setFilters}
                onClearAll={clearFilters}
              />
            )}

            {/* RIGHT: Search Header + Content */}
            <div className="flex-1 min-w-0">
              {/* TOP: Sticky Search Header */}
              <ListingsHeader
                params={params}
                facets={facets}
                meta={meta}
                activeFilterCount={activeFilterCount}
                isLoading={isLoading}
                listings={listings}
                embedded={embedded}
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

              {/* BOTTOM: Scrollable Content */}
              <main className="py-4 sm:py-6">
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
                />
              </main>
            </div>
          </div>

          {/* Pagination - below sidebar and content, full width */}
          <div className="hidden lg:block">
            {!isLoading && !isFetching && listings.length > 0 && (
              <ListingsPagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalResults={meta?.total ?? 0}
                isFetching={isFetching}
                goToPage={goToPage}
              />
            )}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
