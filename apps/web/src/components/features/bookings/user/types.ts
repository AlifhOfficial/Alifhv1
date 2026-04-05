/**
 * User Bookings Types
 */

export interface UserBookingData {
  id: string;
  status: string;
  scheduledDate: string;
  scheduledStartTime: string;
  scheduledEndTime: string;
  listingId: string;
  listingTitle: string;
  listingThumbnail: string | null;
  partnerName: string;
  partnerLogo: string | null;
  notes: string | null;
  specialRequests: string | null;
  numberOfAttendees: number;
  createdAt: string;
  confirmedAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
  cancellationReason: string | null;
  cancellationNotes: string | null;
  confirmationToken: string | null;
  rejectedAt: string | null;
  rejectionReason: string | null;
  // Reschedule tracking
  rescheduleCount: number;
  lastRescheduledAt: string | null;
  // Partner policies (from booking settings)
  partnerSettings?: {
    allowUserCancellation: boolean;
    cancellationDeadlineHours: number;
    allowReschedule: boolean;
    maxRescheduleCount: number;
    rescheduleDeadlineHours: number;
    preparationInstructions: string | null;
    directions: string | null;
    parkingInstructions: string | null;
    contactPersonName: string | null;
    contactPersonPhone: string | null;
  };
}

export interface UserBookingStats {
  total: number;
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
  rejected: number;
  noShow: number;
}

export const USER_BOOKING_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-warning-muted text-warning',
  confirmed: 'bg-success-muted text-success',
  completed: 'bg-primary-muted text-primary',
  cancelled: 'bg-destructive-muted text-destructive',
  rejected: 'bg-muted text-muted-foreground',
  no_show: 'bg-destructive-muted text-destructive',
  expired: 'bg-muted text-muted-foreground',
};

export const USER_BOOKING_STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  completed: 'Completed',
  cancelled: 'Cancelled',
  rejected: 'Rejected',
  no_show: 'No Show',
  expired: 'Expired',
};
