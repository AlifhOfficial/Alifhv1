import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  doublePrecision,
  jsonb,
  index,
  pgEnum,
  unique,
} from 'drizzle-orm/pg-core';
import { user } from './auth';
import { partner } from './partner';
import { carListing } from './listing';

export const bookingStatusEnum = pgEnum('booking_status', [
  'pending',
  'confirmed',
  'completed',
  'cancelled',
  'rejected',
  'no_show',
  'expired',
]);

export const slotStatusEnum = pgEnum('slot_status', [
  'available',
  'booked',
  'blocked',
  'past',
]);

export const bookingSourceEnum = pgEnum('booking_source', [
  'web',
  'mobile',
  'call',
  'walk_in',
]);

export const cancellationReasonEnum = pgEnum('cancellation_reason', [
  'schedule_conflict',
  'found_another_car',
  'price_issue',
  'location_issue',
  'changed_mind',
  'emergency',
  'other',
]);

export const partnerAvailability = pgTable('partner_availability', {
  id: text('id').primaryKey(),
  partnerId: text('partner_id').notNull().references(() => partner.id, { onDelete: 'cascade' }),
  
  // Day-specific availability
  dayOfWeek: integer('day_of_week').notNull(), // 0 = Sunday, 1 = Monday, ... 6 = Saturday
  startTime: text('start_time').notNull(), // "09:00"
  endTime: text('end_time').notNull(), // "18:00"
  slotDuration: integer('slot_duration').default(45).notNull(), // Minutes per slot (45 min test drive sessions)
  
  // Capacity
  maxConcurrentBookings: integer('max_concurrent_bookings').default(1).notNull(), // How many at same time
  bufferTime: integer('buffer_time').default(15), // Minutes between bookings
  
  // Status
  isActive: boolean('is_active').default(true).notNull(),
  
  // Exception Dates (when this rule doesn't apply)
  excludeDates: jsonb('exclude_dates').$type<string[]>().default([]), // ["2024-12-25", "2024-01-01"]
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index('partner_availability_partnerId_idx').on(table.partnerId),
  index('partner_availability_dayOfWeek_idx').on(table.dayOfWeek),
  index('partner_availability_isActive_idx').on(table.isActive),
  // Ensure one rule per partner per day
  unique('partner_availability_partnerId_dayOfWeek_unique').on(table.partnerId, table.dayOfWeek),
]);

/**
 * Booking Slots Table
 * Actual time slots generated from partner availability
 * These are what users see and book
 */
export const bookingSlot = pgTable('booking_slot', {
  id: text('id').primaryKey(),
  partnerId: text('partner_id').notNull().references(() => partner.id, { onDelete: 'cascade' }),
  listingId: text('listing_id').references(() => carListing.id, { onDelete: 'set null' }), // Optional: slot for specific car
  
  // Slot Time
  startTime: timestamp('start_time').notNull(),
  endTime: timestamp('end_time').notNull(),
  duration: integer('duration').default(45).notNull(), // Minutes (45 min test drive sessions)
  
  // Status
  status: slotStatusEnum('status').default('available').notNull(),
  
  // Capacity
  maxBookings: integer('max_bookings').default(1).notNull(),
  currentBookings: integer('current_bookings').default(0).notNull(),
  
  // Location (if partner has multiple showrooms)
  location: text('location'), // "Main Showroom - Dubai Marina"
  locationAddress: text('location_address'),
  locationNotes: text('location_notes'), // "Park in the back, use elevator"
  
  // Metadata
  notes: text('notes'), // Partner's internal notes
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index('booking_slot_partnerId_idx').on(table.partnerId),
  index('booking_slot_listingId_idx').on(table.listingId),
  index('booking_slot_status_idx').on(table.status),
  index('booking_slot_startTime_idx').on(table.startTime),
  index('booking_slot_partnerId_status_startTime_idx').on(table.partnerId, table.status, table.startTime),
]);

/**
 * Bookings Table
 * Core booking records - user reservations for viewing cars
 */
