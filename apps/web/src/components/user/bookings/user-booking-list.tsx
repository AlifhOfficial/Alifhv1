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
      <div className="text-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-sm text-muted-foreground">Loading bookings...</p>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="rounded-xl border border-border p-16 text-center">
        <Calendar className="w-12 h-12 mx-auto text-muted-foreground/40 mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">No bookings yet</h3>
        <p className="text-sm text-muted-foreground mb-6">
          {selectedStatus === 'all' 
            ? "When you book test drives, they'll appear here."
            : `No ${USER_BOOKING_STATUS_LABELS[selectedStatus]?.toLowerCase() || selectedStatus} bookings.`}
        </p>
        <Link
          href="/listings"
          className="px-5 py-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white text-sm transition-colors inline-block"
        >
          Browse Listings
        </Link>
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
