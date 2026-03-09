/**
 * MANAGE BOOKING - Universal Booking Mutation
 * 
 * One function for all booking operations: create, cancel, reschedule,
 * confirm, reject, complete, check-in, no-show, feedback.
 * 
 * @module queries/booking/manage-booking
 */

import { eq, and, inArray, gte, lt, or, isNull, gt } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';
import { db } from '../../dbclient';
import { 
  booking, 
  bookingSlot,
  partnerAvailability,
  partnerBookingSettings,
  cancellationReasonEnum,
  bookingSourceEnum,
} from '../../schema/booking';
import { carListing } from '../../schema/listing';
import { user } from '../../schema/auth';
import { userProfile } from '../../schema/profile';
import { ACTIVE_STATUSES, type BookingStatus } from './get-bookings';
import { getAvailableSlots, getListingBookingContext } from './manage-partner-settings';

// ============================================================================
// TYPES
// ============================================================================

export type BookingAction = 
  | 'create'
  | 'cancel'
  | 'reschedule'
  | 'confirm'
  | 'reject'
  | 'complete'
  | 'checkIn'
  | 'noShow'
  | 'feedback';

export type CancellationReason = (typeof cancellationReasonEnum.enumValues)[number];
export type BookingSource = (typeof bookingSourceEnum.enumValues)[number];

export interface ManageBookingParams {
  action: BookingAction;
  
  // Who's doing it
  actorId: string;
  actorType: 'user' | 'staff';
  
  // For 'create'
  listingId?: string;
  scheduledDate?: Date;
  scheduledStartTime?: Date;
  scheduledEndTime?: Date;
  notes?: string;
  specialRequests?: string;
  numberOfAttendees?: number;
  source?: BookingSource;
  
  // For existing booking operations
  bookingId?: string;
  confirmationToken?: string;
  
  // For 'cancel' / 'reject'
  reason?: string;
  cancellationReason?: CancellationReason;
  
  // For 'reschedule'
  newDate?: Date;
  newStartTime?: Date;
  newEndTime?: Date;
  
  // For 'confirm' / 'complete'
  partnerNotes?: string;
  
  // For 'complete'
  checkInTime?: Date;
  checkOutTime?: Date;
  
  // For 'noShow'
  noShowReason?: string;
  
  // For 'feedback'
  rating?: number;
  comment?: string;
  feedback?: {
    overallRating: number;
    partnerServiceRating?: number;
    vehicleConditionRating?: number;
    processEaseRating?: number;
    liked?: string;
    disliked?: string;
    suggestions?: string;
    interestedInPurchase?: boolean;
    requestFollowUp?: boolean;
    listingAccurate?: boolean;
    accuracyNotes?: string;
  };
}

export interface ManageBookingResult {
  success: boolean;
  error?: string;
  bookingId?: string;
  confirmationToken?: string;
  message?: string;
}

// ============================================================================
// CONFIG
// ============================================================================

const CONFIG = {
  TOKEN_CHARS: 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789',
  TOKEN_LENGTH: 8,
  DEFAULT_SLOT_DURATION: 45,
} as const;

// ============================================================================
// MAIN FUNCTION
// ============================================================================

/**
 * Universal booking mutation handler
 */
export async function manageBooking(
  params: ManageBookingParams
): Promise<ManageBookingResult> {
  const { action, actorId, actorType } = params;

  try {
    switch (action) {
      case 'create':
        return await createBooking(params, actorId);
      
      case 'cancel':
        return await cancelBooking(params, actorId, actorType);
      
      case 'reschedule':
        return await rescheduleBooking(params, actorId);
      
      case 'confirm':
        return await confirmBooking(params, actorId);
      
      case 'reject':
        return await rejectBooking(params, actorId);
      
      case 'complete':
        return await completeBooking(params, actorId);
      
      case 'checkIn':
        return await checkInBooking(params, actorId);
      
      case 'noShow':
        return await reportNoShow(params, actorId);
      
      case 'feedback':
        return await submitFeedback(params, actorId);
      
      default:
        return { success: false, error: `Invalid action: ${action}` };
    }
  } catch (error) {
    console.error(`[ManageBooking] ${action} failed:`, error);
    return { success: false, error: `Failed to ${action} booking` };
  }
}

// ============================================================================
// ACTION HANDLERS
// ============================================================================

/**
 * Create a new booking
 */
