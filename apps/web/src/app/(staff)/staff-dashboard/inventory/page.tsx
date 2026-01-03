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
      <div className="h-full">
        <ListingsView embedded />
      </div>
    </Suspense>
  );
}

function PageSkeleton() {
  return (
    <div className="p-4 sm:p-6">
      <div className="flex gap-6">
        <div className="w-64 flex-shrink-0 hidden lg:block">
          <div className="h-[600px] bg-muted/20 rounded-lg animate-pulse" />
        </div>
        <main className="flex-1 min-w-0">
          <div className="h-16 bg-muted/20 rounded-lg animate-pulse mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="h-64 bg-muted/20 rounded-lg animate-pulse" />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