export const booking = pgTable('booking', {
  id: text('id').primaryKey(),
  
  // Who & What
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  partnerId: text('partner_id').notNull().references(() => partner.id, { onDelete: 'cascade' }),
  listingId: text('listing_id').notNull().references(() => carListing.id, { onDelete: 'cascade' }),
  slotId: text('slot_id').notNull().references(() => bookingSlot.id, { onDelete: 'cascade' }),
  
  // Booking Details
  status: bookingStatusEnum('status').default('pending').notNull(),
  source: bookingSourceEnum('source').default('web').notNull(),
  
  // Scheduled Time
  scheduledDate: timestamp('scheduled_date').notNull(),
  scheduledStartTime: timestamp('scheduled_start_time').notNull(),
  scheduledEndTime: timestamp('scheduled_end_time').notNull(),
  
  // Verification
  confirmationToken: text('confirmation_token').notNull().unique(), // For email/SMS verification
  verifiedAt: timestamp('verified_at'),
  
  // User Information (at time of booking)
  userPhone: text('user_phone').notNull(), // In case user updates their profile later
  userEmail: text('user_email').notNull(),
  userName: text('user_name').notNull(),
  
  // Additional Details
  notes: text('notes'), // User's notes/questions
  specialRequests: text('special_requests'), // "Need test drive", "Want financing info"
  numberOfAttendees: integer('number_of_attendees').default(1), // How many people coming
  
  // Partner Response
  partnerNotes: text('partner_notes'), // Partner's internal notes
  confirmedBy: text('confirmed_by').references(() => user.id, { onDelete: 'set null' }), // Partner staff who confirmed
  confirmedAt: timestamp('confirmed_at'),
  rejectionReason: text('rejection_reason'),
  
  // Reschedule Tracking
  rescheduleCount: integer('reschedule_count').default(0).notNull(),
  maxRescheduleAllowed: integer('max_reschedule_allowed').default(1).notNull(),
  originalSlotId: text('original_slot_id'), // First slot if rescheduled
  lastRescheduledAt: timestamp('last_rescheduled_at'),
  
  // Cancellation
  cancelledAt: timestamp('cancelled_at'),
  cancelledBy: text('cancelled_by'), // 'user' or 'partner'
  cancellationReason: cancellationReasonEnum('cancellation_reason'),
  cancellationNotes: text('cancellation_notes'),
  
  // Completion & Follow-up
  completedAt: timestamp('completed_at'),
  checkInTime: timestamp('check_in_time'), // When user arrived
  checkOutTime: timestamp('check_out_time'), // When viewing ended
  
  // No-show Tracking
  noShowReported: boolean('no_show_reported').default(false),
  noShowReportedAt: timestamp('no_show_reported_at'),
  noShowReason: text('no_show_reason'),
  
  // Reminders Sent
  remindersSent: jsonb('reminders_sent').$type<{
    sms?: string[]; // Timestamps of SMS reminders
    email?: string[]; // Timestamps of email reminders
    push?: string[]; // Timestamps of push notifications
  }>().default({}),
  
  // Follow-up & Feedback (embedded in V1 for simplicity)
  feedbackRequested: boolean('feedback_requested').default(false),
  feedbackRequestedAt: timestamp('feedback_requested_at'),
  feedbackSubmitted: boolean('feedback_submitted').default(false),
  feedbackSubmittedAt: timestamp('feedback_submitted_at'),
  feedback: jsonb('feedback').$type<{
    overallRating: number; // 1-5 stars
    partnerServiceRating?: number; // 1-5
    vehicleConditionRating?: number; // 1-5
    processEaseRating?: number; // 1-5
    liked?: string; // What they liked
    disliked?: string; // What they didn't like
    suggestions?: string; // How to improve
    interestedInPurchase?: boolean; // Are they interested in buying?
    requestFollowUp?: boolean; // Want partner to follow up?
    listingAccurate?: boolean; // Was listing description accurate?
    accuracyNotes?: string;
  }>(),
  
  // Conversion Tracking
  leadConverted: boolean('lead_converted').default(false), // Did booking lead to sale?
  convertedAt: timestamp('converted_at'),
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
  expiresAt: timestamp('expires_at'), // Auto-expire if not confirmed in time
}, (table) => [
  // Core lookups
  index('booking_userId_idx').on(table.userId),
  index('booking_partnerId_idx').on(table.partnerId),
  index('booking_listingId_idx').on(table.listingId),
  index('booking_slotId_idx').on(table.slotId),
  
  // Status & time-based queries
  index('booking_status_idx').on(table.status),
  index('booking_scheduledStartTime_idx').on(table.scheduledStartTime),
  index('booking_scheduledDate_idx').on(table.scheduledDate),
  index('booking_partnerId_scheduledStartTime_idx').on(table.partnerId, table.scheduledStartTime),
  index('booking_userId_scheduledStartTime_idx').on(table.userId, table.scheduledStartTime),
  index('booking_status_scheduledStartTime_idx').on(table.status, table.scheduledStartTime),
  
  // Partner dashboard queries
  index('booking_partnerId_status_idx').on(table.partnerId, table.status),
  index('booking_partnerId_scheduledDate_idx').on(table.partnerId, table.scheduledDate),
  index('booking_partnerId_scheduledDate_status_idx').on(table.partnerId, table.scheduledDate, table.status),
  
  // User history
  index('booking_userId_status_idx').on(table.userId, table.status),
  index('booking_userId_createdAt_idx').on(table.userId, table.createdAt),
  
  // Duplicate booking prevention (userId + listingId + status)
  index('booking_userId_listingId_status_idx').on(table.userId, table.listingId, table.status),
  
  // Overlapping time check (userId + status + scheduledStartTime + scheduledEndTime)
  index('booking_userId_status_startEnd_idx').on(table.userId, table.status, table.scheduledStartTime, table.scheduledEndTime),
  
  // Cancellation abuse check (userId + cancelledBy + cancelledAt)
  index('booking_userId_cancelledBy_cancelledAt_idx').on(table.userId, table.cancelledBy, table.cancelledAt),
  
  // Verification
  index('booking_confirmationToken_idx').on(table.confirmationToken),
  
  // Foreign keys
  index('booking_confirmedBy_idx').on(table.confirmedBy),
]);

