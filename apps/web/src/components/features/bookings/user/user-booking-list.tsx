/**
 * User Booking List Component
 */

'use client';

import { useState } from 'react';
import { Calendar } from 'lucide-react';
import type { UserBookingData } from './types';
import { USER_BOOKING_STATUS_LABELS } from './types';
import { UserBookingCard } from './user-booking-card';

interface UserBookingListProps {
  bookings: UserBookingData[];
  isLoading: boolean;
  selectedStatus: string;
  onCancel: (bookingId: string) => void;
  onOpenFeedback: (bookingId: string) => void;
}

export function UserBookingList({ 
  bookings, 
  isLoading, 
  selectedStatus,
  onCancel,
  onOpenFeedback,
}: UserBookingListProps) {
  const [expandedBooking, setExpandedBooking] = useState<string | null>(null);

  // Client-side filtering for zero-latency toggling
  const filteredBookings = selectedStatus === 'all' 
    ? bookings 
    : bookings.filter(booking => booking.status === selectedStatus);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-5 h-5 border-2 border-muted-foreground/20 border-t-muted-foreground rounded-full animate-spin" />
      </div>
    );
  }

  if (filteredBookings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center rounded-xl border border-border/40 bg-sidebar">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-5">
          <Calendar className="w-7 h-7 text-muted-foreground/40" />
        </div>
        <p className="text-[15px] font-bold tracking-tight text-foreground mb-1">
          {selectedStatus === 'all' 
            ? 'No bookings yet' 
            : `No ${USER_BOOKING_STATUS_LABELS[selectedStatus]?.toLowerCase() || selectedStatus} bookings`}
        </p>
        <p className="text-sm text-muted-foreground/70">
          {selectedStatus === 'all'
            ? 'Your test drive bookings will appear here'
            : `Bookings will appear here when they are ${USER_BOOKING_STATUS_LABELS[selectedStatus]?.toLowerCase() || selectedStatus}`}
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Section Header */}
      <p className="text-sm font-semibold text-muted-foreground/70 mb-4">
        {filteredBookings.length} booking{filteredBookings.length !== 1 ? 's' : ''}
      </p>

      {/* List */}
      <div className="space-y-3">
      {filteredBookings.map(booking => (
        <UserBookingCard
          key={booking.id}
          booking={booking}
          isExpanded={expandedBooking === booking.id}
          isActionLoading={false}
          onToggleExpand={() => setExpandedBooking(
            expandedBooking === booking.id ? null : booking.id
          )}
          onCancel={() => onCancel(booking.id)}
          onLeaveFeedback={() => onOpenFeedback(booking.id)}
        />
      ))}
      </div>
    </div>
  );
}
