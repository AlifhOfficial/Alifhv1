/**
 * Booking Filters Component
 */

'use client';

import { Filter } from 'lucide-react';
import { cn } from '@/utils';
import { STATUS_LABELS } from './types';

interface BookingFiltersProps {
  selectedStatus: string;
  onStatusChange: (status: string) => void;
}

const FILTER_STATUSES = ['all', 'pending', 'confirmed', 'completed', 'cancelled', 'no_show'];

export function BookingFilters({ selectedStatus, onStatusChange }: BookingFiltersProps) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-muted-foreground flex items-center gap-2">
        <Filter className="w-4 h-4" />
        Filter:
      </span>
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
            {status === 'all' ? 'All' : STATUS_LABELS[status]}
          </button>
        ))}
      </div>
    </div>
  );
}
