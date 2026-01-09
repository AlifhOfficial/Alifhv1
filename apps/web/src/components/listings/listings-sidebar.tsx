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
  /** Clear all filters and sort callback */
  onClearAll: () => void;
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
  onClearAll,
}: ListingsSidebarProps) {
  if (!sidebarOpen) return null;

  return (
    <aside className="hidden lg:block w-72 flex-shrink-0">
      <div className={cn(
        "sticky flex flex-col",
        embedded 
          ? "top-0 max-h-screen"
          : "top-14 sm:top-16 max-h-[calc(100vh-3.5rem)] sm:max-h-[calc(100vh-4rem)]"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between py-5 pr-6 flex-shrink-0 border-b border-border/40">
          <div className="flex items-center gap-2">
            <h2 className="text-[15px] font-bold tracking-tight text-foreground">Filters</h2>
            {activeFilterCount > 0 && (
              <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-primary/10 text-primary">
                {activeFilterCount}
              </span>
            )}
          </div>
          <button
            onClick={() => onSidebarToggle(false)}
            className="p-2 text-muted-foreground/70 hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors"
            title="Hide filters"
          >
            <PanelLeftClose className="h-4 w-4" />
          </button>
        </div>
        
        {/* Scrollable Filter Content */}
        <div className="flex-1 overflow-y-auto pr-6 py-4">
          <FilterSidebar
            params={params}
            facets={facets}
            isLoading={isLoading}
            onFilterChange={setFilters}
            onClearFilters={onClearAll}
            activeFilterCount={activeFilterCount}
          />
        </div>
      </div>
    </aside>
  );
}
