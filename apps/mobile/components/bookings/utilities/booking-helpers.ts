/**
 * Booking Helpers — User Bookings Management
 *
 * Pure utility functions for formatting, status mapping, and display logic.
 * No API calls — used by the bookings screen and sheets.
 */

import type { BookingStatus } from '@/lib/booking-api';

// ─── Status Display ──────────────────────────────────────────────────────────

/** Human-readable label for a booking status */
export function formatBookingStatus(status: BookingStatus): string {
  switch (status) {
    case 'pending':   return 'Pending';
    case 'confirmed': return 'Confirmed';
    case 'completed': return 'Completed';
    case 'cancelled': return 'Cancelled';
    case 'rejected':  return 'Rejected';
    case 'no_show':   return 'No Show';
    case 'expired':   return 'Expired';
    default:          return 'Unknown';
  }
}

/** Map booking status to a semantic color */
export function getBookingStatusColor(
  status: BookingStatus,
  colors: {
    success: string;
    warning: string;
    error: string;
    primary: string;
    labelSecondary: string;
    labelQuaternary: string;
  },
): string {
  switch (status) {
    case 'pending':   return colors.warning;
    case 'confirmed': return colors.primary;
    case 'completed': return colors.success;
    case 'cancelled': return colors.labelQuaternary;
    case 'rejected':  return colors.error;
    case 'no_show':   return colors.error;
    case 'expired':   return colors.labelSecondary;
    default:          return colors.labelQuaternary;
  }
}

// ─── Date / Time Formatting ──────────────────────────────────────────────────

/** Format a date string to a readable date: "Mon, 12 Feb 2026" */
export function formatBookingDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/** Format a time string to readable time: "10:30 AM" */
export function formatBookingTime(timeStr: string): string {
  const d = new Date(timeStr);
  return d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/** Format time range: "10:30 AM – 11:15 AM" */
export function formatTimeRange(startTime: string, endTime: string): string {
  return `${formatBookingTime(startTime)} – ${formatBookingTime(endTime)}`;
}

/** Relative time display for upcoming bookings */
export function formatBookingCountdown(scheduledDate: string): {
  text: string;
  isToday: boolean;
  isTomorrow: boolean;
  isPast: boolean;
} {
  const now = new Date();
  const date = new Date(scheduledDate);

  // Normalize to date-only comparison
  const nowDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffMs = targetDate.getTime() - nowDate.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    const absDays = Math.abs(diffDays);
    return {
      text: absDays === 1 ? 'Yesterday' : `${absDays} days ago`,
      isToday: false,
      isTomorrow: false,
      isPast: true,
    };
  }

  if (diffDays === 0) {
    return { text: 'Today', isToday: true, isTomorrow: false, isPast: false };
  }

  if (diffDays === 1) {
    return { text: 'Tomorrow', isToday: false, isTomorrow: true, isPast: false };
  }

  if (diffDays <= 7) {
    return { text: `In ${diffDays} days`, isToday: false, isTomorrow: false, isPast: false };
  }

  return {
    text: formatBookingDate(scheduledDate),
    isToday: false,
    isTomorrow: false,
    isPast: false,
  };
}

// ─── Price Formatting ────────────────────────────────────────────────────────

export function formatPrice(price: number): string {
  if (!price) return '—';
  return `AED ${price.toLocaleString()}`;
}

// ─── Cancellation Helpers ────────────────────────────────────────────────────

/** Check if a booking can be cancelled by the user */
export function canCancelBooking(
  status: BookingStatus,
  scheduledStartTime: string,
  partnerSettings?: {
    allowUserCancellation?: boolean;
    cancellationDeadlineHours?: number;
  } | null,
): { canCancel: boolean; reason?: string } {
  // Only pending and confirmed bookings can be cancelled
  if (status !== 'pending' && status !== 'confirmed') {
    return { canCancel: false, reason: 'This booking cannot be cancelled' };
  }

  // Check if partner allows cancellation
  if (partnerSettings?.allowUserCancellation === false) {
    return { canCancel: false, reason: 'This dealer does not allow online cancellation' };
  }

  // Check cancellation deadline
  const deadlineHours = partnerSettings?.cancellationDeadlineHours ?? 2;
  const now = new Date();
  const start = new Date(scheduledStartTime);
  const hoursUntil = (start.getTime() - now.getTime()) / (1000 * 60 * 60);

  if (hoursUntil < deadlineHours) {
    return {
      canCancel: false,
      reason: `Cancellation deadline passed (${deadlineHours}h before appointment)`,
    };
  }

  return { canCancel: true };
}

// ─── Cancellation Reason Labels ──────────────────────────────────────────────

export const CANCELLATION_REASONS = [
  { value: 'schedule_conflict', label: 'Schedule conflict' },
  { value: 'found_another_car', label: 'Found another car' },
  { value: 'price_issue',       label: 'Price doesn\'t work for me' },
  { value: 'location_issue',    label: 'Location is inconvenient' },
  { value: 'changed_mind',      label: 'Changed my mind' },
  { value: 'emergency',         label: 'Emergency' },
  { value: 'other',             label: 'Other' },
] as const;
