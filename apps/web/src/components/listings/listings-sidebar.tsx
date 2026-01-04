/**
 * ListingsSidebar - Desktop filter sidebar
 * Fixed position sidebar for the listings page
 */

'use client';

import { FilterSidebar } from '@/components/search/filter-sidebar';
import { cn } from '@/lib/utils';
import { PanelLeftClose } from 'lucide-react';
import type { SearchParams, SearchFacets } from '@/lib/search-utils';

interface ListingsSidebarProps {
  /** Search params */
  params: SearchParams;
  /** Facets for filters */
  facets: SearchFacets | null;
  /** Number of active filters */
  activeFilterCount: number;
  /** Loading state */
  isLoading: boolean;
  /** When true, removes top padding for embedding in dashboards */
  embedded?: boolean;
  /** Sidebar open state */
  sidebarOpen: boolean;
  /** Toggle sidebar */
  onSidebarToggle: (open: boolean) => void;
  /** Set filters callback */
  setFilters: (filters: Partial<SearchParams>) => void;
  /** Clear filters callback */
  clearFilters: () => void;
}

export function ListingsSidebar({
  params,
  facets,
  activeFilterCount,
  isLoading,
  embedded = false,
  sidebarOpen,
  onSidebarToggle,
  setFilters,
  clearFilters,
}: ListingsSidebarProps) {
  if (!sidebarOpen) return null;

  return (
    <aside className={cn(
      "hidden lg:block w-64 flex-shrink-0",
      "border-r border-border/40"
    )}>
      <div className={cn(
        "sticky overflow-y-auto pr-6 py-4 sm:py-6",
        embedded 
          ? "top-0 max-h-screen"
          : "top-14 sm:top-16 max-h-[calc(100vh-3.5rem)] sm:max-h-[calc(100vh-4rem)]"
      )}>
        {/* Header with collapse button */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold tracking-tight">Filters</h2>
          <button
            onClick={() => onSidebarToggle(false)}
            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
            title="Hide filters"
          >
            <PanelLeftClose className="h-4 w-4" />
          </button>
        </div>
        
        <FilterSidebar
          params={params}
          facets={facets}
          isLoading={isLoading}
          onFilterChange={setFilters}
          onClearFilters={clearFilters}
          activeFilterCount={activeFilterCount}
        />
      </div>
    </aside>
  );
}
