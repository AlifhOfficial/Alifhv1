/**
 * ListingsHeader - Fixed search bar and controls
 * Fixed header for the listings page
 */

'use client';

import { useMemo, useCallback, useRef } from 'react';
import { SearchBar } from '@/components/search/search-bar';
import { FilterSidebar } from '@/components/search/filter-sidebar';
import { AdvancedFilters } from '@/components/search/advanced-filters';
import { LayoutGrid, List, SlidersHorizontal, X, ChevronDown, PanelLeft } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SORT_OPTIONS, type SearchParams, type SearchFacets } from '@/lib/search-utils';
import { cn } from '@/lib/utils';

interface ListingsHeaderProps {
  /** Search params */
  params: SearchParams;
  /** Facets for filters */
  facets: SearchFacets | null;
  /** Meta information */
  meta: { total: number } | null;
  /** Number of active filters */
  activeFilterCount: number;
  /** Loading state */
  isLoading: boolean;
  /** Listings for partner name derivation */
  listings?: Array<{ partnerName?: string | null }>;
  /** When true, removes top padding for embedding in dashboards */
  embedded?: boolean;
  /** Sidebar open state */
  sidebarOpen: boolean;
  /** Toggle sidebar */
  onSidebarToggle: (open: boolean) => void;
  /** Mobile filters open state */
  mobileFiltersOpen: boolean;
  /** Toggle mobile filters */
  onMobileFiltersToggle: (open: boolean) => void;
  /** View mode */
  viewMode: 'grid' | 'list';
  /** Set view mode */
  onViewModeChange: (mode: 'grid' | 'list') => void;
  /** Set filters callback */
  setFilters: (filters: Partial<SearchParams>) => void;
  /** Clear filters callback */
  clearFilters: () => void;
  /** Set sort callback */
  setSort: (sort: string) => void;
}

