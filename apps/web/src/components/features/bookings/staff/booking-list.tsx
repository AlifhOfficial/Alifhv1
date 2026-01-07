/**
 * Booking List Component
 * Following partner dashboard UI patterns
 */

'use client';

import { useState } from 'react';
import { Box, Loader2 } from 'lucide-react';
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

  // Show empty state only when not loading AND no bookings
  if (!isLoading && bookings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
        <Box className="w-12 h-12 text-muted-foreground/40 stroke-[1.5]" />
        <div>
          <h3 className="font-medium text-foreground">
            {selectedStatus === 'all' ? "No bookings yet" : "No bookings found"}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {selectedStatus === 'all' 
              ? "Bookings will appear here"
              : `No ${STATUS_LABELS[selectedStatus]?.toLowerCase()} bookings`}
          </p>
        </div>
      </div>
    );
  }

  return (
    <section className="space-y-4">
      {isLoading && (
        <div className="flex justify-center py-4">
          <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
        </div>
      )}
      
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
    </section>
  );
}
