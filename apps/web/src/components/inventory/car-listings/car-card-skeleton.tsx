/**
 * Car Card Skeleton Component
 * Loading placeholder for CarCard
 */

import { cn } from '@/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface CarCardSkeletonProps {
  className?: string;
}

export function CarCardSkeleton({ className }: CarCardSkeletonProps) {
  return (
    <div className={cn(
      "flex flex-col overflow-hidden rounded-lg w-full",
      "bg-sidebar border border-sidebar-border",
      className
    )}>
      {/* Image Section - matches CarCard aspect ratios */}
      <Skeleton className="aspect-[4/3] sm:aspect-[3/2] lg:aspect-[16/10] w-full" />
      
      {/* Content Section */}
      <div className="flex flex-1 flex-col p-3 sm:p-4 space-y-2 sm:space-y-3">
        {/* Title + Year row */}
        <div className="flex items-start justify-between gap-2">
          <Skeleton className="h-4 sm:h-[15px] w-2/3" />
          <Skeleton className="h-3 w-8 flex-shrink-0" />
        </div>
        
        {/* Trim */}
        <Skeleton className="h-3 w-1/3 -mt-1" />

        {/* Price */}
        <Skeleton className="h-5 sm:h-6 w-28 sm:w-32" />

        {/* Stats Row */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          <Skeleton className="h-3 sm:h-3.5 w-12" />
          <Skeleton className="h-3 sm:h-3.5 w-8" />
          <Skeleton className="h-3 sm:h-3.5 w-14" />
        </div>

        {/* Bottom Section */}
        <div className="flex items-center justify-between pt-2 sm:pt-3 mt-auto border-t border-sidebar-border">
          {/* Left - Seller */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0 flex-1">
            <Skeleton className="w-6 h-6 sm:w-8 sm:h-8 rounded-full flex-shrink-0" />
            <Skeleton className="h-3 sm:h-3.5 w-20 sm:w-24" />
          </div>

          {/* Right - Actions */}
          <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
            <Skeleton className="h-7 w-7 sm:h-9 sm:w-9 rounded-full" />
            <Skeleton className="h-7 w-7 sm:h-9 sm:w-9 rounded-full" />
            <Skeleton className="h-7 w-7 sm:h-9 sm:w-9 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
