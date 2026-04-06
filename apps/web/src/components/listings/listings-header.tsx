/**
 * ListingsHeader - Fixed search bar and controls
 * Fixed header for the listings page
 */

'use client';

import { useMemo, useCallback, useState } from 'react';
import { SearchBar } from '@/components/search/search-bar';
import { FilterSidebar } from '@/components/search/filter-sidebar';
import { AdvancedFilters } from '@/components/search/advanced-filters';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowUpDown, LayoutGrid, List, SlidersHorizontal, X, ChevronDown, PanelLeft, ChevronRight } from 'lucide-react';
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
  meta: { total?: number; hasMore?: boolean } | null;
  /** Number of active filters */
  activeFilterCount: number;
  /** Loading state */
  isLoading: boolean;
  /** Listings for partner name derivation */
  listings?: Array<{ partnerName?: string | null }>;
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
  /** Server-fetched initial popular suggestions */
  initialSuggestions?: Array<any>;
}

export function ListingsHeader({
  params,
  facets,
  meta: _meta,
  activeFilterCount,
  isLoading,
  listings,
  sidebarOpen,
  onSidebarToggle,
  mobileFiltersOpen,
  onMobileFiltersToggle,
  viewMode,
  onViewModeChange,
  setFilters,
  clearFilters,
  setSort,
  initialSuggestions,
}: ListingsHeaderProps) {
  // Popover open states
  const [makesOpen, setMakesOpen] = useState(false);
  const [modelsOpen, setModelsOpen] = useState(false);
  const [trimsOpen, setTrimsOpen] = useState(false);
  
  // Dynamic island expanded state
  const [islandExpanded, setIslandExpanded] = useState(false);
  
  // Mobile search sheet state
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  


  // Number of items to show before "View all" - kept small for fixed-height dynamic island
  const VISIBLE_COUNT = 4;

  // Multi-select toggle handlers for popovers
  const toggleMake = useCallback((value: string) => {
    const current = params.make ?? [];
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    // Clear downstream when makes change
    setFilters({ make: updated.length ? updated : undefined, model: undefined, trim: undefined });
  }, [params.make, setFilters]);

  const toggleModel = useCallback((value: string) => {
    const current = params.model ?? [];
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    // Clear trim when models change
    setFilters({ model: updated.length ? updated : undefined, trim: undefined });
  }, [params.model, setFilters]);

  const toggleTrim = useCallback((value: string) => {
    const current = params.trim ?? [];
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    setFilters({ trim: updated.length ? updated : undefined });
  }, [params.trim, setFilters]);

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
    <>
      {/* ===== MOBILE HEADER ===== */}
      <div className="md:hidden z-30 bg-background border-b border-border/20">
        <div className="py-2.5 space-y-2">
          {/* Row 1: Search bar + controls */}
          <div className="flex items-center gap-2">
            {/* Filters trigger - pill style */}
            <Sheet open={mobileSearchOpen} onOpenChange={setMobileSearchOpen}>
              <SheetTrigger asChild>
                <button className="relative flex items-center justify-center h-10 w-10 bg-sidebar border border-sidebar-border rounded-full text-muted-foreground active:text-foreground shadow-sm transition-colors touch-manipulation shrink-0">
                  <SlidersHorizontal className="h-4 w-4" />
                  {activeFilterCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] px-0.5 text-caption2 font-bold bg-primary text-primary-foreground rounded-full flex items-center justify-center">
                      {activeFilterCount}
                    </span>
                  )}
                </button>
              </SheetTrigger>
              <SheetContent 
                side="bottom" 
                className="h-[85vh] p-0 bg-background text-foreground border-t-0 rounded-t-3xl flex flex-col shadow-2xl"
                overlayClassName="bg-black/60"
              >
                <SheetTitle className="sr-only">Filters</SheetTitle>
                
                {/* Drag Handle */}
                <div className="flex justify-center pt-3 pb-2 shrink-0">
                  <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
                </div>

                {/* Header with close */}
                <div className="px-4 pb-3 shrink-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-headline font-bold tracking-tight">Filters</h3>
                      {activeFilterCount > 0 && (
                        <p className="text-subhead text-muted-foreground mt-0.5">
                          {activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''} applied
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => setMobileSearchOpen(false)}
                      className="p-2 -mr-2 rounded-full hover:bg-muted transition-colors touch-manipulation"
                    >
                      <X className="h-5 w-5 text-muted-foreground" />
                    </button>
                  </div>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto overscroll-contain">
                  {/* Quick-Select Pills */}
                  <div className="px-4 py-3 space-y-3">
                    {/* Make Quick-Select */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-caption2 font-bold uppercase tracking-wider text-muted-foreground/60">Makes</p>
                        {(facets?.make ?? []).length > 8 && (
                          <Popover>
                            <PopoverTrigger asChild>
                              <button className="text-caption1 text-primary active:text-primary/80 touch-manipulation">
                                View all ({(facets?.make ?? []).length})
                              </button>
                            </PopoverTrigger>
                            <PopoverContent 
                              className="w-[calc(100vw-2rem)] p-0 bg-sidebar border-sidebar-border rounded-xl shadow-lg overflow-hidden" 
                              align="center"
                              sideOffset={8}
                            >
                              <Command className="bg-transparent">
                                <CommandInput placeholder="Search makes..." className="h-12 border-b border-sidebar-border text-callout px-4" />
                                <CommandList className="max-h-[50vh]">
                                  <CommandEmpty className="py-6 text-center text-callout text-muted-foreground">No makes found.</CommandEmpty>
                                  <CommandGroup className="p-2">
                                    {(facets?.make ?? []).map((make) => {
                                      const isSelected = params.make?.includes(make.value) ?? false;
                                      return (
                                        <CommandItem
                                          key={make.value}
                                          value={make.label}
                                          onSelect={() => {
                                            if (isSelected) {
                                              toggleMake(make.value);
                                            } else {
                                              setFilters({ make: [make.value], model: undefined, trim: undefined });
                                            }
                                          }}
                                          className={cn(
                                            "flex items-center justify-between gap-3 px-4 py-3 text-callout tracking-tight rounded-lg cursor-pointer transition-colors duration-100",
                                            isSelected ? "bg-muted text-foreground font-semibold" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                                          )}
                                        >
                                          <span className="flex-1 truncate">{make.label}</span>
                                          <span className="text-subhead text-muted-foreground/60 tabular-nums shrink-0">{make.count}</span>
                                        </CommandItem>
                                      );
                                    })}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {/* Selected makes */}
                        {(params.make ?? []).map((makeValue) => {
                          const makeData = (facets?.make ?? []).find(m => m.value === makeValue);
                          return (
                            <button
                              key={makeValue}
                              onClick={() => toggleMake(makeValue)}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-subhead font-semibold text-foreground bg-foreground/10 rounded-full transition-all touch-manipulation"
                            >
                              <span>{makeData?.label ?? makeValue}</span>
                              <X className="size-3.5" />
                            </button>
                          );
                        })}
                        {/* Unselected makes */}
                        {(facets?.make ?? []).filter(m => !(params.make ?? []).includes(m.value)).slice(0, 8).map((make) => (
                          <button
                            key={make.value}
                            onClick={() => toggleMake(make.value)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-subhead text-foreground/70 bg-muted/40 active:bg-muted/60 rounded-full transition-all touch-manipulation"
                          >
                            <span>{make.label}</span>
                            <span className="text-caption1 text-muted-foreground tabular-nums">{make.count}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Model Quick-Select - when make selected */}
                    {params.make?.length && (facets?.model ?? []).length > 0 && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-caption2 font-bold uppercase tracking-wider text-muted-foreground/60">Models</p>
                          {(facets?.model ?? []).length > 8 && (
                            <Popover>
                              <PopoverTrigger asChild>
                                <button className="text-caption1 text-primary active:text-primary/80 touch-manipulation">
                                  View all ({(facets?.model ?? []).length})
                                </button>
                              </PopoverTrigger>
                              <PopoverContent 
                                className="w-[calc(100vw-2rem)] p-0 bg-sidebar border-sidebar-border rounded-xl shadow-lg overflow-hidden" 
                                align="center"
                                sideOffset={8}
                              >
                                <Command className="bg-transparent">
                                  <CommandInput placeholder="Search models..." className="h-12 border-b border-sidebar-border text-callout px-4" />
                                  <CommandList className="max-h-[50vh]">
                                    <CommandEmpty className="py-6 text-center text-callout text-muted-foreground">No models found.</CommandEmpty>
                                    <CommandGroup className="p-2">
                                      {(facets?.model ?? []).map((model) => {
                                        const isSelected = params.model?.includes(model.value) ?? false;
                                        return (
                                          <CommandItem
                                            key={model.value}
                                            value={model.label}
                                            onSelect={() => {
                                              if (isSelected) {
                                                toggleModel(model.value);
                                              } else {
                                                setFilters({ model: [model.value], trim: undefined });
                                              }
                                            }}
                                            className={cn(
                                              "flex items-center justify-between gap-3 px-4 py-3 text-callout tracking-tight rounded-lg cursor-pointer transition-colors duration-100",
                                              isSelected ? "bg-muted text-foreground font-semibold" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                                            )}
                                          >
                                            <span className="flex-1 truncate">{model.label}</span>
                                            <span className="text-subhead text-muted-foreground/60 tabular-nums shrink-0">{model.count}</span>
                                          </CommandItem>
                                        );
                                      })}
                                    </CommandGroup>
                                  </CommandList>
                                </Command>
                              </PopoverContent>
                            </Popover>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {/* Selected models */}
                          {(params.model ?? []).map((modelValue) => {
                            const modelData = (facets?.model ?? []).find(m => m.value === modelValue);
                            return (
                              <button
                                key={modelValue}
                                onClick={() => toggleModel(modelValue)}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-subhead font-semibold text-foreground bg-foreground/10 rounded-full transition-all touch-manipulation"
                              >
                                <span>{modelData?.label ?? modelValue}</span>
                                <X className="size-3.5" />
                              </button>
                            );
                          })}
                          {/* Unselected models */}
                          {(facets?.model ?? []).filter(m => !(params.model ?? []).includes(m.value)).slice(0, 8).map((model) => (
                            <button
                              key={model.value}
                              onClick={() => toggleModel(model.value)}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-subhead text-foreground/70 bg-muted/40 active:bg-muted/60 rounded-full transition-all touch-manipulation"
                            >
                              <span>{model.label}</span>
                              <span className="text-caption1 text-muted-foreground tabular-nums">{model.count}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Trim Quick-Select - when model selected */}
                    {params.make?.length && params.model?.length && (facets?.trim ?? []).length > 0 && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-caption2 font-bold uppercase tracking-wider text-muted-foreground/60">Trims</p>
                          {(facets?.trim ?? []).length > 8 && (
                            <Popover>
                              <PopoverTrigger asChild>
                                <button className="text-caption1 text-primary active:text-primary/80 touch-manipulation">
                                  View all ({(facets?.trim ?? []).length})
                                </button>
                              </PopoverTrigger>
                              <PopoverContent 
                                className="w-[calc(100vw-2rem)] p-0 bg-sidebar border-sidebar-border rounded-xl shadow-lg overflow-hidden" 
                                align="center"
                                sideOffset={8}
                              >
                                <Command className="bg-transparent">
                                  <CommandInput placeholder="Search trims..." className="h-12 border-b border-sidebar-border text-callout px-4" />
                                  <CommandList className="max-h-[50vh]">
                                    <CommandEmpty className="py-6 text-center text-callout text-muted-foreground">No trims found.</CommandEmpty>
                                    <CommandGroup className="p-2">
                                      {(facets?.trim ?? []).map((trim) => {
                                        const isSelected = params.trim?.includes(trim.value) ?? false;
                                        return (
                                          <CommandItem
                                            key={trim.value}
                                            value={trim.label}
                                            onSelect={() => {
                                              if (isSelected) {
                                                toggleTrim(trim.value);
                                              } else {
                                                setFilters({ trim: [trim.value] });
                                              }
                                            }}
                                            className={cn(
                                              "flex items-center justify-between gap-3 px-4 py-3 text-callout tracking-tight rounded-lg cursor-pointer transition-colors duration-100",
                                              isSelected ? "bg-muted text-foreground font-semibold" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                                            )}
                                          >
                                            <span className="flex-1 truncate">{trim.label}</span>
                                            <span className="text-subhead text-muted-foreground/60 tabular-nums shrink-0">{trim.count}</span>
                                          </CommandItem>
                                        );
                                      })}
                                    </CommandGroup>
                                  </CommandList>
                                </Command>
                              </PopoverContent>
                            </Popover>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {/* Selected trims */}
                          {(params.trim ?? []).map((trimValue) => {
                            const trimData = (facets?.trim ?? []).find(t => t.value === trimValue);
                            return (
                              <button
                                key={trimValue}
                                onClick={() => toggleTrim(trimValue)}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-subhead font-semibold text-foreground bg-foreground/10 rounded-full transition-all touch-manipulation"
                              >
                                <span>{trimData?.label ?? trimValue}</span>
                                <X className="size-3.5" />
                              </button>
                            );
                          })}
                          {/* Unselected trims */}
                          {(facets?.trim ?? []).filter(t => !(params.trim ?? []).includes(t.value)).slice(0, 8).map((trim) => (
                            <button
                              key={trim.value}
                              onClick={() => toggleTrim(trim.value)}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-subhead text-foreground/70 bg-muted/40 active:bg-muted/60 rounded-full transition-all touch-manipulation"
                            >
                              <span>{trim.label}</span>
                              <span className="text-caption1 text-muted-foreground tabular-nums">{trim.count}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* All Filters */}
                  <div className="px-4 py-4">
                    <p className="text-caption2 font-bold uppercase tracking-wider text-muted-foreground/60 mb-3">All Filters</p>
                    <FilterSidebar
                      params={params}
                      facets={facets}
                      isLoading={isLoading}
                      onFilterChange={setFilters}
                      onClearFilters={clearFilters}
                      activeFilterCount={activeFilterCount}
                    />
                    
                    {/* Advanced Filters - Body Type, Fuel, Transmission, Colors, etc. */}
                    <AdvancedFilters
                      params={params}
                      facets={facets ?? undefined}
                      onFilterChange={setFilters}
                      inline
                    />
                  </div>
                </div>

                {/* Sticky Footer */}
                <div className="shrink-0 px-4 py-3 border-t border-border bg-background pb-safe">
                  <div className="flex items-center gap-3">
                    {activeFilterCount > 0 && (
                      <button
                        onClick={clearFilters}
                        className="h-12 px-4 text-subhead font-semibold text-muted-foreground hover:text-foreground border border-sidebar-border rounded-2xl transition-colors touch-manipulation"
                      >
                        Clear all
                      </button>
                    )}
                    <button
                      onClick={() => setMobileSearchOpen(false)}
                      className="flex-1 h-12 bg-primary text-primary-foreground font-semibold text-callout rounded-2xl hover:bg-primary/90 active:scale-[0.98] transition-[background-color,transform] will-change-transform touch-manipulation shadow-lg"
                    >
                      Apply filters
                    </button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            {/* Search Bar */}
            <div className="flex-1 min-w-0">
              <SearchBar
                size="sm"
                placeholder="Search"
                redirectOnSearch={false}
                onSearch={setFilters}
                initialSuggestions={initialSuggestions}
              />
            </div>

            {/* Sort Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="relative flex items-center justify-center h-10 w-10 bg-sidebar border border-sidebar-border rounded-full text-muted-foreground active:text-foreground shadow-sm transition-colors touch-manipulation shrink-0">
                  <ArrowUpDown className="h-4 w-4" />
                  {(params.sortBy || 'relevance') !== 'relevance' && (
                    <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-primary" />
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52 bg-sidebar border border-sidebar-border rounded-lg shadow-lg p-1.5">
                {SORT_OPTIONS.map((option) => (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() => setSort(option.value)}
                    className={cn(
                      "text-subhead tracking-tight cursor-pointer rounded-md px-3 py-2 transition-colors duration-100",
                      (params.sortBy || 'relevance') === option.value
                        ? "bg-muted text-foreground font-semibold"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    )}
                  >
                    {option.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Row 2: Results + Breadcrumb + Active chips */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide -mx-1 px-1">
            {/* Breadcrumb */}
            {breadcrumbItems.length > 1 && (
              <nav className="flex items-center gap-0.5 shrink-0">
                  {breadcrumbItems.slice(-2).map((item, index, arr) => (
                    <div key={item.href} className="flex items-center gap-0.5">
                      {index > 0 && <ChevronRight className="size-3 text-muted-foreground/40 shrink-0" />}
                      <span className={cn(
                        "text-caption1 whitespace-nowrap",
                        index === arr.length - 1 ? "font-bold text-foreground" : "font-medium text-muted-foreground"
                      )}>
                        {item.label}
                      </span>
                    </div>
                  ))}
              </nav>
            )}

            {/* Active filter chips */}
            {activeChips.filter(c => !['make', 'model', 'trim'].includes(c.key)).length > 0 && (
              <>
                {activeChips.filter(c => !['make', 'model', 'trim'].includes(c.key)).slice(0, 2).map((chip) => (
                  <button
                    key={chip.key}
                    onClick={() => handleChipRemove(chip.key)}
                    className="flex items-center gap-1 px-2 py-0.5 text-caption2 font-medium bg-muted/50 text-foreground/80 active:bg-muted/70 rounded-full transition-colors whitespace-nowrap shrink-0 touch-manipulation"
                  >
                    <span className="max-w-[60px] truncate">{chip.label}</span>
                    <X className="h-2.5 w-2.5" />
                  </button>
                ))}
                {activeChips.filter(c => !['make', 'model', 'trim'].includes(c.key)).length > 2 && (
                  <span className="text-caption2 text-muted-foreground whitespace-nowrap shrink-0">
                    +{activeChips.filter(c => !['make', 'model', 'trim'].includes(c.key)).length - 2}
                  </span>
                )}
              </>
            )}

            {/* Clear all */}
            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="ml-auto shrink-0 px-2 py-0.5 text-caption2 font-semibold text-muted-foreground active:text-foreground rounded-full transition-colors touch-manipulation"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ===== DESKTOP HEADER ===== */}
      <header className="hidden md:block z-30 bg-background border-b border-transparent [&:not(:first-child)]:border-border/20">
        <div className="pt-4 pb-4 relative">
          <div className="flex flex-wrap items-center gap-2">
            {/* Sidebar Toggle (Desktop) */}
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

            {/* Desktop Filters Sheet (tablet only) */}
            <Sheet open={mobileFiltersOpen} onOpenChange={onMobileFiltersToggle}>
              <SheetTrigger asChild>
                <button className="lg:hidden relative p-2.5 -ml-1 text-muted-foreground hover:text-foreground active:text-foreground transition-colors touch-manipulation">
                  <SlidersHorizontal className="h-4 w-4" />
                  {activeFilterCount > 0 && (
                    <span className="absolute top-0.5 right-0.5 min-w-[18px] h-[18px] px-1 text-caption2 font-bold bg-foreground text-background rounded-full flex items-center justify-center">
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
                      <h3 className="text-headline font-bold tracking-tight">Filters</h3>
                      {activeFilterCount > 0 && (
                        <p className="text-subhead text-muted-foreground mt-0.5">
                          {activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''} applied
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {activeFilterCount > 0 && (
                        <button
                          onClick={clearFilters}
                          className="text-subhead font-semibold text-muted-foreground hover:text-foreground touch-manipulation px-3 py-1.5 rounded-lg hover:bg-muted transition-colors"
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
                    className="w-full h-12 bg-primary text-primary-foreground font-semibold text-callout rounded-2xl hover:bg-primary/90 active:scale-[0.98] transition-[background-color,transform] will-change-transform touch-manipulation shadow-lg"
                  >
                    Apply filters
                  </button>
                </div>
              </SheetContent>
            </Sheet>

            {/* Search Bar - Desktop */}
            <div className="flex-1 min-w-[200px]">
              <SearchBar
                size="sm"
                placeholder="Search make, model..."
                redirectOnSearch={false}
                onSearch={setFilters}
              />
            </div>

            {/* Right Controls Group */}
            <div className="flex items-center gap-2">
              {/* Sort Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button 
                    className="relative flex items-center gap-1.5 h-9 px-4 bg-sidebar border border-sidebar-border rounded-full text-subhead font-semibold text-muted-foreground hover:text-foreground shadow-sm transition-colors touch-manipulation"
                  >
                    <span>Sort</span>
                    <ChevronDown className="size-3.5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-52 bg-sidebar border border-sidebar-border rounded-lg shadow-lg p-1.5">
                  {SORT_OPTIONS.map((option) => (
                    <DropdownMenuItem
                      key={option.value}
                      onClick={() => setSort(option.value)}
                      className={cn(
                        "text-subhead tracking-tight cursor-pointer rounded-md px-3 py-2 transition-colors duration-100",
                        (params.sortBy || 'relevance') === option.value
                          ? "bg-muted text-foreground font-semibold"
                          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                      )}
                    >
                      {option.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* View Toggle */}
              <div className="flex items-center h-9 px-1 bg-sidebar border border-sidebar-border rounded-full shadow-sm">
                <button
                  onClick={() => onViewModeChange('grid')}
                  className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-full transition-colors touch-manipulation",
                    viewMode === 'grid' ? "text-foreground bg-muted/50" : "text-muted-foreground hover:text-foreground"
                  )}
                  title="Grid view"
                >
                  <LayoutGrid className="size-4" />
                </button>
                <button
                  onClick={() => onViewModeChange('minimal')}
                  className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-full transition-colors touch-manipulation",
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

          {/* Dynamic Island - Collapsible container */}
          <div className="mt-3">
          {/* Natural View - Horizontal quick-select (when collapsed) */}
          {!islandExpanded && (
            <div className="flex items-center gap-3 h-10">
              {/* Quick-Select Options */}
              <div className="flex-1 flex items-center gap-2 overflow-x-auto scrollbar-hide">
                {/* Make Quick-Select */}
                {(facets?.make ?? []).length > 0 && (
                  <>
                    <span className="text-caption1 font-bold uppercase tracking-wider text-muted-foreground/60 whitespace-nowrap shrink-0">
                      Makes
                    </span>
                    {/* Selected makes as removable pills */}
                    {(params.make ?? []).map((makeValue) => {
                      const makeData = (facets?.make ?? []).find(m => m.value === makeValue);
                      return (
                        <button
                          key={makeValue}
                          onClick={() => toggleMake(makeValue)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-subhead font-semibold text-foreground bg-muted hover:bg-muted/70 rounded-full transition-all whitespace-nowrap shrink-0"
                        >
                          <span>{makeData?.label ?? makeValue}</span>
                          <X className="size-3.5" />
                        </button>
                      );
                    })}
                    {/* Unselected makes as quick pills */}
                    {!params.make?.length && (facets?.make ?? []).slice(0, VISIBLE_COUNT).map((make) => (
                      <button
                        key={make.value}
                        onClick={() => setFilters({ make: [make.value], model: undefined, trim: undefined })}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-subhead text-foreground/80 hover:text-foreground bg-muted/40 hover:bg-muted/60 rounded-full transition-all whitespace-nowrap shrink-0"
                      >
                        <span>{make.label}</span>
                        <span className="text-caption1 text-muted-foreground tabular-nums">{make.count}</span>
                      </button>
                    ))}
                  </>
                )}

                {/* Model Quick-Select - when make selected */}
                {params.make?.length && (facets?.model ?? []).length > 0 && (
                  <>
                    <span className="text-caption1 font-bold uppercase tracking-wider text-muted-foreground/60 whitespace-nowrap shrink-0">
                      Models
                    </span>
                    {/* Selected models as removable pills */}
                    {(params.model ?? []).map((modelValue) => {
                      const modelData = (facets?.model ?? []).find(m => m.value === modelValue);
                      return (
                        <button
                          key={modelValue}
                          onClick={() => toggleModel(modelValue)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-subhead font-semibold text-foreground bg-muted hover:bg-muted/70 rounded-full transition-all whitespace-nowrap shrink-0"
                        >
                          <span>{modelData?.label ?? modelValue}</span>
                          <X className="size-3.5" />
                        </button>
                      );
                    })}
                    {/* Unselected models as quick pills */}
                    {!params.model?.length && (facets?.model ?? []).slice(0, VISIBLE_COUNT).map((model) => (
                      <button
                        key={model.value}
                        onClick={() => setFilters({ model: [model.value], trim: undefined })}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-subhead text-foreground/80 hover:text-foreground bg-muted/40 hover:bg-muted/60 rounded-full transition-all whitespace-nowrap shrink-0"
                      >
                        <span>{model.label}</span>
                        <span className="text-caption1 text-muted-foreground tabular-nums">{model.count}</span>
                      </button>
                    ))}
                  </>
                )}

                {/* Trim Quick-Select - when make & model selected */}
                {params.make?.length && params.model?.length && (facets?.trim ?? []).length > 0 && (
                  <>
                    <span className="text-caption1 font-bold uppercase tracking-wider text-muted-foreground/60 whitespace-nowrap shrink-0">
                      Trims
                    </span>
                    {/* Selected trims as removable pills */}
                    {(params.trim ?? []).map((trimValue) => {
                      const trimData = (facets?.trim ?? []).find(t => t.value === trimValue);
                      return (
                        <button
                          key={trimValue}
                          onClick={() => toggleTrim(trimValue)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-subhead font-semibold text-foreground bg-muted hover:bg-muted/70 rounded-full transition-all whitespace-nowrap shrink-0"
                        >
                          <span>{trimData?.label ?? trimValue}</span>
                          <X className="size-3.5" />
                        </button>
                      );
                    })}
                    {/* Unselected trims as quick pills */}
                    {!params.trim?.length && (facets?.trim ?? []).slice(0, VISIBLE_COUNT).map((trim) => (
                      <button
                        key={trim.value}
                        onClick={() => setFilters({ trim: [trim.value] })}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-subhead text-foreground/80 hover:text-foreground bg-muted/40 hover:bg-muted/60 rounded-full transition-all whitespace-nowrap shrink-0"
                      >
                        <span>{trim.label}</span>
                        <span className="text-caption1 text-muted-foreground tabular-nums">{trim.count}</span>
                      </button>
                    ))}
                  </>
                )}

                {/* Other active filter chips */}
                {activeChips.filter(c => !['make', 'model', 'trim'].includes(c.key)).map((chip) => (
                  <button
                    key={chip.key}
                    onClick={() => handleChipRemove(chip.key)}
                    className="group flex items-center gap-1.5 px-3 py-1.5 text-caption1 font-semibold bg-muted/50 text-foreground/80 hover:bg-muted/70 hover:text-foreground rounded-full transition-colors whitespace-nowrap shrink-0"
                  >
                    <span>{chip.label}</span>
                    <X className="h-3 w-3 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </button>
                ))}
              </div>

              {/* View More button */}
              <button
                onClick={() => setIslandExpanded(true)}
                className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-subhead font-semibold text-muted-foreground hover:text-foreground bg-muted/40 hover:bg-muted/60 rounded-full transition-all"
              >
                <span>View more</span>
                <ChevronDown className="size-3.5" />
              </button>

              {/* Clear All */}
              <div className="shrink-0 ml-auto flex items-center gap-2">
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="px-2.5 py-1 text-caption1 font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-full transition-colors"
                  >
                    Clear all
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Expanded State - Full selection UI */}
          {islandExpanded && (
            <div className="p-4 bg-sidebar border border-sidebar-border rounded-xl space-y-4 animate-in fade-in-0 slide-in-from-top-2 duration-200">
              {/* Header with collapse button */}
              <div className="flex items-center justify-between pb-2">
                <div className="flex items-center gap-3">
                  <span className="text-subhead font-semibold text-foreground">Refine your search</span>
                </div>
                <div className="flex items-center gap-2">
                  {activeFilterCount > 0 && (
                    <button
                      onClick={clearFilters}
                      className="px-2 py-1 text-caption1 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Clear all
                    </button>
                  )}
                  <button
                    onClick={() => setIslandExpanded(false)}
                    className="flex items-center gap-1.5 px-2 py-1 text-caption1 text-muted-foreground hover:text-foreground rounded transition-colors"
                  >
                    <span>Collapse</span>
                    <ChevronDown className="size-3.5 rotate-180" />
                  </button>
                </div>
              </div>
              {/* Makes Row */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-caption1 font-bold uppercase tracking-wider text-muted-foreground/60 whitespace-nowrap shrink-0">
                  Makes
                </span>
                <>
                  {/* Selected makes */}
                  {(params.make ?? []).map((makeValue) => {
                      const makeData = (facets?.make ?? []).find(m => m.value === makeValue);
                      return (
                        <button
                          key={makeValue}
                          onClick={() => toggleMake(makeValue)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-subhead font-semibold text-foreground bg-muted hover:bg-muted/70 rounded-full transition-all"
                        >
                          <span>{makeData?.label ?? makeValue}</span>
                          <X className="size-3.5" />
                        </button>
                      );
                    })}
                    {/* Unselected makes */}
                    {(facets?.make ?? []).filter(m => !(params.make ?? []).includes(m.value)).slice(0, 8).map((make) => (
                      <button
                        key={make.value}
                        onClick={() => toggleMake(make.value)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-subhead text-muted-foreground hover:text-foreground bg-muted/30 hover:bg-muted/50 rounded-full transition-all"
                      >
                        <span>{make.label}</span>
                        <span className="text-caption1 text-muted-foreground/60 tabular-nums">{make.count}</span>
                      </button>
                    ))}
                    {/* View all button */}
                    {(facets?.make ?? []).length > 8 && (
                      <Popover open={makesOpen} onOpenChange={setMakesOpen}>
                        <PopoverTrigger asChild>
                          <button className="flex items-center gap-1.5 px-3 py-1.5 text-subhead text-muted-foreground hover:text-foreground rounded-full transition-all">
                            <span>View all ({(facets?.make ?? []).length})</span>
                            <ChevronDown className={cn("size-3.5 transition-transform", makesOpen && "rotate-180")} />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent 
                          className="w-[280px] p-0 bg-sidebar border-sidebar-border rounded-lg shadow-lg overflow-hidden" 
                          align="start"
                          sideOffset={8}
                        >
                          <Command className="bg-transparent">
                            <CommandInput placeholder="Search makes..." className="h-10 border-b border-sidebar-border text-subhead" />
                            <CommandList className="max-h-[280px]">
                              <CommandEmpty className="py-4 text-center text-subhead text-muted-foreground">No makes found.</CommandEmpty>
                              <CommandGroup className="p-1.5">
                                {(facets?.make ?? []).map((make) => {
                                  const isSelected = params.make?.includes(make.value) ?? false;
                                  return (
                                    <CommandItem
                                      key={make.value}
                                      value={make.label}
                                      onSelect={() => toggleMake(make.value)}
                                      className={cn(
                                        "flex items-center justify-between gap-3 px-3 py-2.5 text-subhead tracking-tight rounded-md cursor-pointer transition-colors duration-100",
                                        isSelected ? "bg-muted text-foreground font-semibold" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                                      )}
                                    >
                                      <span className="flex-1 truncate">{make.label}</span>
                                      <span className="text-caption1 text-muted-foreground/60 tabular-nums shrink-0">{make.count}</span>
                                    </CommandItem>
                                  );
                                })}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    )}
                  {/* Clear makes */}
                  {(params.make?.length ?? 0) > 0 && (
                    <button
                      onClick={() => setFilters({ make: undefined, model: undefined, trim: undefined })}
                      className="text-caption1 text-muted-foreground hover:text-foreground px-2"
                    >
                      Clear
                    </button>
                  )}
                </>
              </div>

              {/* Models Row - Only show when makes selected */}
              {params.make?.length && (
                <div className="flex items-center gap-2 flex-wrap pt-3 border-t border-sidebar-border/50">
                  <span className="text-caption1 font-bold uppercase tracking-wider text-muted-foreground/60 whitespace-nowrap shrink-0">
                    Models
                  </span>
                  {(facets?.model ?? []).length > 0 ? (
                    <>
                      {/* Selected models */}
                      {(params.model ?? []).map((modelValue) => {
                        const modelData = (facets?.model ?? []).find(m => m.value === modelValue);
                        return (
                          <button
                            key={modelValue}
                            onClick={() => toggleModel(modelValue)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-subhead font-semibold text-foreground bg-muted hover:bg-muted/70 rounded-full transition-all"
                          >
                            <span>{modelData?.label ?? modelValue}</span>
                            <X className="size-3.5" />
                          </button>
                        );
                      })}
                      {/* Unselected models */}
                      {(facets?.model ?? []).filter(m => !(params.model ?? []).includes(m.value)).slice(0, 8).map((model) => (
                        <button
                          key={model.value}
                          onClick={() => toggleModel(model.value)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-subhead text-muted-foreground hover:text-foreground bg-muted/30 hover:bg-muted/50 rounded-full transition-all"
                        >
                          <span>{model.label}</span>
                          <span className="text-caption1 text-muted-foreground/60 tabular-nums">{model.count}</span>
                        </button>
                      ))}
                      {/* View all button */}
                      {(facets?.model ?? []).length > 8 && (
                        <Popover open={modelsOpen} onOpenChange={setModelsOpen}>
                          <PopoverTrigger asChild>
                            <button className="flex items-center gap-1.5 px-3 py-1.5 text-subhead text-muted-foreground hover:text-foreground rounded-full transition-all">
                              <span>View all ({(facets?.model ?? []).length})</span>
                              <ChevronDown className={cn("size-3.5 transition-transform", modelsOpen && "rotate-180")} />
                            </button>
                          </PopoverTrigger>
                          <PopoverContent 
                            className="w-[280px] p-0 bg-sidebar border-sidebar-border rounded-lg shadow-lg overflow-hidden" 
                            align="start"
                            sideOffset={8}
                          >
                            <Command className="bg-transparent">
                              <CommandInput placeholder="Search models..." className="h-10 border-b border-sidebar-border text-subhead" />
                              <CommandList className="max-h-[280px]">
                                <CommandEmpty className="py-4 text-center text-subhead text-muted-foreground">No models found.</CommandEmpty>
                                <CommandGroup className="p-1.5">
                                  {(facets?.model ?? []).map((model) => {
                                    const isSelected = params.model?.includes(model.value) ?? false;
                                    return (
                                      <CommandItem
                                        key={model.value}
                                        value={model.label}
                                        onSelect={() => toggleModel(model.value)}
                                        className={cn(
                                          "flex items-center justify-between gap-3 px-3 py-2.5 text-subhead tracking-tight rounded-md cursor-pointer transition-colors duration-100",
                                          isSelected ? "bg-muted text-foreground font-semibold" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                                        )}
                                      >
                                        <span className="flex-1 truncate">{model.label}</span>
                                        <span className="text-caption1 text-muted-foreground/60 tabular-nums shrink-0">{model.count}</span>
                                      </CommandItem>
                                    );
                                  })}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      )}
                      {/* Clear models */}
                      {(params.model?.length ?? 0) > 0 && (
                        <button
                          onClick={() => setFilters({ model: undefined, trim: undefined })}
                          className="text-caption1 text-muted-foreground hover:text-foreground px-2"
                        >
                          Clear
                        </button>
                      )}
                    </>
                  ) : (
                    <span className="text-subhead text-muted-foreground/50">No models available</span>
                  )}
                </div>
              )}

              {/* Trims Row - Only show when makes and models selected */}
              {params.make?.length && params.model?.length && (
                <div className="flex items-center gap-2 flex-wrap pt-3 border-t border-sidebar-border/50">
                  <span className="text-caption1 font-bold uppercase tracking-wider text-muted-foreground/60 whitespace-nowrap shrink-0">
                    Trims
                  </span>
                  {(facets?.trim ?? []).length > 0 ? (
                    <>
                      {/* Selected trims */}
                      {(params.trim ?? []).map((trimValue) => {
                        const trimData = (facets?.trim ?? []).find(t => t.value === trimValue);
                        return (
                          <button
                            key={trimValue}
                            onClick={() => toggleTrim(trimValue)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-subhead font-semibold text-foreground bg-muted hover:bg-muted/70 rounded-full transition-all"
                          >
                            <span>{trimData?.label ?? trimValue}</span>
                            <X className="size-3.5" />
                          </button>
                        );
                      })}
                      {/* Unselected trims */}
                      {(facets?.trim ?? []).filter(t => !(params.trim ?? []).includes(t.value)).slice(0, 8).map((trim) => (
                        <button
                          key={trim.value}
                          onClick={() => toggleTrim(trim.value)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-subhead text-muted-foreground hover:text-foreground bg-muted/30 hover:bg-muted/50 rounded-full transition-all"
                        >
                          <span>{trim.label}</span>
                          <span className="text-caption1 text-muted-foreground/60 tabular-nums">{trim.count}</span>
                        </button>
                      ))}
                      {/* View all button */}
                      {(facets?.trim ?? []).length > 8 && (
                        <Popover open={trimsOpen} onOpenChange={setTrimsOpen}>
                          <PopoverTrigger asChild>
                            <button className="flex items-center gap-1.5 px-3 py-1.5 text-subhead text-muted-foreground hover:text-foreground rounded-full transition-all">
                              <span>View all ({(facets?.trim ?? []).length})</span>
                              <ChevronDown className={cn("size-3.5 transition-transform", trimsOpen && "rotate-180")} />
                            </button>
                          </PopoverTrigger>
                          <PopoverContent 
                            className="w-[280px] p-0 bg-sidebar border-sidebar-border rounded-lg shadow-lg overflow-hidden" 
                            align="start"
                            sideOffset={8}
                          >
                            <Command className="bg-transparent">
                              <CommandInput placeholder="Search trims..." className="h-10 border-b border-sidebar-border text-subhead" />
                              <CommandList className="max-h-[280px]">
                                <CommandEmpty className="py-4 text-center text-subhead text-muted-foreground">No trims found.</CommandEmpty>
                                <CommandGroup className="p-1.5">
                                  {(facets?.trim ?? []).map((trim) => {
                                    const isSelected = params.trim?.includes(trim.value) ?? false;
                                    return (
                                      <CommandItem
                                        key={trim.value}
                                        value={trim.label}
                                        onSelect={() => toggleTrim(trim.value)}
                                        className={cn(
                                          "flex items-center justify-between gap-3 px-3 py-2.5 text-subhead tracking-tight rounded-md cursor-pointer transition-colors duration-100",
                                          isSelected ? "bg-muted text-foreground font-semibold" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                                        )}
                                      >
                                        <span className="flex-1 truncate">{trim.label}</span>
                                        <span className="text-caption1 text-muted-foreground/60 tabular-nums shrink-0">{trim.count}</span>
                                      </CommandItem>
                                    );
                                  })}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      )}
                      {/* Clear trims */}
                      {(params.trim?.length ?? 0) > 0 && (
                        <button
                          onClick={() => setFilters({ trim: undefined })}
                          className="text-caption1 text-muted-foreground hover:text-foreground px-2"
                        >
                          Clear
                        </button>
                      )}
                    </>
                  ) : (
                    <span className="text-subhead text-muted-foreground/50">No trims available</span>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
        </div>
      </header>
    </>
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
  if (params.transmission?.length) {
    chips.push({ key: 'transmission', label: params.transmission.join(', ') });
  }
  if (params.engineSize?.length) {
    chips.push({ key: 'engineSize', label: params.engineSize.join(', ') });
  }
  if (params.exteriorColor?.length) {
    chips.push({ key: 'exteriorColor', label: `Exterior: ${params.exteriorColor.join(', ')}` });
  }
  if (params.interiorColor?.length) {
    chips.push({ key: 'interiorColor', label: `Interior: ${params.interiorColor.join(', ')}` });
  }
  if (params.specs?.length) {
    chips.push({ key: 'specs', label: params.specs.join(', ') });
  }
  if (params.tags?.length) {
    chips.push({ key: 'tags', label: params.tags.map(t => t.replace(/([A-Z])/g, ' $1').trim()).join(', ') });
  }
  if (params.extras?.length) {
    chips.push({ key: 'extras', label: params.extras.map(e => e.replace(/([A-Z])/g, ' $1').trim()).join(', ') });
  }
  if (params.isNegotiable) {
    chips.push({ key: 'isNegotiable', label: 'Negotiable' });
  }
  if (params.sellerType) {
    chips.push({ key: 'sellerType', label: params.sellerType === 'dealer' ? 'Dealers' : 'Private' });
  }
  if (params.exportStatus?.length) {
    chips.push({ key: 'exportStatus', label: `Export: ${params.exportStatus.join(', ')}` });
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

function ListingsHeaderSkeletonComponent() {
  return (
    <>
      {/* ===== MOBILE SKELETON ===== */}
      <div className="md:hidden z-30 bg-background border-b border-border/20">
        <div className="py-2.5 space-y-2">
          {/* Row 1: Search bar + controls */}
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-10 rounded-full shrink-0" />
            <Skeleton className="flex-1 h-10 rounded-full" />
            <Skeleton className="h-10 w-10 rounded-full shrink-0" />
          </div>
          {/* Row 2: Filter context */}
          <div className="space-y-1.5">
            <Skeleton className="h-3 w-20 rounded-md" />
            <div className="flex items-center gap-2 overflow-hidden">
              <Skeleton className="h-4 w-24 rounded-md shrink-0" />
              <Skeleton className="h-4 w-16 rounded-md shrink-0" />
              <Skeleton className="h-4 w-20 rounded-md shrink-0" />
              <Skeleton className="h-4 w-10 rounded-md shrink-0 ml-auto" />
            </div>
          </div>
        </div>
      </div>

      {/* ===== DESKTOP SKELETON ===== */}
      <header className="hidden md:block z-30 bg-background border-b border-transparent [&:not(:first-child)]:border-sidebar-border/50">
        <div className="py-4">
          {/* Search Row */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Results count skeleton */}
            <Skeleton className="h-9 w-20 rounded-full" />

            {/* Search bar skeleton */}
            <Skeleton className="flex-1 min-w-[200px] h-9 rounded-full" />

            {/* Right controls */}
            <div className="flex items-center gap-2">
              <Skeleton className="h-9 w-20 rounded-full" />
              <Skeleton className="h-9 w-24 rounded-full" />
            </div>
          </div>

          {/* Filter summary skeleton */}
          <div className="mt-3 space-y-2">
            <Skeleton className="h-3.5 w-24 rounded-md" />
            <div className="flex items-center gap-2 overflow-hidden">
              <Skeleton className="h-5 w-20 rounded-md shrink-0" />
              <Skeleton className="h-5 w-24 rounded-md shrink-0" />
              <Skeleton className="h-5 w-18 rounded-md shrink-0" />
              <Skeleton className="h-5 w-12 rounded-md shrink-0" />
            </div>
          </div>
        </div>
      </header>
    </>
  );
}

ListingsHeader.Skeleton = ListingsHeaderSkeletonComponent;
