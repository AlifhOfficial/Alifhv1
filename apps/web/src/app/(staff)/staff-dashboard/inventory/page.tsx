/**
 * Staff Inventory Browse Page
 * Full listings browse view embedded in staff dashboard
 * Allows staff to browse all inventory without leaving the dashboard
 */

import { Suspense } from 'react';
import { ListingsView } from '@/components/listings/listings-view';
import {
  searchListings,
  urlToSearchParams,
} from '@alifh/database';
import { getCachedSearchFacets } from '@/lib/search-cache';
import type { SearchResponse } from '@/lib/search-utils';

interface PageProps {
  searchParams: Promise<{
    [key: string]: string | string[] | undefined;
  }>;
}

export default async function StaffInventoryPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const urlParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      if (Array.isArray(value)) {
        value.forEach((v) => urlParams.append(key, v));
      } else {
        urlParams.set(key, value);
      }
    }
  });

  const searchParamsObj = urlToSearchParams(urlParams);
  const limit = searchParamsObj.limit || 30;

  if (!searchParamsObj.sortBy) {
    searchParamsObj.sortBy = 'relevance';
  }

  let initialData: SearchResponse | null = null;

  try {
    const [searchResult, facets] = await Promise.all([
      searchListings(
        { ...searchParamsObj, limit },
        {
          skipFacets: true,
          skipTotalCount: false,
        }
      ),
      getCachedSearchFacets(searchParamsObj),
    ]);

    initialData = {
      ...searchResult,
      facets,
    } as SearchResponse;
  } catch (error) {
    console.error('[StaffInventoryPage] Failed to fetch initial data:', error);
  }

  return (
    <Suspense fallback={<PageSkeleton />}>
      {/* DashboardContent wraps pages in p-4; cancel all margins for full-bleed listings */}
      <div className="-mx-4 -mt-4 -mb-4">
        <ListingsView
          embedded
          defaultFiltersOpen={false}
          initialData={initialData}
          serverDriven
          hydrateFavoritesStatus={false}
        />
      </div>
    </Suspense>
  );
}

function PageSkeleton() {
  return (
    <div className="-mx-4 -mt-4 -mb-4 min-h-screen bg-background">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex">
          {/* Sidebar skeleton - matches ListingsSidebar structure */}
          <div className="w-64 flex-shrink-0 hidden lg:block" />
          
          {/* Content area */}
          <main className="flex-1 min-w-0 lg:pl-6">
            {/* Header skeleton */}
            <div className="h-20 bg-muted/20 rounded-lg animate-pulse" />
            
            {/* Cards skeleton - matches grid layout */}
            <div className="mt-4 sm:mt-6 py-4 sm:py-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="h-64 bg-muted/20 rounded-lg animate-pulse" />
              ))}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
