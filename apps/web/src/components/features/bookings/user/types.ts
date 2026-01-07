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
  feedbackRating: number | null;
  feedbackComment: string | null;
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

export const USER_BOOKING_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  confirmed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  rejected: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300',
  no_show: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  expired: 'bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400',
};

export const USER_BOOKING_STATUS_LABELS: Record<string, string> = {
  pending: 'Pending Confirmation',
  confirmed: 'Confirmed',
  completed: 'Completed',
  cancelled: 'Cancelled',
  rejected: 'Rejected',
  no_show: 'No Show',
  expired: 'Expired',
};
