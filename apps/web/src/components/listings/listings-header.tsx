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
import { Skeleton } from '@/components/ui/skeleton';
import { LayoutGrid, List, SlidersHorizontal, X, ChevronDown, PanelLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
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
  // Popover open states
  const [makesOpen, setMakesOpen] = useState(false);
  const [modelsOpen, setModelsOpen] = useState(false);
  const [trimsOpen, setTrimsOpen] = useState(false);

  // Number of items to show before "View all" - kept small for fixed-height dynamic island
  const VISIBLE_COUNT = 4;

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
    } else if (chipKey === 'sellerId') {
      setFilters({ sellerId: undefined });
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
      "sticky z-30 bg-background border-b border-transparent",
      "[&:not(:first-child)]:border-sidebar-border/50",
      embedded ? "top-0" : "top-14 sm:top-16"
    )}>
      <div className="py-2.5 sm:py-4 relative">
        {/* Search Row */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2">
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
              <button className="lg:hidden relative p-2.5 -ml-1 text-muted-foreground hover:text-foreground active:text-foreground transition-colors touch-manipulation">
                <SlidersHorizontal className="h-5 w-5 sm:h-4 sm:w-4" />
                {activeFilterCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 min-w-[18px] h-[18px] px-1 text-[10px] font-bold bg-foreground text-background rounded-full flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </SheetTrigger>
            <SheetContent 
              side="bottom" 
              className="h-[90vh] p-0 bg-background text-foreground border-t-0 rounded-t-3xl flex flex-col shadow-2xl"
              overlayClassName="bg-black/60"
            >
              <SheetTitle className="sr-only">Filters</SheetTitle>
              
              {/* Drag Handle */}
              <div className="flex justify-center pt-3 pb-2 shrink-0">
                <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
              </div>

              {/* Header */}
              <div className="px-5 pb-4 border-b border-border shrink-0">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold tracking-tight">Filters</h3>
                    {activeFilterCount > 0 && (
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''} applied
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {activeFilterCount > 0 && (
                      <button
                        onClick={clearFilters}
                        className="text-sm font-semibold text-muted-foreground hover:text-foreground touch-manipulation px-3 py-1.5 rounded-lg hover:bg-muted transition-colors"
                      >
                        Reset
                      </button>
                    )}
                    <button
                      onClick={() => onMobileFiltersToggle(false)}
                      className="p-2 -mr-2 rounded-full hover:bg-muted transition-colors touch-manipulation"
                    >
                      <X className="h-5 w-5 text-muted-foreground" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Scrollable Filter Content */}
              <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-4">
                <FilterSidebar
                  params={params}
                  facets={facets}
                  isLoading={isLoading}
                  onFilterChange={setFilters}
                  onClearFilters={clearFilters}
                  activeFilterCount={activeFilterCount}
                />
              </div>

              {/* Sticky Footer with Apply Button */}
              <div className="shrink-0 px-5 py-4 border-t border-border bg-background/95 backdrop-blur-sm pb-safe">
                <button
                  onClick={() => onMobileFiltersToggle(false)}
                  className="w-full h-12 bg-primary text-primary-foreground font-semibold text-base rounded-2xl hover:bg-primary/90 active:scale-[0.98] transition-all touch-manipulation shadow-lg"
                >
                  Show {meta?.total ?? 0} results
                </button>
              </div>
            </SheetContent>
          </Sheet>

          {/* Results count - hidden on mobile, shows on larger screens */}
          <div className="hidden sm:flex items-center h-9 px-4 bg-sidebar border border-sidebar-border rounded-full shadow-sm">
            <span className="text-sm font-semibold text-sidebar-foreground/70 tabular-nums whitespace-nowrap">
              {meta?.total ?? 0} cars
            </span>
          </div>

          {/* Search Bar - Full width on mobile, flexible on desktop */}
          <div className="w-full sm:flex-1 sm:min-w-[200px] order-last sm:order-none mt-2 sm:mt-0">
            <SearchBar
              size="sm"
              placeholder="Search make, model..."
              redirectOnSearch={false}
              onSearch={setFilters}
            />
          </div>

          {/* Right Controls Group */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Sort Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button 
                  className="flex items-center gap-1.5 sm:gap-2 h-9 px-2.5 sm:px-4 text-sm font-semibold bg-sidebar border border-sidebar-border rounded-full text-sidebar-foreground/70 hover:text-sidebar-foreground shadow-sm transition-colors touch-manipulation"
                >
                  <span className="hidden xs:inline">{SORT_OPTIONS.find(s => s.value === (params.sortBy || 'relevance'))?.label || 'Sort'}</span>
                  <span className="xs:hidden">Sort</span>
                  <ChevronDown className="size-3.5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-52 bg-sidebar border border-sidebar-border rounded-lg shadow-lg p-1.5">
                {SORT_OPTIONS.map((option) => (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() => setSort(option.value)}
                    className="text-[15px] font-semibold tracking-tight text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent cursor-pointer rounded-md px-3 py-2 flex items-center justify-between"
                  >
                    <span>{option.label}</span>
                    {(params.sortBy || 'relevance') === option.value && (
                      <CheckCircle2 className="size-4 text-foreground" />
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* View Toggle */}
            <div className="flex items-center h-9 px-0.5 sm:px-1 bg-sidebar border border-sidebar-border rounded-full shadow-sm">
              <button
                onClick={() => onViewModeChange('grid')}
                className={cn(
                  "flex items-center justify-center w-8 h-8 sm:w-7 sm:h-7 rounded-full transition-colors touch-manipulation",
                  viewMode === 'grid' ? "text-foreground bg-muted/50" : "text-muted-foreground hover:text-foreground"
                )}
                title="Grid view"
              >
                <LayoutGrid className="size-4" />
              </button>
              <button
                onClick={() => onViewModeChange('minimal')}
                className={cn(
                  "flex items-center justify-center w-8 h-8 sm:w-7 sm:h-7 rounded-full transition-colors touch-manipulation",
                  viewMode === 'minimal' ? "text-foreground bg-muted/50" : "text-muted-foreground hover:text-foreground"
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
                  "hidden lg:flex items-center justify-center w-7 h-7 rounded-full transition-colors",
                  viewMode === 'list' ? "text-foreground bg-muted/50" : "text-muted-foreground hover:text-foreground"
                )}
                title="List view"
              >
                <List className="size-4" />
              </button>
            </div>

            {/* Advanced Filters - Right side */}
            <AdvancedFilters
              params={params}
              facets={facets}
              onFilterChange={setFilters}
            />
          </div>
        </div>

        {/* Mobile: Active filters strip + results count */}
        <div className="flex sm:hidden items-center gap-2 mt-2 overflow-x-auto scrollbar-hide -mx-1 px-1 pb-1">
          {/* Results count on mobile */}
          {!isLoading && (
            <span className="text-xs font-medium text-muted-foreground whitespace-nowrap shrink-0">
              {meta?.total ?? 0} cars
            </span>
          )}
          
          {/* Breadcrumb on mobile */}
          {breadcrumbItems.length > 1 && (
            <>
              <div className="w-px h-4 bg-border shrink-0" />
              <nav className="flex items-center gap-1 shrink-0">
                {breadcrumbItems.map((item, index) => (
                  <div key={item.href} className="flex items-center gap-1">
                    {index > 0 && <ChevronRight className="size-3 text-muted-foreground/40" />}
                    {index === breadcrumbItems.length - 1 ? (
                      <span className="text-xs font-bold text-foreground whitespace-nowrap">{item.label}</span>
                    ) : (
                      <button
                        onClick={() => {
                          if (index === 0) {
                            setFilters({ make: undefined, model: undefined, trim: undefined });
                          } else if (index === 1) {
                            setFilters({ model: undefined, trim: undefined });
                          }
                        }}
                        className="text-xs font-medium text-muted-foreground whitespace-nowrap touch-manipulation"
                      >
                        {item.label}
                      </button>
                    )}
                  </div>
                ))}
              </nav>
            </>
          )}
          
          {/* Active filter chips on mobile (excluding make/model/trim shown in breadcrumb) */}
          {activeChips.filter(c => !['make', 'model', 'trim'].includes(c.key)).length > 0 && (
            <>
              <div className="w-px h-4 bg-border shrink-0" />
              {activeChips.filter(c => !['make', 'model', 'trim'].includes(c.key)).slice(0, 2).map((chip) => (
                <button
                  key={chip.key}
                  onClick={() => handleChipRemove(chip.key)}
                  className="flex items-center gap-1 px-2 py-1 text-[11px] font-medium bg-muted/50 text-foreground/80 hover:bg-muted/70 rounded-full transition-colors whitespace-nowrap shrink-0 touch-manipulation"
                >
                  <span className="max-w-[80px] truncate">{chip.label}</span>
                  <X className="h-2.5 w-2.5" />
                </button>
              ))}
              {activeChips.filter(c => !['make', 'model', 'trim'].includes(c.key)).length > 2 && (
                <span className="text-[11px] text-muted-foreground whitespace-nowrap shrink-0">+{activeChips.filter(c => !['make', 'model', 'trim'].includes(c.key)).length - 2}</span>
              )}
            </>
          )}
          
          {/* Clear all on mobile */}
          {activeFilterCount > 0 && (
            <button
              onClick={clearFilters}
              className="ml-auto shrink-0 px-2 py-1 text-[11px] font-medium text-muted-foreground hover:text-foreground rounded-full transition-colors touch-manipulation"
            >
              Clear
            </button>
          )}
        </div>

        {/* Mobile: Quick-Select Pills */}
        <div className="sm:hidden mt-2 -mx-1 px-1">
          {/* Make Quick-Select */}
          {!params.make?.length && (facets?.make ?? []).length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 whitespace-nowrap shrink-0">
                Makes
              </span>
              {(facets?.make ?? []).slice(0, 6).map((make) => (
                <button
                  key={make.value}
                  onClick={() => setFilters({ make: [make.value], model: undefined, trim: undefined })}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-foreground/80 bg-muted/40 active:bg-muted/60 rounded-full transition-all whitespace-nowrap shrink-0 touch-manipulation"
                >
                  <span>{make.label}</span>
                  <span className="text-[10px] text-muted-foreground tabular-nums">{make.count}</span>
                </button>
              ))}
            </div>
          )}

          {/* Model Quick-Select */}
          {params.make?.length && !params.model?.length && (
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 whitespace-nowrap shrink-0">
                Models
              </span>
              {isLoading ? (
                <>
                  {[1,2,3,4].map((i) => (
                    <div key={i} className="h-7 w-16 rounded-full bg-muted/60 animate-pulse shrink-0" />
                  ))}
                </>
              ) : (facets?.model ?? []).length > 0 ? (
                <>
                  {(facets?.model ?? []).slice(0, 8).map((model) => (
                    <button
                      key={model.value}
                      onClick={() => setFilters({ model: [model.value] })}
                      className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-foreground/80 bg-muted/40 active:bg-muted/60 rounded-full transition-all whitespace-nowrap shrink-0 touch-manipulation"
                    >
                      <span>{model.label}</span>
                      <span className="text-[10px] text-muted-foreground tabular-nums">{model.count}</span>
                    </button>
                  ))}
                </>
              ) : null}
            </div>
          )}

          {/* Trim Quick-Select */}
          {params.make?.length && params.model?.length && !params.trim?.length && (facets?.trim ?? []).length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 whitespace-nowrap shrink-0">
                Trims
              </span>
              {isLoading ? (
                <>
                  {[1,2,3].map((i) => (
                    <div key={i} className="h-7 w-14 rounded-full bg-muted/60 animate-pulse shrink-0" />
                  ))}
                </>
              ) : (
                <>
                  {(facets?.trim ?? []).slice(0, 8).map((trim) => (
                    <button
                      key={trim.value}
                      onClick={() => setFilters({ trim: [trim.value] })}
                      className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-foreground/80 bg-muted/40 active:bg-muted/60 rounded-full transition-all whitespace-nowrap shrink-0 touch-manipulation"
                    >
                      <span>{trim.label}</span>
                      <span className="text-[10px] text-muted-foreground tabular-nums">{trim.count}</span>
                    </button>
                  ))}
                </>
              )}
            </div>
          )}
        </div>

        {/* Dynamic Island - Fixed height container that morphs content */}
        <div className="hidden sm:flex items-center gap-3 mt-3 h-10">
          {/* Left: Breadcrumb (when filters active) */}
          {breadcrumbItems.length > 1 && (
            <nav className="flex items-center gap-1.5 shrink-0">
              {breadcrumbItems.map((item, index) => (
                <div key={item.href} className="flex items-center gap-1.5">
                  {index > 0 && <ChevronRight className="size-3.5 text-muted-foreground/40" />}
                  {index === breadcrumbItems.length - 1 ? (
                    <span className="text-sm font-bold text-foreground whitespace-nowrap">{item.label}</span>
                  ) : (
                    <Link 
                      href={item.href}
                      className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap"
                    >
                      {item.label}
                    </Link>
                  )}
                </div>
              ))}
            </nav>
          )}

          {/* Separator when breadcrumb exists and quick-select will show */}
          {breadcrumbItems.length > 1 && (
            (!params.make?.length && (facets?.make ?? []).length > 0) ||
            (params.make?.length && !params.model?.length && (facets?.model ?? []).length > 0) ||
            (params.make?.length && params.model?.length && !params.trim?.length && (facets?.trim ?? []).length > 0)
          ) && (
            <div className="w-px h-5 bg-border shrink-0" />
          )}

          {/* Quick-Select Options (contextual) */}
          <div className="flex-1 flex items-center gap-2 overflow-x-auto scrollbar-hide">
            {/* Make Quick-Select - when no make selected */}
            {!params.make?.length && (isLoading || (facets?.make ?? []).length > 0) && (
              <>
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground/60 whitespace-nowrap shrink-0">
                  Makes
                </span>
                {isLoading ? (
                  <>
                    <Skeleton className="h-7 w-16 rounded-full shrink-0" />
                    <Skeleton className="h-7 w-20 rounded-full shrink-0" />
                    <Skeleton className="h-7 w-14 rounded-full shrink-0" />
                  </>
                ) : (
                  <>
                    {(facets?.make ?? []).slice(0, VISIBLE_COUNT).map((make) => (
                      <button
                        key={make.value}
                        onClick={() => setFilters({ make: [make.value], model: undefined, trim: undefined })}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-foreground/80 hover:text-foreground bg-muted/40 hover:bg-muted/60 rounded-full transition-all whitespace-nowrap shrink-0"
                      >
                        <span>{make.label}</span>
                        <span className="text-xs text-muted-foreground tabular-nums">{make.count}</span>
                      </button>
                    ))}
                    {(facets?.make ?? []).length > VISIBLE_COUNT && (
                  <Popover open={makesOpen} onOpenChange={setMakesOpen}>
                    <PopoverTrigger asChild>
                      <button
                        className={cn(
                          "flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-full transition-all whitespace-nowrap shrink-0",
                          "bg-sidebar border border-sidebar-border shadow-sm",
                          makesOpen 
                            ? "text-sidebar-foreground border-primary/50 ring-1 ring-primary/20" 
                            : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:shadow-md"
                        )}
                      >
                        <span>View all</span>
                        <ChevronDown className={cn("size-3.5 transition-transform", makesOpen && "rotate-180")} />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent 
                      className="w-[280px] p-0 bg-sidebar border-sidebar-border rounded-lg shadow-lg overflow-hidden" 
                      align="start"
                      sideOffset={8}
                    >
                      <Command className="bg-transparent">
                        <CommandInput 
                          placeholder="Search makes..." 
                          className="h-10 border-b border-sidebar-border text-[15px]"
                        />
                        <CommandList className="max-h-[280px]">
                          <CommandEmpty className="py-4 text-center text-[15px] text-muted-foreground">No makes found.</CommandEmpty>
                          <CommandGroup className="p-1.5">
                            {(facets?.make ?? []).map((make) => (
                              <CommandItem
                                key={make.value}
                                value={make.label}
                                onSelect={() => {
                                  setFilters({ make: [make.value], model: undefined, trim: undefined });
                                  setMakesOpen(false);
                                }}
                                className="px-3 py-2 text-[15px] font-semibold tracking-tight text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent rounded-md cursor-pointer"
                              >
                                <span className="flex-1">{make.label}</span>
                                <span className="text-xs text-muted-foreground tabular-nums">{make.count}</span>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                    )}
                  </>
                )}
              </>
            )}

            {/* Model Quick-Select - when make selected but no model */}
            {params.make?.length && !params.model?.length && (
              <>
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground/60 whitespace-nowrap shrink-0">
                  Models
                </span>
                {isLoading ? (
                  /* Skeleton loading state - deterministic widths to avoid hydration mismatch */
                  <>
                    {[72, 65, 80, 68].map((width, i) => (
                      <div
                        key={i}
                        className="h-7 rounded-full bg-muted/60 animate-pulse shrink-0"
                        style={{ width: `${width}px` }}
                      />
                    ))}
                  </>
                ) : (facets?.model ?? []).length > 0 ? (
                  <>
                    {(facets?.model ?? []).slice(0, VISIBLE_COUNT).map((model) => (
                      <button
                        key={model.value}
                        onClick={() => setFilters({ model: [model.value] })}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-foreground/80 hover:text-foreground bg-muted/40 hover:bg-muted/60 rounded-full transition-all whitespace-nowrap shrink-0"
                      >
                        <span>{model.label}</span>
                        <span className="text-xs text-muted-foreground tabular-nums">{model.count}</span>
                      </button>
                    ))}
                    {(facets?.model ?? []).length > VISIBLE_COUNT && (
                      <Popover open={modelsOpen} onOpenChange={setModelsOpen}>
                        <PopoverTrigger asChild>
                          <button
                            className={cn(
                              "flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-full transition-all whitespace-nowrap shrink-0",
                              "bg-sidebar border border-sidebar-border shadow-sm",
                              modelsOpen 
                                ? "text-sidebar-foreground border-primary/50 ring-1 ring-primary/20" 
                                : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:shadow-md"
                            )}
                          >
                            <span>View all</span>
                            <ChevronDown className={cn("size-3.5 transition-transform", modelsOpen && "rotate-180")} />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent 
                          className="w-[280px] p-0 bg-sidebar border-sidebar-border rounded-lg shadow-lg overflow-hidden" 
                          align="start"
                          sideOffset={8}
                        >
                          <Command className="bg-transparent">
                            <CommandInput 
                              placeholder="Search models..." 
                              className="h-10 border-b border-sidebar-border text-[15px]"
                            />
                            <CommandList className="max-h-[280px]">
                              <CommandEmpty className="py-4 text-center text-[15px] text-muted-foreground">No models found.</CommandEmpty>
                              <CommandGroup className="p-1.5">
                                {(facets?.model ?? []).map((model) => (
                                  <CommandItem
                                    key={model.value}
                                    value={model.label}
                                    onSelect={() => {
                                      setFilters({ model: [model.value] });
                                      setModelsOpen(false);
                                    }}
                                    className="px-3 py-2 text-[15px] font-semibold tracking-tight text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent rounded-md cursor-pointer"
                                  >
                                    <span className="flex-1">{model.label}</span>
                                    <span className="text-xs text-muted-foreground tabular-nums">{model.count}</span>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    )}
                  </>
                ) : null}
              </>
            )}

            {/* Trim Quick-Select - when make & model selected but no trim */}
            {params.make?.length && params.model?.length && !params.trim?.length && (
              <>
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground/60 whitespace-nowrap shrink-0">
                  Trims
                </span>
                {isLoading ? (
                  /* Skeleton loading state - deterministic widths to avoid hydration mismatch */
                  <>
                    {[58, 70, 62, 75].map((width, i) => (
                      <div
                        key={i}
                        className="h-7 rounded-full bg-muted/60 animate-pulse shrink-0"
                        style={{ width: `${width}px` }}
                      />
                    ))}
                  </>
                ) : (facets?.trim ?? []).length > 0 ? (
                  <>
                    {(facets?.trim ?? []).slice(0, VISIBLE_COUNT).map((trim) => (
                      <button
                        key={trim.value}
                        onClick={() => setFilters({ trim: [trim.value] })}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-foreground/80 hover:text-foreground bg-muted/40 hover:bg-muted/60 rounded-full transition-all whitespace-nowrap shrink-0"
                      >
                        <span>{trim.label}</span>
                        <span className="text-xs text-muted-foreground tabular-nums">{trim.count}</span>
                      </button>
                    ))}
                    {(facets?.trim ?? []).length > VISIBLE_COUNT && (
                      <Popover open={trimsOpen} onOpenChange={setTrimsOpen}>
                        <PopoverTrigger asChild>
                          <button
                            className={cn(
                              "flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-full transition-all whitespace-nowrap shrink-0",
                              "bg-sidebar border border-sidebar-border shadow-sm",
                              trimsOpen 
                                ? "text-sidebar-foreground border-primary/50 ring-1 ring-primary/20" 
                                : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:shadow-md"
                            )}
                          >
                            <span>View all</span>
                            <ChevronDown className={cn("size-3.5 transition-transform", trimsOpen && "rotate-180")} />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent 
                          className="w-[280px] p-0 bg-sidebar border-sidebar-border rounded-lg shadow-lg overflow-hidden" 
                          align="start"
                          sideOffset={8}
                        >
                          <Command className="bg-transparent">
                            <CommandInput 
                              placeholder="Search trims..." 
                              className="h-10 border-b border-sidebar-border text-[15px]"
                            />
                            <CommandList className="max-h-[280px]">
                              <CommandEmpty className="py-4 text-center text-[15px] text-muted-foreground">No trims found.</CommandEmpty>
                              <CommandGroup className="p-1.5">
                                {(facets?.trim ?? []).map((trim) => (
                                  <CommandItem
                                    key={trim.value}
                                    value={trim.label}
                                    onSelect={() => {
                                      setFilters({ trim: [trim.value] });
                                      setTrimsOpen(false);
                                    }}
                                    className="px-3 py-2 text-[15px] font-semibold tracking-tight text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent rounded-md cursor-pointer"
                                  >
                                    <span className="flex-1">{trim.label}</span>
                                    <span className="text-xs text-muted-foreground tabular-nums">{trim.count}</span>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    )}
                  </>
                ) : null}
              </>
            )}

            {/* Other active filter chips */}
            {activeChips.filter(c => !['make', 'model', 'trim'].includes(c.key)).map((chip) => (
              <button
                key={chip.key}
                onClick={() => handleChipRemove(chip.key)}
                className="group flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-muted/50 text-foreground/80 hover:bg-muted/70 hover:text-foreground rounded-full transition-colors whitespace-nowrap shrink-0"
              >
                <span>{chip.label}</span>
                <X className="h-3 w-3 text-muted-foreground group-hover:text-foreground transition-colors" />
              </button>
            ))}
          </div>

          {/* Clear All - Always visible on right when filters active */}
          {activeFilterCount > 0 && (
            <button
              onClick={clearFilters}
              className="shrink-0 px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-full transition-colors"
            >
              Clear all
            </button>
          )}
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
    chips.push({ key: 'isBlackTierPartner', label: 'Black Members' });
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
  if (params.sellerId) {
    chips.push({ key: 'sellerId', label: 'Private Seller' });
  }

  return chips;
}

// ============================================================================
// SKELETON
// ============================================================================

interface ListingsHeaderSkeletonProps {
  embedded?: boolean;
}

function ListingsHeaderSkeletonComponent({ embedded = false }: ListingsHeaderSkeletonProps) {
  return (
    <header className={cn(
      "sticky z-30 bg-background border-b border-transparent",
      "[&:not(:first-child)]:border-sidebar-border/50",
      embedded ? "top-0" : "top-14 sm:top-16"
    )}>
      <div className="py-3 sm:py-4">
        {/* Search Row */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Results count skeleton */}
          <Skeleton className="hidden sm:block h-9 w-20 rounded-full" />

          {/* Search bar skeleton */}
          <Skeleton className="w-full sm:flex-1 sm:min-w-[200px] h-9 rounded-full order-last sm:order-none" />

          {/* Right controls */}
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-20 rounded-full" />
            <Skeleton className="h-9 w-24 rounded-full" />
          </div>
        </div>

        {/* Dynamic Island skeleton */}
        <div className="hidden sm:flex items-center gap-3 mt-3 h-10">
          <Skeleton className="h-7 w-16 rounded-full" />
          <Skeleton className="h-7 w-20 rounded-full" />
          <Skeleton className="h-7 w-24 rounded-full" />
          <Skeleton className="h-7 w-18 rounded-full" />
        </div>
      </div>
    </header>
  );
}

ListingsHeader.Skeleton = ListingsHeaderSkeletonComponent;
