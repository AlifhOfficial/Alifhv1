/**
 * ListingsSidebar - Desktop filter sidebar
 * Fixed position sidebar for the listings page
 */

'use client';

import { FilterSidebar } from '@/components/search/filter-sidebar';
import { Skeleton } from '@/components/ui/skeleton';
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
  return (
    <aside className={cn(
      "w-64 flex-shrink-0 flex flex-col",
      embedded 
        ? "h-screen sticky top-0"
        : "h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)] sticky top-14 sm:top-16"
    )}>
      {/* Header - Fixed */}
      <div className="flex items-center justify-between py-4 pr-6 flex-shrink-0">
        <div className="flex items-center gap-3">
          <h2 className="text-base font-bold tracking-tight text-foreground">Filters</h2>
        </div>
        <button
          onClick={() => onSidebarToggle(false)}
          className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl transition-colors"
          title="Hide filters"
        >
          <PanelLeftClose className="h-4 w-4" />
        </button>
      </div>
      
      {/* Scrollable Filter Content */}
      <div className="flex-1 overflow-y-auto overscroll-contain pr-6 py-4">
        <FilterSidebar
          params={params}
          facets={facets}
          isLoading={isLoading}
          onFilterChange={setFilters}
          onClearFilters={onClearAll}
          activeFilterCount={activeFilterCount}
        />
      </div>
    </aside>
  );
}

// ============================================================================
// SKELETON
// ============================================================================

interface ListingsSidebarSkeletonProps {
  embedded?: boolean;
}

function ListingsSidebarSkeletonComponent({ embedded = false }: ListingsSidebarSkeletonProps) {
  return (
    <aside className={cn(
      "w-64 flex-shrink-0 flex flex-col",
      embedded 
        ? "h-screen sticky top-0"
        : "h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)] sticky top-14 sm:top-16"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between py-4 pr-6 flex-shrink-0 border-b border-border/50">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-8 w-8 rounded-xl" />
      </div>
      
      {/* Filter sections skeleton */}
      <div className="flex-1 overflow-hidden pr-6 py-4 space-y-6">
        {/* Filter section 1 */}
        <div className="space-y-3">
          <Skeleton className="h-4 w-20" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-full rounded-md" />
            <Skeleton className="h-8 w-full rounded-md" />
            <Skeleton className="h-8 w-full rounded-md" />
          </div>
        </div>

        {/* Filter section 2 */}
        <div className="space-y-3">
          <Skeleton className="h-4 w-16" />
          <div className="flex gap-2">
            <Skeleton className="h-9 flex-1 rounded-md" />
            <Skeleton className="h-9 flex-1 rounded-md" />
          </div>
        </div>

        {/* Filter section 3 */}
        <div className="space-y-3">
          <Skeleton className="h-4 w-24" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-full rounded-md" />
            <Skeleton className="h-8 w-full rounded-md" />
          </div>
        </div>

        {/* Filter section 4 */}
        <div className="space-y-3">
          <Skeleton className="h-4 w-20" />
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-7 w-16 rounded-full" />
            <Skeleton className="h-7 w-20 rounded-full" />
            <Skeleton className="h-7 w-14 rounded-full" />
          </div>
        </div>
      </div>
    </aside>
  );
}

ListingsSidebar.Skeleton = ListingsSidebarSkeletonComponent;
