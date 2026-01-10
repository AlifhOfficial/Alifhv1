/**
 * Inventory/Listings Page Client Component
 * Contains all interactive client-side logic
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { ListingsHeader } from './listings-header';
import { ListingsSidebar } from './listings-sidebar';
import { ListingsContent } from './listings-content';
import { useSearch } from '@/hooks/use-search';
import { TooltipProvider } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface ListingsViewProps {
  /** When true, removes top padding for embedding in dashboards */
  embedded?: boolean;
}

export function ListingsView({ embedded = false }: ListingsViewProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'minimal'>('grid'); // Default to grid
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

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
    setFilters,
    clearFilters,
    setSort,
    loadMore,
  } = useSearch({ defaultLimit: 30 });

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
          <div className="flex">
            {/* LEFT: Fixed Sidebar */}
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

            {/* RIGHT: Search Header + Content */}
            <div className="flex-1 min-w-0 flex flex-col">
              {/* TOP: Fixed Search Header */}
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
              <main className={cn(
                "flex-1 py-4 sm:py-6",
                sidebarOpen && "lg:pl-6"
              )}>
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
        </div>
      </div>
    </TooltipProvider>
  );
}
