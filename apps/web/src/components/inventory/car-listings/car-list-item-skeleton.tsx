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
      "overflow-hidden rounded-lg transition-all duration-300 flex flex-col lg:flex-row w-full",
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
          <Skeleton className="h-5 sm:h-6 lg:h-7 w-3/4" />
          <Skeleton className="h-5 sm:h-6 lg:h-7 w-20 sm:w-24" />
        </div>

        {/* Stats Row */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 lg:gap-3 mb-2 sm:mb-3 lg:mb-auto lg:pb-4">
          <Skeleton className="h-3 sm:h-4 lg:h-5 w-12 sm:w-16" />
          <Skeleton className="h-3 sm:h-4 w-1 rounded-full" />
          <Skeleton className="h-3 sm:h-4 lg:h-5 w-10 sm:w-12" />
          <Skeleton className="h-3 sm:h-4 w-1 rounded-full" />
          <Skeleton className="h-3 sm:h-4 lg:h-5 w-12 sm:w-16" />
          <Skeleton className="h-3 sm:h-4 w-1 rounded-full" />
          <Skeleton className="h-4 sm:h-5 lg:h-6 w-10 sm:w-12 rounded" />
        </div>

        {/* Bottom Section - Dealer and Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 pt-2 sm:pt-3 lg:pt-4 border-t border-sidebar-border mt-auto">
          {/* Left - Dealer */}
          <div className="flex items-center gap-2 sm:gap-2.5 lg:gap-3">
            <Skeleton className="w-6 h-6 sm:w-8 sm:h-8 lg:w-9 lg:h-9 rounded-full" />
            <div className="flex items-center gap-1 sm:gap-1.5">
              <Skeleton className="h-3 sm:h-4 w-20 sm:w-24" />
              <Skeleton className="h-3 sm:h-3.5 w-3 sm:w-3.5 rounded-full" />
            </div>
          </div>

          {/* Right - Actions */}
          <div className="flex items-center gap-1 sm:gap-2 self-end sm:self-auto">
            <Skeleton className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg" />
            <Skeleton className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg" />
            <Skeleton className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
