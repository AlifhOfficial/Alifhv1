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
import { AmnaFloatingButton } from './amna-floating-button';
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
  /** Default location filter (for location hub pages) */
  defaultLocation?: string;
  /** Default brand filter (for brand hub pages) */
  defaultBrand?: string;
  /** Default model filter (for model hub pages) */
  defaultModel?: string;
}

export function ListingsView({ 
  embedded = false, 
  defaultFiltersOpen = true,
  defaultLocation,
  defaultBrand,
  defaultModel,
}: ListingsViewProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'minimal'>('list'); // Default to list
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(defaultFiltersOpen);

  const { isSignedIn } = useUser();

  // Fetch favorites status once at the parent level (only if signed in)
  // Child components (CarCard) will subscribe to this data without triggering refetch
  useFavoritesStatus({ enabled: isSignedIn });

  // Note: CarCard is responsive - shows mobile layout on <sm and desktop layout on sm+
  // On desktop (lg+), 'list' mode uses CarListItem (full width rows)

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
    defaultLimit: 30,
    initialParams: {
      ...(defaultLocation && { location: [defaultLocation] }),
      ...(defaultBrand && { make: [defaultBrand] }),
      ...(defaultModel && { model: [defaultModel] }),
    },
  });

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

          {/* Desktop Layout - Fixed height with scrollable content */}
          <div className="hidden lg:flex gap-6 h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)]">
            {/* LEFT: Sidebar - fixed, doesn't scroll */}
            {sidebarOpen && (
              <div className="shrink-0 h-full overflow-y-auto scrollbar-hide">
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
              </div>
            )}

            {/* RIGHT: Search Header + Content - scrollable */}
            <div className="flex-1 min-w-0 h-full overflow-y-auto scrollbar-hide">
              {/* TOP: Sticky Search Header */}
              <div className="sticky top-0 z-10 bg-background">
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
              </div>

              {/* BOTTOM: Content */}
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

              {/* Pagination - inside scrollable area */}
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
      </div>
      {/* Floating Amna AI Button */}
      <AmnaFloatingButton />
    </TooltipProvider>
  );
}