async function createBooking(
  params: ManageBookingParams,
  userId: string
): Promise<ManageBookingResult> {
  const {
    listingId,
    scheduledDate,
    scheduledStartTime,
    scheduledEndTime,
    notes,
    specialRequests,
    numberOfAttendees = 1,
    source = 'web',
  } = params;

  if (!listingId || !scheduledDate || !scheduledStartTime || !scheduledEndTime) {
    return { success: false, error: 'Missing required fields: listingId, scheduledDate, scheduledStartTime, scheduledEndTime' };
  }

  // Get listing and partner
  const listing = await getListingBookingContext(listingId);
  if (!listing) {
    return { success: false, error: 'Listing not found' };
  }
  if (listing.lifecycleStatus !== 'active') {
    return { success: false, error: 'This listing is not available for booking' };
  }
  if (!listing.partnerId) {
    return { success: false, error: 'This listing does not support test drive bookings' };
  }

  const partnerId = listing.partnerId;
  const staffUserId = listing.userId; // Staff member managing this listing

  // Get user info
  const userData = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: userProfile.phone,
    })
    .from(user)
    .leftJoin(userProfile, eq(userProfile.userId, user.id))
    .where(eq(user.id, userId))
    .limit(1);

  if (userData.length === 0) {
    return { success: false, error: 'User not found' };
  }

  const userInfo = userData[0];
  const userPhone = userInfo.phone || '+971500000000';

  // Check for duplicate booking
  const now = new Date();
  const existingBooking = await db.query.booking.findFirst({
    where: and(
      eq(booking.userId, userId),
      eq(booking.listingId, listingId),
      inArray(booking.status, ACTIVE_STATUSES),
      gte(booking.scheduledEndTime, now)
    ),
    columns: { id: true },
  });

  if (existingBooking) {
    return { success: false, error: 'You already have an active booking for this listing' };
  }

  // Check for overlapping booking (same user, same time)
  const overlapping = await db.query.booking.findFirst({
    where: and(
      eq(booking.userId, userId),
      inArray(booking.status, ACTIVE_STATUSES),
      lt(booking.scheduledStartTime, scheduledEndTime),
      gt(booking.scheduledEndTime, scheduledStartTime)
    ),
    columns: { id: true },
  });

  if (overlapping) {
    return { success: false, error: 'You have another booking at this time' };
  }

  // Create slot - calculate duration from actual booking times
  const slotId = createId();
  const durationMinutes = Math.round((scheduledEndTime.getTime() - scheduledStartTime.getTime()) / (60 * 1000));
  await db.insert(bookingSlot).values({
    id: slotId,
    partnerId,
    listingId,
    startTime: scheduledStartTime,
    endTime: scheduledEndTime,
    duration: durationMinutes,
    status: 'booked',
    maxBookings: 1,
    currentBookings: 1,
  });

  // Get staff settings for auto-confirm - no fallback
  const settings = staffUserId
    ? await db.query.partnerBookingSettings.findFirst({
        where: and(
          eq(partnerBookingSettings.partnerId, partnerId),
          eq(partnerBookingSettings.staffUserId, staffUserId)
        ),
      })
    : null;

  const autoConfirm = settings?.autoConfirm ?? false;
  const confirmationToken = generateToken();
  const bookingId = createId();

  // Create booking - expires at scheduled time (no fixed timeout)
  await db.insert(booking).values({
    id: bookingId,
    userId,
    partnerId,
    listingId,
    slotId,
    status: autoConfirm ? 'confirmed' : 'pending',
    source,
    scheduledDate,
    scheduledStartTime,
    scheduledEndTime,
    confirmationToken,
    userName: userInfo.name || 'Guest',
    userEmail: userInfo.email,
    userPhone,
    notes,
    specialRequests,
    numberOfAttendees,
    confirmedAt: autoConfirm ? now : null,
    expiresAt: autoConfirm ? null : scheduledStartTime, // Expires when scheduled time passes
  });

  return {
    success: true,
    bookingId,
    confirmationToken,
    message: autoConfirm ? 'Booking confirmed' : 'Booking created - pending confirmation',
  };
}

/**
 * Cancel a booking
 */
