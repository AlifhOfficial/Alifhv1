/**
 * Booking List Component
 * macOS-inspired minimal design
 */

'use client';

import { useState } from 'react';
import { Calendar, Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";
import type { BookingData } from './types';
import { BookingCard } from './booking-card';

// Empty state config with colors
const EMPTY_STATE_CONFIG: Record<string, { icon: React.ElementType; color: string; message: string; subMessage: string }> = {
  all: { 
    icon: Calendar, 
    color: 'text-foreground', 
    message: 'No bookings yet', 
    subMessage: 'Bookings will appear here' 
  },
  pending: { 
    icon: Clock, 
    color: 'text-warning', 
    message: 'No pending bookings', 
    subMessage: 'Bookings awaiting confirmation will appear here' 
  },
  confirmed: { 
    icon: CheckCircle2, 
    color: 'text-emerald-500', 
    message: 'No confirmed bookings', 
    subMessage: 'Upcoming test drives will appear here' 
  },
  completed: { 
    icon: CheckCircle2, 
    color: 'text-primary', 
    message: 'No completed bookings', 
    subMessage: 'Past test drives will appear here' 
  },
  cancelled: { 
    icon: XCircle, 
    color: 'text-destructive', 
    message: 'No cancelled bookings', 
    subMessage: 'Cancelled bookings will appear here' 
  },
  no_show: { 
    icon: AlertCircle, 
    color: 'text-muted-foreground', 
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

  // Loading state with skeletons
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="p-4">
            <div className="flex gap-4">
              {/* Image skeleton */}
              <Skeleton className="w-28 compact:w-36 aspect-[4/3] rounded-lg flex-shrink-0" />
              
              {/* Content skeleton */}
              <div className="flex-1 min-w-0 flex flex-col">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1.5">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-3.5 w-24" />
                  </div>
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
                
                {/* Date/Time row */}
                <div className="flex items-center gap-3 mt-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-16" />
                </div>
                
                {/* Code + Actions row */}
                <div className="mt-auto pt-3 flex items-center justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-24 rounded-lg" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Empty state with colors
  if (bookings.length === 0) {
    const config = searchQuery 
      ? { icon: Calendar, color: 'text-foreground', message: 'No matches found', subMessage: 'Try adjusting your search' }
      : (EMPTY_STATE_CONFIG[selectedStatus] || EMPTY_STATE_CONFIG.all);
    const Icon = config.icon;
    
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <Icon className={`w-5 h-5 ${config.color} mb-3`} strokeWidth={2} />
        <h3 className="text-subhead font-semibold tracking-tight">
          {config.message}
        </h3>
        <p className="text-caption1 text-muted-foreground mt-1">
          {config.subMessage}
        </p>
      </div>
    );
  }

  return (
    <section className="space-y-3">
      {/* Section Header */}
      <p className="text-caption1 text-muted-foreground mb-6">
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
