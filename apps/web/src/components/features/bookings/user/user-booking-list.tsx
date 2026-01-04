/**
 * User Booking List Component
 */

'use client';

import { useState } from 'react';
import { Calendar } from 'lucide-react';
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-foreground"></div>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="bg-sidebar rounded-xl border border-border/40 py-24 px-12">
        <div className="flex flex-col items-center text-center space-y-5">
          <div className="w-16 h-16 rounded-full bg-muted/40 flex items-center justify-center">
            <Calendar className="w-7 h-7 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold tracking-tight text-foreground">No bookings yet</h3>
            <p className="text-[15px] font-medium text-muted-foreground/70 max-w-md">
              {selectedStatus === 'all' 
                ? "Your booked test drives will appear here"
                : `No ${USER_BOOKING_STATUS_LABELS[selectedStatus]?.toLowerCase() || selectedStatus} bookings`}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
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
          onLeaveFeedback={() => onOpenFeedback(booking.id)}
        />
      ))}
    </div>
  );
}
