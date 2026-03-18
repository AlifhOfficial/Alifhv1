/**
 * Inventory/Listings Page - Revvup Design System
 * Clean compact layout
 * Note: Navbar is rendered by the public layout wrapper
 * 
 * Architecture: Server-side data fetch for instant display
 */

import { Suspense } from 'react';
import { Metadata } from 'next';
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

/**
 * Determine if a filter combination should be noindexed
 * Keep indexable: single filters (make, emirate, specs, black, bodyType)
 * Noindex: multiple filters, pagination, price/year ranges, complex combinations
 */
function shouldNoindex(params: Record<string, string | string[] | undefined>): boolean {
  const paramKeys = Object.keys(params).filter(
    (key) => params[key] !== undefined && params[key] !== ''
  );

  // No filters = indexable
  if (paramKeys.length === 0) return false;

  // Single high-value filters = indexable
  const indexableParams = ['make', 'emirate', 'specs', 'black', 'bodyType'];
  if (
    paramKeys.length === 1 &&
    indexableParams.includes(paramKeys[0]!)
  ) {
    return false;
  }

  // Pagination = noindex
  if (params.page && params.page !== '1') return true;

  // Price/year ranges = noindex
  if (params.minPrice || params.maxPrice || params.minYear || params.maxYear) return true;

  // Multiple filters = noindex (too specific)
  if (paramKeys.length > 1) return true;

  // Everything else = noindex
  return true;
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const params = await searchParams;
  const noindex = shouldNoindex(params);
  const ogImage = '/opengraph-image';

  const baseMetadata: Metadata = {
    title: 'Used Cars for Sale in Dubai | No Ads | Revvup',
    description: 'Browse used cars in Dubai. No sponsored ads. Free for private sellers. Book test drives online. New and used cars for sale in UAE.',
    keywords: 'used cars for sale dubai, buy used car dubai, second hand cars dubai, cars for sale uae, used cars dubai, car marketplace dubai, buy car dubai, dubai used cars, 2nd hand cars dubai, dubizzle cars dubai, dubicars uae, yallmotors, cars24 dubai, shoofi cars, ayeshi uae, automotive classifieds uae, car shopping dubai',
    openGraph: {
      title: 'Used Cars for Sale in Dubai | No Ads | Revvup',
      description: 'Browse used cars in Dubai. No sponsored ads. Buy and sell cars on Revvup. Free. Forever.',
      type: 'website',
      url: 'https://revvup.ae/listings',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: 'Revvup UAE car marketplace — buy and sell cars free',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Used Cars for Sale in Dubai | No Ads | Revvup',
      description: 'Browse used cars in Dubai. No sponsored ads. Buy and sell cars on Revvup. Free. Forever.',
      images: ['/twitter-image'],
    },
    alternates: {
      canonical: 'https://revvup.ae/listings',
    },
  };

  // Add noindex for low-value filter combinations
  if (noindex) {
    baseMetadata.robots = {
      index: false,
      follow: true,
    };
  }

  return baseMetadata;
}

// Revalidate every 5 minutes (300 seconds)
export const revalidate = 300;

export default async function InventoryPage({ searchParams }: PageProps) {
  // Parse search params for server-side fetch
  const params = await searchParams;
  const urlParams = new URLSearchParams();
  
  // Convert params to URLSearchParams
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      if (Array.isArray(value)) {
        value.forEach(v => urlParams.append(key, v));
      } else {
        urlParams.set(key, value);
      }
    }
  });
  
  // Parse to search params format
  const searchParamsObj = urlToSearchParams(urlParams);
  const limit = searchParamsObj.limit || 30;
  if (!searchParamsObj.cursor && searchParamsObj.pageToken) {
    searchParamsObj.cursor = searchParamsObj.pageToken;
  }
  
  // Normalize sortBy to 'relevance' if not specified
  if (!searchParamsObj.sortBy) {
    searchParamsObj.sortBy = 'relevance';
  }

  const canUseServerData = (searchParamsObj.page || 1) <= 1 || Boolean(searchParamsObj.cursor || searchParamsObj.pageToken);
  
  // Fetch initial data server-side for instant display
  let initialData: SearchResponse | null = null;
  
  try {
    if (canUseServerData) {
      const [searchResult, facets] = await Promise.all([
        searchListings({ ...searchParamsObj, limit }, { fast: true }),
        getCachedSearchFacets(searchParamsObj),
      ]);
      
      // Cast to web's SearchResponse type (database type is compatible)
      initialData = {
        ...searchResult,
        facets,
      } as SearchResponse;
    }
  } catch (error) {
    console.error('[ListingsPage] Failed to fetch initial data:', error);
    // Client will fetch if server fails
  }
  
  return (
    <Suspense fallback={<PageSkeleton />}>
      <ListingsView initialData={initialData} serverDriven={canUseServerData} hydrateFavoritesStatus={false} />
    </Suspense>
  );
}

function PageSkeleton() {
  return (
    <div className="min-h-screen bg-background pt-16 sm:pt-20 overflow-y-auto scrollbar-hide">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="hidden lg:grid h-[calc(100dvh-4rem)] grid-cols-[16rem_minmax(0,1fr)] gap-x-6 overflow-hidden">
          <div className="h-full rounded-2xl bg-muted/10" />
          <main className="grid min-h-0 grid-rows-[auto_minmax(0,1fr)]">
            <div className="h-20 bg-muted/20 rounded-lg animate-pulse" />
            <div className="mt-4 min-h-0 space-y-3 overflow-hidden sm:mt-6 md:mt-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-32 bg-muted/20 rounded-lg animate-pulse" />
              ))}
            </div>
          </main>
        </div>
        <div className="lg:hidden">
          <main className="min-w-0 overflow-y-auto scrollbar-hide">
            <div className="h-20 bg-muted/20 rounded-lg animate-pulse" />
            <div className="mt-4 space-y-3 sm:mt-6 md:mt-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-32 bg-muted/20 rounded-lg animate-pulse" />
              ))}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
