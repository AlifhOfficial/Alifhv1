/**
 * User Booking List Component
 * Clean minimal design with empty states
 */

'use client';

import { useState } from 'react';
import { Calendar, Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import type { UserBookingData } from './types';
import { UserBookingCard } from './user-booking-card';

// Empty state config with colors
const EMPTY_STATE_CONFIG: Record<string, { icon: React.ElementType; color: string; message: string; subMessage: string }> = {
  all: { 
    icon: Calendar, 
    color: 'text-foreground', 
    message: 'No bookings yet', 
    subMessage: 'Your test drive bookings will appear here' 
  },
  pending: { 
    icon: Clock, 
    color: 'text-warning', 
    message: 'No pending bookings', 
    subMessage: 'Bookings awaiting confirmation will appear here' 
  },
  confirmed: { 
    icon: CheckCircle2, 
    color: 'text-emerald-500', 
    message: 'No confirmed bookings', 
    subMessage: 'Upcoming test drives will appear here' 
  },
  completed: { 
    icon: CheckCircle2, 
    color: 'text-primary', 
    message: 'No completed bookings', 
    subMessage: 'Past test drives will appear here' 
  },
  cancelled: { 
    icon: XCircle, 
    color: 'text-destructive', 
    message: 'No cancelled bookings', 
    subMessage: 'Cancelled bookings will appear here' 
  },
  no_show: { 
    icon: AlertCircle, 
    color: 'text-slate-500', 
    message: 'No missed bookings', 
    subMessage: 'Missed bookings will appear here' 
  },
};

interface UserBookingListProps {
  bookings: UserBookingData[];
  isLoading: boolean;
  selectedStatus: string;
  searchQuery?: string;
  onCancel: (bookingId: string) => void;
}

export function UserBookingList({ 
  bookings, 
  isLoading, 
  selectedStatus,
  searchQuery = '',
  onCancel,
}: UserBookingListProps) {
  const [expandedBooking, setExpandedBooking] = useState<string | null>(null);

  // Bookings are now pre-filtered by parent component

  if (isLoading) {
    return (
      <div className="space-y-1">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex gap-4 p-4">
            <Skeleton className="w-28 sm:w-36 aspect-[4/3] rounded-lg shrink-0" />
            <div className="flex-1 min-w-0 space-y-2">
              <Skeleton className="h-4 sm:h-5 w-3/4" />
              <Skeleton className="h-3 w-1/3" />
              <div className="flex gap-3 mt-2">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-12" />
              </div>
              <Skeleton className="h-5 w-20 rounded-full mt-auto" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (bookings.length === 0) {
    const config = searchQuery 
      ? { icon: Calendar, color: 'text-muted-foreground/20', message: 'No matches found', subMessage: 'Try adjusting your search' }
      : (EMPTY_STATE_CONFIG[selectedStatus] || EMPTY_STATE_CONFIG.all);
    const Icon = config.icon;
    
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="text-center max-w-xs">
          <Icon className={`w-8 h-8 mx-auto mb-4 ${searchQuery ? 'text-muted-foreground/20' : config.color}`} strokeWidth={1.5} />
          <h3 className="text-subhead font-semibold text-foreground mb-1">{config.message}</h3>
          <p className="text-caption1 text-muted-foreground/60 leading-relaxed">{config.subMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Section Header */}
      <p className="text-caption2 sm:text-caption1 text-muted-foreground mb-4 sm:mb-6">
        {bookings.length} booking{bookings.length !== 1 ? 's' : ''}
        {searchQuery && <span> matching "{searchQuery}"</span>}
      </p>

      {/* List */}
      <div className="space-y-2 sm:space-y-1">
      {bookings.map(booking => (
        <UserBookingCard
          key={booking.id}
          booking={booking}
          isExpanded={expandedBooking === booking.id}
          isActionLoading={false}
          onToggleExpand={() => setExpandedBooking(
            expandedBooking === booking.id ? null : booking.id
          )}
          onCancel={() => onCancel(booking.id)}
        />
      ))}
      </div>
    </div>
  );
}
