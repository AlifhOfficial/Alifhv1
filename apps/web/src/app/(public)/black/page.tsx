/**
 * Black Listings Page - Signature/Premium Listings
 * Public page displaying all black-tier premium listings
 */

import { Suspense } from 'react';
import { BlackListingsView } from '@/components/listings/black-listings-view';
import { Navbar } from '@/components/shared/navbar';

export const metadata = {
  title: 'Signature Collection | Alifh',
  description: 'Exclusive premium car listings from verified dealers',
};

export default function BlackListingsPage() {
  return (
    <>
      <Suspense fallback={<div className="h-16" />}>
        <Navbar />
      </Suspense>
      
      <Suspense fallback={<PageSkeleton />}>
        <BlackListingsView />
      </Suspense>
    </>
  );
}

function PageSkeleton() {
  return (
    <div className="min-h-screen bg-zinc-950 pt-16 sm:pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header skeleton */}
        <div className="text-center mb-16">
          <div className="h-8 w-48 bg-zinc-800/50 rounded mx-auto mb-4 animate-pulse" />
          <div className="h-4 w-96 max-w-full bg-zinc-800/30 rounded mx-auto animate-pulse" />
        </div>
        
        {/* Cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-[4/3] bg-zinc-800/30 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}