async function cancelBooking(
  params: ManageBookingParams,
  actorId: string,
  actorType: 'user' | 'staff'
): Promise<ManageBookingResult> {
  const { bookingId, reason, cancellationReason } = params;

  if (!bookingId) {
    return { success: false, error: 'bookingId is required' };
  }

  const existing = await db.query.booking.findFirst({
    where: eq(booking.id, bookingId),
  });

  if (!existing) {
    return { success: false, error: 'Booking not found' };
  }

  // Authorization check
  if (actorType === 'user' && existing.userId !== actorId) {
    return { success: false, error: 'You can only cancel your own bookings' };
  }

  if (!ACTIVE_STATUSES.includes(existing.status as BookingStatus)) {
    return { success: false, error: `Cannot cancel booking in status: ${existing.status}` };
  }

  // Check cancellation policy for users
  if (actorType === 'user') {
    // Get staff-specific settings (listing owner's settings)
    const bookingListing = await db.query.carListing.findFirst({
      where: eq(carListing.id, existing.listingId),
      columns: { userId: true },
    });
    const staffUserId = bookingListing?.userId;

    // Get staff-specific settings only - no fallback
    const settings = staffUserId
      ? await db.query.partnerBookingSettings.findFirst({
          where: and(
            eq(partnerBookingSettings.partnerId, existing.partnerId),
            eq(partnerBookingSettings.staffUserId, staffUserId)
          ),
        })
      : null;

    if (settings && !settings.allowUserCancellation) {
      return { success: false, error: 'This dealer does not allow user cancellations' };
    }

    const deadlineHours = settings?.cancellationDeadlineHours ?? 2;
    const deadline = new Date(existing.scheduledStartTime.getTime() - deadlineHours * 60 * 60 * 1000);
    
    if (new Date() > deadline) {
      return { success: false, error: `Cancellation deadline passed (${deadlineHours} hours before appointment)` };
    }
  }

  const now = new Date();
  await db
    .update(booking)
    .set({
      status: 'cancelled',
      cancelledAt: now,
      cancelledBy: actorType,
      cancellationReason: cancellationReason || 'other',
      cancellationNotes: reason,
      updatedAt: now,
    })
    .where(eq(booking.id, bookingId));

  // Free up the slot
  await db
    .update(bookingSlot)
    .set({ status: 'available', currentBookings: 0 })
    .where(eq(bookingSlot.id, existing.slotId));

  return { success: true, bookingId, message: 'Booking cancelled' };
}

/**
 * Reschedule a booking
 */
async function rescheduleBooking(
  params: ManageBookingParams,
  userId: string
): Promise<ManageBookingResult> {
  const { bookingId, newDate, newStartTime, newEndTime } = params;

  if (!bookingId || !newDate || !newStartTime || !newEndTime) {
    return { success: false, error: 'bookingId, newDate, newStartTime, newEndTime are required' };
  }

  const existing = await db.query.booking.findFirst({
    where: eq(booking.id, bookingId),
  });

  if (!existing) {
    return { success: false, error: 'Booking not found' };
  }

  if (existing.userId !== userId) {
    return { success: false, error: 'You can only reschedule your own bookings' };
  }

  if (!ACTIVE_STATUSES.includes(existing.status as BookingStatus)) {
    return { success: false, error: `Cannot reschedule booking in status: ${existing.status}` };
  }

  // Check reschedule limit - get staff-specific settings only
  const bookingListing = await db.query.carListing.findFirst({
    where: eq(carListing.id, existing.listingId),
    columns: { userId: true },
  });
  const staffUserId = bookingListing?.userId;

  // Get staff-specific settings only - no fallback
  const settings = staffUserId
    ? await db.query.partnerBookingSettings.findFirst({
        where: and(
          eq(partnerBookingSettings.partnerId, existing.partnerId),
          eq(partnerBookingSettings.staffUserId, staffUserId)
        ),
      })
    : null;

  if (settings && !settings.allowReschedule) {
    return { success: false, error: 'This dealer does not allow rescheduling' };
  }

  const maxReschedules = settings?.maxRescheduleCount ?? 1;
  if (existing.rescheduleCount >= maxReschedules) {
    return { success: false, error: `Maximum ${maxReschedules} reschedule(s) allowed` };
  }

  const deadlineHours = settings?.rescheduleDeadlineHours ?? 4;
  const deadline = new Date(existing.scheduledStartTime.getTime() - deadlineHours * 60 * 60 * 1000);
  
  if (new Date() > deadline) {
    return { success: false, error: `Reschedule deadline passed (${deadlineHours} hours before appointment)` };
  }

  // Create new slot - calculate duration from actual times
  const newSlotId = createId();
  const rescheduleDuration = Math.round((newEndTime.getTime() - newStartTime.getTime()) / (60 * 1000));
  await db.insert(bookingSlot).values({
    id: newSlotId,
    partnerId: existing.partnerId,
    listingId: existing.listingId,
    startTime: newStartTime,
    endTime: newEndTime,
    duration: rescheduleDuration,
    status: 'booked',
    maxBookings: 1,
    currentBookings: 1,
  });

  // Update booking
  const now = new Date();
  await db
    .update(booking)
    .set({
      slotId: newSlotId,
      scheduledDate: newDate,
      scheduledStartTime: newStartTime,
      scheduledEndTime: newEndTime,
      originalSlotId: existing.originalSlotId || existing.slotId,
      rescheduleCount: existing.rescheduleCount + 1,
      lastRescheduledAt: now,
      status: 'pending', // Back to pending after reschedule
      confirmedAt: null,
      confirmedBy: null,
      updatedAt: now,
    })
    .where(eq(booking.id, bookingId));

  // Free old slot
  await db
    .update(bookingSlot)
    .set({ status: 'available', currentBookings: 0 })
    .where(eq(bookingSlot.id, existing.slotId));

  return { success: true, bookingId, message: 'Booking rescheduled' };
}

