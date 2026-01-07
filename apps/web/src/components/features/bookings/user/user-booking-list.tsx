/**
 * User Booking List Component
 */

'use client';

import { useState } from 'react';
import { Package } from 'lucide-react';
import Link from 'next/link';
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
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-foreground"></div>
      </div>
    );
  }

  if (filteredBookings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Package className="w-12 h-12 text-muted-foreground/40 mb-4" />
        <p className="text-lg font-medium text-muted-foreground">
          {selectedStatus === 'all' 
            ? "No test drives yet" 
            : `No ${USER_BOOKING_STATUS_LABELS[selectedStatus]?.toLowerCase() || selectedStatus} bookings`}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
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
  );
}