/**
 * ❌ REMOVED: User Booking Restrictions Table
 * 
 * @reason Over-engineered for V1 - implement as simple app logic instead
 * @removed: userBookingRestriction table with 15+ fields for abuse tracking
 * 
 * @v1_solution: Simple rules in application code:
 *   - Max 3 active bookings per user
 *   - Max 2 cancellations per month
 *   - Calculate from booking table when user tries to book
 * 
 * @v2_solution: Add back if you need:
 *   - Complex blacklisting system
 *   - Reliability scoring
 *   - Detailed abuse tracking
 *   - Partner-specific restrictions
 * 
 * Example V1 implementation:
 * ```typescript
 * // Check if user can book
 * const activeBookings = await db.query.booking.findMany({
 *   where: and(
 *     eq(booking.userId, userId),
 *     inArray(booking.status, ['pending', 'confirmed'])
 *   )
 * });
 * 
 * if (activeBookings.length >= 3) {
 *   throw new Error('Maximum 3 active bookings allowed');
 * }
 * 
 * // Check cancellations this month
 * const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
 * const cancellations = await db.query.booking.findMany({
 *   where: and(
 *     eq(booking.userId, userId),
 *     eq(booking.status, 'cancelled'),
 *     gte(booking.cancelledAt, thirtyDaysAgo)
 *   )
 * });
 * 
 * if (cancellations.length >= 2) {
 *   throw new Error('Maximum 2 cancellations per month');
 * }
 * ```
 */

/**
 * Partner Booking Settings Table
 * Partner-specific booking configuration
 */
export const partnerBookingSettings = pgTable('partner_booking_settings', {
  id: text('id').primaryKey(),
  partnerId: text('partner_id').notNull().references(() => partner.id, { onDelete: 'cascade' }).unique(),
  
  // Booking Enabled
  bookingEnabled: boolean('booking_enabled').default(true).notNull(),
  
  // Auto-confirmation
  autoConfirm: boolean('auto_confirm').default(false).notNull(), // Skip manual confirmation
  confirmationTimeoutMinutes: integer('confirmation_timeout_minutes').default(60), // Auto-reject after X mins
  
  // Lead Time
  minLeadTimeHours: integer('min_lead_time_hours').default(2).notNull(), // Minimum hours in advance
  maxLeadTimeDays: integer('max_lead_time_days').default(30).notNull(), // Maximum days in advance
  
  // Cancellation Policy
  allowUserCancellation: boolean('allow_user_cancellation').default(true).notNull(),
  cancellationDeadlineHours: integer('cancellation_deadline_hours').default(2), // Must cancel X hours before
  
  // Reschedule Policy
  allowReschedule: boolean('allow_reschedule').default(true).notNull(),
  maxRescheduleCount: integer('max_reschedule_count').default(1).notNull(),
  rescheduleDeadlineHours: integer('reschedule_deadline_hours').default(4),
  
  // Reminders
  sendReminders: boolean('send_reminders').default(true).notNull(),
  reminderTimes: jsonb('reminder_times').$type<number[]>().default([24, 2]), // Hours before: 24h, 2h
  smsReminders: boolean('sms_reminders').default(true).notNull(),
  emailReminders: boolean('email_reminders').default(true).notNull(),
  
  // Buffer & Duration
  defaultSlotDuration: integer('default_slot_duration').default(30).notNull(), // Minutes
  bufferBetweenBookings: integer('buffer_between_bookings').default(15), // Minutes
  
  // Instructions for Users
  preparationInstructions: text('preparation_instructions'), // "Bring your driving license"
  directions: text('directions'), // How to find the showroom
  parkingInstructions: text('parking_instructions'),
  contactPersonName: text('contact_person_name'),
  contactPersonPhone: text('contact_person_phone'),
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index('partner_booking_settings_partnerId_idx').on(table.partnerId),
  index('partner_booking_settings_bookingEnabled_idx').on(table.bookingEnabled),
]);