/**
 * Confirm a booking (staff action)
 */
async function confirmBooking(
  params: ManageBookingParams,
  staffId: string
): Promise<ManageBookingResult> {
  const { bookingId, partnerNotes } = params;

  if (!bookingId) {
    return { success: false, error: 'bookingId is required' };
  }

  const existing = await db.query.booking.findFirst({
    where: eq(booking.id, bookingId),
  });

  if (!existing) {
    return { success: false, error: 'Booking not found' };
  }

  if (existing.status !== 'pending') {
    return { success: false, error: `Cannot confirm booking in status: ${existing.status}` };
  }

  const now = new Date();
  await db
    .update(booking)
    .set({
      status: 'confirmed',
      confirmedAt: now,
      confirmedBy: staffId,
      partnerNotes: partnerNotes || existing.partnerNotes,
      expiresAt: null,
      updatedAt: now,
    })
    .where(eq(booking.id, bookingId));

  return { success: true, bookingId, message: 'Booking confirmed' };
}

/**
 * Reject a booking (staff action)
 */
async function rejectBooking(
  params: ManageBookingParams,
  staffId: string
): Promise<ManageBookingResult> {
  const { bookingId, reason } = params;

  if (!bookingId) {
    return { success: false, error: 'bookingId is required' };
  }

  if (!reason) {
    return { success: false, error: 'Rejection reason is required' };
  }

  const existing = await db.query.booking.findFirst({
    where: eq(booking.id, bookingId),
  });

  if (!existing) {
    return { success: false, error: 'Booking not found' };
  }

  if (existing.status !== 'pending') {
    return { success: false, error: `Cannot reject booking in status: ${existing.status}` };
  }

  const now = new Date();
  await db
    .update(booking)
    .set({
      status: 'rejected',
      rejectionReason: reason,
      updatedAt: now,
    })
    .where(eq(booking.id, bookingId));

  // Free up slot
  await db
    .update(bookingSlot)
    .set({ status: 'available', currentBookings: 0 })
    .where(eq(bookingSlot.id, existing.slotId));

  return { success: true, bookingId, message: 'Booking rejected' };
}

/**
 * Complete a booking (staff action)
 */
async function completeBooking(
  params: ManageBookingParams,
  staffId: string
): Promise<ManageBookingResult> {
  const { bookingId, checkInTime, checkOutTime, partnerNotes } = params;

  if (!bookingId) {
    return { success: false, error: 'bookingId is required' };
  }

  const existing = await db.query.booking.findFirst({
    where: eq(booking.id, bookingId),
  });

  if (!existing) {
    return { success: false, error: 'Booking not found' };
  }

  if (!['pending', 'confirmed'].includes(existing.status)) {
    return { success: false, error: `Cannot complete booking in status: ${existing.status}` };
  }

  const now = new Date();
  await db
    .update(booking)
    .set({
      status: 'completed',
      completedAt: now,
      checkInTime: checkInTime || existing.checkInTime || now,
      checkOutTime: checkOutTime || now,
      partnerNotes: partnerNotes || existing.partnerNotes,
      confirmedAt: existing.confirmedAt || now,
      confirmedBy: existing.confirmedBy || staffId,
      updatedAt: now,
    })
    .where(eq(booking.id, bookingId));

  return { success: true, bookingId, message: 'Booking completed' };
}

/**
 * Check in a customer (staff action)
 */
