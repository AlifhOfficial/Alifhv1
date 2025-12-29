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
      <div className="rounded-2xl border border-border/40 p-16 text-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
            <Calendar className="w-6 h-6 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h3 className="font-medium">No bookings yet</h3>
            <p className="text-sm text-muted-foreground/70">
              {selectedStatus === 'all' 
                ? "When you book test drives, they'll appear here."
                : `No ${USER_BOOKING_STATUS_LABELS[selectedStatus]?.toLowerCase() || selectedStatus} bookings.`}
            </p>
          </div>
          <Link
            href="/listings"
            className="px-6 py-3 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium tracking-tight transition-colors mt-2"
          >
            Browse Listings
          </Link>
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
