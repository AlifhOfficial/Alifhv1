/**
 * User Booking Card Component
 * macOS-inspired minimal design
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

// Status colors - solid text only
const STATUS_COLORS: Record<string, string> = {
  pending: 'text-amber-500',
  confirmed: 'text-emerald-500',
  completed: 'text-blue-500',
  cancelled: 'text-red-500',
  no_show: 'text-slate-400',
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
    <div className="group relative rounded-xl bg-sidebar border border-sidebar-border overflow-hidden">
      {/* Main Card Content */}
      <div className="flex flex-col sm:flex-row">
        {/* Image */}
        <div className="p-3 sm:w-48 flex-shrink-0">
          <Link 
            href={`/listings/${booking.listingId}`}
            className="relative aspect-[4/3] w-full overflow-hidden rounded-lg block bg-muted/20"
            onClick={e => e.stopPropagation()}
          >
            {booking.listingThumbnail ? (
              <Image
                src={booking.listingThumbnail}
                alt={booking.listingTitle}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                sizes="(max-width: 640px) 100vw, 192px"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-sidebar-accent">
                <ImageIcon className="w-8 h-8 text-sidebar-foreground/20" />
              </div>
            )}
          </Link>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 sm:py-4 sm:pr-4 sm:pl-1 flex flex-col min-w-0">
          {/* Header */}
          <div className="mb-2">
            <Link 
              href={`/listings/${booking.listingId}`}
              className="text-[15px] font-bold tracking-tight text-foreground line-clamp-1 hover:text-primary transition-colors"
              onClick={e => e.stopPropagation()}
            >
              {booking.listingTitle}
            </Link>
            <p className="text-sm text-muted-foreground/70 mt-0.5 line-clamp-1">
              {booking.partnerName}
            </p>
          </div>

          {/* Date & Time */}
          <div className="flex items-center gap-4 text-sm mb-auto">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span className="font-semibold text-foreground">{formatDate(booking.scheduledStartTime)}</span>
            </span>
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span className="font-semibold text-foreground tabular-nums">{formatTime(booking.scheduledStartTime)}</span>
            </span>
            {booking.numberOfAttendees > 1 && (
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Users className="w-4 h-4" />
                <span className="font-semibold text-foreground tabular-nums">{booking.numberOfAttendees}</span>
              </span>
            )}
          </div>

          {/* Status Row */}
          <div className="flex items-center justify-between pt-3">
            <span className={cn("text-xs font-bold", STATUS_COLORS[booking.status] || 'text-muted-foreground')}>
              {STATUS_LABELS[booking.status] || booking.status}
            </span>
            
            {booking.confirmationToken && (
              <span className="text-xs font-mono text-muted-foreground/50">
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
          "w-full flex items-center justify-between px-4 py-3 border-t border-sidebar-border/60 hover:bg-sidebar-accent/30 transition-colors",
          isExpanded && "bg-sidebar-accent/20"
        )}
      >
        <span className="text-xs font-medium text-muted-foreground">
          {isExpanded ? 'Hide Details' : 'View Details'}
        </span>
        <ChevronDown className={cn(
          "w-4 h-4 text-muted-foreground/50 transition-transform duration-200",
          isExpanded && "rotate-180"
        )} />
      </button>

      {/* Expanded Details Panel */}
      {isExpanded && (
        <div className="px-4 pb-4 pt-3 bg-sidebar-accent/10 border-t border-sidebar-border/30 animate-in slide-in-from-top-2 duration-200">
          {/* Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Attendees</p>
              <p className="text-sm font-bold text-foreground">{booking.numberOfAttendees} {booking.numberOfAttendees === 1 ? 'person' : 'people'}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Booked</p>
              <p className="text-sm font-bold text-foreground">{formatFullDate(booking.createdAt)}</p>
            </div>
            {booking.confirmedAt && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Confirmed</p>
                <p className="text-sm font-bold text-foreground">{formatFullDate(booking.confirmedAt)}</p>
              </div>
            )}
          </div>
          
          {booking.notes && (
            <div className="pt-3 border-t border-sidebar-border/30">
              <p className="text-xs font-medium text-muted-foreground mb-1">Notes</p>
              <p className="text-sm text-foreground">{booking.notes}</p>
            </div>
          )}

          {booking.specialRequests && (
            <div className="pt-3 border-t border-sidebar-border/30">
              <p className="text-xs font-medium text-muted-foreground mb-1">Special Requests</p>
              <p className="text-sm text-foreground">{booking.specialRequests}</p>
            </div>
          )}

          {/* Cancellation Reason */}
          {booking.cancellationReason && (
            <div className="mt-4 p-3 rounded-lg bg-red-500/5 border border-red-500/10">
              <p className="text-xs font-bold text-red-500 mb-1">Cancellation Reason</p>
              <p className="text-sm text-foreground capitalize">{booking.cancellationReason.replace(/_/g, ' ')}</p>
              {booking.cancellationNotes && (
                <p className="text-xs text-muted-foreground mt-1">{booking.cancellationNotes}</p>
              )}
            </div>
          )}

          {/* Feedback Section */}
          {booking.status === 'completed' && (
            <div className="pt-4 mt-4 border-t border-sidebar-border/30">
              {booking.feedbackRating ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star
                        key={star}
                        className={cn(
                          "w-4 h-4",
                          star <= booking.feedbackRating!
                            ? "fill-amber-400 text-amber-400"
                            : "text-muted-foreground/20"
                        )}
                      />
                    ))}
                    <span className="text-xs font-medium text-muted-foreground ml-2">Your rating</span>
                  </div>
                  {booking.feedbackComment && (
                    <p className="text-sm text-muted-foreground/70">{booking.feedbackComment}</p>
                  )}
                </div>
              ) : (
                <button
                  onClick={onLeaveFeedback}
                  className="px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold transition-colors"
                >
                  Leave Feedback
                </button>
              )}
            </div>
          )}

          {/* Cancel Action */}
          {canCancel() && (
            <div className="pt-4 mt-4 border-t border-sidebar-border/30">
              <button
                onClick={onCancel}
                disabled={isActionLoading}
                className="px-4 py-2 rounded-lg text-red-500 hover:bg-red-500/10 text-sm font-semibold transition-colors disabled:opacity-50"
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