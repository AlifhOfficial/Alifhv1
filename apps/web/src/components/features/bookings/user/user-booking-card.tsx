/**
 * User Booking Card Component
 * Clean minimal design with expandable details
 */

'use client';

import { 
  Calendar, 
  Clock, 
  ChevronDown,
  ImageIcon,
  Users,
  MapPin
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/utils';
import { getAppThumbUrl } from '@/utils/storage';
import type { UserBookingData } from './types';

interface UserBookingCardProps {
  booking: UserBookingData;
  isExpanded: boolean;
  isActionLoading: boolean;
  onToggleExpand: () => void;
  onCancel: () => void;
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
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
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
  const listingThumbnailUrl = getAppThumbUrl(booking.listingThumbnail);

  return (
    <div className="group relative">
      {/* Main Card */}
      <div className="flex gap-4 p-4">
        {/* Image */}
        <Link 
          href={`/listings/${booking.listingId}`}
          className="relative w-28 sm:w-36 aspect-[4/3] flex-shrink-0 overflow-hidden rounded-lg bg-muted/30"
          onClick={e => e.stopPropagation()}
        >
          {listingThumbnailUrl ? (
            <img
              src={listingThumbnailUrl}
              alt={booking.listingTitle}
              className="absolute inset-0 h-full w-full object-cover"
              loading="lazy"
              decoding="async"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted/50">
              <ImageIcon className="w-6 h-6 text-muted-foreground/30" />
            </div>
          )}
        </Link>

        {/* Content */}
        <div className="flex-1 min-w-0 flex flex-col">
          {/* Title */}
          <Link 
            href={`/listings/${booking.listingId}`}
            className="text-sm sm:text-base font-semibold text-foreground tracking-tight line-clamp-1 hover:text-primary transition-colors"
            onClick={e => e.stopPropagation()}
          >
            {booking.listingTitle}
          </Link>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
            {booking.partnerName}
          </p>

          {/* Date & Time */}
          <div className="flex items-center gap-3 text-xs mt-2">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Calendar className="w-3.5 h-3.5" />
              <span className="font-medium text-foreground">{formatDate(booking.scheduledStartTime)}</span>
            </span>
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className="w-3.5 h-3.5" />
              <span className="font-medium text-foreground tabular-nums">{formatTime(booking.scheduledStartTime)}</span>
            </span>
            {booking.numberOfAttendees > 1 && (
              <span className="flex items-center gap-1 text-muted-foreground">
                <Users className="w-3.5 h-3.5" />
                {booking.numberOfAttendees}
              </span>
            )}
          </div>

          {/* Status + Code */}
          <div className="flex items-center gap-3 mt-auto pt-3">
            <span className={cn(
              "text-xs font-medium px-2 py-0.5 rounded-full",
              STATUS_CONFIG[booking.status]?.bg || 'bg-muted',
              STATUS_CONFIG[booking.status]?.text || 'text-muted-foreground'
            )}>
              {STATUS_LABELS[booking.status] || booking.status}
            </span>
            
            {booking.confirmationToken && (
              <span className="text-xs font-mono text-muted-foreground/50 ml-auto">
                #{booking.confirmationToken}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Details Toggle */}
      <button
        onClick={onToggleExpand}
        className="w-full flex items-center justify-center gap-1.5 py-3 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
      >
        <span>{isExpanded ? 'Hide details' : 'View details'}</span>
        <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", isExpanded && "rotate-180")} />
      </button>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="px-5 pb-5 pt-2 space-y-5 animate-in slide-in-from-top-2 duration-200">
          {/* Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Attendees</p>
              <p className="text-sm font-medium text-foreground">{booking.numberOfAttendees} {booking.numberOfAttendees === 1 ? 'person' : 'people'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Booked</p>
              <p className="text-sm font-medium text-foreground">{formatFullDate(booking.createdAt)}</p>
            </div>
            {booking.confirmedAt && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Confirmed</p>
                <p className="text-sm font-medium text-foreground">{formatFullDate(booking.confirmedAt)}</p>
              </div>
            )}
          </div>
          
          {booking.notes && (
            <div>
              <p className="text-xs text-muted-foreground mb-1">Notes</p>
              <p className="text-sm text-foreground">{booking.notes}</p>
            </div>
          )}

          {booking.specialRequests && (
            <div>
              <p className="text-xs text-muted-foreground mb-1">Special Requests</p>
              <p className="text-sm text-foreground">{booking.specialRequests}</p>
            </div>
          )}

          {/* Cancellation Reason */}
          {(booking.cancellationReason || booking.cancellationNotes) && (
            <div className="p-4 rounded-lg bg-destructive/5">
              <p className="text-xs font-medium text-destructive mb-1">Cancellation Reason</p>
              <p className="text-sm text-foreground">
                {booking.cancellationNotes || booking.cancellationReason?.replace(/_/g, ' ')}
              </p>
            </div>
          )}

          {/* Rejection Reason */}
          {booking.rejectionReason && (
            <div className="p-4 rounded-lg bg-red-500/5 border border-red-500/20">
              <p className="text-xs font-medium text-red-500 mb-1">Rejection Reason</p>
              <p className="text-sm text-foreground">{booking.rejectionReason}</p>
            </div>
          )}

          {/* Cancel Action */}
          {canCancel() && (
            <button
              onClick={onCancel}
              disabled={isActionLoading}
              className="h-9 px-4 rounded-lg text-destructive hover:bg-destructive/10 text-sm font-medium transition-colors disabled:opacity-50"
            >
              Cancel Booking
            </button>
          )}
        </div>
      )}
    </div>
  );
}
