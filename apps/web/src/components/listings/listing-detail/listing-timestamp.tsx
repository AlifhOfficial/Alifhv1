/**
 * Listing Timestamp Component
 * 
 * Displays when the listing was posted/updated on the detail page sidebar.
 */

'use client';

import { Clock, RefreshCw } from 'lucide-react';
import { cn } from '@/utils';

interface ListingTimestampProps {
  createdAt: Date;
  updatedAt?: Date;
  publishedAt?: Date | null;
  className?: string;
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  if (diffWeeks < 4) return `${diffWeeks} week${diffWeeks !== 1 ? 's' : ''} ago`;
  if (diffMonths < 12) return `${diffMonths} month${diffMonths !== 1 ? 's' : ''} ago`;
  
  return date.toLocaleDateString('en-AE', { 
    day: 'numeric',
    month: 'short', 
    year: 'numeric' 
  });
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-AE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function ListingTimestamp({ 
  createdAt, 
  updatedAt, 
  publishedAt,
  className 
}: ListingTimestampProps) {
  const postedDate = publishedAt || createdAt;
  const wasUpdated = updatedAt && updatedAt.getTime() > postedDate.getTime() + 60000; // More than 1 minute after posting

  return (
    <div className={cn(
      "p-4 bg-muted/20 border border-border/40 rounded-xl space-y-2",
      className
    )}>
      {/* Posted Date */}
      <div className="flex items-center gap-2 text-sm">
        <Clock className="w-4 h-4 text-muted-foreground" />
        <span className="text-muted-foreground">Posted</span>
        <span className="font-medium text-foreground">{formatTimeAgo(postedDate)}</span>
      </div>

      {/* Updated Date */}
      {wasUpdated && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground pl-6">
          <RefreshCw className="w-3 h-3" />
          <span>Updated {formatTimeAgo(updatedAt)}</span>
        </div>
      )}

      {/* Exact Date on Hover */}
      <p className="text-[10px] text-muted-foreground pl-6">
        Listed on {formatDate(postedDate)}
      </p>
    </div>
  );
}
