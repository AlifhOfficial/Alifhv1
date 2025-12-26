/**
 * Booking Mutations
 * Write operations for bookings (create, update, cancel, reschedule)
 * 
 * @module queries/booking/booking-mutations
 */

import { eq, and, inArray, lt, gt, gte, sql, ne, or, isNull } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';
import { db } from '../../dbclient';
import { 
  booking, 
  bookingSlot,
  partnerAvailability,
  type cancellationReasonEnum 
} from '../../schema/booking';
import { carListing } from '../../schema/listing';
import { partner } from '../../schema/partner';
import { user } from '../../schema/auth';
import { checkUserBookingRestrictions } from './booking-queries';
import { getAvailableSlots, getPartnerBookingSettings } from './availability-queries';

/**
 * Generate a random confirmation token
 */
function generateConfirmationToken(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let token = '';
  for (let i = 0; i < 8; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

/**
 * Input for creating a new booking
 */
export interface CreateBookingInput {
  userId: string;
  listingId: string;
  scheduledDate: Date;
  scheduledStartTime: Date;
  scheduledEndTime: Date;
  notes?: string;
  specialRequests?: string;
  numberOfAttendees?: number;
  source?: 'web' | 'mobile' | 'call' | 'walk_in';
}

/**
 * Booking creation result
 */
export interface BookingResult {
  success: boolean;
  bookingId?: string;
  confirmationToken?: string;
  error?: string;
}

export interface StaffCheckInResult {
  success: boolean;
  bookingId?: string;
  error?: string;
}

/**
 * Staff check-in by booking ID (marks arrival; auto-confirms if still pending).
 */
export async function checkInBookingAsStaff(
  bookingId: string,
  partnerId: string,
  staffUserId: string
): Promise<StaffCheckInResult> {
  const current = await db.query.booking.findFirst({
    where: and(eq(booking.id, bookingId), eq(booking.partnerId, partnerId)),
    columns: { id: true, status: true },
  });

  if (!current) {
    return { success: false, error: 'Booking not found' };
  }

  if (!['pending', 'confirmed'].includes(current.status)) {
    return { success: false, error: `Booking cannot be updated in status: ${current.status}` };
  }

  const now = new Date();
  const update: Record<string, unknown> = {
    checkInTime: now,
    updatedAt: now,
  };

  if (current.status === 'pending') {
    update.status = 'confirmed';
    update.confirmedAt = now;
    update.confirmedBy = staffUserId;
  }

  const updated = await db
    .update(booking)
    .set(update)
    .where(
      and(
        eq(booking.id, bookingId),
        eq(booking.partnerId, partnerId),
        inArray(booking.status, ['pending', 'confirmed'])
      )
    )
    .returning({ id: booking.id });

  if (updated.length === 0) {
    return { success: false, error: 'Failed to update booking' };
  }

  return { success: true, bookingId };
}

/**
 * Maintenance: expire pending bookings and delete stale cancelled/expired records.
 * This is run opportunistically from API routes to keep the DB tidy without requiring cron.
 */
export async function runBookingMaintenance(options?: { retentionDays?: number }) {
  const retentionDays = options?.retentionDays ?? 7;
  const now = new Date();
  const cutoff = new Date(now.getTime() - retentionDays * 24 * 60 * 60 * 1000);

  try {
    // Expire pending bookings past their confirmation window
    await db
      .update(booking)
      .set({ status: 'expired', updatedAt: now })
      .where(and(eq(booking.status, 'pending'), lt(booking.expiresAt, now)));

    // Delete old cancelled/expired bookings
    await db.execute(sql`
      delete from booking
      where (status = 'cancelled' and cancelled_at < ${cutoff})
         or (status = 'expired' and updated_at < ${cutoff})
    `);

    // Delete orphan slots (slots not referenced by any booking)
    await db.execute(sql`
      delete from booking_slot bs
      where not exists (
        select 1 from booking b where b.slot_id = bs.id
      )
    `);
  } catch {
    // Best-effort: maintenance should never break user flows
  }
}

/**
 * Create a new booking
 */
export async function createBooking(input: CreateBookingInput): Promise<BookingResult> {
  // Check user restrictions first
  const restrictions = await checkUserBookingRestrictions(input.userId);
  if (!restrictions.canBook) {
    return { success: false, error: restrictions.reason };
  }

  // Get listing to find partner
  const listingData = await db.query.carListing.findFirst({
    where: eq(carListing.id, input.listingId),
    columns: {
      id: true,
      partnerId: true,
      lifecycleStatus: true,
    },
  });

  if (!listingData) {
    return { success: false, error: 'Listing not found' };
  }

  if (listingData.lifecycleStatus !== 'active') {
    return { success: false, error: 'This listing is not available for booking' };
  }

  if (!listingData.partnerId) {
    return { success: false, error: 'This listing does not support test drive bookings' };
  }

  const partnerId = listingData.partnerId;

  // Check partner booking settings
  const settings = await getPartnerBookingSettings(partnerId);
  if (settings && !settings.bookingEnabled) {
    return { success: false, error: 'This dealer is not accepting bookings at this time' };
  }

  // Prevent multiple active bookings by the same user for the same listing.
  // (User should reschedule/cancel their existing booking instead.)
  const now = new Date();
  const existingForListing = await db.query.booking.findFirst({
    where: and(
      eq(booking.userId, input.userId),
      eq(booking.listingId, input.listingId),
      inArray(booking.status, ['pending', 'confirmed']),
      gte(booking.scheduledEndTime, now),
      or(
        eq(booking.status, 'confirmed'),
        and(
          eq(booking.status, 'pending'),
          or(isNull(booking.expiresAt), gt(booking.expiresAt, now))
        )
      )
    ),
    columns: { id: true, status: true, scheduledStartTime: true },
  });

  if (existingForListing) {
    return { success: false, error: 'You already have a test drive booked for this listing' };
  }

  // Prevent overlapping bookings for the same user across different listings.
  const overlappingUserBooking = await db.query.booking.findFirst({
    where: and(
      eq(booking.userId, input.userId),
      inArray(booking.status, ['pending', 'confirmed']),
      lt(booking.scheduledStartTime, input.scheduledEndTime),
      gt(booking.scheduledEndTime, input.scheduledStartTime),
      or(
        eq(booking.status, 'confirmed'),
        and(
          eq(booking.status, 'pending'),
          or(isNull(booking.expiresAt), gt(booking.expiresAt, now))
        )
      )
    ),
    columns: { id: true },
  });

  if (overlappingUserBooking) {
    return { success: false, error: 'You already have another booking at that time' };
  }

  // Check if the slot is available
  const slotDay = new Date(input.scheduledStartTime);
  slotDay.setUTCHours(0, 0, 0, 0);
  const slots = await getAvailableSlots(partnerId, slotDay);
  
  // Find matching slot by comparing ISO strings (more reliable than getTime())
  const inputStartISO = input.scheduledStartTime.toISOString();
  const targetSlot = slots.find(
    s => s.startTime.toISOString() === inputStartISO
  );

  if (!targetSlot || !targetSlot.isAvailable) {
    return { success: false, error: 'This time slot is no longer available' };
  }

  // Validate duration / end time to prevent client tampering
  if (input.scheduledEndTime.toISOString() !== targetSlot.endTime.toISOString()) {
    return { success: false, error: 'Invalid time slot selection' };
  }

  // Hard protection against double-booking (race conditions / timezone issues):
  // ensure partner capacity isn't exceeded for the requested interval.
  const dayOfWeek = slotDay.getUTCDay();
  const rule = await db.query.partnerAvailability.findFirst({
    where: and(
      eq(partnerAvailability.partnerId, partnerId),
      eq(partnerAvailability.dayOfWeek, dayOfWeek),
      eq(partnerAvailability.isActive, true)
    ),
    columns: {
      id: true,
      maxConcurrentBookings: true,
    },
  });

  const maxConcurrentBookings = rule?.maxConcurrentBookings ?? 1;

  const overlapCountResult = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(booking)
    .where(
      and(
        eq(booking.partnerId, partnerId),
        inArray(booking.status, ['pending', 'confirmed']),
        lt(booking.scheduledStartTime, input.scheduledEndTime),
        gt(booking.scheduledEndTime, input.scheduledStartTime)
      )
    );

  const overlapCount = overlapCountResult[0]?.count ?? 0;
  if (overlapCount >= maxConcurrentBookings) {
    return { success: false, error: 'This time slot is no longer available' };
  }

  // Prevent duplicate bookings for the same listing at the exact same time (even if partner allows concurrency)
  const listingOverlap = await db.query.booking.findFirst({
    where: and(
      eq(booking.partnerId, partnerId),
      eq(booking.listingId, input.listingId),
      inArray(booking.status, ['pending', 'confirmed']),
      lt(booking.scheduledStartTime, input.scheduledEndTime),
      gt(booking.scheduledEndTime, input.scheduledStartTime)
    ),
    columns: { id: true },
  });

  if (listingOverlap) {
    return { success: false, error: 'This listing is already booked for that time' };
  }

  // Check lead time requirements
  const hoursUntilBooking = (input.scheduledStartTime.getTime() - now.getTime()) / (1000 * 60 * 60);
  
  if (settings) {
    if (hoursUntilBooking < settings.minLeadTimeHours) {
      return { 
        success: false, 
        error: `Bookings must be made at least ${settings.minLeadTimeHours} hours in advance` 
      };
    }

    const daysUntilBooking = hoursUntilBooking / 24;
    if (daysUntilBooking > settings.maxLeadTimeDays) {
      return { 
        success: false, 
        error: `Bookings can only be made up to ${settings.maxLeadTimeDays} days in advance` 
      };
    }
  }

  // Get user data
  const userData = await db.query.user.findFirst({
    where: eq(user.id, input.userId),
    columns: {
      id: true,
      name: true,
      email: true,
    },
  });

  if (!userData) {
    return { success: false, error: 'User not found' };
  }

  // Get user's phone from profile
  const profile = await db.query.userProfile.findFirst({
    where: eq(user.id, input.userId),
  });

  const userPhone = profile?.phone || '+971500000000'; // Fallback

  // Create booking slot record
  const slotId = createId();
  const bookingId = createId();
  const confirmationToken = generateConfirmationToken();
  const autoConfirm = settings?.autoConfirm ?? false;

  // RACE CONDITION FIX: Use INSERT with immediate verification
  // If a concurrent request creates a booking in between our checks,
  // we'll catch it by re-verifying after insert.
  try {
    await db.insert(bookingSlot).values({
      id: slotId,
      partnerId,
      listingId: input.listingId,
      startTime: input.scheduledStartTime,
      endTime: input.scheduledEndTime,
      duration: 45,
      status: 'booked',
      maxBookings: 1,
      currentBookings: 1,
    });

    await db.insert(booking).values({
      id: bookingId,
      userId: input.userId,
      partnerId,
      listingId: input.listingId,
      slotId,
      status: autoConfirm ? 'confirmed' : 'pending',
      source: input.source ?? 'web',
      scheduledDate: slotDay,
      scheduledStartTime: input.scheduledStartTime,
      scheduledEndTime: input.scheduledEndTime,
      confirmationToken,
      userPhone,
      userEmail: userData.email,
      userName: userData.name || 'User',
      notes: input.notes,
      specialRequests: input.specialRequests,
      numberOfAttendees: input.numberOfAttendees ?? 1,
      confirmedAt: autoConfirm ? new Date() : null,
      expiresAt: autoConfirm ? null : new Date(now.getTime() + 60 * 60 * 1000), // 1 hour to confirm
    });

    // IMMEDIATE VERIFICATION: Check for any concurrent double-booking race condition
    // After insert, verify we didn't exceed capacity
    const postInsertOverlapCount = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(booking)
      .where(
        and(
          eq(booking.partnerId, partnerId),
          inArray(booking.status, ['pending', 'confirmed']),
          lt(booking.scheduledStartTime, input.scheduledEndTime),
          gt(booking.scheduledEndTime, input.scheduledStartTime),
          ne(booking.id, bookingId) // Exclude our own booking
        )
      );

    const concurrentBookings = (postInsertOverlapCount[0]?.count ?? 0) + 1; // +1 for our booking
    
    if (concurrentBookings > maxConcurrentBookings) {
      // Race condition occurred - rollback by deleting our booking
      await db.delete(booking).where(eq(booking.id, bookingId));
      await db.delete(bookingSlot).where(eq(bookingSlot.id, slotId));
      return { success: false, error: 'This time slot was just booked. Please select another time.' };
    }

    // Also verify listing wasn't double-booked
    const postInsertListingOverlap = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(booking)
      .where(
        and(
          eq(booking.partnerId, partnerId),
          eq(booking.listingId, input.listingId),
          inArray(booking.status, ['pending', 'confirmed']),
          lt(booking.scheduledStartTime, input.scheduledEndTime),
          gt(booking.scheduledEndTime, input.scheduledStartTime),
          ne(booking.id, bookingId)
        )
      );

    if ((postInsertListingOverlap[0]?.count ?? 0) > 0) {
      // Listing was double-booked - rollback
      await db.delete(booking).where(eq(booking.id, bookingId));
      await db.delete(bookingSlot).where(eq(bookingSlot.id, slotId));
      return { success: false, error: 'This listing was just booked for that time. Please select another slot.' };
    }

    return {
      success: true,
      bookingId,
      confirmationToken,
    };
  } catch (err) {
    // Handle unique constraint violations or other DB errors
    console.error('[createBooking] Insert failed:', err);
    
    // Attempt cleanup in case slot was created but booking failed
    try {
      await db.delete(bookingSlot).where(eq(bookingSlot.id, slotId));
    } catch { /* ignore cleanup errors */ }
    
    return { success: false, error: 'Failed to create booking. Please try again.' };
  }
}

/**
 * Confirm a booking (partner action)
 */
export async function confirmBooking(
  bookingId: string,
  confirmedByUserId: string,
  partnerNotes?: string
): Promise<{ success: boolean; error?: string }> {
  const bookingData = await db.query.booking.findFirst({
    where: eq(booking.id, bookingId),
  });

  if (!bookingData) {
    return { success: false, error: 'Booking not found' };
  }

  if (bookingData.status !== 'pending') {
    return { success: false, error: 'Booking cannot be confirmed in its current status' };
  }

  await db
    .update(booking)
    .set({
      status: 'confirmed',
      confirmedBy: confirmedByUserId,
      confirmedAt: new Date(),
      partnerNotes,
      expiresAt: null,
      updatedAt: new Date(),
    })
    .where(eq(booking.id, bookingId));

  return { success: true };
}

/**
 * Reject a booking (partner action)
 */
export async function rejectBooking(
  bookingId: string,
  rejectedByUserId: string,
  rejectionReason: string
): Promise<{ success: boolean; error?: string }> {
  const bookingData = await db.query.booking.findFirst({
    where: eq(booking.id, bookingId),
  });

  if (!bookingData) {
    return { success: false, error: 'Booking not found' };
  }

  if (bookingData.status !== 'pending') {
    return { success: false, error: 'Booking cannot be rejected in its current status' };
  }

  await db
    .update(booking)
    .set({
      status: 'rejected',
      rejectionReason,
      expiresAt: null,
      updatedAt: new Date(),
    })
    .where(eq(booking.id, bookingId));

  // Free up the slot
  await db
    .update(bookingSlot)
    .set({
      status: 'available',
      currentBookings: 0,
      updatedAt: new Date(),
    })
    .where(eq(bookingSlot.id, bookingData.slotId));

  return { success: true };
}

/**
 * Cancel a booking
 */
export type CancellationReason = 
  | 'schedule_conflict' 
  | 'found_another_car' 
  | 'price_issue' 
  | 'location_issue' 
  | 'changed_mind' 
  | 'emergency' 
  | 'other';

export async function cancelBooking(
  bookingId: string,
  cancelledBy: 'user' | 'partner',
  userId: string,
  reason: CancellationReason,
  notes?: string
): Promise<{ success: boolean; error?: string }> {
  const bookingData = await db.query.booking.findFirst({
    where: eq(booking.id, bookingId),
  });

  if (!bookingData) {
    return { success: false, error: 'Booking not found' };
  }

  if (!['pending', 'confirmed'].includes(bookingData.status)) {
    return { success: false, error: 'Booking cannot be cancelled in its current status' };
  }

  // Check cancellation deadline for users
  if (cancelledBy === 'user') {
    const settings = await getPartnerBookingSettings(bookingData.partnerId);
    if (settings && !settings.allowUserCancellation) {
      return { success: false, error: 'This booking cannot be cancelled. Please contact the dealer.' };
    }

    if (settings?.cancellationDeadlineHours) {
      const hoursUntilBooking = (bookingData.scheduledStartTime.getTime() - Date.now()) / (1000 * 60 * 60);
      if (hoursUntilBooking < settings.cancellationDeadlineHours) {
        return { 
          success: false, 
          error: `Cancellations must be made at least ${settings.cancellationDeadlineHours} hours before the appointment` 
        };
      }
    }
  }

  await db
    .update(booking)
    .set({
      status: 'cancelled',
      cancelledAt: new Date(),
      cancelledBy,
      cancellationReason: reason,
      cancellationNotes: notes,
      updatedAt: new Date(),
    })
    .where(eq(booking.id, bookingId));

  // Free up the slot
  await db
    .update(bookingSlot)
    .set({
      status: 'available',
      currentBookings: 0,
      updatedAt: new Date(),
    })
    .where(eq(bookingSlot.id, bookingData.slotId));

  return { success: true };
}

/**
 * Reschedule a booking
 */
export async function rescheduleBooking(
  bookingId: string,
  userId: string,
  newDate: Date,
  newStartTime: Date,
  newEndTime: Date
): Promise<{ success: boolean; error?: string }> {
  const bookingData = await db.query.booking.findFirst({
    where: eq(booking.id, bookingId),
  });

  if (!bookingData) {
    return { success: false, error: 'Booking not found' };
  }

  if (!['pending', 'confirmed'].includes(bookingData.status)) {
    return { success: false, error: 'Booking cannot be rescheduled in its current status' };
  }

  // Check reschedule limits
  if (bookingData.rescheduleCount >= bookingData.maxRescheduleAllowed) {
    return { success: false, error: 'Maximum number of reschedules reached' };
  }

  // Check reschedule deadline
  const settings = await getPartnerBookingSettings(bookingData.partnerId);
  if (settings?.rescheduleDeadlineHours) {
    const hoursUntilBooking = (bookingData.scheduledStartTime.getTime() - Date.now()) / (1000 * 60 * 60);
    if (hoursUntilBooking < settings.rescheduleDeadlineHours) {
      return { 
        success: false, 
        error: `Rescheduling must be done at least ${settings.rescheduleDeadlineHours} hours before the appointment` 
      };
    }
  }

  // Check if new slot is available
  const slotDay = new Date(newStartTime);
  slotDay.setUTCHours(0, 0, 0, 0);
  const slots = await getAvailableSlots(bookingData.partnerId, slotDay);
  const targetSlot = slots.find(
    s => s.startTime.toISOString() === newStartTime.toISOString()
  );

  if (!targetSlot || !targetSlot.isAvailable) {
    return { success: false, error: 'The new time slot is not available' };
  }

  // Hard protection against double-booking (exclude this booking)
  const dayOfWeek = slotDay.getUTCDay();
  const rule = await db.query.partnerAvailability.findFirst({
    where: and(
      eq(partnerAvailability.partnerId, bookingData.partnerId),
      eq(partnerAvailability.dayOfWeek, dayOfWeek),
      eq(partnerAvailability.isActive, true)
    ),
    columns: {
      id: true,
      maxConcurrentBookings: true,
    },
  });

  const maxConcurrentBookings = rule?.maxConcurrentBookings ?? 1;

  const overlapCountResult = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(booking)
    .where(
      and(
        eq(booking.partnerId, bookingData.partnerId),
        inArray(booking.status, ['pending', 'confirmed']),
        ne(booking.id, bookingId),
        lt(booking.scheduledStartTime, newEndTime),
        gt(booking.scheduledEndTime, newStartTime)
      )
    );

  const overlapCount = overlapCountResult[0]?.count ?? 0;
  if (overlapCount >= maxConcurrentBookings) {
    return { success: false, error: 'The new time slot is not available' };
  }

  const listingOverlap = await db.query.booking.findFirst({
    where: and(
      eq(booking.partnerId, bookingData.partnerId),
      eq(booking.listingId, bookingData.listingId),
      inArray(booking.status, ['pending', 'confirmed']),
      ne(booking.id, bookingId),
      lt(booking.scheduledStartTime, newEndTime),
      gt(booking.scheduledEndTime, newStartTime)
    ),
    columns: { id: true },
  });

  if (listingOverlap) {
    return { success: false, error: 'This listing is already booked for that time' };
  }

  // Free up old slot
  await db
    .update(bookingSlot)
    .set({
      status: 'available',
      currentBookings: 0,
      updatedAt: new Date(),
    })
    .where(eq(bookingSlot.id, bookingData.slotId));

  // Create new slot
  const newSlotId = createId();
  await db.insert(bookingSlot).values({
    id: newSlotId,
    partnerId: bookingData.partnerId,
    listingId: bookingData.listingId,
    startTime: newStartTime,
    endTime: newEndTime,
    duration: 45,
    status: 'booked',
    maxBookings: 1,
    currentBookings: 1,
  });

  // Update booking
  await db
    .update(booking)
    .set({
      slotId: newSlotId,
      scheduledDate: slotDay,
      scheduledStartTime: newStartTime,
      scheduledEndTime: newEndTime,
      rescheduleCount: bookingData.rescheduleCount + 1,
      lastRescheduledAt: new Date(),
      originalSlotId: bookingData.originalSlotId || bookingData.slotId,
      status: 'pending', // Reset to pending for re-confirmation
      confirmedAt: null,
      updatedAt: new Date(),
    })
    .where(eq(booking.id, bookingId));

  return { success: true };
}

/**
 * Mark booking as complete (partner action)
 */
export async function completeBooking(
  bookingId: string,
  staffUserId: string,
  checkInTime?: Date,
  checkOutTime?: Date,
  partnerNotes?: string
): Promise<{ success: boolean; error?: string }> {
  const bookingData = await db.query.booking.findFirst({
    where: eq(booking.id, bookingId),
  });

  if (!bookingData) {
    return { success: false, error: 'Booking not found' };
  }

  if (bookingData.status !== 'confirmed') {
    return { success: false, error: 'Only confirmed bookings can be marked as complete' };
  }

  await db
    .update(booking)
    .set({
      status: 'completed',
      completedAt: new Date(),
      checkInTime: checkInTime || bookingData.scheduledStartTime,
      checkOutTime: checkOutTime || new Date(),
      partnerNotes,
      feedbackRequested: true,
      feedbackRequestedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(booking.id, bookingId));

  return { success: true };
}

/**
 * Report no-show (partner action)
 */
export async function reportNoShow(
  bookingId: string,
  staffUserId: string,
  reason?: string
): Promise<{ success: boolean; error?: string }> {
  const bookingData = await db.query.booking.findFirst({
    where: eq(booking.id, bookingId),
  });

  if (!bookingData) {
    return { success: false, error: 'Booking not found' };
  }

  if (bookingData.status !== 'confirmed') {
    return { success: false, error: 'Only confirmed bookings can be marked as no-show' };
  }

  // Check if the booking time has passed
  if (bookingData.scheduledEndTime > new Date()) {
    return { success: false, error: 'Cannot report no-show before the scheduled time has passed' };
  }

  await db
    .update(booking)
    .set({
      status: 'no_show',
      noShowReported: true,
      noShowReportedAt: new Date(),
      noShowReason: reason,
      updatedAt: new Date(),
    })
    .where(eq(booking.id, bookingId));

  return { success: true };
}

/**
 * Submit feedback for a completed booking
 */
export interface BookingFeedback {
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
}

export async function submitBookingFeedback(
  bookingId: string,
  userId: string,
  feedback: BookingFeedback
): Promise<{ success: boolean; error?: string }> {
  const bookingData = await db.query.booking.findFirst({
    where: and(
      eq(booking.id, bookingId),
      eq(booking.userId, userId)
    ),
  });

  if (!bookingData) {
    return { success: false, error: 'Booking not found' };
  }

  if (bookingData.status !== 'completed') {
    return { success: false, error: 'Feedback can only be submitted for completed bookings' };
  }

  if (bookingData.feedbackSubmitted) {
    return { success: false, error: 'Feedback has already been submitted' };
  }

  await db
    .update(booking)
    .set({
      feedback,
      feedbackSubmitted: true,
      feedbackSubmittedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(booking.id, bookingId));

  return { success: true };
}