async function checkInBooking(
  params: ManageBookingParams,
  staffId: string
): Promise<ManageBookingResult> {
  const { bookingId, confirmationToken } = params;

  // Can lookup by either ID or confirmation token
  let existing;
  if (bookingId) {
    existing = await db.query.booking.findFirst({
      where: eq(booking.id, bookingId),
    });
  } else if (confirmationToken) {
    existing = await db.query.booking.findFirst({
      where: eq(booking.confirmationToken, confirmationToken.toUpperCase()),
    });
  } else {
    return { success: false, error: 'bookingId or confirmationToken is required' };
  }

  if (!existing) {
    return { success: false, error: 'Booking not found' };
  }

  if (!ACTIVE_STATUSES.includes(existing.status as BookingStatus)) {
    return { success: false, error: `Cannot check in booking in status: ${existing.status}` };
  }

  const now = new Date();
  const updates: Record<string, unknown> = {
    checkInTime: now,
    updatedAt: now,
  };

  // Auto-confirm if still pending
  if (existing.status === 'pending') {
    updates.status = 'confirmed';
    updates.confirmedAt = now;
    updates.confirmedBy = staffId;
    updates.expiresAt = null;
  }

  await db
    .update(booking)
    .set(updates)
    .where(eq(booking.id, existing.id));

  return { success: true, bookingId: existing.id, message: 'Customer checked in' };
}

/**
 * Report no-show (staff action)
 */
async function reportNoShow(
  params: ManageBookingParams,
  staffId: string
): Promise<ManageBookingResult> {
  const { bookingId, noShowReason } = params;

  if (!bookingId) {
    return { success: false, error: 'bookingId is required' };
  }

  const existing = await db.query.booking.findFirst({
    where: eq(booking.id, bookingId),
  });

  if (!existing) {
    return { success: false, error: 'Booking not found' };
  }

  if (!ACTIVE_STATUSES.includes(existing.status as BookingStatus)) {
    return { success: false, error: `Cannot report no-show for booking in status: ${existing.status}` };
  }

  const now = new Date();
  await db
    .update(booking)
    .set({
      status: 'no_show',
      noShowReported: true,
      noShowReportedAt: now,
      noShowReason: noShowReason,
      updatedAt: now,
    })
    .where(eq(booking.id, bookingId));

  return { success: true, bookingId, message: 'No-show reported' };
}

/**
 * Submit feedback (user action)
 */
async function submitFeedback(
  params: ManageBookingParams,
  userId: string
): Promise<ManageBookingResult> {
  const { bookingId, feedback } = params;

  if (!bookingId) {
    return { success: false, error: 'bookingId is required' };
  }

  if (!feedback || !feedback.overallRating) {
    return { success: false, error: 'feedback with overallRating is required' };
  }

  const existing = await db.query.booking.findFirst({
    where: eq(booking.id, bookingId),
  });

  if (!existing) {
    return { success: false, error: 'Booking not found' };
  }

  if (existing.userId !== userId) {
    return { success: false, error: 'You can only submit feedback for your own bookings' };
  }

  if (existing.status !== 'completed') {
    return { success: false, error: 'Can only submit feedback for completed bookings' };
  }

  if (existing.feedbackSubmitted) {
    return { success: false, error: 'Feedback already submitted' };
  }

  const now = new Date();
  await db
    .update(booking)
    .set({
      feedbackSubmitted: true,
      feedbackSubmittedAt: now,
      feedback,
      updatedAt: now,
    })
    .where(eq(booking.id, bookingId));

  return { success: true, bookingId, message: 'Feedback submitted' };
}

// ============================================================================
// MAINTENANCE
// ============================================================================

/**
 * Run maintenance tasks (expire pending when time passes, cleanup old)
 */
export async function runBookingMaintenance(options?: { retentionDays?: number }): Promise<void> {
  const retentionDays = options?.retentionDays ?? 7;
  const now = new Date();
  const cutoff = new Date(now.getTime() - retentionDays * 24 * 60 * 60 * 1000);

  try {
    // Expire pending bookings where scheduled time has passed
    // Partners have full freedom to confirm until the booking time arrives
    await db
      .update(booking)
      .set({ status: 'expired', updatedAt: now })
      .where(and(
        eq(booking.status, 'pending'),
        lt(booking.scheduledStartTime, now)
      ));

    // Auto-cancel confirmed bookings where scheduled time passed without check-in
    await db
      .update(booking)
      .set({
        status: 'no_show',
        noShowReported: true,
        noShowReportedAt: now,
        noShowReason: 'Auto-marked - scheduled time passed without check-in',
        updatedAt: now,
      })
      .where(and(
        eq(booking.status, 'confirmed'),
        lt(booking.scheduledStartTime, now)
      ));

    // Delete old cancelled/expired bookings (soft cleanup)
    // We keep the data but could delete if needed

  } catch (error) {
    console.error('[BookingMaintenance] Error:', error);
  }
}

// ============================================================================
// HELPERS
// ============================================================================

function generateToken(): string {
  let token = '';
  for (let i = 0; i < CONFIG.TOKEN_LENGTH; i++) {
    token += CONFIG.TOKEN_CHARS.charAt(Math.floor(Math.random() * CONFIG.TOKEN_CHARS.length));
  }
  return token;
}
