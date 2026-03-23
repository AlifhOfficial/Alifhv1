/**
 * Inventory/Listings Page Client Component
 * Contains all interactive client-side logic
 */

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
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
const PUBLIC_LISTINGS_SIDEBAR_KEY = 'revvup:public-listings-sidebar-open:v1';

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
  const shouldPersistPublicSidebar = pathname === '/listings' && !embedded;
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
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window === 'undefined') return defaultFiltersOpen;
    if (!shouldPersistPublicSidebar) return defaultFiltersOpen;

    const saved = window.sessionStorage.getItem(PUBLIC_LISTINGS_SIDEBAR_KEY);
    if (saved === 'true') return true;
    if (saved === 'false') return false;
    return defaultFiltersOpen;
  });

  const updateSidebarOpen = useCallback((open: boolean) => {
    setSidebarOpen(open);
    if (typeof window !== 'undefined' && shouldPersistPublicSidebar) {
      window.sessionStorage.setItem(PUBLIC_LISTINGS_SIDEBAR_KEY, String(open));
    }
  }, [shouldPersistPublicSidebar]);

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
    canGoBack,
    hasNextPage,
    setFilters,
    clearFilters,
    setSort,
    loadMore,
    goToNextPage,
    goToPreviousPage,
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
    if (!shouldPersistPublicSidebar) return;
    window.sessionStorage.setItem(PUBLIC_LISTINGS_SIDEBAR_KEY, String(sidebarOpen));
  }, [sidebarOpen, shouldPersistPublicSidebar]);

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
  // Stable key for non-pagination params (filters, query, sort)
  // Excludes page/cursor so pagination doesn't double-scroll
  const filterKey = JSON.stringify({
    q: params.q,
    make: params.make,
    model: params.model,
    emirate: params.emirate,
    priceMin: params.priceMin,
    priceMax: params.priceMax,
    yearMin: params.yearMin,
    yearMax: params.yearMax,
    mileageMin: params.mileageMin,
    mileageMax: params.mileageMax,
    specs: params.specs,
    bodyType: params.bodyType,
    transmission: params.transmission,
    fuelType: params.fuelType,
    exteriorColor: params.exteriorColor,
    sortBy: params.sortBy,
    partnerId: params.partnerId,
    limit: params.limit,
  });
  const prevFilterKeyRef = useRef(filterKey);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      prevPageRef.current = currentPage;
      prevFilterKeyRef.current = filterKey;
      return;
    }
    const pageChanged = prevPageRef.current !== currentPage;
    const filtersChanged = prevFilterKeyRef.current !== filterKey;
    if ((pageChanged || filtersChanged) && !isFetching) {
      window.scrollTo({ top: 0, behavior: 'instant' });
      prevPageRef.current = currentPage;
      prevFilterKeyRef.current = filterKey;
    }
  }, [currentPage, filterKey, isFetching]);

  return (
    <TooltipProvider>
      <div className={cn(
        "min-h-screen bg-background",
        embedded ? "" : "pt-14 sm:pt-16"
      )}>
        {/* Main Layout Container - respects max-width */}
        <div className={cn(
          "mx-auto px-4 sm:px-6 lg:px-8",
          !embedded && "max-w-[1600px] lg:pt-6"
        )}>
          {/* Mobile Layout (no resizable) */}
          <div className="lg:hidden">
            {/* TOP: Sticky mobile header */}
            <div
              className={cn(
                "sticky z-30 bg-background",
                embedded ? "top-0" : "top-[54px] sm:top-[62px]"
              )}
            >
              <ListingsHeader
                params={params}
                facets={facets}
                meta={meta}
                activeFilterCount={activeFilterCount}
                isLoading={isLoading}
                listings={listings}
                sidebarOpen={false}
                onSidebarToggle={updateSidebarOpen}
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
            <main className="pb-3 sm:pb-6">
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

          {/* Desktop Layout - sticky L-shell with normal page scroll */}
          <div
            className={cn(
              "hidden lg:grid gap-x-6",
              sidebarOpen ? "grid-cols-[16rem_minmax(0,1fr)]" : "grid-cols-[minmax(0,1fr)]"
            )}
          >
            {/* LEFT: Sidebar */}
            {sidebarOpen && (
              <div className="min-w-0">
                <div
                  className={cn(
                    "sticky overflow-hidden",
                    embedded ? "top-0 max-h-[100dvh]" : "top-16 max-h-[calc(100dvh-4rem)]"
                  )}
                >
                  <ListingsSidebar
                    params={params}
                    facets={facets}
                    activeFilterCount={activeFilterCount}
                    isLoading={isLoading}
                    embedded={embedded}
                    sidebarOpen={sidebarOpen}
                    onSidebarToggle={updateSidebarOpen}
                    setFilters={setFilters}
                    onClearAll={clearFilters}
                  />
                </div>
              </div>
            )}

            {/* RIGHT COLUMN: Sticky header + page-flow content */}
            <div className={cn("min-w-0", sidebarOpen && "col-start-2")}>
              <div
                className={cn(
                  "sticky z-30 bg-background",
                  embedded ? "top-0" : "top-16"
                )}
              >
                <ListingsHeader
                  params={params}
                  facets={facets}
                  meta={meta}
                  activeFilterCount={activeFilterCount}
                  isLoading={isLoading}
                  listings={listings}
                  sidebarOpen={sidebarOpen}
                  onSidebarToggle={updateSidebarOpen}
                  mobileFiltersOpen={mobileFiltersOpen}
                  onMobileFiltersToggle={setMobileFiltersOpen}
                  viewMode={viewMode}
                  onViewModeChange={setViewMode}
                  setFilters={setFilters}
                  clearFilters={clearFilters}
                  setSort={setSort}
                />
              </div>

              <main className="pt-1 pb-6 sm:pt-2">
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
            </div>
          </div>

          {!embedded && !isLoading && !isFetching && listings.length > 0 && (
            <div className={cn("hidden lg:block pt-6", sidebarOpen && "pl-[18.5rem]")}>
              <ListingsPagination
                currentPage={currentPage}
                canGoBack={canGoBack}
                hasNextPage={hasNextPage}
                isFetching={isFetching}
                goToPreviousPage={goToPreviousPage}
                goToNextPage={goToNextPage}
              />
            </div>
          )}

          {embedded && !isLoading && !isFetching && listings.length > 0 && (
            <div className="hidden lg:block pt-6">
              <ListingsPagination
                currentPage={currentPage}
                canGoBack={canGoBack}
                hasNextPage={hasNextPage}
                isFetching={isFetching}
                goToPreviousPage={goToPreviousPage}
                goToNextPage={goToNextPage}
              />
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}
