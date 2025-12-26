/**
 * Individual Booking Card Component
 */

'use client';

import { 
  Calendar, 
  Clock, 
  User, 
  Phone,
  Mail,
  CheckCircle,
  XCircle,
  Loader2,
  ChevronDown,
  Check,
  X,
  UserX,
} from 'lucide-react';
import { cn } from '@/utils';
import type { BookingData } from './types';
import { STATUS_COLORS, STATUS_LABELS } from './types';

const BOOKING_TIME_ZONE = 'Asia/Dubai';

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
  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString('en-AE', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      timeZone: BOOKING_TIME_ZONE,
    });
  };

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString('en-AE', {
      hour: '2-digit',
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
    <div className="rounded-xl border border-border overflow-hidden">
      {/* Booking Header */}
      <div 
        className="p-4 cursor-pointer hover:bg-muted/30 transition-colors"
        onClick={onToggleExpand}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0">
            {booking.listingThumbnail && (
              <img
                src={booking.listingThumbnail}
                alt={booking.listingTitle}
                className="w-16 h-12 object-cover rounded-md flex-shrink-0"
              />
            )}
            <div className="min-w-0">
              <p className="font-medium text-foreground truncate">{booking.listingTitle}</p>
              <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                <User className="w-3.5 h-3.5" />
                <span>{booking.userName}</span>
              </div>
              <div className="flex items-center gap-2 mt-0.5 text-sm text-muted-foreground">
                <Calendar className="w-3.5 h-3.5" />
                <span>{formatDate(booking.scheduledStartTime)}</span>
                <Clock className="w-3.5 h-3.5 ml-2" />
                <span>{formatTime(booking.scheduledStartTime)}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className={cn(
              "px-3 py-1 rounded-md text-xs font-medium",
              STATUS_COLORS[booking.status]
            )}>
              {STATUS_LABELS[booking.status]}
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
        <div className="border-t border-border/40 p-4 bg-muted/20">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Contact Info */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-foreground">Contact Information</h4>
              <div className="space-y-1.5 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <User className="w-4 h-4" />
                  <span>{booking.userName}</span>
                  {booking.numberOfAttendees > 1 && (
                    <span className="text-xs">
                      (+{booking.numberOfAttendees - 1} guests)
                    </span>
                  )}
                </div>
                <a 
                  href={`mailto:${booking.userEmail}`}
                  className="flex items-center gap-2 text-primary hover:underline"
                >
                  <Mail className="w-4 h-4" />
                  {booking.userEmail}
                </a>
                <a 
                  href={`tel:${booking.userPhone}`}
                  className="flex items-center gap-2 text-primary hover:underline"
                >
                  <Phone className="w-4 h-4" />
                  {booking.userPhone}
                </a>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <div>
                <h4 className="text-sm font-medium text-foreground">Confirmation Code</h4>
                <p className="text-sm font-mono font-semibold text-primary mt-1">
                  {booking.confirmationToken}
                </p>
                {booking.checkInTime && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Checked in: {formatTime(booking.checkInTime)}
                  </p>
                )}
              </div>
              {booking.notes && (
                <div>
                  <h4 className="text-sm font-medium text-foreground">Notes</h4>
                  <p className="text-sm text-muted-foreground mt-1">{booking.notes}</p>
                </div>
              )}
              {booking.specialRequests && (
                <div>
                  <h4 className="text-sm font-medium text-foreground">Special Requests</h4>
                  <p className="text-sm text-muted-foreground mt-1">{booking.specialRequests}</p>
                </div>
              )}
              {booking.cancellationReason && (
                <div>
                  <h4 className="text-sm font-medium text-destructive">Cancellation Reason</h4>
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
            </div>
          </div>

          {/* Actions */}
          {(booking.status === 'pending' || booking.status === 'confirmed') && (
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border/40">
              {booking.status === 'pending' && (
                <>
                  <button
                    onClick={() => onAction('confirm')}
                    disabled={isActionLoading}
                    className="px-5 py-2 rounded-full bg-green-500 hover:bg-green-600 text-white text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                    className="px-5 py-2 rounded-full border border-border hover:bg-secondary/10 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Reject
                  </button>
                </>
              )}
              
              {booking.status === 'confirmed' && !hasStarted && (
                <button
                  onClick={() => {
                    const notes = prompt('Cancellation reason (optional):') || undefined;
                    onAction('cancel', { reason: 'other', notes });
                  }}
                  disabled={isActionLoading}
                  className="px-5 py-2 rounded-full bg-red-500/10 text-red-500 text-sm hover:bg-red-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isActionLoading ? 'Cancelling...' : 'Cancel Booking'}
                </button>
              )}

              {booking.status === 'confirmed' && hasStarted && (
                <>
                  <button
                    onClick={() => onAction('complete')}
                    disabled={isActionLoading}
                    className="px-5 py-2 rounded-full bg-green-500 hover:bg-green-600 text-white text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isActionLoading ? 'Completing...' : 'Mark Complete'}
                  </button>
                  {hasEnded && (
                    <button
                      onClick={() => onAction('no_show', { 
                        reason: 'Customer did not show up' 
                      })}
                      disabled={isActionLoading}
                      className="px-5 py-2 rounded-full bg-yellow-500/10 text-yellow-500 text-sm hover:bg-yellow-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
