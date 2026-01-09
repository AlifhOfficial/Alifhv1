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
  cancellationReasonEnum,
  bookingSourceEnum,
} from '../../schema/booking';
import { carListing } from '../../schema/listing';
import { partner } from '../../schema/partner';
import { user } from '../../schema/auth';
import { userProfile } from '../../schema/profile';
import { checkUserBookingRestrictions, BOOKING_CONFIG, ACTIVE_BOOKING_STATUSES } from './booking-queries';
import { getAvailableSlots, getPartnerBookingSettings } from './availability-queries';

// ============================================================================
// CONFIGURATION CONSTANTS
// ============================================================================

/**
 * Booking mutation configuration
 * These can be moved to environment variables for production tuning
 */
export const BOOKING_MUTATION_CONFIG = {
  /** Default slot duration in minutes */
  DEFAULT_SLOT_DURATION: 45,
  /** Confirmation token length */
  CONFIRMATION_TOKEN_LENGTH: 8,
  /** Hours until pending booking expires */
  PENDING_BOOKING_EXPIRY_HOURS: 1,
  /** Default retention days for deleted bookings */
  DEFAULT_RETENTION_DAYS: 7,
  /** Characters used for confirmation tokens (no ambiguous chars like 0/O, 1/I) */
  TOKEN_CHARS: 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789',
} as const;

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/** Cancellation reasons derived from the database enum */
export type CancellationReason = (typeof cancellationReasonEnum.enumValues)[number];

/** Booking source derived from the database enum */
export type BookingSource = (typeof bookingSourceEnum.enumValues)[number];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Wrap a database mutation with error handling and logging
 */
async function withMutationErrorHandling<T>(
  operation: string,
  mutationFn: () => Promise<T>
): Promise<T> {
  try {
    return await mutationFn();
  } catch (error) {
    console.error(`[BookingMutations] ${operation} failed:`, error);
    throw error;
  }
}

/**
 * Generate a random confirmation token
 */
function generateConfirmationToken(): string {
  const { TOKEN_CHARS, CONFIRMATION_TOKEN_LENGTH } = BOOKING_MUTATION_CONFIG;
  let token = '';
  for (let i = 0; i < CONFIRMATION_TOKEN_LENGTH; i++) {
    token += TOKEN_CHARS.charAt(Math.floor(Math.random() * TOKEN_CHARS.length));
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
  source?: BookingSource;
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
  return withMutationErrorHandling('checkInBookingAsStaff', async () => {
    const current = await db.query.booking.findFirst({
      where: and(eq(booking.id, bookingId), eq(booking.partnerId, partnerId)),
      columns: { id: true, status: true },
    });

    if (!current) {
      return { success: false, error: 'Booking not found' };
    }

    if (!ACTIVE_BOOKING_STATUSES.includes(current.status as any)) {
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
          inArray(booking.status, ACTIVE_BOOKING_STATUSES)
        )
      )
      .returning({ id: booking.id });

    if (updated.length === 0) {
      return { success: false, error: 'Failed to update booking' };
    }

    return { success: true, bookingId };
  });
}

/**
 * Maintenance: expire pending bookings and delete stale cancelled/expired records.
 * This is run opportunistically from API routes to keep the DB tidy without requiring cron.
 */
export async function runBookingMaintenance(options?: { retentionDays?: number }): Promise<void> {
  const retentionDays = options?.retentionDays ?? BOOKING_MUTATION_CONFIG.DEFAULT_RETENTION_DAYS;
  const now = new Date();
  const cutoff = new Date(now.getTime() - retentionDays * 24 * 60 * 60 * 1000);

  try {
    // Expire pending bookings past their confirmation window
    await db
      .update(booking)
      .set({ status: 'expired', updatedAt: now })
      .where(and(eq(booking.status, 'pending'), lt(booking.expiresAt, now)));

    // Auto-cancel bookings where the scheduled time has passed with no action
    // This handles both pending and confirmed bookings that weren't checked in or completed
    await db
      .update(booking)
      .set({ 
        status: 'cancelled', 
        cancelledAt: now,
        cancelledBy: 'system',
        cancellationNotes: 'Automatically cancelled - scheduled time passed without action',
        updatedAt: now 
      })
      .where(
        and(
          inArray(booking.status, ACTIVE_BOOKING_STATUSES),
          lt(booking.scheduledStartTime, now)
        )
      );

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
  } catch (error) {
    // Log but don't throw - maintenance should never break user flows
    console.error('[BookingMaintenance] Maintenance task failed:', error);
  }
}

/**
 * Create a new booking
 * ⚡ OPTIMIZED: Parallelized validation queries (reduced from ~15 to ~6 round trips)
 */
