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
      "flex flex-col overflow-hidden rounded-lg transition-all duration-300 w-full",
      "bg-sidebar border border-sidebar-border",
      className
    )}>
      {/* Image Section */}
      <Skeleton className="aspect-[4/3] w-full" />
      
      {/* Content Section */}
      <div className="flex flex-1 flex-col p-3 sm:p-4 space-y-2 sm:space-y-3">
        {/* Title */}
        <Skeleton className="h-4 sm:h-5 w-3/4" />

        {/* Price */}
        <Skeleton className="h-6 sm:h-7 w-1/2 -mt-0.5" />

        {/* Stats Row */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          <Skeleton className="h-3 sm:h-3.5 w-10 sm:w-12" />
          <Skeleton className="h-3 sm:h-3.5 w-1 rounded-full" />
          <Skeleton className="h-3 sm:h-3.5 w-8 sm:w-10" />
          <Skeleton className="h-3 sm:h-3.5 w-1 rounded-full" />
          <Skeleton className="h-3 sm:h-3.5 w-12 sm:w-14" />
        </div>

        {/* Bottom Section */}
        <div className="flex items-center justify-between pt-2 sm:pt-3 mt-auto border-t border-sidebar-border">
          {/* Left - Dealer */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0 flex-1">
            <Skeleton className="w-6 h-6 sm:w-8 sm:h-8 rounded-full flex-shrink-0" />
            <div className="flex items-center gap-1 sm:gap-1.5 min-w-0">
              <Skeleton className="h-3 sm:h-4 w-16 sm:w-20" />
              <Skeleton className="w-3 h-3 sm:w-4 sm:h-4 rounded-full flex-shrink-0" />
            </div>
          </div>

          {/* Right - QI + Actions */}
          <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
            <Skeleton className="h-4 sm:h-5 w-8 sm:w-10 rounded mr-0.5" />
            <Skeleton className="h-7 w-7 sm:h-8 sm:w-8 rounded-full" />
            <Skeleton className="h-7 w-7 sm:h-8 sm:w-8 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
