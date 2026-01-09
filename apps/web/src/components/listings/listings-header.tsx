/**
 * ListingsHeader - Fixed search bar and controls
 * Fixed header for the listings page
 */

'use client';

import { useMemo, useCallback, useState } from 'react';
import Link from 'next/link';
import { SearchBar } from '@/components/search/search-bar';
import { FilterSidebar } from '@/components/search/filter-sidebar';
import { AdvancedFilters } from '@/components/search/advanced-filters';
import { LayoutGrid, List, SlidersHorizontal, X, ChevronDown, PanelLeft, ChevronRight } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
  viewMode: 'grid' | 'list' | 'minimal';
  /** Set view mode */
  onViewModeChange: (mode: 'grid' | 'list' | 'minimal') => void;
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
  // Modal states for viewing all options
  const [makesModalOpen, setMakesModalOpen] = useState(false);
  const [modelsModalOpen, setModelsModalOpen] = useState(false);
  const [trimsModalOpen, setTrimsModalOpen] = useState(false);

  // Number of items to show before "View all"
  const VISIBLE_COUNT = 6;

  // Memoize active chips - pass listings directly, memoize on params change
  const activeChips = useMemo(
    () => getActiveFilterChips(params, listings),
    [params, listings]
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
    } else if (chipKey === 'model') {
      // When removing model, also remove trim
      setFilters({ model: undefined, trim: undefined });
    } else if (chipKey === 'make') {
      // When removing make, also remove model and trim
      setFilters({ make: undefined, model: undefined, trim: undefined });
    } else {
      setFilters({ [chipKey]: undefined });
    }
  }, [setFilters, setSort]);

  // Generate breadcrumb items based on active filters
  const breadcrumbItems = useMemo(() => {
    const items: Array<{ label: string; href: string }> = [
      { label: 'All Cars', href: '/listings' }
    ];

    // Add make
    if (params.make && params.make.length > 0) {
      const make = params.make[0]; // Use first make
      items.push({
        label: make,
        href: `/listings?make=${encodeURIComponent(make)}`
      });
    }

    // Add model
    if (params.model && params.model.length > 0 && params.make && params.make.length > 0) {
      const make = params.make[0];
      const model = params.model[0]; // Use first model
      items.push({
        label: model,
        href: `/listings?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}`
      });
    }

    // Add trim
    if (params.trim && params.trim.length > 0 && params.make && params.make.length > 0 && params.model && params.model.length > 0) {
      const make = params.make[0];
      const model = params.model[0];
      const trim = params.trim[0]; // Use first trim
      items.push({
        label: trim,
        href: `/listings?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}&trim=${encodeURIComponent(trim)}`
      });
    }

    return items;
  }, [params.make, params.model, params.trim]);

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
          <span className="hidden sm:inline-block text-sm font-semibold text-muted-foreground/70 tabular-nums whitespace-nowrap">
            {isLoading ? '...' : `${meta?.total ?? 0} cars`}
          </span>

          {/* Search Bar - Full width on mobile, flexible on desktop */}
          <div className="w-full sm:flex-1 sm:min-w-[200px] order-last sm:order-none">
            <SearchBar
              size="sm"
              placeholder="Search make, model, dealer..."
              redirectOnSearch={false}
              onSearch={setFilters}
            />
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-muted-foreground/70 hover:text-foreground transition-colors">
                  <span className="hidden sm:inline">{SORT_OPTIONS.find(s => s.value === params.sortBy)?.label || 'Sort'}</span>
                  <span className="sm:hidden">Sort</span>
                  <ChevronDown className="size-4 text-muted-foreground/50" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-sidebar border-border/40">
                {SORT_OPTIONS.map((option) => (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() => setSort(option.value)}
                    className={cn(
                      "text-sm font-semibold cursor-pointer",
                      params.sortBy === option.value ? "bg-muted/50 text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                    )}
                  >
                    {option.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* View Toggle - Grid/Minimal on mobile, all three on desktop */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => onViewModeChange('grid')}
              className={cn(
                "p-2 transition-colors rounded-md",
                viewMode === 'grid' ? "text-foreground" : "text-muted-foreground/50 hover:text-foreground"
              )}
              title="Grid view"
            >
              <LayoutGrid className="size-4" />
            </button>
            <button
              onClick={() => onViewModeChange('minimal')}
              className={cn(
                "p-2 transition-colors rounded-md",
                viewMode === 'minimal' ? "text-foreground" : "text-muted-foreground/50 hover:text-foreground"
              )}
              title="Minimal view"
            >
              <svg className="size-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="1" width="6" height="6" rx="1" />
                <rect x="9" y="1" width="6" height="6" rx="1" />
                <rect x="1" y="9" width="6" height="6" rx="1" />
                <rect x="9" y="9" width="6" height="6" rx="1" />
              </svg>
            </button>
            <button
              onClick={() => onViewModeChange('list')}
              className={cn(
                "hidden lg:block p-2 transition-colors rounded-md",
                viewMode === 'list' ? "text-foreground" : "text-muted-foreground/50 hover:text-foreground"
              )}
              title="List view"
            >
              <List className="size-4" />
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

        {/* Breadcrumb - Show when make/model/trim filters are active */}
        {breadcrumbItems.length > 1 && (
          <nav 
            className={cn(
              "flex items-center gap-2 text-sm py-3 overflow-x-auto scrollbar-hide mt-3",
              sidebarOpen && "lg:pl-6"
            )}
          >
            {breadcrumbItems.map((item, index) => (
              <div key={item.href} className="flex items-center gap-2">
                {index > 0 && <span className="text-muted-foreground/30">/</span>}
                {index === breadcrumbItems.length - 1 ? (
                  <span className="font-bold text-foreground whitespace-nowrap">{item.label}</span>
                ) : (
                  <Link 
                    href={item.href}
                    className="font-semibold text-muted-foreground/70 hover:text-foreground transition-colors whitespace-nowrap"
                  >
                    {item.label}
                  </Link>
                )}
              </div>
            ))}
          </nav>
        )}

        {/* Make Quick-Select - Show when no make is selected */}
        {!params.make?.length && (facets?.make ?? []).length > 0 && (
          <div 
            className={cn(
              "hidden sm:flex flex-wrap items-center gap-2 py-3 mt-3",
              sidebarOpen && "lg:pl-6"
            )}
          >
            <span className="text-sm font-semibold text-muted-foreground/70 whitespace-nowrap shrink-0">
              Makes:
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              {(facets?.make ?? []).slice(0, VISIBLE_COUNT).map((make) => (
                <button
                  key={make.value}
                  onClick={() => setFilters({ make: [make.value], model: undefined, trim: undefined })}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground bg-muted/30 hover:bg-muted/50 rounded-full transition-all whitespace-nowrap"
                >
                  <span>{make.label}</span>
                  <span className="text-xs text-muted-foreground/50 tabular-nums">{make.count}</span>
                </button>
              ))}
              {(facets?.make ?? []).length > VISIBLE_COUNT && (
                <button
                  onClick={() => setMakesModalOpen(true)}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
                >
                  View all
                  <ChevronRight className="size-3.5" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Makes Modal */}
        <Dialog open={makesModalOpen} onOpenChange={setMakesModalOpen}>
          <DialogContent className="max-w-lg bg-sidebar border-border/40 p-0 gap-0">
            <DialogHeader className="px-5 py-4 border-b border-border/40">
              <DialogTitle className="text-[15px] font-bold tracking-tight text-foreground">
                All Makes
              </DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-1 p-2 overflow-y-auto max-h-[60vh]">
              {(facets?.make ?? []).map((make) => (
                <button
                  key={make.value}
                  onClick={() => {
                    setFilters({ make: [make.value], model: undefined, trim: undefined });
                    setMakesModalOpen(false);
                  }}
                  className="flex items-center justify-between gap-3 px-4 py-3 text-sm font-semibold text-foreground hover:bg-muted/50 rounded-lg transition-colors text-left"
                >
                  <span className="truncate">{make.label}</span>
                  <span className="text-xs text-muted-foreground/70 tabular-nums flex-shrink-0">{make.count}</span>
                </button>
              ))}
            </div>
          </DialogContent>
        </Dialog>

        {/* Model Quick-Select - Show when make is selected but no model */}
        {params.make?.length && !params.model?.length && (facets?.model ?? []).length > 0 && (
          <div 
            className={cn(
              "hidden sm:flex flex-wrap items-center gap-2 py-3",
              breadcrumbItems.length <= 1 && "mt-3",
              sidebarOpen && "lg:pl-6"
            )}
          >
            <span className="text-sm font-semibold text-muted-foreground/70 whitespace-nowrap shrink-0">
              Models:
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              {(facets?.model ?? []).slice(0, VISIBLE_COUNT).map((model) => (
                <button
                  key={model.value}
                  onClick={() => setFilters({ model: [model.value] })}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground bg-muted/30 hover:bg-muted/50 rounded-full transition-all whitespace-nowrap"
                >
                  <span>{model.label}</span>
                  <span className="text-xs text-muted-foreground/50 tabular-nums">{model.count}</span>
                </button>
              ))}
              {(facets?.model ?? []).length > VISIBLE_COUNT && (
                <button
                  onClick={() => setModelsModalOpen(true)}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
                >
                  View all
                  <ChevronRight className="size-3.5" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Models Modal */}
        <Dialog open={modelsModalOpen} onOpenChange={setModelsModalOpen}>
          <DialogContent className="max-w-lg bg-sidebar border-border/40 p-0 gap-0">
            <DialogHeader className="px-5 py-4 border-b border-border/40">
              <DialogTitle className="text-[15px] font-bold tracking-tight text-foreground">
                All Models
              </DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-1 p-2 overflow-y-auto max-h-[60vh]">
              {(facets?.model ?? []).map((model) => (
                <button
                  key={model.value}
                  onClick={() => {
                    setFilters({ model: [model.value] });
                    setModelsModalOpen(false);
                  }}
                  className="flex items-center justify-between gap-3 px-4 py-3 text-sm font-semibold text-foreground hover:bg-muted/50 rounded-lg transition-colors text-left"
                >
                  <span className="truncate">{model.label}</span>
                  <span className="text-xs text-muted-foreground/70 tabular-nums flex-shrink-0">{model.count}</span>
                </button>
              ))}
            </div>
          </DialogContent>
        </Dialog>

        {/* Trim Quick-Select - Show when make & model selected but no trim */}
        {params.make?.length && params.model?.length && !params.trim?.length && (facets?.trim ?? []).length > 0 && (
          <div 
            className={cn(
              "hidden sm:flex flex-wrap items-center gap-2 py-3",
              sidebarOpen && "lg:pl-6"
            )}
          >
            <span className="text-sm font-semibold text-muted-foreground/70 whitespace-nowrap shrink-0">
              Trims:
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              {(facets?.trim ?? []).slice(0, VISIBLE_COUNT).map((trim) => (
                <button
                  key={trim.value}
                  onClick={() => setFilters({ trim: [trim.value] })}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground bg-muted/30 hover:bg-muted/50 rounded-full transition-all whitespace-nowrap"
                >
                  <span>{trim.label}</span>
                  <span className="text-xs text-muted-foreground/50 tabular-nums">{trim.count}</span>
                </button>
              ))}
              {(facets?.trim ?? []).length > VISIBLE_COUNT && (
                <button
                  onClick={() => setTrimsModalOpen(true)}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
                >
                  View all
                  <ChevronRight className="size-3.5" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Trims Modal */}
        <Dialog open={trimsModalOpen} onOpenChange={setTrimsModalOpen}>
          <DialogContent className="max-w-lg bg-sidebar border-border/40 p-0 gap-0">
            <DialogHeader className="px-5 py-4 border-b border-border/40">
              <DialogTitle className="text-[15px] font-bold tracking-tight text-foreground">
                All Trims
              </DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-1 p-2 overflow-y-auto max-h-[60vh]">
              {(facets?.trim ?? []).map((trim) => (
                <button
                  key={trim.value}
                  onClick={() => {
                    setFilters({ trim: [trim.value] });
                    setTrimsModalOpen(false);
                  }}
                  className="flex items-center justify-between gap-3 px-4 py-3 text-sm font-semibold text-foreground hover:bg-muted/50 rounded-lg transition-colors text-left"
                >
                  <span className="truncate">{trim.label}</span>
                  <span className="text-xs text-muted-foreground/70 tabular-nums flex-shrink-0">{trim.count}</span>
                </button>
              ))}
            </div>
          </DialogContent>
        </Dialog>

        {/* Active Chips - with sidebar-aware padding to align with content grid */}
        <div 
          className={cn(
            "overflow-hidden transition-all duration-200",
            activeChips.length > 0 ? "mt-3 sm:mt-4 max-h-32 opacity-100" : "max-h-0 opacity-0",
            sidebarOpen && "lg:pl-6"
          )}
        >
          <div className="flex flex-wrap items-center gap-2">
            {activeChips.map((chip) => (
              <button
                key={chip.key}
                onClick={() => handleChipRemove(chip.key)}
                className="group flex items-center gap-1.5 px-3 py-1 text-xs font-semibold bg-muted/40 hover:bg-muted/60 rounded-full transition-colors"
              >
                <span>{chip.label}</span>
                <X className="h-3 w-3 text-muted-foreground/70 group-hover:text-foreground transition-colors" />
              </button>
            ))}
            {activeChips.length > 0 && (
              <button
                onClick={clearFilters}
                className="px-2 py-1 text-xs font-semibold text-muted-foreground/70 hover:text-foreground transition-colors"
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
  if (params.condition === 'new') {
    chips.push({ key: 'condition', label: 'New Cars' });
  }
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
  // Add make/model/trim as chips (clickable to remove)
  if (params.make?.length) {
    chips.push({ key: 'make', label: params.make[0] });
  }
  if (params.model?.length) {
    chips.push({ key: 'model', label: params.model[0] });
  }
  if (params.trim?.length) {
    chips.push({ key: 'trim', label: params.trim[0] });
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
