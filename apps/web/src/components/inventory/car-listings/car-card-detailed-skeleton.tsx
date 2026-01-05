/**
 * Car Card Detailed Skeleton Component
 * Loading placeholder for detailed car view
 * Matches CarCardDetailed layout
 */

import { Skeleton } from '@/components/ui/skeleton';

export function CarCardDetailedSkeleton() {
  return (
    <div className="space-y-8">
      {/* Image Gallery */}
      <div className="space-y-3">
        {/* Main Image */}
        <Skeleton className="aspect-[16/10] w-full rounded-2xl" />
        
        {/* Thumbnails */}
        <div className="flex gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="w-16 h-12 rounded-lg flex-shrink-0" />
          ))}
        </div>
      </div>

      {/* Highlights */}
      <div className="space-y-3">
        <Skeleton className="h-4 w-20" />
        <div className="flex flex-wrap gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-5 w-32" />
          ))}
        </div>
      </div>

      {/* Header Section */}
      <div className="space-y-4">
        {/* Title & Actions */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-7 w-40" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>
        </div>

        {/* Quick Details */}
        <div className="flex gap-3">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-5 w-32" />
        </div>

        {/* VIN */}
        <Skeleton className="h-4 w-48" />
      </div>

      {/* Description */}
      <div className="space-y-3">
        <Skeleton className="h-4 w-24" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>

      {/* Specifications */}
      <div className="space-y-4">
        <Skeleton className="h-4 w-28" />
        
        <div className="space-y-0">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="flex justify-between py-3 border-b border-border">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-24" />
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="space-y-3">
        <Skeleton className="h-4 w-20" />
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-28 rounded-lg" />
          ))}
        </div>
      </div>

      {/* AI Pricing Insights */}
      <div className="space-y-4">
        <div className="pt-4 border-t border-border flex items-center gap-2">
          <Skeleton className="h-5 w-5 rounded-full" />
          <Skeleton className="h-4 w-48" />
        </div>
        
        {/* Price Trend & Fair Value */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-14 w-full rounded-lg" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-14 w-full rounded-lg" />
          </div>
        </div>

        {/* Market Range */}
        <Skeleton className="h-24 w-full rounded-xl" />

        {/* Value Factors */}
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    </div>
  );
}
