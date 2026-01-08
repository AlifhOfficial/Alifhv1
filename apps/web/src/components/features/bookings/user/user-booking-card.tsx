/**
 * User Booking Card Component
 */

'use client';

import { 
  Calendar, 
  Clock, 
  ChevronDown,
  Star,
  Building2
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/utils';
import type { UserBookingData } from './types';
import { USER_BOOKING_STATUS_COLORS, USER_BOOKING_STATUS_LABELS } from './types';
import { BookingStatusIcon } from './booking-status-icon';

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
    return new Date(isoString).toLocaleDateString('en-AE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString('en-AE', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
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
    <div className="rounded-xl border border-sidebar-border overflow-hidden bg-sidebar hover:bg-sidebar-accent/50 transition-colors">
      {/* Booking Header */}
      <div 
        className="px-5 py-4 cursor-pointer"
        onClick={onToggleExpand}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 min-w-0 flex-1">
            {booking.listingThumbnail && (
              <div className="relative w-28 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0 border border-sidebar-border">
                <img
                  src={booking.listingThumbnail}
                  alt={booking.listingTitle}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="min-w-0 space-y-2 flex-1">
              <Link 
                href={`/listings/${booking.listingId}`}
                className="text-base font-semibold tracking-tight text-sidebar-foreground hover:text-primary transition-colors line-clamp-1 block"
                onClick={e => e.stopPropagation()}
              >
                {booking.listingTitle}
              </Link>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Building2 className="w-3.5 h-3.5" />
                <span>{booking.partnerName}</span>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center gap-2 text-sidebar-foreground/90">
                  <Calendar className="w-4 h-4 text-muted-foreground/60" />
                  <span className="font-medium">
                    {formatDate(booking.scheduledStartTime)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>
                    {formatTime(booking.scheduledStartTime)} - {formatTime(booking.scheduledEndTime)}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <span className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold tracking-tight",
              USER_BOOKING_STATUS_COLORS[booking.status]
            )}>
              <BookingStatusIcon status={booking.status} />
              {USER_BOOKING_STATUS_LABELS[booking.status]}
            </span>
            <ChevronDown className={cn(
              "w-5 h-5 text-muted-foreground/60 transition-transform duration-200",
              isExpanded && "rotate-180"
            )} />
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="border-t border-sidebar-border px-5 py-4 space-y-5">
          {/* Confirmation Token */}
          {booking.confirmationToken && (
            <div className="rounded-lg bg-sidebar-accent/40 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-sidebar-accent flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Confirmation Code</p>
                  <p className="text-xl font-mono font-bold text-sidebar-foreground tracking-wider mt-1">{booking.confirmationToken}</p>
                </div>
              </div>
            </div>
          )}

          {/* Details Grid */}
          <div className="grid md:grid-cols-2 gap-5">
            <div className="space-y-2.5">
              <h4 className="text-base font-semibold tracking-tight text-sidebar-foreground">Booking Details</h4>
              <div className="space-y-2 text-sm">
                <p className="text-muted-foreground">
                  <span className="text-sidebar-foreground/90 font-semibold">Attendees:</span>{' '}
                  {booking.numberOfAttendees} {booking.numberOfAttendees === 1 ? 'person' : 'people'}
                </p>
                <p className="text-muted-foreground">
                  <span className="text-sidebar-foreground/90 font-medium">Booked on:</span>{' '}
                  {new Date(booking.createdAt).toLocaleDateString('en-AE')}
                </p>
                {booking.confirmedAt && (
                  <p className="text-muted-foreground">
                    <span className="text-sidebar-foreground/90 font-medium">Confirmed on:</span>{' '}
                    {new Date(booking.confirmedAt).toLocaleDateString('en-AE')}
                  </p>
                )}
              </div>
            </div>

            {(booking.notes || booking.specialRequests) && (
              <div className="space-y-3">
                {booking.notes && (
                  <div>
                    <h4 className="text-base font-semibold tracking-tight text-sidebar-foreground">Your Notes</h4>
                    <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{booking.notes}</p>
                  </div>
                )}
                {booking.specialRequests && (
                  <div>
                    <h4 className="text-base font-semibold tracking-tight text-sidebar-foreground">Special Requests</h4>
                    <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{booking.specialRequests}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Cancellation Reason */}
          {booking.cancellationReason && (
            <div className="rounded-lg bg-rose-500/10 px-5 py-4">
              <p className="text-base font-semibold tracking-tight text-rose-500">Cancellation Reason</p>
              <p className="text-sm text-muted-foreground mt-2 capitalize">
                {booking.cancellationReason.replace(/_/g, ' ')}
              </p>
              {booking.cancellationNotes && (
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                  {booking.cancellationNotes}
                </p>
              )}
            </div>
          )}

          {/* Feedback Section */}
          {booking.status === 'completed' && (
            <div className="pt-4 border-t border-sidebar-border">
              {booking.feedbackRating ? (
                <div className="space-y-2.5">
                  <h4 className="text-base font-semibold tracking-tight text-sidebar-foreground">Your Feedback</h4>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star
                        key={star}
                        className={cn(
                          "w-5 h-5",
                          star <= booking.feedbackRating!
                            ? "fill-yellow-500 text-yellow-500"
                            : "text-muted-foreground/40"
                        )}
                      />
                    ))}
                  </div>
                  {booking.feedbackComment && (
                    <p className="text-sm text-muted-foreground leading-relaxed">{booking.feedbackComment}</p>
                  )}
                </div>
              ) : (
                <button
                  onClick={onLeaveFeedback}
                  className="px-5 py-2.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold tracking-tight transition-colors"
                >
                  Leave Feedback
                </button>
              )}
            </div>
          )}

          {/* Actions */}
          {canCancel() && (
            <div className="flex gap-2 pt-4 border-t border-sidebar-border">
              <button
                onClick={onCancel}
                disabled={isActionLoading}
                className="px-5 py-2.5 rounded-lg bg-rose-500 hover:bg-rose-600 text-white text-sm font-semibold tracking-tight transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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