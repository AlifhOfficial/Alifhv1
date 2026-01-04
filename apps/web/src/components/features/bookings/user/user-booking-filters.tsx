/**
 * User Booking Filters
 */

'use client';

import { cn } from '@/utils';
import { USER_BOOKING_STATUS_LABELS } from './types';

interface UserBookingFiltersProps {
  selectedStatus: string;
  onStatusChange: (status: string) => void;
}

const FILTER_STATUSES = ['all', 'pending', 'confirmed', 'completed', 'cancelled'];

export function UserBookingFilters({ selectedStatus, onStatusChange }: UserBookingFiltersProps) {
  return (
    <div className="flex items-center gap-4">
      <span className="text-sm font-semibold tracking-tight text-muted-foreground/70">Filter:</span>
      <div className="flex gap-2 flex-wrap">
        {FILTER_STATUSES.map(status => (
          <button
            key={status}
            onClick={() => onStatusChange(status)}
            className={cn(
              "px-5 py-2 rounded-full text-sm font-semibold tracking-tight transition-colors",
              selectedStatus === status
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "border border-border/40 hover:bg-muted/40"
            )}
          >
            {status === 'all' ? 'All' : USER_BOOKING_STATUS_LABELS[status]?.split(' ')[0]}
          </button>
        ))}
      </div>
    </div>
  );
}
