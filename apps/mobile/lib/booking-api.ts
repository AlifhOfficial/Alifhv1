/**
 * Booking API Client - Mobile
 *
 * Handles booking availability, time slots, and booking creation.
 * Mirrors the web API at /api/bookings/slots and /api/bookings.
 */

import { API_BASE } from './config';
import { getStoredSession } from './auth-api';

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
