/**
 * Listing Detail Skeleton Component
 * Loading placeholder for listing detail page
 * Uses CarCardDetailedSkeleton for the main content
 */

import { Skeleton } from '@/components/ui/skeleton';
import { CarCardDetailedSkeleton } from '@/components/inventory';

export function ListingDetailSkeleton() {
  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-10">
        {/* Main Column - Car Details (60%) */}
        <div className="lg:col-span-3 min-w-0">
          <CarCardDetailedSkeleton />
        </div>

        {/* Sidebar (40%) */}
        <div className="lg:col-span-2 min-w-0">
          <div className="lg:sticky lg:top-24 space-y-6">
            {/* Seller Profile Card */}
            <div className="rounded-xl border border-border p-6 space-y-5">
              {/* Header */}
              <div className="flex items-center gap-3">
                <Skeleton className="h-14 w-14 rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
              
              {/* Stats */}
              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-border">
                <div className="space-y-1.5">
                  <Skeleton className="h-6 w-12 mx-auto" />
                  <Skeleton className="h-3 w-16 mx-auto" />
                </div>
                <div className="space-y-1.5">
                  <Skeleton className="h-6 w-12 mx-auto" />
                  <Skeleton className="h-3 w-16 mx-auto" />
                </div>
                <div className="space-y-1.5">
                  <Skeleton className="h-6 w-12 mx-auto" />
                  <Skeleton className="h-3 w-16 mx-auto" />
                </div>
              </div>
            </div>
            
            {/* Contact Section */}
            <div className="space-y-3">
              <Skeleton className="h-12 w-full rounded-full" />
              <Skeleton className="h-12 w-full rounded-full" />
            </div>
            
            {/* Timestamp */}
            <div className="rounded-xl border border-border p-5 space-y-3">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-40" />
            </div>
            
            {/* EMI Calculator */}
            <div className="rounded-xl border border-border p-5 space-y-4">
              <Skeleton className="h-5 w-32" />
              <div className="space-y-3">
                <Skeleton className="h-10 w-full rounded-lg" />
                <Skeleton className="h-10 w-full rounded-lg" />
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>
              <div className="pt-3 border-t border-border">
                <Skeleton className="h-7 w-full" />
              </div>
            </div>
            
            {/* Location */}
            <div className="rounded-xl border border-border p-5 space-y-3">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-40 w-full rounded-lg" />
              <Skeleton className="h-4 w-full" />
            </div>
            
            {/* Safety Note */}
            <div className="pt-4 border-t border-border flex items-start gap-3">
              <Skeleton className="h-5 w-5 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
