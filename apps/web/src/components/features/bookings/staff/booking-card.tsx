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
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: BOOKING_TIME_ZONE,
    });
  };

  const now = new Date();
  const scheduledStart = new Date(booking.scheduledStartTime);
  const scheduledEnd = new Date(booking.scheduledEndTime);
  const hasStarted = scheduledStart <= now;
  const hasEnded = scheduledEnd <= now;

  return (
    <div className="group relative rounded-xl bg-card border border-border/40 hover:border-border/60 transition-colors overflow-hidden">
      {/* Main Card Content */}
      <div className="flex flex-col sm:flex-row">
        {/* Image */}
        <div className="p-2.5 sm:w-36 flex-shrink-0">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-muted/20">
            {booking.listingThumbnail ? (
              <img
                src={booking.listingThumbnail}
                alt={booking.listingTitle}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-muted/30">
                <ImageIcon className="w-6 h-6 text-muted-foreground/30" />
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-3 sm:py-3 sm:pr-3 sm:pl-0.5 flex flex-col min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="min-w-0">
              <p className="text-[15px] font-semibold text-foreground line-clamp-1">
                {booking.listingTitle}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <User className="w-3.5 h-3.5 text-muted-foreground/50" />
                <span className="text-sm text-muted-foreground/70">{booking.userName}</span>
                {booking.numberOfAttendees > 1 && (
                  <span className="text-xs text-muted-foreground/50 ml-1">
                    +{booking.numberOfAttendees - 1}
                  </span>
                )}
              </div>
            </div>
            <span className={cn(
              "text-[11px] font-semibold px-1.5 py-0.5 rounded flex-shrink-0",
              STATUS_CONFIG[booking.status]?.bg || 'bg-muted',
              STATUS_CONFIG[booking.status]?.text || 'text-muted-foreground'
            )}>
              {STATUS_LABELS[booking.status] || booking.status}
            </span>
          </div>

          {/* Date & Time */}
          <div className="flex items-center gap-3 text-sm mb-auto">
            <span className="flex items-center gap-1.5 text-muted-foreground/70">
              <Calendar className="w-3.5 h-3.5" />
              <span className="font-medium text-foreground/80">{formatDate(booking.scheduledStartTime)}</span>
            </span>
            <span className="flex items-center gap-1.5 text-muted-foreground/70">
              <Clock className="w-3.5 h-3.5" />
              <span className="font-medium text-foreground/80 tabular-nums">{formatTime(booking.scheduledStartTime)}</span>
            </span>
          </div>

          {/* Code Row */}
          <div className="flex items-center justify-between pt-2">
            {booking.confirmationToken && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  copyCode();
                }}
                className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground/60 hover:text-muted-foreground transition-colors group/code"
                title="Copy booking code"
              >
                <span>#{booking.confirmationToken}</span>
                {copied ? (
                  <Check className="w-3 h-3 text-emerald-500" />
                ) : (
                  <Copy className="w-3 h-3 opacity-0 group-hover/code:opacity-100 transition-opacity" />
                )}
              </button>
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
        <span className="text-[11px] font-semibold text-muted-foreground/70">
          {isExpanded ? 'Hide' : 'Details'}
        </span>
        <ChevronDown className={cn(
          "w-3.5 h-3.5 text-muted-foreground/50 transition-transform duration-200",
          isExpanded && "rotate-180"
        )} />
      </button>

      {/* Expanded Details Panel */}
      {isExpanded && (
        <div className="px-3 pb-3 pt-2 bg-muted/10 border-t border-border/20 animate-in slide-in-from-top-2 duration-200">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Contact Info */}
            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50">Contact</p>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-muted-foreground/50" />
                  <span className="text-sm font-medium text-foreground/80">{booking.userName}</span>
                  {booking.numberOfAttendees > 1 && (
                    <span className="text-xs text-muted-foreground/60">
                      (+{booking.numberOfAttendees - 1} guests)
                    </span>
                  )}
                </div>
                <a 
                  href={`mailto:${booking.userEmail}`}
                  className="flex items-center gap-2 text-xs text-foreground/80 hover:text-primary transition-colors"
                >
                  <Mail className="w-3.5 h-3.5 text-muted-foreground/50" />
                  {booking.userEmail}
                </a>
                <a 
                  href={`tel:${booking.userPhone}`}
                  className="flex items-center gap-2 text-xs text-foreground/80 hover:text-primary transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-muted-foreground/50" />
                  {booking.userPhone}
                </a>
              </div>
            </div>

            {/* Booking Info */}
            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50">Booking Info</p>
              <div className="space-y-1.5">
                <div>
                  <p className="text-[10px] text-muted-foreground/60">Code</p>
                  <button
                    onClick={copyCode}
                    className="flex items-center gap-1.5 text-xs font-mono font-semibold text-foreground/80 hover:text-primary transition-colors group/code2"
                  >
                    {booking.confirmationToken}
                    {copied ? (
                      <Check className="w-3 h-3 text-emerald-500" />
                    ) : (
                      <Copy className="w-3 h-3 opacity-50 group-hover/code2:opacity-100 transition-opacity" />
                    )}
                  </button>
                </div>
                {booking.checkInTime && (
                  <div>
                    <p className="text-[10px] text-muted-foreground/60">Checked In</p>
                    <p className="text-xs font-medium text-foreground/80">
                      {formatTime(booking.checkInTime)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Notes & Requests */}
          {(booking.notes || booking.specialRequests) && (
            <div className="mt-3 pt-3 border-t border-border/20 space-y-2">
              {booking.notes && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50 mb-1">Notes</p>
                  <p className="text-xs text-foreground/80 leading-relaxed">{booking.notes}</p>
                </div>
              )}
              {booking.specialRequests && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50 mb-1">Special Requests</p>
                  <p className="text-xs text-foreground/80 leading-relaxed">{booking.specialRequests}</p>
                </div>
              )}
            </div>
          )}

          {/* Cancellation Reason */}
          {booking.cancellationReason && (
            <div className="mt-3 p-2.5 rounded-lg bg-destructive/5 border border-destructive/10">
              <p className="text-[10px] font-bold uppercase tracking-wider text-destructive/80 mb-1">Cancellation Reason</p>
              <p className="text-xs text-foreground/80 capitalize">{booking.cancellationReason.replace(/_/g, ' ')}</p>
              {booking.cancellationNotes && (
                <p className="text-[11px] text-muted-foreground/70 mt-1">{booking.cancellationNotes}</p>
              )}
            </div>
          )}

          {/* Actions */}
          {(booking.status === 'pending' || booking.status === 'confirmed') && (
            <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-border/20">
              {booking.status === 'pending' && (
                <>
                  <button
                    onClick={() => onAction('confirm')}
                    disabled={isActionLoading}
                    className="h-7 px-3 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 text-xs font-semibold transition-colors disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {isActionLoading ? (
                      <div className="w-3 h-3 border border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
                    ) : null}
                    Confirm
                  </button>
                  <button
                    onClick={() => {
                      const reason = prompt('Enter rejection reason:');
                      if (reason) {
                        onAction('reject', { reason });
                      }
                    }}
                    disabled={isActionLoading}
                    className="h-7 px-3 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 text-xs font-semibold transition-colors disabled:opacity-50"
                  >
                    Reject
                  </button>
                </>
              )}
              
              {booking.status === 'confirmed' && !hasStarted && (
                <button
                  onClick={() => onAction('cancel')}
                  disabled={isActionLoading}
                  className="h-7 px-3 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 text-xs font-semibold transition-colors disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isActionLoading ? (
                    <div className="w-3 h-3 border border-red-500/30 border-t-red-500 rounded-full animate-spin" />
                  ) : null}
                  Cancel
                </button>
              )}

              {booking.status === 'confirmed' && hasStarted && (
                <>
                  <button
                    onClick={() => onAction('complete')}
                    disabled={isActionLoading}
                    className="h-7 px-3 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 text-xs font-semibold transition-colors disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {isActionLoading ? (
                      <div className="w-3 h-3 border border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
                    ) : null}
                    Complete
                  </button>
                  {hasEnded && (
                    <button
                      onClick={() => onAction('no_show', { 
                        reason: 'Customer did not show up' 
                      })}
                      disabled={isActionLoading}
                      className="h-7 px-3 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 text-xs font-semibold transition-colors disabled:opacity-50"
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
