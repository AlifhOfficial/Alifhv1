/**
 * Car List Item Skeleton Component
 * Loading placeholder for CarListItem (list view)
 */

import { cn } from '@/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface CarListItemSkeletonProps {
  className?: string;
}

export function CarListItemSkeleton({ className }: CarListItemSkeletonProps) {
  return (
    <div className={cn(
      "overflow-hidden rounded-xl flex flex-col lg:flex-row w-full",
      "bg-sidebar border border-sidebar-border",
      className
    )}>
      {/* Image Section */}
      <div className="p-2 sm:p-3 w-full lg:w-80 flex-shrink-0">
        <Skeleton className="aspect-[4/3] w-full rounded-lg" />
      </div>

      {/* Content Section */}
      <div className="flex flex-1 flex-col px-3 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-5 min-w-0">
        {/* Top Section - Title and Price */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-1 sm:gap-2 lg:gap-6 mb-2 sm:mb-3">
          <div className="flex-1 min-w-0 space-y-1">
            <Skeleton className="h-[15px] sm:h-4 lg:h-5 w-3/4" />
            <Skeleton className="h-3 sm:h-3.5 w-1/3" />
          </div>
          <Skeleton className="h-5 sm:h-6 w-24 sm:w-28 flex-shrink-0" />
        </div>

        {/* Stats Row */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 lg:gap-3 mb-1 sm:mb-1.5">
          <Skeleton className="h-3 sm:h-3.5 lg:h-4 w-8" />
          <Skeleton className="h-3 sm:h-3.5 lg:h-4 w-14" />
          <Skeleton className="h-3 sm:h-3.5 lg:h-4 w-10" />
        </div>

        {/* Location Row */}
        <div className="mb-2 sm:mb-3 lg:mb-auto lg:pb-4">
          <Skeleton className="h-3 sm:h-3.5 w-16" />
        </div>

        {/* Bottom Section - Seller and Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 pt-2 sm:pt-3 lg:pt-4 border-t border-sidebar-border mt-auto">
          {/* Left - Seller */}
          <div className="flex items-center gap-2 sm:gap-2.5 lg:gap-3">
            <Skeleton className="w-6 h-6 sm:w-8 sm:h-8 lg:w-9 lg:h-9 rounded-full flex-shrink-0" />
            <Skeleton className="h-3 sm:h-3.5 w-24 sm:w-28" />
          </div>

          {/* Right - Actions */}
          <div className="flex items-center gap-0.5 sm:gap-1 self-end sm:self-auto">
            <Skeleton className="h-7 w-7 sm:h-9 sm:w-9 rounded-full" />
            <Skeleton className="h-7 w-7 sm:h-9 sm:w-9 rounded-full" />
            <Skeleton className="h-7 w-7 sm:h-9 sm:w-9 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
