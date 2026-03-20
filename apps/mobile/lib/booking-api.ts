/**
 * Booking API Client - Mobile
 *
 * Handles booking availability, time slots, and booking creation.
 * Mirrors the web API at /api/bookings/slots and /api/bookings.
 */

import { API_BASE, getAppImageUrl } from './config';
import { getStoredSession } from './auth-api';

/** Convert relative CDN path → absolute URL for native <Image/> */
function toAbsoluteUrl(path: string | null | undefined): string | null {
  return getAppImageUrl(path);
}

// ============================================================================
// TYPES
// ============================================================================

export interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  duration: number;
  status: 'available' | 'booked' | 'blocked' | 'past';
  isAvailable: boolean;
}

export interface AvailableDate {
  date: string;
  dayOfWeek: number;
  hasSlots: boolean;
}

export interface BookingSettings {
  minLeadTimeHours: number;
  maxLeadTimeDays: number;
  defaultSlotDuration: number;
  preparationInstructions?: string | null;
  directions?: string | null;
  parkingInstructions?: string | null;
  contactPersonName?: string | null;
  contactPersonPhone?: string | null;
  allowUserCancellation?: boolean;
  cancellationDeadlineHours?: number;
  allowReschedule?: boolean;
  maxRescheduleCount?: number;
  rescheduleDeadlineHours?: number;
}

export interface AvailableDatesResponse {
  available: boolean;
  reason?: string;
  partnerId?: string;
  dates: AvailableDate[];
  settings: BookingSettings | null;
}

export interface TimeSlotsResponse {
  available: boolean;
  partnerId?: string;
  date: string;
  slots: TimeSlot[];
  settings: BookingSettings | null;
}

export interface CreateBookingParams {
  listingId: string;
  scheduledDate: string;
  scheduledStartTime: string;
  scheduledEndTime: string;
  notes?: string;
  specialRequests?: string;
  numberOfAttendees?: number;
}

export interface BookingResult {
  success: boolean;
  bookingId: string;
  confirmationToken: string;
  message: string;
}

// ============================================================================
// API OPERATIONS
// ============================================================================

/**
 * Fetch available dates for a listing (next 30 days)
 */
export async function getAvailableDates(listingId: string): Promise<AvailableDatesResponse> {
  const url = `${API_BASE}/api/bookings/slots?listingId=${listingId}&mode=dates&t=${Date.now()}`;

  console.log('[Booking API] GET available dates', url);

  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Failed to load availability');
  }

  return data;
}

/**
 * Fetch time slots for a specific date
 */
export async function getTimeSlots(listingId: string, dateStr: string): Promise<TimeSlotsResponse> {
  const url = `${API_BASE}/api/bookings/slots?listingId=${listingId}&date=${dateStr}&t=${Date.now()}`;

  console.log('[Booking API] GET time slots', url);

  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Failed to load time slots');
  }

  return data;
}

/**
 * Create a booking (authenticated)
 */
export async function createBooking(params: CreateBookingParams): Promise<BookingResult> {
  const session = await getStoredSession();

  if (!session?.token) {
    throw new Error('Authentication required');
  }

  console.log('[Booking API] POST create booking');

  const res = await fetch(`${API_BASE}/api/bookings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.token}`,
    },
    body: JSON.stringify(params),
  });

  const data = await res.json();

  if (!res.ok) {
    if (res.status === 401) {
      throw new Error('Please sign in to book a test drive');
    }
    if (res.status === 429) {
      throw new Error(data.error || 'You have reached the booking limit. Please try again later.');
    }
    throw new Error(data.error || 'Failed to create booking');
  }

  return data;
}

// ============================================================================
// USER BOOKING TYPES
// ============================================================================

export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'completed'
  | 'cancelled'
  | 'rejected'
  | 'no_show'
  | 'expired';

export type BookingFilter = 'all' | BookingStatus;

export type CancellationReason =
  | 'schedule_conflict'
  | 'found_another_car'
  | 'price_issue'
  | 'location_issue'
  | 'changed_mind'
  | 'emergency'
  | 'other';

