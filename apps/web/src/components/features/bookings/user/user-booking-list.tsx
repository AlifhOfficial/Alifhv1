/**
 * User Booking List Component
 * Clean minimal design with empty states
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
      <div className="flex flex-col items-center justify-center py-24">
        <div className="w-5 h-5 border-2 border-muted-foreground/20 border-t-muted-foreground rounded-full animate-spin" />
        <p className="text-xs text-muted-foreground mt-4">Loading...</p>
      </div>
    );
  }

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
    <div>
      {/* Section Header */}
      <p className="text-xs text-muted-foreground mb-6">
        {bookings.length} booking{bookings.length !== 1 ? 's' : ''}
        {searchQuery && <span> matching "{searchQuery}"</span>}
      </p>

      {/* List */}
      <div className="space-y-1">
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
