/**
 * Booking List Component
 * Following partner dashboard UI patterns
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

  // Show empty state only when not loading AND no bookings
  if (!isLoading && bookings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center rounded-xl border border-border/40">
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
          <Calendar className="w-5 h-5 text-muted-foreground" />
        </div>
        <h3 className="font-medium text-foreground">No bookings found</h3>
        <p className="text-sm text-muted-foreground/70 mt-1 max-w-sm">
          {selectedStatus === 'all' 
            ? "When customers book test drives, they'll appear here."
            : `No ${STATUS_LABELS[selectedStatus]?.toLowerCase()} bookings at the moment.`}
        </p>
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <div className="flex items-baseline justify-between border-b border-border/40 pb-2">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-medium tracking-tight">All Bookings</h3>
          {isLoading && (
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
          )}
        </div>
        <span className="text-sm text-muted-foreground">
          {bookings.length} booking{bookings.length !== 1 ? 's' : ''}
        </span>
      </div>
      
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
