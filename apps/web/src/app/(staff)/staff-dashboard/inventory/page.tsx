/**
 * Staff Inventory Browse Page
 * Full listings browse view embedded in staff dashboard
 * Allows staff to browse all inventory without leaving the dashboard
 */

import { Suspense } from 'react';
import { ListingsView } from '@/components/listings/listings-view';

export default function StaffInventoryPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <ListingsView embedded />
    </Suspense>
  );
}

function PageSkeleton() {
  return (
    <div className="min-h-screen bg-background">
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
