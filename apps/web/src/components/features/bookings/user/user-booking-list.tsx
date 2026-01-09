/**
 * User Booking List Component
 * macOS-inspired minimal design
 */

'use client';

import { useState } from 'react';
import { Calendar, Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import type { UserBookingData } from './types';
import { UserBookingCard } from './user-booking-card';

// Empty state config with colors
const EMPTY_STATE_CONFIG: Record<string, { icon: React.ElementType; color: string; message: string; subMessage: string }> = {
  all: { 
    icon: Calendar, 
    color: 'text-muted-foreground/40', 
    message: 'No bookings yet', 
    subMessage: 'Your test drive bookings will appear here' 
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
    subMessage: 'Missed bookings will appear here' 
  },
};

interface UserBookingListProps {
  bookings: UserBookingData[];
  isLoading: boolean;
  selectedStatus: string;
  searchQuery?: string;
  onCancel: (bookingId: string) => void;
  onOpenFeedback: (bookingId: string) => void;
}

export function UserBookingList({ 
  bookings, 
  isLoading, 
  selectedStatus,
  searchQuery = '',
  onCancel,
  onOpenFeedback,
}: UserBookingListProps) {
  const [expandedBooking, setExpandedBooking] = useState<string | null>(null);

  // Bookings are now pre-filtered by parent component

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-5 h-5 border-2 border-muted-foreground/20 border-t-muted-foreground rounded-full animate-spin" />
      </div>
    );
  }

  if (bookings.length === 0) {
    const config = searchQuery 
      ? { icon: Calendar, color: 'text-muted-foreground/40', message: 'No matches found', subMessage: 'Try adjusting your search' }
      : (EMPTY_STATE_CONFIG[selectedStatus] || EMPTY_STATE_CONFIG.all);
    const Icon = config.icon;
    
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center rounded-xl border border-sidebar-border bg-sidebar">
        <div className="w-16 h-16 rounded-full bg-sidebar-accent/50 flex items-center justify-center mb-5">
          <Icon className={`w-7 h-7 ${config.color}`} />
        </div>
        <p className="text-[15px] font-bold tracking-tight text-foreground mb-1">
          {config.message}
        </p>
        <p className="text-sm text-muted-foreground/70">
          {config.subMessage}
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Section Header */}
      <p className="text-sm font-semibold text-muted-foreground/70 mb-4">
        {bookings.length} booking{bookings.length !== 1 ? 's' : ''}
        {searchQuery && <span className="text-muted-foreground/50"> matching "{searchQuery}"</span>}
      </p>

      {/* List */}
      <div className="space-y-3">
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
    </div>
  );
}
