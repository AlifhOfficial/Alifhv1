'use client';

import { cn } from '@/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface SellerProfileCardSkeletonProps {
  className?: string;
  variant?: 'partner' | 'user';
}

export function SellerProfileCardSkeleton({ className, variant = 'partner' }: SellerProfileCardSkeletonProps) {
  return (
    <div className={cn("space-y-5", className)}>
      {/* Header with Logo and Brand Info */}
      <div className="flex items-start justify-between gap-4">
        {/* Brand Info */}
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-36" />
            <Skeleton className="w-5 h-5 rounded-full" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="w-4 h-4 rounded-full" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-3.5 w-32" />
        </div>

        {/* Logo */}
        <Skeleton className={variant === 'partner' ? "w-16 h-16 flex-shrink-0" : "w-14 h-14 rounded-full flex-shrink-0"} />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 py-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-1">
            <div className="flex items-center gap-2">
              <Skeleton className="w-4 h-4 rounded-full" />
              <Skeleton className="h-3 w-14" />
            </div>
            <Skeleton className="h-5 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}
