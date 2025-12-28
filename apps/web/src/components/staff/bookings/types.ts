/**
 * Staff Bookings Types
 */

export interface BookingData {
  id: string;
  status: string;
  scheduledDate: string;
  scheduledStartTime: string;
  scheduledEndTime: string;
  confirmationToken: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  listingId: string;
  listingTitle: string;
  listingThumbnail: string | null;
  notes: string | null;
  specialRequests: string | null;
  numberOfAttendees: number;
  createdAt: string;
  confirmedAt: string | null;
  checkInTime: string | null;
  checkOutTime: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
  cancellationReason: string | null;
  cancellationNotes?: string | null;
}

export interface BookingStats {
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  noShowBookings: number;
  todayBookings: number;
  upcomingBookings: number;
}

export interface AvailabilityRule {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotDuration: number;
  maxConcurrentBookings: number;
  bufferTime: number | null;
  isActive: boolean;
  excludeDates?: string[]; // ["2024-12-25", "2024-01-01"]
}

export interface BookingSettings {
  // Core settings
  bookingEnabled: boolean;
  autoConfirm: boolean;
  
  // Lead time
  minLeadTimeHours: number;
  maxAdvanceBookingDays: number;
  allowSameDay: boolean;
}

export const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-500/10 text-yellow-500',
  confirmed: 'bg-green-500/10 text-green-500',
  completed: 'bg-green-500/10 text-green-500',
  cancelled: 'bg-red-500/10 text-red-500',
  rejected: 'bg-red-500/10 text-red-500',
  no_show: 'bg-yellow-500/10 text-yellow-500',
  expired: 'bg-foreground/10 text-muted-foreground',
};

export const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  completed: 'Completed',
  cancelled: 'Cancelled',
  rejected: 'Rejected',
  no_show: 'No Show',
  expired: 'Expired',
};

export const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