export async function createBooking(input: CreateBookingInput): Promise<BookingResult> {
  const now = new Date();
  const slotDay = new Date(input.scheduledStartTime);
  slotDay.setUTCHours(0, 0, 0, 0);
  const dayOfWeek = slotDay.getUTCDay();

  // ⚡ PHASE 1: Parallel initial validation (4 queries → 1 round trip)
  const [restrictions, listingData, userWithProfile] = await Promise.all([
    checkUserBookingRestrictions(input.userId),
    db.query.carListing.findFirst({
      where: eq(carListing.id, input.listingId),
      columns: { id: true, partnerId: true, lifecycleStatus: true },
    }),
    // Combined user + profile query (was 2 separate queries)
    db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: userProfile.phone,
      })
      .from(user)
      .leftJoin(userProfile, eq(userProfile.userId, user.id))
      .where(eq(user.id, input.userId))
      .limit(1),
  ]);

  // Early validation checks
  if (!restrictions.canBook) {
    return { success: false, error: restrictions.reason };
  }

  if (!listingData) {
    return { success: false, error: 'Listing not found' };
  }

  if (listingData.lifecycleStatus !== 'active') {
    return { success: false, error: 'This listing is not available for booking' };
  }

  if (!listingData.partnerId) {
    return { success: false, error: 'This listing does not support test drive bookings' };
  }

  if (userWithProfile.length === 0) {
    return { success: false, error: 'User not found' };
  }

  const partnerId = listingData.partnerId;
  const userData = userWithProfile[0];
  const userPhone = userData.phone || '+971500000000';

  // ⚡ PHASE 2: Partner + booking validation (5 queries → 1 round trip)
  const [settings, existingForListing, overlappingUserBooking, slots, availabilityRule] = await Promise.all([
    getPartnerBookingSettings(partnerId),
    db.query.booking.findFirst({
      where: and(
        eq(booking.userId, input.userId),
        eq(booking.listingId, input.listingId),
        inArray(booking.status, ['pending', 'confirmed']),
        gte(booking.scheduledEndTime, now),
        or(
          eq(booking.status, 'confirmed'),
          and(eq(booking.status, 'pending'), or(isNull(booking.expiresAt), gt(booking.expiresAt, now)))
        )
      ),
      columns: { id: true },
    }),
    db.query.booking.findFirst({
      where: and(
        eq(booking.userId, input.userId),
        inArray(booking.status, ['pending', 'confirmed']),
        lt(booking.scheduledStartTime, input.scheduledEndTime),
        gt(booking.scheduledEndTime, input.scheduledStartTime),
        or(
          eq(booking.status, 'confirmed'),
          and(eq(booking.status, 'pending'), or(isNull(booking.expiresAt), gt(booking.expiresAt, now)))
        )
      ),
      columns: { id: true },
    }),
    getAvailableSlots(partnerId, slotDay),
    db.query.partnerAvailability.findFirst({
      where: and(
        eq(partnerAvailability.partnerId, partnerId),
        eq(partnerAvailability.dayOfWeek, dayOfWeek),
        eq(partnerAvailability.isActive, true)
      ),
      columns: { id: true, maxConcurrentBookings: true },
    }),
  ]);

  // Validation checks
  if (settings && !settings.bookingEnabled) {
    return { success: false, error: 'This dealer is not accepting bookings at this time' };
  }

  if (existingForListing) {
    return { success: false, error: 'You already have a test drive booked for this listing' };
  }

  if (overlappingUserBooking) {
    return { success: false, error: 'You already have another booking at that time' };
  }

  // Slot validation
  const inputStartISO = input.scheduledStartTime.toISOString();
  const targetSlot = slots.find(s => s.startTime.toISOString() === inputStartISO);

  if (!targetSlot || !targetSlot.isAvailable) {
    return { success: false, error: 'This time slot is no longer available' };
  }

  if (input.scheduledEndTime.toISOString() !== targetSlot.endTime.toISOString()) {
    return { success: false, error: 'Invalid time slot selection' };
  }

  const maxConcurrentBookings = availabilityRule?.maxConcurrentBookings ?? 1;

  // ⚡ PHASE 3: Final conflict checks (2 queries → 1 round trip)
  const [overlapCountResult, listingOverlap] = await Promise.all([
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(booking)
      .where(
        and(
          eq(booking.partnerId, partnerId),
          inArray(booking.status, ['pending', 'confirmed']),
          lt(booking.scheduledStartTime, input.scheduledEndTime),
          gt(booking.scheduledEndTime, input.scheduledStartTime)
        )
      ),
    db.query.booking.findFirst({
      where: and(
        eq(booking.partnerId, partnerId),
        eq(booking.listingId, input.listingId),
        inArray(booking.status, ['pending', 'confirmed']),
        lt(booking.scheduledStartTime, input.scheduledEndTime),
        gt(booking.scheduledEndTime, input.scheduledStartTime)
      ),
      columns: { id: true },
    }),
  ]);

  const overlapCount = overlapCountResult[0]?.count ?? 0;
  if (overlapCount >= maxConcurrentBookings) {
    return { success: false, error: 'This time slot is no longer available' };
  }

  if (listingOverlap) {
    return { success: false, error: 'This listing is already booked for that time' };
  }

  // Lead time validation
  const hoursUntilBooking = (input.scheduledStartTime.getTime() - now.getTime()) / (1000 * 60 * 60);
  
  if (settings) {
    if (hoursUntilBooking < settings.minLeadTimeHours) {
      return { success: false, error: `Bookings must be made at least ${settings.minLeadTimeHours} hours in advance` };
    }
    const daysUntilBooking = hoursUntilBooking / 24;
    if (daysUntilBooking > settings.maxLeadTimeDays) {
      return { success: false, error: `Bookings can only be made up to ${settings.maxLeadTimeDays} days in advance` };
    }
  }

  // Create booking
  const slotId = createId();
  const bookingId = createId();
  const confirmationToken = generateConfirmationToken();
  const autoConfirm = settings?.autoConfirm ?? false;

  try {
    // ⚡ PHASE 4: Insert slot + booking in parallel
    await Promise.all([
      db.insert(bookingSlot).values({
        id: slotId,
        partnerId,
        listingId: input.listingId,
        startTime: input.scheduledStartTime,
        endTime: input.scheduledEndTime,
        duration: BOOKING_MUTATION_CONFIG.DEFAULT_SLOT_DURATION,
        status: 'booked',
        maxBookings: 1,
        currentBookings: 1,
      }),
      db.insert(booking).values({
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
        expiresAt: autoConfirm ? null : new Date(now.getTime() + BOOKING_MUTATION_CONFIG.PENDING_BOOKING_EXPIRY_HOURS * 60 * 60 * 1000),
      }),
    ]);

    // ⚡ PHASE 5: Post-insert verification (2 queries → 1 round trip)
    const [postInsertOverlapCount, postInsertListingOverlap] = await Promise.all([
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(booking)
        .where(
          and(
            eq(booking.partnerId, partnerId),
            inArray(booking.status, ['pending', 'confirmed']),
            lt(booking.scheduledStartTime, input.scheduledEndTime),
            gt(booking.scheduledEndTime, input.scheduledStartTime),
            ne(booking.id, bookingId)
          )
        ),
      db
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
        ),
    ]);

    const concurrentBookings = (postInsertOverlapCount[0]?.count ?? 0) + 1;
    
    if (concurrentBookings > maxConcurrentBookings) {
      await Promise.all([
        db.delete(booking).where(eq(booking.id, bookingId)),
        db.delete(bookingSlot).where(eq(bookingSlot.id, slotId)),
      ]);
      return { success: false, error: 'This time slot was just booked. Please select another time.' };
    }

    if ((postInsertListingOverlap[0]?.count ?? 0) > 0) {
      await Promise.all([
        db.delete(booking).where(eq(booking.id, bookingId)),
        db.delete(bookingSlot).where(eq(bookingSlot.id, slotId)),
      ]);
      return { success: false, error: 'This listing was just booked for that time. Please select another slot.' };
    }

    return { success: true, bookingId, confirmationToken };
  } catch (err) {
    console.error('[createBooking] Insert failed:', err);
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
  return withMutationErrorHandling('confirmBooking', async () => {
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
  });
}

