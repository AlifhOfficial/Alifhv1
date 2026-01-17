/**
 * Booking List Component
 * macOS-inspired minimal design
 */

'use client';

import { useState } from 'react';
import { Calendar, Loader2, Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import type { BookingData } from './types';
import { BookingCard } from './booking-card';

// Empty state config with colors
const EMPTY_STATE_CONFIG: Record<string, { icon: React.ElementType; color: string; message: string; subMessage: string }> = {
  all: { 
    icon: Calendar, 
    color: 'text-muted-foreground/40', 
    message: 'No bookings yet', 
    subMessage: 'Bookings will appear here' 
  },
  pending: { 
    icon: Clock, 
    color: 'text-amber-500/40', 
    message: 'No pending bookings', 
    subMessage: 'Bookings awaiting confirmation will appear here' 
  },
  confirmed: { 
    icon: CheckCircle2, 
    color: 'text-emerald-500/40', 
    message: 'No confirmed bookings', 
    subMessage: 'Upcoming test drives will appear here' 
  },
  completed: { 
    icon: CheckCircle2, 
    color: 'text-blue-500/40', 
    message: 'No completed bookings', 
    subMessage: 'Past test drives will appear here' 
  },
  cancelled: { 
    icon: XCircle, 
    color: 'text-red-500/40', 
    message: 'No cancelled bookings', 
    subMessage: 'Cancelled bookings will appear here' 
  },
  no_show: { 
    icon: AlertCircle, 
    color: 'text-slate-400/40', 
    message: 'No missed bookings', 
    subMessage: 'No-shows and expired bookings will appear here' 
  },
};

interface BookingListProps {
  bookings: BookingData[];
  isLoading: boolean;
  selectedStatus: string;
  searchQuery?: string;
  onAction: (bookingId: string, action: string, data?: Record<string, any>) => Promise<void>;
}

export function BookingList({ 
  bookings, 
  isLoading, 
  selectedStatus,
  searchQuery = '',
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

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="w-5 h-5 border-2 border-muted-foreground/20 border-t-muted-foreground rounded-full animate-spin" />
        <p className="text-xs text-muted-foreground mt-4">Loading...</p>
      </div>
    );
  }

  // Empty state with colors
  if (bookings.length === 0) {
    const config = searchQuery 
      ? { icon: Calendar, color: 'text-muted-foreground/20', message: 'No matches found', subMessage: 'Try adjusting your search' }
      : (EMPTY_STATE_CONFIG[selectedStatus] || EMPTY_STATE_CONFIG.all);
    const Icon = config.icon;
    
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <Icon className={`w-10 h-10 ${config.color} mb-4`} />
        <h3 className="text-lg font-medium tracking-tight">
          {config.message}
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          {config.subMessage}
        </p>
      </div>
    );
  }

  return (
    <section className="space-y-3">
      {/* Section Header */}
      <p className="text-xs text-muted-foreground mb-6">
        {bookings.length} booking{bookings.length !== 1 ? 's' : ''}
        {searchQuery && <span> matching "{searchQuery}"</span>}
      </p>
      
      <div className="space-y-1">
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
