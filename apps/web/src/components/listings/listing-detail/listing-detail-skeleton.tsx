/**
 * Listing Detail Skeleton Component
 * Loading placeholder for listing detail page
 * Simplified for better perceived performance
 */

import { Skeleton } from '@/components/ui/skeleton';

export function ListingDetailSkeleton() {
  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-10">
        {/* Main Column - Car Details (60%) */}
        <div className="lg:col-span-3 space-y-6">
          {/* Image Gallery */}
          <Skeleton className="aspect-video w-full rounded-xl" />
          
          {/* Title & Price */}
          <div className="space-y-3">
            <Skeleton className="h-7 w-3/4" />
            <Skeleton className="h-8 w-40" />
          </div>
          
          {/* Quick Stats */}
          <div className="flex gap-4">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-24" />
          </div>
          
          {/* Specifications Grid */}
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex justify-between py-3 border-b border-border/30">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar (40%) */}
        <div className="lg:col-span-2">
          <div className="lg:sticky lg:top-24 space-y-6">
            {/* Seller Profile Card */}
            <div className="rounded-xl border border-border/30 p-5 space-y-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
            </div>
            
            {/* Contact Section */}
            <div className="space-y-3">
              <Skeleton className="h-12 w-full rounded-full" />
              <Skeleton className="h-12 w-full rounded-full" />
            </div>
            
            {/* EMI Calculator */}
            <div className="space-y-3">
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-8 w-32" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
