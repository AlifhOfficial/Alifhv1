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
      <span className="text-sm text-muted-foreground">Filter:</span>
      <div className="flex gap-2 flex-wrap">
        {FILTER_STATUSES.map(status => (
          <button
            key={status}
            onClick={() => onStatusChange(status)}
            className={cn(
              "px-5 py-2 rounded-full text-sm transition-colors",
              selectedStatus === status
                ? "bg-blue-500 hover:bg-blue-600 text-white"
                : "border border-border hover:bg-secondary/10"
            )}
          >
            {status === 'all' ? 'All' : USER_BOOKING_STATUS_LABELS[status]?.split(' ')[0]}
          </button>
        ))}
      </div>
    </div>
  );
}
