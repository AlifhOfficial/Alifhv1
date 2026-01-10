/**
 * User Booking Card Component
 * Clean minimal design with expandable details
 */

'use client';

import { 
  Calendar, 
  Clock, 
  ChevronDown,
  Star,
  ImageIcon,
  Users,
  MapPin
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/utils';
import type { UserBookingData } from './types';

interface UserBookingCardProps {
  booking: UserBookingData;
  isExpanded: boolean;
  isActionLoading: boolean;
  onToggleExpand: () => void;
  onCancel: () => void;
  onLeaveFeedback: () => void;
}

// Status colors with background for badge style
const STATUS_CONFIG: Record<string, { bg: string; text: string }> = {
  pending: { bg: 'bg-amber-500/10', text: 'text-amber-600' },
  confirmed: { bg: 'bg-emerald-500/10', text: 'text-emerald-600' },
  completed: { bg: 'bg-blue-500/10', text: 'text-blue-600' },
  cancelled: { bg: 'bg-red-500/10', text: 'text-red-600' },
  no_show: { bg: 'bg-muted', text: 'text-muted-foreground' },
  expired: { bg: 'bg-muted', text: 'text-muted-foreground' },
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  completed: 'Completed',
  cancelled: 'Cancelled',
  no_show: 'No Show',
};

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
    
    if (d.toDateString() === today.toDateString()) return 'Today';
    if (d.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    return d.toLocaleDateString('en-AE', { month: 'short', day: 'numeric' });
  };

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString('en-AE', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const formatFullDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString('en-AE', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
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
    <div className="group relative rounded-xl bg-card border border-border/40 overflow-hidden hover:border-border/60 transition-colors">
      {/* Main Card Content */}
      <div className="flex flex-col sm:flex-row">
        {/* Image */}
        <div className="p-2.5 sm:w-44 flex-shrink-0">
          <Link 
            href={`/listings/${booking.listingId}`}
            className="relative aspect-[4/3] w-full overflow-hidden rounded-lg block bg-muted/30"
            onClick={e => e.stopPropagation()}
          >
            {booking.listingThumbnail ? (
              <Image
                src={booking.listingThumbnail}
                alt={booking.listingTitle}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 176px"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-muted/50">
                <ImageIcon className="w-6 h-6 text-muted-foreground/30" />
              </div>
            )}
          </Link>
        </div>

        {/* Content */}
        <div className="flex-1 p-3 sm:py-3 sm:pr-3 sm:pl-0.5 flex flex-col min-w-0">
          {/* Header */}
          <div className="mb-1.5">
            <Link 
              href={`/listings/${booking.listingId}`}
              className="text-sm font-semibold text-foreground line-clamp-1 hover:text-primary transition-colors"
              onClick={e => e.stopPropagation()}
            >
              {booking.listingTitle}
            </Link>
            <p className="text-xs text-muted-foreground/60 mt-0.5 line-clamp-1">
              {booking.partnerName}
            </p>
          </div>

          {/* Date & Time */}
          <div className="flex items-center gap-3 text-xs mb-auto">
            <span className="flex items-center gap-1 text-muted-foreground/60">
              <Calendar className="w-3.5 h-3.5" />
              <span className="font-semibold text-foreground/80">{formatDate(booking.scheduledStartTime)}</span>
            </span>
            <span className="flex items-center gap-1 text-muted-foreground/60">
              <Clock className="w-3.5 h-3.5" />
              <span className="font-semibold text-foreground/80 tabular-nums">{formatTime(booking.scheduledStartTime)}</span>
            </span>
            {booking.numberOfAttendees > 1 && (
              <span className="flex items-center gap-1 text-muted-foreground/60">
                <Users className="w-3.5 h-3.5" />
                <span className="font-semibold text-foreground/80 tabular-nums">{booking.numberOfAttendees}</span>
              </span>
            )}
          </div>

          {/* Status Row */}
          <div className="flex items-center justify-between pt-2 mt-2 border-t border-border/30">
            <span className={cn(
              "text-[11px] font-semibold px-1.5 py-0.5 rounded",
              STATUS_CONFIG[booking.status]?.bg || 'bg-muted',
              STATUS_CONFIG[booking.status]?.text || 'text-muted-foreground'
            )}>
              {STATUS_LABELS[booking.status] || booking.status}
            </span>
            
            {booking.confirmationToken && (
              <span className="text-[10px] font-mono text-muted-foreground/40">
                #{booking.confirmationToken}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Details Toggle Bar */}
      <button
        onClick={onToggleExpand}
        className={cn(
          "w-full flex items-center justify-between px-3 py-2 border-t border-border/30 hover:bg-muted/30 transition-colors",
          isExpanded && "bg-muted/20"
        )}
      >
        <span className="text-[11px] font-medium text-muted-foreground/60">
          {isExpanded ? 'Hide details' : 'View details'}
        </span>
        <ChevronDown className={cn(
          "w-3.5 h-3.5 text-muted-foreground/40 transition-transform duration-200",
          isExpanded && "rotate-180"
        )} />
      </button>

      {/* Expanded Details Panel */}
      {isExpanded && (
        <div className="px-3 pb-3 pt-2 bg-muted/10 animate-in slide-in-from-top-2 duration-200">
          {/* Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
            <div>
              <p className="text-[11px] font-medium text-muted-foreground/60 mb-0.5">Attendees</p>
              <p className="text-xs font-semibold text-foreground">{booking.numberOfAttendees} {booking.numberOfAttendees === 1 ? 'person' : 'people'}</p>
            </div>
            <div>
              <p className="text-[11px] font-medium text-muted-foreground/60 mb-0.5">Booked</p>
              <p className="text-xs font-semibold text-foreground">{formatFullDate(booking.createdAt)}</p>
            </div>
            {booking.confirmedAt && (
              <div>
                <p className="text-[11px] font-medium text-muted-foreground/60 mb-0.5">Confirmed</p>
                <p className="text-xs font-semibold text-foreground">{formatFullDate(booking.confirmedAt)}</p>
              </div>
            )}
          </div>
          
          {booking.notes && (
            <div className="pt-2 border-t border-border/30">
              <p className="text-[11px] font-medium text-muted-foreground/60 mb-0.5">Notes</p>
              <p className="text-xs text-foreground">{booking.notes}</p>
            </div>
          )}

          {booking.specialRequests && (
            <div className="pt-2 border-t border-border/30">
              <p className="text-[11px] font-medium text-muted-foreground/60 mb-0.5">Special Requests</p>
              <p className="text-xs text-foreground">{booking.specialRequests}</p>
            </div>
          )}

          {/* Cancellation Reason */}
          {booking.cancellationReason && (
            <div className="mt-3 p-2.5 rounded-lg bg-destructive/5 border border-destructive/10">
              <p className="text-[11px] font-semibold text-destructive mb-0.5">Cancellation Reason</p>
              <p className="text-xs text-foreground capitalize">{booking.cancellationReason.replace(/_/g, ' ')}</p>
              {booking.cancellationNotes && (
                <p className="text-[11px] text-muted-foreground mt-1">{booking.cancellationNotes}</p>
              )}
            </div>
          )}

          {/* Feedback Section */}
          {booking.status === 'completed' && (
            <div className="pt-3 mt-3 border-t border-border/30">
              {booking.feedbackRating ? (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star
                        key={star}
                        className={cn(
                          "w-3.5 h-3.5",
                          star <= booking.feedbackRating!
                            ? "fill-amber-400 text-amber-400"
                            : "text-muted-foreground/20"
                        )}
                      />
                    ))}
                    <span className="text-[11px] font-medium text-muted-foreground ml-1.5">Your rating</span>
                  </div>
                  {booking.feedbackComment && (
                    <p className="text-xs text-muted-foreground/70">{booking.feedbackComment}</p>
                  )}
                </div>
              ) : (
                <button
                  onClick={onLeaveFeedback}
                  className="h-8 px-3 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold transition-colors"
                >
                  Leave Feedback
                </button>
              )}
            </div>
          )}

          {/* Cancel Action */}
          {canCancel() && (
            <div className="pt-3 mt-3 border-t border-border/30">
              <button
                onClick={onCancel}
                disabled={isActionLoading}
                className="h-8 px-3 rounded-lg text-destructive hover:bg-destructive/10 text-xs font-semibold transition-colors disabled:opacity-50"
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