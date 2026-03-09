/**
 * Individual Booking Card Component
 * macOS-inspired minimal design
 */

'use client';

import { 
  Calendar, 
  Clock, 
  User, 
  Phone,
  Mail,
  ChevronDown,
  ImageIcon,
  Copy,
  Check,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/utils';
import { getThumbUrl } from '@/utils/storage';
import type { BookingData } from './types';

const BOOKING_TIME_ZONE = 'Asia/Dubai';

// Status badge config with background and text colors
const STATUS_CONFIG: Record<string, { bg: string; text: string }> = {
  pending: { bg: 'bg-amber-500/10', text: 'text-amber-600' },
  confirmed: { bg: 'bg-emerald-500/10', text: 'text-emerald-600' },
  completed: { bg: 'bg-blue-500/10', text: 'text-blue-600' },
  cancelled: { bg: 'bg-red-500/10', text: 'text-red-600' },
  rejected: { bg: 'bg-red-500/10', text: 'text-red-600' },
  expired: { bg: 'bg-muted', text: 'text-muted-foreground' },
  no_show: { bg: 'bg-muted', text: 'text-muted-foreground' },
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  completed: 'Completed',
  cancelled: 'Cancelled',
  rejected: 'Rejected',
  expired: 'Expired',
  no_show: 'No Show',
};

interface BookingCardProps {
  booking: BookingData;
  isExpanded: boolean;
  isActionLoading: boolean;
  onToggleExpand: () => void;
  onAction: (action: string, data?: Record<string, any>) => void;
}

export function BookingCard({
  booking,
  isExpanded,
  isActionLoading,
  onToggleExpand,
  onAction,
}: BookingCardProps) {
  const [copied, setCopied] = useState(false);

  const copyCode = async () => {
    if (!booking.confirmationToken) return;
    await navigator.clipboard.writeText(booking.confirmationToken);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (isoString: string) => {
    const d = new Date(isoString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (d.toDateString() === today.toDateString()) return 'Today';
    if (d.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    return d.toLocaleDateString('en-AE', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
      timeZone: BOOKING_TIME_ZONE 
    });
  };

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString('en-AE', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: BOOKING_TIME_ZONE,
    });
  };

  const now = new Date();
  const scheduledStart = new Date(booking.scheduledStartTime);
  const scheduledEnd = new Date(booking.scheduledEndTime);
  const hasStarted = scheduledStart <= now;
  const hasEnded = scheduledEnd <= now;

  return (
    <div className="group relative">
      {/* Main Card */}
      <div className="flex gap-4 p-4">
        {/* Image */}
        <div className="relative w-28 sm:w-36 aspect-[4/3] flex-shrink-0 overflow-hidden rounded-lg bg-muted/20">
          {booking.listingThumbnail ? (
            <img
              src={getThumbUrl(booking.listingThumbnail) || booking.listingThumbnail}
              alt={booking.listingTitle}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted/30">
              <ImageIcon className="w-6 h-6 text-muted-foreground/30" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 flex flex-col">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm sm:text-base font-semibold text-foreground tracking-tight line-clamp-1">
                {booking.listingTitle}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <User className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{booking.userName}</span>
                {booking.numberOfAttendees > 1 && (
                  <span className="text-xs text-muted-foreground/60">+{booking.numberOfAttendees - 1}</span>
                )}
              </div>
            </div>
            <span className={cn(
              "text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0",
              STATUS_CONFIG[booking.status]?.bg || 'bg-muted',
              STATUS_CONFIG[booking.status]?.text || 'text-muted-foreground'
            )}>
              {STATUS_LABELS[booking.status] || booking.status}
            </span>
          </div>

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
          </div>

          {/* Code */}
          <div className="mt-auto pt-3">
            {booking.confirmationToken && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  copyCode();
                }}
                className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground hover:text-foreground transition-colors"
                title="Copy booking code"
              >
                <span>#{booking.confirmationToken}</span>
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </button>
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
          <div className="grid md:grid-cols-2 gap-6">
            {/* Contact Info */}
            <div className="space-y-3">
              <p className="text-xs font-medium text-muted-foreground">Contact</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">{booking.userName}</span>
                  {booking.numberOfAttendees > 1 && (
                    <span className="text-xs text-muted-foreground">(+{booking.numberOfAttendees - 1} guests)</span>
                  )}
                </div>
                <a 
                  href={`mailto:${booking.userEmail}`}
                  className="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors"
                >
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  {booking.userEmail}
                </a>
                <a 
                  href={`tel:${booking.userPhone}`}
                  className="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors"
                >
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  {booking.userPhone}
                </a>
              </div>
            </div>

            {/* Booking Info */}
            <div className="space-y-3">
              <p className="text-xs font-medium text-muted-foreground">Booking Info</p>
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Code</p>
                  <button
                    onClick={copyCode}
                    className="flex items-center gap-1.5 text-sm font-mono font-medium text-foreground hover:text-primary transition-colors"
                  >
                    {booking.confirmationToken}
                    {copied ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 opacity-50 hover:opacity-100 transition-opacity" />
                    )}
                  </button>
                </div>
                {booking.checkInTime && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Checked In</p>
                    <p className="text-sm font-medium text-foreground">{formatTime(booking.checkInTime)}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Notes & Requests */}
          {(booking.notes || booking.specialRequests) && (
            <div className="space-y-4">
              {booking.notes && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Notes</p>
                  <p className="text-sm text-foreground leading-relaxed">{booking.notes}</p>
                </div>
              )}
              {booking.specialRequests && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Special Requests</p>
                  <p className="text-sm text-foreground leading-relaxed">{booking.specialRequests}</p>
                </div>
              )}
            </div>
          )}

          {/* Cancellation Reason */}
          {booking.cancellationReason && (
            <div className="p-4 rounded-lg bg-destructive/5">
              <p className="text-xs font-medium text-destructive mb-1">Cancellation Reason</p>
              <p className="text-sm text-foreground capitalize">{booking.cancellationReason.replace(/_/g, ' ')}</p>
              {booking.cancellationNotes && (
                <p className="text-xs text-muted-foreground mt-2">{booking.cancellationNotes}</p>
              )}
            </div>
          )}

          {/* Rejection Reason */}
          {booking.rejectionReason && (
            <div className="p-4 rounded-lg bg-red-500/5 border border-red-500/20">
              <p className="text-xs font-medium text-red-500 mb-1">Rejection Reason</p>
              <p className="text-sm text-foreground">{booking.rejectionReason}</p>
            </div>
          )}

          {/* Actions */}
          {(booking.status === 'pending' || booking.status === 'confirmed') && (
            <div className="flex flex-wrap gap-2 pt-2">
              {booking.status === 'pending' && (
                <>
                  <button
                    onClick={() => onAction('confirm')}
                    disabled={isActionLoading}
                    className="h-9 px-4 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {isActionLoading && <div className="w-3.5 h-3.5 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />}
                    Confirm
                  </button>
                  <button
                    onClick={() => onAction('reject')}
                    disabled={isActionLoading}
                    className="h-9 px-4 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    Reject
                  </button>
                </>
              )}
              
              {booking.status === 'confirmed' && !hasStarted && (
                <button
                  onClick={() => onAction('cancel')}
                  disabled={isActionLoading}
                  className="h-9 px-4 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isActionLoading && <div className="w-3.5 h-3.5 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin" />}
                  Cancel
                </button>
              )}

              {booking.status === 'confirmed' && hasStarted && (
                <>
                  <button
                    onClick={() => onAction('complete')}
                    disabled={isActionLoading}
                    className="h-9 px-4 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {isActionLoading && <div className="w-3.5 h-3.5 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />}
                    Complete
                  </button>
                  {hasEnded && (
                    <button
                      onClick={() => onAction('noShow', { noShowReason: 'Customer did not show up' })}
                      disabled={isActionLoading}
                      className="h-9 px-4 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 text-sm font-medium transition-colors disabled:opacity-50"
                    >
                      No-show
                    </button>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
