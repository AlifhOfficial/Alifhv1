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
      "flex gap-4 p-4 rounded-lg border border-sidebar-border bg-sidebar",
      className
    )}>
      {/* Image Skeleton */}
      <Skeleton className="w-48 h-32 flex-shrink-0 rounded-lg" />
      
      {/* Content */}
      <div className="flex-1 space-y-3">
        {/* Title */}
        <div className="space-y-2">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        
        {/* Details */}
        <div className="flex gap-4">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
        </div>
        
        {/* Bottom */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-6 w-24" />
        </div>
      </div>
    </div>
  );
}
