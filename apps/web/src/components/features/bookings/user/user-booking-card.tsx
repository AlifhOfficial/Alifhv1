/**
 * User Booking Card Component
 */

'use client';

import { 
  Calendar, 
  Clock, 
  ChevronDown,
  Star,
  Box
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/utils';
import type { UserBookingData } from './types';
import { USER_BOOKING_STATUS_COLORS, USER_BOOKING_STATUS_LABELS } from './types';

interface UserBookingCardProps {
  booking: UserBookingData;
  isExpanded: boolean;
  isActionLoading: boolean;
  onToggleExpand: () => void;
  onCancel: () => void;
  onLeaveFeedback: () => void;
}

export function UserBookingCard({
  booking,
  isExpanded,
  isActionLoading,
  onToggleExpand,
  onCancel,
  onLeaveFeedback,
}: UserBookingCardProps) {
  const formatDate = (isoString: string) => {
    const d = new Date(isoString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (d.toDateString() === today.toDateString()) {
      return 'Today';
    }
    if (d.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    }
    return d.toLocaleDateString('en-AE', { month: 'short', day: 'numeric' });
  };

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString('en-AE', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  // Check if cancellation is allowed (2 hours before scheduled time)
  const canCancel = () => {
    if (booking.status !== 'pending' && booking.status !== 'confirmed') return false;
    const scheduledTime = new Date(booking.scheduledStartTime);
    const cutoffTime = new Date(scheduledTime.getTime() - 2 * 60 * 60 * 1000);
    return new Date() < cutoffTime;
  };

  return (
    <div className="rounded-xl border border-border/40 bg-sidebar hover:border-border/60 transition-all">
      {/* Clickable Row */}
      <div
        className="flex items-center gap-4 p-4 cursor-pointer"
        onClick={onToggleExpand}
      >
        {/* Time */}
        <div className="w-24 flex-shrink-0">
          <p className="text-[15px] font-bold tracking-tight text-foreground">{formatDate(booking.scheduledStartTime)}</p>
          <p className="text-sm font-semibold text-muted-foreground/70">{formatTime(booking.scheduledStartTime)}</p>
        </div>

        {/* Image */}
        <div className="w-20 h-14 rounded-lg overflow-hidden bg-muted flex-shrink-0">
          {booking.listingThumbnail ? (
            <img
              src={booking.listingThumbnail}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Box className="w-5 h-5 text-muted-foreground/30" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <Link 
            href={`/listings/${booking.listingId}`}
            className="text-[15px] font-bold tracking-tight text-foreground truncate block hover:text-primary transition-colors"
            onClick={e => e.stopPropagation()}
          >
            {booking.listingTitle}
          </Link>
          <p className="text-sm text-muted-foreground/70 truncate mt-0.5">
            {booking.partnerName}
          </p>
        </div>

        {/* Status */}
        <span className={cn(
          "px-3 py-1.5 rounded-lg text-xs font-semibold flex-shrink-0",
          USER_BOOKING_STATUS_COLORS[booking.status]
        )}>
          {USER_BOOKING_STATUS_LABELS[booking.status]}
        </span>

        {/* Chevron */}
        <ChevronDown className={cn(
          "w-4 h-4 text-muted-foreground/40 transition-transform flex-shrink-0",
          isExpanded && "rotate-180"
        )} />
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="px-4 pb-4 pt-0 space-y-4 border-t border-border/40">
          {/* Confirmation Token */}
          {booking.confirmationToken && (
            <div className="flex items-center gap-4 p-4 mt-4 rounded-xl bg-muted/30">
              <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center flex-shrink-0">
                <Calendar className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-semibold text-muted-foreground/70">Confirmation Code</p>
                <p className="text-[15px] font-mono font-bold tracking-wide text-foreground">{booking.confirmationToken}</p>
              </div>
            </div>
          )}

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <p className="text-sm font-semibold text-muted-foreground/70">Attendees</p>
              <p className="text-[15px] font-bold text-foreground">{booking.numberOfAttendees} {booking.numberOfAttendees === 1 ? 'person' : 'people'}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-muted-foreground/70">Booked</p>
              <p className="text-[15px] font-bold text-foreground">{new Date(booking.createdAt).toLocaleDateString('en-AE', { month: 'short', day: 'numeric' })}</p>
            </div>
            {booking.confirmedAt && (
              <div>
                <p className="text-sm font-semibold text-muted-foreground/70">Confirmed</p>
                <p className="text-[15px] font-bold text-foreground">{new Date(booking.confirmedAt).toLocaleDateString('en-AE', { month: 'short', day: 'numeric' })}</p>
              </div>
            )}
          </div>
          
          {booking.notes && (
            <div className="pt-2">
              <p className="text-sm font-semibold text-muted-foreground/70 mb-1">Notes</p>
              <p className="text-sm text-foreground">{booking.notes}</p>
            </div>
          )}
          {booking.specialRequests && (
            <div className="pt-2">
              <p className="text-sm font-semibold text-muted-foreground/70 mb-1">Special Requests</p>
              <p className="text-sm text-foreground">{booking.specialRequests}</p>
            </div>
          )}

          {/* Cancellation Reason */}
          {booking.cancellationReason && (
            <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20">
              <p className="text-sm font-semibold text-red-600 mb-1">Cancellation Reason</p>
              <p className="text-sm text-foreground capitalize">{booking.cancellationReason.replace(/_/g, ' ')}</p>
              {booking.cancellationNotes && (
                <p className="text-sm text-muted-foreground/70 mt-1">{booking.cancellationNotes}</p>
              )}
            </div>
          )}

          {/* Feedback Section */}
          {booking.status === 'completed' && (
            <div className="pt-4 border-t border-border/40">
              {booking.feedbackRating ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star
                        key={star}
                        className={cn(
                          "w-5 h-5",
                          star <= booking.feedbackRating!
                            ? "fill-yellow-500 text-yellow-500"
                            : "text-muted-foreground/30"
                        )}
                      />
                    ))}
                    <span className="text-sm font-semibold text-muted-foreground/70 ml-2">Your rating</span>
                  </div>
                  {booking.feedbackComment && (
                    <p className="text-sm text-muted-foreground/70">{booking.feedbackComment}</p>
                  )}
                </div>
              ) : (
                <button
                  onClick={onLeaveFeedback}
                  className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold transition-colors"
                >
                  Leave Feedback
                </button>
              )}
            </div>
          )}

          {/* Actions */}
          {canCancel() && (
            <div className="pt-4 border-t border-border/40">
              <button
                onClick={onCancel}
                disabled={isActionLoading}
                className="px-5 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600 text-sm font-semibold transition-colors disabled:opacity-50"
              >
                Cancel Booking
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}