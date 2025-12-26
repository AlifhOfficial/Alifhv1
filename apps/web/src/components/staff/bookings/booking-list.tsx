/**
 * Booking List Component
 */

'use client';

import { useState } from 'react';
import { Calendar, Loader2 } from 'lucide-react';
import type { BookingData } from './types';
import { STATUS_LABELS } from './types';
import { BookingCard } from './booking-card';

interface BookingListProps {
  bookings: BookingData[];
  isLoading: boolean;
  selectedStatus: string;
  onAction: (bookingId: string, action: string, data?: Record<string, any>) => Promise<void>;
}

export function BookingList({ 
  bookings, 
  isLoading, 
  selectedStatus,
  onAction,
}: BookingListProps) {
  const [expandedBooking, setExpandedBooking] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  async function handleAction(bookingId: string, action: string, data?: Record<string, any>) {
    setActionLoading(bookingId);
    try {
      await onAction(bookingId, action, data);
    } finally {
      setActionLoading(null);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-medium text-foreground">No bookings found</h3>
        <p className="text-sm text-muted-foreground mt-1">
          {selectedStatus === 'all' 
            ? "When customers book test drives for your listings, they'll appear here."
            : `No ${STATUS_LABELS[selectedStatus]?.toLowerCase()} bookings.`}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {bookings.map(booking => (
        <BookingCard
          key={booking.id}
          booking={booking}
          isExpanded={expandedBooking === booking.id}
          isActionLoading={actionLoading === booking.id}
          onToggleExpand={() => setExpandedBooking(
            expandedBooking === booking.id ? null : booking.id
          )}
          onAction={(action, data) => handleAction(booking.id, action, data)}
        />
      ))}
    </div>
  );
}
