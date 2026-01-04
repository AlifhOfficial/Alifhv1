/**
 * Consignment Funnels Page
 * Staff dashboard page for managing consignment funnels
 * Dealers can create saved searches and view matching listings
 */

import { Suspense } from 'react';
import { ConsignmentFunnelsView } from '@/components/staff/consignment/funnels-view';

export default function ConsignmentFunnelsPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <ConsignmentFunnelsView />
    </Suspense>
  );
}

function PageSkeleton() {
  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 w-48 bg-muted/30 rounded animate-pulse" />
          <div className="h-4 w-64 bg-muted/20 rounded animate-pulse mt-2" />
        </div>
        <div className="h-10 w-32 bg-muted/30 rounded animate-pulse" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="border rounded-lg p-4 space-y-3">
            <div className="h-5 w-32 bg-muted/30 rounded animate-pulse" />
            <div className="h-4 w-full bg-muted/20 rounded animate-pulse" />
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 4 }).map((_, j) => (
                <div key={j} className="h-6 w-16 bg-muted/30 rounded-full animate-pulse" />
              ))}
            </div>
            <div className="flex justify-between items-center pt-2">
              <div className="h-4 w-20 bg-muted/20 rounded animate-pulse" />
              <div className="h-8 w-24 bg-muted/30 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