export function ListingsHeader({
  params,
  facets,
  meta,
  activeFilterCount,
  isLoading,
  listings,
  embedded = false,
  sidebarOpen,
  onSidebarToggle,
  mobileFiltersOpen,
  onMobileFiltersToggle,
  viewMode,
  onViewModeChange,
  setFilters,
  clearFilters,
  setSort,
}: ListingsHeaderProps) {
  // Use ref to avoid listings array causing recalculations
  const listingsRef = useRef(listings);
  listingsRef.current = listings;

  // Memoize active chips - use stable reference for listings
  const activeChips = useMemo(
    () => getActiveFilterChips(params, listingsRef.current),
    // Only depend on params - listings ref is stable
    [params]
  );

  // Memoize chip removal handler to avoid recreating on each render
  const handleChipRemove = useCallback((chipKey: string) => {
    // Handle compound filters that need multiple params cleared
    if (chipKey === 'partnerId') {
      setFilters({ partnerId: undefined, partnerName: undefined });
    } else if (chipKey === 'priceMin') {
      setFilters({ priceMin: undefined, priceMax: undefined });
    } else if (chipKey === 'yearMin') {
      setFilters({ yearMin: undefined, yearMax: undefined });
    } else if (chipKey === 'sortBy') {
      setSort('relevance'); // Reset to default sort
    } else {
      setFilters({ [chipKey]: undefined });
    }
  }, [setFilters, setSort]);

  return (
    <header className={cn(
      "sticky z-30 bg-background",
      embedded ? "top-0" : "top-14 sm:top-16"
    )}>
      <div className="py-3 sm:py-4">
        {/* Search Row */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 md:gap-4 lg:gap-6">
          {/* Sidebar Toggle (Desktop) - Use opacity/pointer-events instead of conditional render */}
          <button
            onClick={() => onSidebarToggle(true)}
            className={cn(
              "hidden lg:flex p-2 -ml-2 text-muted-foreground hover:text-foreground transition-all duration-200",
              sidebarOpen ? "opacity-0 pointer-events-none w-0 -ml-0 p-0" : "opacity-100"
            )}
            title="Show filters"
            aria-hidden={sidebarOpen}
            tabIndex={sidebarOpen ? -1 : 0}
          >
            <PanelLeft className="h-4 w-4" />
          </button>

          {/* Mobile Filters */}
          <Sheet open={mobileFiltersOpen} onOpenChange={onMobileFiltersToggle}>
            <SheetTrigger asChild>
              <button className="lg:hidden relative p-2 -ml-2 text-muted-foreground hover:text-foreground transition-colors">
                <SlidersHorizontal className="h-4 w-4" />
                {activeFilterCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 text-[10px] font-medium bg-foreground text-background rounded-full flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[85vh] p-4 sm:p-6 bg-background text-foreground border-border">
              <SheetTitle className="sr-only">Filters</SheetTitle>
              {/* Mobile filters header */}
              <div className="flex items-center justify-between py-4 mb-2 border-b border-border/30">
                <h2 className="text-lg font-bold tracking-tight">Filters</h2>
                {activeFilterCount > 0 && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="text-sm font-semibold text-muted-foreground/70 hover:text-foreground transition-colors"
                  >
                    Clear all
                  </button>
                )}
              </div>
              <div className="overflow-y-auto h-full pb-4">
                <FilterSidebar
                  params={params}
                  facets={facets}
                  isLoading={isLoading}
                  onFilterChange={(filters) => {
                    setFilters(filters);
                    onMobileFiltersToggle(false);
                  }}
                  onClearFilters={clearFilters}
                  activeFilterCount={activeFilterCount}
                />
              </div>
            </SheetContent>
          </Sheet>

          {/* Results count - hidden on mobile, shows on larger screens */}
          <span className="hidden sm:inline-block text-sm text-muted-foreground tabular-nums whitespace-nowrap">
            {isLoading ? '...' : `${meta?.total ?? 0} cars`}
          </span>

          {/* Search Bar - Full width on mobile, flexible on desktop */}
          <div className="w-full sm:flex-1 sm:min-w-[200px] order-last sm:order-none">
            <SearchBar
              size="sm"
              placeholder="Search make, model or dealer..."
              redirectOnSearch={false}
              onSearch={setFilters}
            />
          </div>

          {/* Popular Dropdown - Premium filters */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap">
                <span>Popular</span>
                <ChevronDown className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-sidebar border-sidebar-border text-sidebar-foreground">
              <DropdownMenuItem
                onClick={() => setFilters({ isBlkListing: params.isBlkListing ? undefined : true })}
                className={`text-sm font-medium cursor-pointer ${params.isBlkListing ? 'bg-sidebar-accent text-sidebar-foreground' : 'hover:bg-sidebar-accent/50'}`}
              >
                Black Listings
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setFilters({ isBlackTierPartner: params.isBlackTierPartner ? undefined : true })}
                className={`text-sm font-medium cursor-pointer ${params.isBlackTierPartner ? 'bg-sidebar-accent text-sidebar-foreground' : 'hover:bg-sidebar-accent/50'}`}
              >
                Ace Members
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Sort Dropdown */}
          <div className="relative">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-sidebar-foreground hover:text-sidebar-foreground transition-colors">
                  <span className="hidden sm:inline">{SORT_OPTIONS.find(s => s.value === params.sortBy)?.label || 'Sort'}</span>
                  <span className="sm:hidden">Sort</span>
                  <ChevronDown className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-sidebar border-sidebar-border text-sidebar-foreground">
                {SORT_OPTIONS.map((option) => (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() => setSort(option.value)}
                    className={`text-sm font-medium cursor-pointer ${params.sortBy === option.value ? 'bg-sidebar-accent text-sidebar-foreground' : 'hover:bg-sidebar-accent/50'}`}
                  >
                    {option.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* View Toggle - Desktop/iPad only (lg+), switches between grid and list */}
          <div className="hidden lg:flex items-center gap-1">
            <button
              onClick={() => onViewModeChange('grid')}
              className={`p-1.5 transition-colors ${viewMode === 'grid' ? 'text-foreground' : 'text-muted-foreground/50 hover:text-foreground'}`}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => onViewModeChange('list')}
              className={`p-1.5 transition-colors ${viewMode === 'list' ? 'text-foreground' : 'text-muted-foreground/50 hover:text-foreground'}`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>

          {/* Advanced Filters - moves to the right on mobile */}
          <div className="md:contents ml-auto md:ml-0">
            <AdvancedFilters
              params={params}
              facets={facets}
              onFilterChange={setFilters}
            />
          </div>
        </div>

        {/* Active Chips - with sidebar-aware padding to align with content grid */}
        <div 
          className={cn(
            "overflow-hidden transition-all duration-200",
            activeChips.length > 0 ? "mt-3 sm:mt-4 max-h-32 opacity-100" : "max-h-0 opacity-0",
            sidebarOpen && "lg:pl-6"
          )}
        >
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {activeChips.map((chip) => (
              <button
                key={chip.key}
                onClick={() => handleChipRemove(chip.key)}
                className="group flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs bg-secondary/50 hover:bg-secondary rounded-full transition-colors"
              >
                <span>{chip.label}</span>
                <X className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-muted-foreground group-hover:text-foreground transition-colors" />
              </button>
            ))}
            {activeChips.length > 0 && (
              <button
                onClick={clearFilters}
                className="px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Clear all
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

/**
 * Generate active filter chips for display
 * @param params - Current search params
 * @param listings - Optional listings data to derive partner name when not in params
 */
function getActiveFilterChips(
  params: SearchParams, 
  listings?: Array<{ partnerName?: string | null }>
): Array<{ key: string; label: string }> {
  const chips: Array<{ key: string; label: string }> = [];

  // Premium filters at the top
  if (params.isBlkListing) {
    chips.push({ key: 'isBlkListing', label: 'Black Listings' });
  }
  if (params.isBlackTierPartner) {
    chips.push({ key: 'isBlackTierPartner', label: 'Ace Members' });
  }

  // Sort chip (only show when not default)
  if (params.sortBy && params.sortBy !== 'relevance') {
    const sortLabel = SORT_OPTIONS.find(s => s.value === params.sortBy)?.label || 'Sorted';
    chips.push({ key: 'sortBy', label: `Sort: ${sortLabel}` });
  }

  if (params.q) {
    chips.push({ key: 'q', label: `"${params.q}"` });
  }
  if (params.make?.length) {
    chips.push({ key: 'make', label: params.make.join(', ') });
  }
  if (params.model?.length) {
    chips.push({ key: 'model', label: params.model.join(', ') });
  }
  if (params.yearMin || params.yearMax) {
    const label = params.yearMin && params.yearMax
      ? `${params.yearMin} - ${params.yearMax}`
      : params.yearMin
      ? `From ${params.yearMin}`
      : `Up to ${params.yearMax}`;
    chips.push({ key: 'yearMin', label: `Year: ${label}` });
  }
  if (params.priceMin || params.priceMax) {
    const formatPrice = (v: number) => v >= 1000 ? `${Math.round(v / 1000)}K` : v;
    const label = params.priceMin && params.priceMax
      ? `${formatPrice(params.priceMin)} - ${formatPrice(params.priceMax)}`
      : params.priceMin
      ? `From ${formatPrice(params.priceMin)}`
      : `Up to ${formatPrice(params.priceMax)}`;
    chips.push({ key: 'priceMin', label: `Price: ${label}` });
  }
  if (params.mileageMax) {
    chips.push({ key: 'mileageMax', label: `Under ${Math.round(params.mileageMax / 1000)}K km` });
  }
  if (params.emirate?.length) {
    chips.push({ key: 'emirate', label: params.emirate.join(', ') });
  }
  if (params.bodyType?.length) {
    chips.push({ key: 'bodyType', label: params.bodyType.join(', ') });
  }
  if (params.fuelType?.length) {
    chips.push({ key: 'fuelType', label: params.fuelType.join(', ') });
  }
  if (params.sellerType) {
    chips.push({ key: 'sellerType', label: params.sellerType === 'dealer' ? 'Dealers' : 'Private' });
  }
  if (params.partnerId) {
    // Try to get partner name: 1) from URL params, 2) from listings data, 3) fallback
    const partnerNameFromListings = listings?.find(l => l.partnerName)?.partnerName;
    const label = params.partnerName || partnerNameFromListings || 'Partner';
    chips.push({ key: 'partnerId', label });
  }

  return chips;
}