export interface UserBooking {
  id: string;
  status: BookingStatus;
  source: string;
  scheduledDate: string;
  scheduledStartTime: string;
  scheduledEndTime: string;
  confirmationToken: string;
  verifiedAt: string | null;

  // User info
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;

  // Listing info
  listingId: string;
  listingTitle: string;
  listingThumbnail: string | null;
  listingPrice: number;

  // Partner info
  partnerId: string;
  partnerName: string;
  partnerLogo: string | null;
  partnerAddress: string | null;
  partnerPhone: string;

  // Additional details
  notes: string | null;
  specialRequests: string | null;
  numberOfAttendees: number;

  // Partner response
  partnerNotes: string | null;
  confirmedAt: string | null;
  rejectionReason: string | null;

  // Reschedule
  rescheduleCount: number;
  maxRescheduleAllowed: number;

  // Cancellation
  cancelledAt: string | null;
  cancelledBy: string | null;
  cancellationReason: string | null;
  cancellationNotes: string | null;

  // Completion
  completedAt: string | null;
  checkInTime: string | null;
  checkOutTime: string | null;

  // No-show
  noShowReported: boolean;

  // Feedback
  feedbackSubmitted: boolean;

  // Timestamps
  createdAt: string;
  updatedAt: string;
  expiresAt: string | null;

  // Partner settings (embedded from join)
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
  } | null;
}

export interface UserBookingsResponse {
  bookings: UserBooking[];
  total: number;
}

export interface GetUserBookingsParams {
  status?: BookingStatus | BookingStatus[];
  q?: string;
  sort?: 'newest' | 'oldest';
  limit?: number;
  offset?: number;
}

export interface CancelBookingParams {
  reason?: CancellationReason;
  notes?: string;
}

export interface CancelBookingResult {
  success: boolean;
  message: string;
}

// ============================================================================
// USER BOOKING API OPERATIONS
// ============================================================================

/**
 * Fetch the current user's bookings with optional filtering and pagination
 */
export async function getUserBookings(
  params: GetUserBookingsParams = {},
): Promise<UserBookingsResponse> {
  const session = await getStoredSession();

  if (!session?.token) {
    throw new Error('Authentication required');
  }

  const searchParams = new URLSearchParams();
  if (params.status) {
    const statusStr = Array.isArray(params.status)
      ? params.status.join(',')
      : params.status;
    searchParams.set('status', statusStr);
  }
  if (params.q) searchParams.set('q', params.q);
  if (params.sort) searchParams.set('sort', params.sort);
  if (params.limit) searchParams.set('limit', String(params.limit));
  if (params.offset) searchParams.set('offset', String(params.offset));

  const url = `${API_BASE}/api/bookings?${searchParams.toString()}&t=${Date.now()}`;
  console.log('[Booking API] GET user bookings', url);

  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.token}`,
    },
  });

  const data = await res.json();

  if (!res.ok) {
    if (res.status === 401) {
      throw new Error('Please sign in to view your bookings');
    }
    throw new Error(data.error || 'Failed to load bookings');
  }

  // Transform relative CDN paths to absolute URLs
  if (data.bookings) {
    data.bookings = data.bookings.map((b: UserBooking) => ({
      ...b,
      listingThumbnail: toAbsoluteUrl(b.listingThumbnail),
      partnerLogo: toAbsoluteUrl(b.partnerLogo),
    }));
  }

  return data;
}

/**
 * Cancel a booking
 */
export async function cancelBooking(
  bookingId: string,
  params: CancelBookingParams = {},
): Promise<CancelBookingResult> {
  const session = await getStoredSession();

  if (!session?.token) {
    throw new Error('Authentication required');
  }

  console.log('[Booking API] PATCH cancel booking', bookingId);

  const res = await fetch(`${API_BASE}/api/bookings/${bookingId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.token}`,
    },
    body: JSON.stringify({
      action: 'cancel',
      cancellationReason: params.reason || 'other',
      notes: params.notes,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    if (res.status === 401) {
      throw new Error('Please sign in to cancel this booking');
    }
    if (res.status === 403) {
      throw new Error(data.error || 'You cannot cancel this booking');
    }
    throw new Error(data.error || 'Failed to cancel booking');
  }

  return data;
}
