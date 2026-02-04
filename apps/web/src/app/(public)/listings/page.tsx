/**
 * Inventory/Listings Page - Revvup Design System
 * Clean compact layout
 * Note: Navbar is rendered by the public layout wrapper
 */

import { Suspense } from 'react';
import { Metadata } from 'next';
import { ListingsView } from '@/components/listings/listings-view';

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

  const baseMetadata: Metadata = {
    title: 'Used Cars for Sale in Dubai | VIN Shown | Revvup',
    description: 'Browse used cars in Dubai with VIN shown on every listing. No sponsored ads. Free for private sellers. Book test drives online. New and used cars for sale in UAE.',
    keywords: 'used cars for sale dubai, buy used car dubai, second hand cars dubai, cars for sale uae, used cars dubai, car marketplace dubai, buy car dubai, dubai used cars, 2nd hand cars dubai, dubizzle cars dubai, dubicars uae, yallmotors, cars24 dubai, shoofi cars, ayeshi uae, automotive classifieds uae, car shopping dubai',
    openGraph: {
      title: 'Used Cars for Sale in Dubai | VIN Shown | Revvup',
      description: 'Browse used cars in Dubai with VIN shown on every listing. No sponsored ads. Book test drives anytime.',
      type: 'website',
      url: 'https://revvup.ae/listings',
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

export default function InventoryPage({ searchParams }: PageProps) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <ListingsView />
    </Suspense>
  );
}

function PageSkeleton() {
  return (
    <div className="min-h-screen bg-background pt-16 sm:pt-20">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex gap-0">
          <div className="w-64 flex-shrink-0 hidden lg:block" />
          <main className="flex-1 min-w-0 lg:pl-8">
            <div className="h-20 bg-muted/20 rounded-lg animate-pulse" />
            <div className="mt-4 sm:mt-6 md:mt-8 space-y-3">
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
