/**
 * Listing Detail Skeleton Component
 * Loading placeholder for listing detail page
 */

import { Skeleton } from '@/components/ui/skeleton';

export function ListingDetailSkeleton() {
  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-10">
        {/* Main Column - Car Details (60%) */}
        <div className="lg:col-span-3">
          <div className="rounded-2xl border border-border/40 bg-card overflow-hidden">
            {/* Image Gallery Skeleton */}
            <Skeleton className="aspect-video w-full" />
            
            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
              
              {/* Price and Stats */}
              <div className="flex items-center justify-between">
                <Skeleton className="h-10 w-48" />
                <div className="flex gap-4">
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-8 w-16" />
                </div>
              </div>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-5 w-full" />
                  </div>
                ))}
              </div>
              
              {/* Specifications */}
              <div className="space-y-4">
                <Skeleton className="h-6 w-32" />
                <div className="grid grid-cols-2 gap-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Features */}
              <div className="space-y-4">
                <Skeleton className="h-6 w-24" />
                <div className="space-y-2">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar (40%) */}
        <div className="lg:col-span-2">
          <div className="sticky top-24 space-y-6">
            {/* Seller Profile Card */}
            <div className="rounded-2xl border border-border/40 bg-card p-6 space-y-4">
              <div className="flex items-start gap-3">
                <Skeleton className="h-12 w-12 rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
            
            {/* Contact Section */}
            <div className="rounded-2xl border border-border/40 bg-card p-6 space-y-4">
              <Skeleton className="h-6 w-32" />
              <div className="space-y-3">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            </div>
            
            {/* EMI Calculator */}
            <div className="rounded-2xl border border-border/40 bg-card p-6 space-y-4">
              <Skeleton className="h-6 w-40" />
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))}
              </div>
            </div>
            
            {/* Location */}
            <div className="rounded-2xl border border-border/40 bg-card p-6 space-y-4">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-32 w-full rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
