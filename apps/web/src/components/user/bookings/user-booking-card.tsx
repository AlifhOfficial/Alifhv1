/**
 * User Booking Card Component
 */

'use client';

import { 
  Calendar, 
  Clock, 
  XCircle,
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

  const canCancel = () => {
    if (booking.status !== 'pending' && booking.status !== 'confirmed') return false;
    const scheduledTime = new Date(booking.scheduledStartTime);
    const cutoffTime = new Date(scheduledTime.getTime() - 2 * 60 * 60 * 1000);
    return new Date() < cutoffTime;
  };

  return (
    <div className="rounded-xl border border-border overflow-hidden hover:bg-secondary/5 transition-colors">
      {/* Booking Header */}
      <div 
        className="p-6 cursor-pointer"
        onClick={onToggleExpand}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 min-w-0">
            {booking.listingThumbnail && (
              <img
                src={booking.listingThumbnail}
                alt={booking.listingTitle}
                className="w-20 h-14 object-cover rounded-lg flex-shrink-0"
              />
            )}
            <div className="min-w-0 space-y-1.5">
              <Link 
                href={`/listings/${booking.listingId}`}
                className="font-medium text-foreground hover:text-blue-500 truncate block transition-colors"
                onClick={e => e.stopPropagation()}
              >
                {booking.listingTitle}
              </Link>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Building2 className="w-3.5 h-3.5" />
                <span>{booking.partnerName}</span>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-blue-500" />
                  <span className="text-foreground font-medium">
                    {formatDate(booking.scheduledStartTime)}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Clock className="w-3.5 h-3.5" />
                <span>
                  {formatTime(booking.scheduledStartTime)} - {formatTime(booking.scheduledEndTime)}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <span className={cn(
              "flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium",
              USER_BOOKING_STATUS_COLORS[booking.status]
            )}>
              <BookingStatusIcon status={booking.status} />
              {USER_BOOKING_STATUS_LABELS[booking.status]}
            </span>
            <ChevronDown className={cn(
              "w-4 h-4 text-muted-foreground transition-transform",
              isExpanded && "rotate-180"
            )} />
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="border-t border-border p-6 bg-secondary/5 space-y-6">
          {/* Confirmation Token */}
          {booking.confirmationToken && (
            <div className="flex items-center gap-3 p-4 bg-blue-500/10 rounded-xl">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Confirmation Code</p>
                <p className="text-lg font-mono font-semibold text-blue-500">{booking.confirmationToken}</p>
              </div>
            </div>
          )}

          {/* Details Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-foreground">Booking Details</h4>
              <div className="space-y-2 text-sm">
                <p className="text-muted-foreground">
                  <span className="text-foreground font-medium">Attendees:</span>{' '}
                  {booking.numberOfAttendees} {booking.numberOfAttendees === 1 ? 'person' : 'people'}
                </p>
                <p className="text-muted-foreground">
                  <span className="text-foreground font-medium">Booked on:</span>{' '}
                  {new Date(booking.createdAt).toLocaleDateString('en-AE')}
                </p>
                {booking.confirmedAt && (
                  <p className="text-muted-foreground">
                    <span className="text-foreground font-medium">Confirmed on:</span>{' '}
                    {new Date(booking.confirmedAt).toLocaleDateString('en-AE')}
                  </p>
                )}
              </div>
            </div>

            {(booking.notes || booking.specialRequests) && (
              <div className="space-y-3">
                {booking.notes && (
                  <div>
                    <h4 className="text-sm font-medium text-foreground">Your Notes</h4>
                    <p className="text-sm text-muted-foreground mt-1">{booking.notes}</p>
                  </div>
                )}
                {booking.specialRequests && (
                  <div>
                    <h4 className="text-sm font-medium text-foreground">Special Requests</h4>
                    <p className="text-sm text-muted-foreground mt-1">{booking.specialRequests}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Cancellation Reason */}
          {booking.cancellationReason && (
            <div className="p-4 bg-red-500/10 rounded-xl">
              <p className="text-sm font-medium text-red-500">Cancellation Reason</p>
              <p className="text-sm text-muted-foreground mt-1 capitalize">
                {booking.cancellationReason.replace(/_/g, ' ')}
              </p>
              {booking.cancellationNotes && (
                <p className="text-sm text-muted-foreground mt-1">
                  {booking.cancellationNotes}
                </p>
              )}
            </div>
          )}

          {/* Feedback Section */}
          {booking.status === 'completed' && (
            <div className="pt-4 border-t border-border">
              {booking.feedbackRating ? (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-foreground">Your Feedback</h4>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star
                        key={star}
                        className={cn(
                          "w-5 h-5",
                          star <= booking.feedbackRating!
                            ? "fill-yellow-500 text-yellow-500"
                            : "text-muted-foreground"
                        )}
                      />
                    ))}
                  </div>
                  {booking.feedbackComment && (
                    <p className="text-sm text-muted-foreground">{booking.feedbackComment}</p>
                  )}
                </div>
              ) : (
                <button
                  onClick={onLeaveFeedback}
                  className="px-5 py-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white text-sm transition-colors"
                >
                  Leave Feedback
                </button>
              )}
            </div>
          )}

          {/* Actions */}
          {canCancel() && (
            <div className="flex gap-3 pt-4 border-t border-border">
              <button
                onClick={() => {
                  if (confirm('Cancel this booking?')) onCancel();
                }}
                disabled={isActionLoading}
                className="px-5 py-2 rounded-full bg-red-500/10 text-red-500 text-sm hover:bg-red-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
