/**
 * Inventory/Listings Page Client Component
 * Contains all interactive client-side logic
 */

'use client';

import { useState } from 'react';
import { CarCard, CarListItem, CarCardSkeleton, CarListItemSkeleton } from '@/components/inventory';
import { SearchBar } from '@/components/search/search-bar';
import { FilterSidebar } from '@/components/search/filter-sidebar';
import { AdvancedFilters } from '@/components/search/advanced-filters';
import { useSearch } from '@/hooks/use-search';
import { LayoutGrid, List, SlidersHorizontal, X, ChevronDown, Search, PanelLeftClose, PanelLeft, CheckCircle2 } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { SORT_OPTIONS } from '@/lib/search-utils';
import { cn } from '@/lib/utils';

export function ListingsView() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list'); // Default to list for desktop
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const {
    listings,
    facets,
    meta,
    params,
    activeFilterCount,
    isLoading,
    isFetching,
    error,
    setQuery,
    setFilters,
    clearFilters,
    setSort,
    loadMore,
  } = useSearch({ defaultLimit: 30 });

  const activeChips = getActiveFilterChips(params);

  return (
    <div className="min-h-screen bg-background pt-16 sm:pt-20">
      {/* Main Content */}
      <div className="max-w-[1400px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="flex gap-0">
          {/* Collapsible Sidebar - Fixed position */}
          <Collapsible open={sidebarOpen} onOpenChange={setSidebarOpen} className="hidden lg:block">
            <CollapsibleContent className="w-64 flex-shrink-0">
              <div className="fixed top-24 w-64 max-h-[calc(100vh-6rem)] overflow-y-auto pr-6 pb-8">
                <FilterSidebar
                  params={params}
                  facets={facets}
                  isLoading={isLoading}
                  onFilterChange={setFilters}
                  onClearFilters={clearFilters}
                  activeFilterCount={activeFilterCount}
                />
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Cards */}
          <main className={sidebarOpen ? "flex-1 min-w-0 lg:pl-8 lg:border-l lg:border-border/40" : "flex-1 min-w-0"}>
            {/* Sticky Search Header */}
            <div className="sticky top-14 sm:top-16 z-30 bg-background pt-3 sm:pt-4 md:pt-6 pb-3 sm:pb-4 md:pb-6">
              {/* Search Row - Minimal */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 md:gap-4 lg:gap-6">
                {/* Sidebar Toggle (Desktop) */}
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="hidden lg:flex p-2 -ml-2 text-muted-foreground hover:text-foreground transition-colors"
                  title={sidebarOpen ? 'Hide filters' : 'Show filters'}
                >
                  {sidebarOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeft className="h-4 w-4" />}
                </button>

                {/* Mobile Filters */}
                <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
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
                          setMobileFiltersOpen(false);
                        }}
                        onClearFilters={clearFilters}
                        activeFilterCount={activeFilterCount}
                      />
                    </div>
                  </SheetContent>
                </Sheet>

                {/* Results count - hidden on mobile, shows on larger screens */}
                <span className="hidden sm:inline-block text-sm text-muted-foreground tabular-nums">
                  {isLoading ? '...' : `${meta?.total ?? 0} cars`}
                </span>

                {/* Search Bar - Full width on mobile */}
                <div className="w-full sm:flex-1 order-last sm:order-none">
                  <SearchBar
                    size="sm"
                    placeholder="Search make, model, year..."
                    redirectOnSearch={false}
                    onSearch={setQuery}
                  />
                </div>

                {/* Negotiable Toggle */}
                <button
                  type="button"
                  onClick={() => setFilters({ isNegotiable: params.isNegotiable ? undefined : true })}
                  className={cn(
                    'flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm rounded-lg transition-colors',
                    params.isNegotiable
                      ? 'bg-foreground text-background'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                  )}
                >
                  {params.isNegotiable && <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
                  <span className="whitespace-nowrap">Negotiable</span>
                </button>

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

                {/* View Toggle - Desktop only, switches between grid and list */}
                <div className="hidden md:flex items-center gap-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 transition-colors ${viewMode === 'grid' ? 'text-foreground' : 'text-muted-foreground/50 hover:text-foreground'}`}
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
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

              {/* Active Chips */}
              {activeChips.length > 0 && (
                <div className="mt-3 sm:mt-4">
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                    {activeChips.map((chip) => (
                      <button
                        key={chip.key}
                        onClick={() => setFilters({ [chip.key]: undefined })}
                        className="group flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs bg-secondary/50 hover:bg-secondary rounded-full transition-colors"
                      >
                        <span>{chip.label}</span>
                        <X className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-muted-foreground group-hover:text-foreground transition-colors" />
                      </button>
                    ))}
                    <button
                      onClick={clearFilters}
                      className="px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Clear all
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-lg border border-border/30 p-8 text-center">
                <X className="w-8 h-8 text-red-500 mx-auto mb-3" />
                <p className="font-medium mb-1">Something went wrong</p>
                <p className="text-sm text-muted-foreground mb-4">{error.message}</p>
                <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                  Try again
                </Button>
              </div>
            )}

            {/* Loading */}
            {isLoading && !error && (
              <>
                {/* Mobile: always grid */}
                <div className="md:hidden grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <CarCardSkeleton key={i} />
                  ))}
                </div>
                
                {/* Desktop: respects viewMode */}
                <div className="hidden md:block">
                  {viewMode === 'grid' ? (
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-5">
                      {Array.from({ length: 8 }).map((_, i) => (
                        <CarCardSkeleton key={i} />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <CarListItemSkeleton key={i} />
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Empty */}
            {!isLoading && !error && listings.length === 0 && (
              <div className="rounded-lg border border-border/30 p-6 text-center">
                <Search className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                <p className="font-medium mb-1">No cars found</p>
                <p className="text-sm text-muted-foreground mb-4">Try adjusting your filters</p>
                {activeFilterCount > 0 && (
                  <Button variant="outline" size="sm" onClick={clearFilters}>
                    Clear filters
                  </Button>
                )}
              </div>
            )}

            {/* Results */}
            {!isLoading && !error && listings.length > 0 && (
              <>
                {/* Mobile: always grid */}
                <div className="md:hidden grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {listings.map((listing, index) => (
                    <CarCard
                      key={listing.id}
                      id={listing.id}
                      make={listing.make}
                      model={listing.model}
                      year={listing.year}
                      trim={listing.trim}
                      price={listing.price}
                      mileage={listing.mileage}
                      emirate={listing.emirate}
                      specs={listing.specs}
                      thumbnail={listing.thumbnail}
                      images={listing.images}
                      qiScore={listing.qiScore}
                      partnerName={listing.partnerName || undefined}
                      partnerLogo={listing.partnerLogo || undefined}
                      partnerVerified={listing.partnerVerified || undefined}
                      sellerName={listing.sellerName || undefined}
                      sellerAvatarUrl={listing.sellerAvatarUrl || undefined}
                      isBlackMember={listing.isBlackMember || false}
                      priority={index < 4}
                    />
                  ))}
                </div>

                {/* Desktop: respects viewMode */}
                <div className="hidden md:block">
                  {viewMode === 'grid' ? (
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-5">
                      {listings.map((listing, index) => (
                        <CarCard
                          key={listing.id}
                          id={listing.id}
                          make={listing.make}
                          model={listing.model}
                          year={listing.year}
                          trim={listing.trim}
                          price={listing.price}
                          mileage={listing.mileage}
                          emirate={listing.emirate}
                          specs={listing.specs}
                          thumbnail={listing.thumbnail}
                          images={listing.images}
                          qiScore={listing.qiScore}
                          partnerName={listing.partnerName || undefined}
                          partnerLogo={listing.partnerLogo || undefined}
                          partnerVerified={listing.partnerVerified || undefined}
                          sellerName={listing.sellerName || undefined}
                          sellerAvatarUrl={listing.sellerAvatarUrl || undefined}
                          isBlackMember={listing.isBlackMember || false}
                          priority={index < 4}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {listings.map((listing) => (
                        <CarListItem
                          key={listing.id}
                          id={listing.id}
                          make={listing.make}
                          model={listing.model}
                          year={listing.year}
                          trim={listing.trim}
                          price={listing.price}
                          mileage={listing.mileage}
                          emirate={listing.emirate}
                          specs={listing.specs}
                          thumbnail={listing.thumbnail}
                          images={listing.images}
                          qiScore={listing.qiScore}
                          partnerName={listing.partnerName || undefined}
                          partnerLogo={listing.partnerLogo || undefined}
                          partnerVerified={listing.partnerVerified || undefined}
                          sellerName={listing.sellerName || undefined}
                          sellerAvatarUrl={listing.sellerAvatarUrl || undefined}
                          isBlackMember={listing.isBlackMember || false}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {meta?.hasMore && (
                  <div className="flex justify-center pt-4 sm:pt-6 md:pt-8">
                    <Button variant="outline" size="sm" onClick={loadMore} disabled={isFetching} className="text-xs sm:text-sm">
                      {isFetching ? 'Loading...' : `Load more (${listings.length}/${meta.total})`}
                    </Button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

/**
 * Generate active filter chips for display
 */
function getActiveFilterChips(params: any): Array<{ key: string; label: string }> {
  const chips: Array<{ key: string; label: string }> = [];

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

  return chips;
}
