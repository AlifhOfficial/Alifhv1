/**
 * Booking System
 * 
 * Simplified booking system with 3 core functions:
 * - getBookings(): Universal getter - all use cases
 * - managePartnerSettings(): Partner config setter
 * - manageBooking(): Universal mutation
 * 
 * @module queries/booking
 */

// Universal getter
export {
  getBookings,
  checkBookingRestrictions,
  type GetBookingsParams,
  type GetBookingsResult,
  type BookingRecord,
  type BookingStats,
  type BookingStatus,
  ACTIVE_STATUSES,
  TERMINAL_STATUSES,
} from './get-bookings';

// Partner settings & slot generation
export {
  managePartnerSettings,
  getAvailableSlots,
  getAvailableDates,
  getListingBookingContext,
  type ManagePartnerSettingsParams,
  type ManagePartnerSettingsResult,
  type PartnerSettingsAction,
  type AvailabilityRule,
  type PartnerSettings,
  type TimeSlot,
  type AvailableDate,
} from './manage-partner-settings';

// Universal mutation
export {
  manageBooking,
  runBookingMaintenance,
  type ManageBookingParams,
  type ManageBookingResult,
  type BookingAction,
  type CancellationReason,
  type BookingSource,
} from './manage-booking';
