/**
 * Listing Timestamp Component - Alifh Design System
 * 
 * Clean, minimal timestamp display following "Less is More" principle.
 */

'use client';

import { Clock } from 'lucide-react';
import { cn } from '@/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface ListingTimestampProps {
  createdAt: Date | string;
  updatedAt?: Date | string;
  publishedAt?: Date | string | null;
  originalPublishedAt?: Date | string | null;
  lastEditedAt?: Date | string | null;
  className?: string;
}

function toDate(date: Date | string): Date {
  return date instanceof Date ? date : new Date(date);
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
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffWeeks < 4) return `${diffWeeks}w ago`;
  if (diffMonths < 12) return `${diffMonths}mo ago`;
  
  return date.toLocaleDateString('en-AE', { 
    day: 'numeric',
    month: 'short', 
    year: 'numeric' 
  });
}

export function ListingTimestamp({ 
  createdAt, 
  updatedAt, 
  publishedAt,
  originalPublishedAt,
  lastEditedAt,
  className 
}: ListingTimestampProps) {
  // Use originalPublishedAt for display (anti-abuse: shows true first listing date)
  // Fall back to publishedAt, then createdAt
  const postedDate = toDate(originalPublishedAt || publishedAt || createdAt);
  // Use lastEditedAt for "updated" display if available, otherwise updatedAt
  const editedDateObj = lastEditedAt ? toDate(lastEditedAt) : (updatedAt ? toDate(updatedAt) : null);
  const wasUpdated = editedDateObj && editedDateObj.getTime() > postedDate.getTime() + 60000;

  return (
    <div className={cn("py-4", className)}>
      <div className="flex items-center gap-2.5">
        <Clock className="w-5 h-5 text-muted-foreground" />
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-bold text-foreground">
            {formatTimeAgo(postedDate)}
          </span>
          {wasUpdated && (
            <span className="text-sm text-muted-foreground font-semibold">
              • Updated {formatTimeAgo(editedDateObj)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function ListingTimestampSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("py-4", className)}>
      <Skeleton className="h-4 w-24" />
    </div>
  );
}

ListingTimestamp.Skeleton = ListingTimestampSkeleton;
