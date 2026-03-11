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
import type { SearchResponse } from '@/lib/search-utils';
import { usePathname } from 'next/navigation';

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
  /** Server-fetched initial data (for instant display) */
  initialData?: SearchResponse | null;
  /** Route owns search fetching; client only drives URL */
  serverDriven?: boolean;
  /** Subscribe to favorites-status from this parent */
  hydrateFavoritesStatus?: boolean;
}

const VIEW_MODE_KEY = 'listings-view-mode';
const LAST_PUBLIC_LISTINGS_URL_KEY = 'revvup:last-public-listings-url';

export function ListingsView({ 
  embedded = false, 
  defaultFiltersOpen = true,
  defaultLocation,
  defaultBrand,
  defaultModel,
  initialData,
  serverDriven = false,
  hydrateFavoritesStatus = true,
}: ListingsViewProps) {
  const pathname = usePathname();
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'minimal'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(VIEW_MODE_KEY);
      if (saved === 'grid' || saved === 'list' || saved === 'minimal') {
        return saved;
      }
    }
    return 'grid';
  });
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(defaultFiltersOpen);

  const { isSignedIn } = useUser();
  useFavoritesStatus({ enabled: hydrateFavoritesStatus && isSignedIn });

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
    initialData,
    serverDriven,
  });

  // Persist view mode to localStorage
  useEffect(() => {
    localStorage.setItem(VIEW_MODE_KEY, viewMode);
  }, [viewMode]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (pathname !== '/listings') return;

    const currentUrl = `${pathname}${window.location.search}`;
    window.sessionStorage.setItem(LAST_PUBLIC_LISTINGS_URL_KEY, currentUrl);
  }, [pathname, params]);

  // Scroll to top when user changes pagination (not on initial mount/back navigation)
  // Skip initial mount to let browser restore scroll position naturally
  const prevPageRef = useRef(currentPage);
  const isInitialMount = useRef(true);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      prevPageRef.current = currentPage;
      return;
    }
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
            <div className={cn(
              "sticky z-30 bg-background pb-2 -mx-4 px-4 sm:-mx-6 sm:px-6",
              embedded ? "top-0" : "top-14 sm:top-16"
            )}>
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
            </div>

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

          {/* Desktop Layout - Uses window scroll for native back/forward restoration */}
          <div className="hidden lg:flex gap-6">
            {/* LEFT: Sidebar - sticky */}
            {sidebarOpen && (
              <div className={cn(
                "shrink-0 sticky self-start overflow-y-auto scrollbar-hide",
                embedded ? "top-0 max-h-[calc(100vh-4rem)]" : "top-16 max-h-[calc(100vh-5rem)]"
              )}>
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

            {/* RIGHT: Search Header + Content */}
            <div className="flex-1 min-w-0">
              {/* TOP: Search Header - sticky below navbar */}
              <div className={cn(
                "sticky z-30 bg-background pb-2",
                embedded ? "top-0" : "top-14 sm:top-16"
              )}>
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

              {/* Pagination */}
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
    </TooltipProvider>
  );
}