/**
 * Reject a booking (partner action)
 */
export async function rejectBooking(
  bookingId: string,
  rejectedByUserId: string,
  rejectionReason: string
): Promise<{ success: boolean; error?: string }> {
  return withMutationErrorHandling('rejectBooking', async () => {
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
  });
}

/**
 * Cancel a booking
 */
export async function cancelBooking(
  bookingId: string,
  cancelledBy: 'user' | 'partner',
  userId: string,
  reason: CancellationReason,
  notes?: string
): Promise<{ success: boolean; error?: string }> {
  return withMutationErrorHandling('cancelBooking', async () => {
    const bookingData = await db.query.booking.findFirst({
      where: eq(booking.id, bookingId),
    });

    if (!bookingData) {
      return { success: false, error: 'Booking not found' };
    }

    if (!ACTIVE_BOOKING_STATUSES.includes(bookingData.status as any)) {
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
  });
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
  return withMutationErrorHandling('rescheduleBooking', async () => {
    const bookingData = await db.query.booking.findFirst({
      where: eq(booking.id, bookingId),
    });

    if (!bookingData) {
      return { success: false, error: 'Booking not found' };
    }

    if (!ACTIVE_BOOKING_STATUSES.includes(bookingData.status as any)) {
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
          inArray(booking.status, ACTIVE_BOOKING_STATUSES),
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
        inArray(booking.status, ACTIVE_BOOKING_STATUSES),
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
      duration: BOOKING_MUTATION_CONFIG.DEFAULT_SLOT_DURATION,
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
  });
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
  return withMutationErrorHandling('completeBooking', async () => {
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
  });
}

/**
 * Report no-show (partner action)
 */
export async function reportNoShow(
  bookingId: string,
  staffUserId: string,
  reason?: string
): Promise<{ success: boolean; error?: string }> {
  return withMutationErrorHandling('reportNoShow', async () => {
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
  });
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
  return withMutationErrorHandling('submitBookingFeedback', async () => {
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
  });
}
