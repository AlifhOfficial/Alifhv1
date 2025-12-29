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
      "flex flex-col overflow-hidden rounded-lg border border-sidebar-border bg-sidebar",
      className
    )}>
      {/* Image Skeleton */}
      <Skeleton className="aspect-[4/3] w-full" />
      
      {/* Content */}
      <div className="flex flex-col flex-1 p-4 space-y-3">
        {/* Title */}
        <div className="space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        
        {/* Price and Details */}
        <div className="space-y-2 pt-1">
          <Skeleton className="h-6 w-2/3" />
          <Skeleton className="h-4 w-full" />
        </div>
        
        {/* Bottom Section */}
        <div className="flex items-center justify-between pt-3 mt-auto border-t border-sidebar-border">
          <div className="flex items-center gap-2.5">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>
      </div>
    </div>
  );
}
