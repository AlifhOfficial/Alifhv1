/**
 * Listing Timestamp Component - Alifh Design System
 * 
 * Clean, minimal timestamp display following "Less is More" principle.
 */

'use client';

import { Clock } from 'lucide-react';
import { cn } from '@/utils';

interface ListingTimestampProps {
  createdAt: Date | string;
  updatedAt?: Date | string;
  publishedAt?: Date | string | null;
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
  className 
}: ListingTimestampProps) {
  const postedDate = toDate(publishedAt || createdAt);
  const updatedDateObj = updatedAt ? toDate(updatedAt) : null;
  const wasUpdated = updatedDateObj && updatedDateObj.getTime() > postedDate.getTime() + 60000;

  return (
    <div className={cn("py-4 border-y border-border", className)}>
      <div className="flex items-center gap-2.5">
        <Clock className="w-5 h-5 text-muted-foreground" />
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-bold text-foreground">
            {formatTimeAgo(postedDate)}
          </span>
          {wasUpdated && (
            <span className="text-sm text-muted-foreground font-semibold">
              • Updated {formatTimeAgo(updatedDateObj)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
