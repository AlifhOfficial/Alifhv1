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

// Status colors - solid text only
const STATUS_COLORS: Record<string, string> = {
  pending: 'text-amber-500',
  confirmed: 'text-emerald-500',
  completed: 'text-blue-500',
  cancelled: 'text-red-500',
  rejected: 'text-red-500',
  expired: 'text-slate-400',
  no_show: 'text-slate-400',
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
    <div className="group relative rounded-xl bg-sidebar border border-sidebar-border overflow-hidden">
      {/* Main Card Content */}
      <div className="flex flex-col sm:flex-row">
        {/* Image */}
        <div className="p-3 sm:w-40 flex-shrink-0">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-muted/20">
            {booking.listingThumbnail ? (
              <img
                src={booking.listingThumbnail}
                alt={booking.listingTitle}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-sidebar-accent">
                <ImageIcon className="w-8 h-8 text-sidebar-foreground/20" />
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 sm:py-4 sm:pr-4 sm:pl-1 flex flex-col min-w-0">
          {/* Header */}
          <div className="mb-2">
            <p className="text-[15px] font-bold tracking-tight text-foreground line-clamp-1">
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
          </div>

          {/* Status Row */}
          <div className="flex items-center justify-between pt-3">
            <span className={cn("text-xs font-bold", STATUS_COLORS[booking.status] || 'text-muted-foreground')}>
              {STATUS_LABELS[booking.status] || booking.status}
            </span>
            
            {booking.confirmationToken && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  copyCode();
                }}
                className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground/50 hover:text-muted-foreground transition-colors group/code"
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
          <div className="grid md:grid-cols-2 gap-6">
            {/* Contact Info */}
            <div className="space-y-3">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Contact</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground/50" />
                  <span className="text-sm font-semibold text-foreground">{booking.userName}</span>
                  {booking.numberOfAttendees > 1 && (
                    <span className="text-xs text-muted-foreground">
                      (+{booking.numberOfAttendees - 1} guests)
                    </span>
                  )}
                </div>
                <a 
                  href={`mailto:${booking.userEmail}`}
                  className="flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <Mail className="w-4 h-4" />
                  {booking.userEmail}
                </a>
                <a 
                  href={`tel:${booking.userPhone}`}
                  className="flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <Phone className="w-4 h-4" />
                  {booking.userPhone}
                </a>
              </div>
            </div>

            {/* Booking Info */}
            <div className="space-y-3">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Booking Info</p>
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-muted-foreground">Confirmation Code</p>
                  <button
                    onClick={copyCode}
                    className="flex items-center gap-2 text-sm font-mono font-bold text-foreground hover:text-primary transition-colors group/code2"
                  >
                    {booking.confirmationToken}
                    {copied ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 opacity-50 group-hover/code2:opacity-100 transition-opacity" />
                    )}
                  </button>
                </div>
                {booking.checkInTime && (
                  <div>
                    <p className="text-xs text-muted-foreground">Checked In</p>
                    <p className="text-sm font-semibold text-foreground">
                      {formatTime(booking.checkInTime)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Notes & Requests */}
          {(booking.notes || booking.specialRequests) && (
            <div className="mt-4 pt-4 border-t border-sidebar-border/30 space-y-3">
              {booking.notes && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Notes</p>
                  <p className="text-sm text-foreground">{booking.notes}</p>
                </div>
              )}
              {booking.specialRequests && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Special Requests</p>
                  <p className="text-sm text-foreground">{booking.specialRequests}</p>
                </div>
              )}
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

          {/* Actions */}
          {(booking.status === 'pending' || booking.status === 'confirmed') && (
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-sidebar-border/30">
              {booking.status === 'pending' && (
                <>
                  <button
                    onClick={() => onAction('confirm')}
                    disabled={isActionLoading}
                    className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold transition-colors disabled:opacity-50"
                  >
                    {isActionLoading ? 'Confirming...' : 'Confirm'}
                  </button>
                  <button
                    onClick={() => {
                      const reason = prompt('Enter rejection reason:');
                      if (reason) {
                        onAction('reject', { reason });
                      }
                    }}
                    disabled={isActionLoading}
                    className="px-4 py-2 rounded-lg text-red-500 hover:bg-red-500/10 text-sm font-semibold transition-colors disabled:opacity-50"
                  >
                    Reject
                  </button>
                </>
              )}
              
              {booking.status === 'confirmed' && !hasStarted && (
                <button
                  onClick={() => onAction('cancel')}
                  disabled={isActionLoading}
                  className="px-4 py-2 rounded-lg text-red-500 hover:bg-red-500/10 text-sm font-semibold transition-colors disabled:opacity-50"
                >
                  {isActionLoading ? 'Cancelling...' : 'Cancel Booking'}
                </button>
              )}

              {booking.status === 'confirmed' && hasStarted && (
                <>
                  <button
                    onClick={() => onAction('complete')}
                    disabled={isActionLoading}
                    className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold transition-colors disabled:opacity-50"
                  >
                    {isActionLoading ? 'Completing...' : 'Mark Complete'}
                  </button>
                  {hasEnded && (
                    <button
                      onClick={() => onAction('no_show', { 
                        reason: 'Customer did not show up' 
                      })}
                      disabled={isActionLoading}
                      className="px-4 py-2 rounded-lg text-amber-500 hover:bg-amber-500/10 text-sm font-semibold transition-colors disabled:opacity-50"
                    >
                      {isActionLoading ? 'Reporting...' : 'Report No-Show'}
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
