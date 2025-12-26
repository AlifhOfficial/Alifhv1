/**
 * Availability Queries
 * Functions for managing partner booking availability and generating slots
 * 
 * @module queries/booking/availability-queries
 */

import { eq, and, gte, lte, inArray, desc, sql, or, isNull, lt, gt } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';
import { db } from '../../dbclient';
import { 
  partnerAvailability, 
  bookingSlot, 
  booking,
  partnerBookingSettings 
} from '../../schema/booking';
import { partner } from '../../schema/partner';

const PARTNER_TIMEZONE_OFFSET_MINUTES = 4 * 60; // Asia/Dubai (no DST)

function getPartnerDayStartUtc(date: Date): number {
  const baseUtcMidnight = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0, 0);
  return baseUtcMidnight - PARTNER_TIMEZONE_OFFSET_MINUTES * 60 * 1000;
}

/**
 * Partner availability rule for a specific day
 */
export interface AvailabilityRule {
  id: string;
  partnerId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotDuration: number;
  maxConcurrentBookings: number;
  bufferTime: number | null;
  isActive: boolean;
  excludeDates: string[];
}

/**
 * Get partner's availability rules
 */
export async function getPartnerAvailability(partnerId: string): Promise<AvailabilityRule[]> {
  const rules = await db.query.partnerAvailability.findMany({
    where: and(
      eq(partnerAvailability.partnerId, partnerId),
      eq(partnerAvailability.isActive, true)
    ),
    orderBy: [partnerAvailability.dayOfWeek],
  });

  return rules.map(rule => ({
    id: rule.id,
    partnerId: rule.partnerId,
    dayOfWeek: rule.dayOfWeek,
    startTime: rule.startTime,
    endTime: rule.endTime,
    slotDuration: rule.slotDuration,
    maxConcurrentBookings: rule.maxConcurrentBookings,
    bufferTime: rule.bufferTime,
    isActive: rule.isActive,
    excludeDates: (rule.excludeDates as string[]) || [],
  }));
}

/**
 * Set or update partner availability for a specific day
 */
export async function setPartnerAvailability(
  partnerId: string,
  dayOfWeek: number,
  data: {
    startTime: string;
    endTime: string;
    slotDuration?: number;
    maxConcurrentBookings?: number;
    bufferTime?: number;
    isActive?: boolean;
    excludeDates?: string[];
  }
): Promise<AvailabilityRule> {
  // Check if rule exists
  const existing = await db.query.partnerAvailability.findFirst({
    where: and(
      eq(partnerAvailability.partnerId, partnerId),
      eq(partnerAvailability.dayOfWeek, dayOfWeek)
    ),
  });

  if (existing) {
    // Update existing
    const [updated] = await db
      .update(partnerAvailability)
      .set({
        startTime: data.startTime,
        endTime: data.endTime,
        slotDuration: data.slotDuration ?? existing.slotDuration,
        maxConcurrentBookings: data.maxConcurrentBookings ?? existing.maxConcurrentBookings,
        bufferTime: data.bufferTime ?? existing.bufferTime,
        isActive: data.isActive ?? existing.isActive,
        excludeDates: data.excludeDates ?? existing.excludeDates,
        updatedAt: new Date(),
      })
      .where(eq(partnerAvailability.id, existing.id))
      .returning();

    return {
      id: updated.id,
      partnerId: updated.partnerId,
      dayOfWeek: updated.dayOfWeek,
      startTime: updated.startTime,
      endTime: updated.endTime,
      slotDuration: updated.slotDuration,
      maxConcurrentBookings: updated.maxConcurrentBookings,
      bufferTime: updated.bufferTime,
      isActive: updated.isActive,
      excludeDates: (updated.excludeDates as string[]) || [],
    };
  }

  // Create new
  const [created] = await db
    .insert(partnerAvailability)
    .values({
      id: createId(),
      partnerId,
      dayOfWeek,
      startTime: data.startTime,
      endTime: data.endTime,
      slotDuration: data.slotDuration ?? 45,
      maxConcurrentBookings: data.maxConcurrentBookings ?? 1,
      bufferTime: data.bufferTime ?? 15,
      isActive: data.isActive ?? true,
      excludeDates: data.excludeDates ?? [],
    })
    .returning();

  return {
    id: created.id,
    partnerId: created.partnerId,
    dayOfWeek: created.dayOfWeek,
    startTime: created.startTime,
    endTime: created.endTime,
    slotDuration: created.slotDuration,
    maxConcurrentBookings: created.maxConcurrentBookings,
    bufferTime: created.bufferTime,
    isActive: created.isActive,
    excludeDates: (created.excludeDates as string[]) || [],
  };
}

/**
 * Initialize default availability for a partner (Mon-Sat 9-6, Fri closed)
 */
export async function initializeDefaultAvailability(partnerId: string): Promise<void> {
  const defaults = [
    { dayOfWeek: 0, startTime: '09:00', endTime: '18:00', isActive: true }, // Sunday
    { dayOfWeek: 1, startTime: '09:00', endTime: '18:00', isActive: true }, // Monday
    { dayOfWeek: 2, startTime: '09:00', endTime: '18:00', isActive: true }, // Tuesday
    { dayOfWeek: 3, startTime: '09:00', endTime: '18:00', isActive: true }, // Wednesday
    { dayOfWeek: 4, startTime: '09:00', endTime: '18:00', isActive: true }, // Thursday
    { dayOfWeek: 5, startTime: '09:00', endTime: '13:00', isActive: false }, // Friday (closed or half day)
    { dayOfWeek: 6, startTime: '09:00', endTime: '18:00', isActive: true }, // Saturday
  ];

  for (const rule of defaults) {
    await setPartnerAvailability(partnerId, rule.dayOfWeek, rule);
  }
}

/**
 * Time slot data structure
 */
export interface TimeSlot {
  id: string;
  startTime: Date;
  endTime: Date;
  duration: number;
  status: 'available' | 'booked' | 'blocked' | 'past';
  currentBookings: number;
  maxBookings: number;
  isAvailable: boolean;
}

/**
 * Generate available time slots for a partner on a specific date
 * This creates slots dynamically based on availability rules
 */
export async function getAvailableSlots(
  partnerId: string,
  date: Date,
  listingId?: string
): Promise<TimeSlot[]> {
  // Treat scheduling as UTC to avoid server timezone differences.
  const dayOfWeek = date.getUTCDay(); // 0 = Sunday
  const dateStr = date.toISOString().split('T')[0];

  // Get availability rule for this day
  const rule = await db.query.partnerAvailability.findFirst({
    where: and(
      eq(partnerAvailability.partnerId, partnerId),
      eq(partnerAvailability.dayOfWeek, dayOfWeek),
      eq(partnerAvailability.isActive, true)
    ),
  });

  if (!rule) {
    return []; // No availability for this day
  }

  // Check if date is excluded
  const excludeDates = (rule.excludeDates as string[]) || [];
  if (excludeDates.includes(dateStr)) {
    return [];
  }

  // Generate slots based on rule
  const slots: TimeSlot[] = [];
  const [startHour, startMin] = rule.startTime.split(':').map(Number);
  const [endHour, endMin] = rule.endTime.split(':').map(Number);
  
  // Interpret availability rule times in partner local time (Asia/Dubai) and convert to UTC instants.
  const dayStartUtc = getPartnerDayStartUtc(date);
  const startDate = new Date(dayStartUtc + (startHour * 60 + startMin) * 60 * 1000);
  const endDate = new Date(dayStartUtc + (endHour * 60 + endMin) * 60 * 1000);

  const slotDuration = rule.slotDuration; // in minutes
  const bufferTime = rule.bufferTime || 0;
  const totalSlotTime = slotDuration + bufferTime;
  
  let currentSlotStart = new Date(startDate);
  const now = new Date();

  // Get existing bookings that overlap this working-day window.
  // Using overlap logic avoids timezone/day-boundary bugs that can cause "slot looks available but fails on submit".
  const existingBookings = await db.query.booking.findMany({
    where: and(
      eq(booking.partnerId, partnerId),
      inArray(booking.status, ['pending', 'confirmed']),
      lt(booking.scheduledStartTime, endDate),
      gt(booking.scheduledEndTime, startDate),
      or(
        eq(booking.status, 'confirmed'),
        and(
          eq(booking.status, 'pending'),
          or(isNull(booking.expiresAt), gte(booking.expiresAt, now))
        )
      )
    ),
    columns: {
      listingId: true,
      scheduledStartTime: true,
      scheduledEndTime: true,
    },
  });

  while (currentSlotStart < endDate) {
    const slotEnd = new Date(currentSlotStart.getTime() + slotDuration * 60000);
    
    // Don't generate slots that extend past closing time
    if (slotEnd > endDate) break;

    // Count partner bookings for this time slot
    const partnerBookingsAtThisTime = existingBookings.filter((b) => currentSlotStart < b.scheduledEndTime && slotEnd > b.scheduledStartTime).length;

    // For listing-specific availability, also enforce exclusivity per listing.
    const listingBookingsAtThisTime =
      listingId
        ? existingBookings.filter((b) => b.listingId === listingId && currentSlotStart < b.scheduledEndTime && slotEnd > b.scheduledStartTime).length
        : 0;

    const isPast = currentSlotStart < now;
    const partnerHasCapacity = partnerBookingsAtThisTime < rule.maxConcurrentBookings;
    const listingIsFree = !listingId || listingBookingsAtThisTime < 1;
    const isAvailable = !isPast && partnerHasCapacity && listingIsFree;

    slots.push({
      id: `${partnerId}-${currentSlotStart.toISOString()}`,
      startTime: new Date(currentSlotStart),
      endTime: slotEnd,
      duration: slotDuration,
      status: isPast ? 'past' : isAvailable ? 'available' : 'booked',
      currentBookings: listingId ? listingBookingsAtThisTime : partnerBookingsAtThisTime,
      maxBookings: listingId ? 1 : rule.maxConcurrentBookings,
      isAvailable,
    });

    // Move to next slot (including buffer time)
    currentSlotStart = new Date(currentSlotStart.getTime() + totalSlotTime * 60000);
  }

  return slots;
}

/**
 * Get partner booking settings
 */
export interface BookingSettings {
  id: string;
  partnerId: string;
  bookingEnabled: boolean;
  autoConfirm: boolean;
  confirmationTimeoutMinutes: number | null;
  minLeadTimeHours: number;
  maxLeadTimeDays: number;
  allowUserCancellation: boolean;
  cancellationDeadlineHours: number | null;
  allowReschedule: boolean;
  maxRescheduleCount: number;
  rescheduleDeadlineHours: number | null;
  sendReminders: boolean;
  reminderTimes: number[];
  defaultSlotDuration: number;
  bufferBetweenBookings: number | null;
  preparationInstructions: string | null;
  directions: string | null;
  parkingInstructions: string | null;
  contactPersonName: string | null;
  contactPersonPhone: string | null;
}

export async function getPartnerBookingSettings(partnerId: string): Promise<BookingSettings | null> {
  const settings = await db.query.partnerBookingSettings.findFirst({
    where: eq(partnerBookingSettings.partnerId, partnerId),
  });

  if (!settings) return null;

  return {
    id: settings.id,
    partnerId: settings.partnerId,
    bookingEnabled: settings.bookingEnabled,
    autoConfirm: settings.autoConfirm,
    confirmationTimeoutMinutes: settings.confirmationTimeoutMinutes,
    minLeadTimeHours: settings.minLeadTimeHours,
    maxLeadTimeDays: settings.maxLeadTimeDays,
    allowUserCancellation: settings.allowUserCancellation,
    cancellationDeadlineHours: settings.cancellationDeadlineHours,
    allowReschedule: settings.allowReschedule,
    maxRescheduleCount: settings.maxRescheduleCount,
    rescheduleDeadlineHours: settings.rescheduleDeadlineHours,
    sendReminders: settings.sendReminders,
    reminderTimes: (settings.reminderTimes as number[]) || [24, 2],
    defaultSlotDuration: settings.defaultSlotDuration,
    bufferBetweenBookings: settings.bufferBetweenBookings,
    preparationInstructions: settings.preparationInstructions,
    directions: settings.directions,
    parkingInstructions: settings.parkingInstructions,
    contactPersonName: settings.contactPersonName,
    contactPersonPhone: settings.contactPersonPhone,
  };
}

/**
 * Create or update partner booking settings
 */
export async function upsertPartnerBookingSettings(
  partnerId: string,
  data: Partial<Omit<BookingSettings, 'id' | 'partnerId'>>
): Promise<BookingSettings> {
  const existing = await db.query.partnerBookingSettings.findFirst({
    where: eq(partnerBookingSettings.partnerId, partnerId),
  });

  if (existing) {
    const [updated] = await db
      .update(partnerBookingSettings)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(partnerBookingSettings.id, existing.id))
      .returning();

    return {
      id: updated.id,
      partnerId: updated.partnerId,
      bookingEnabled: updated.bookingEnabled,
      autoConfirm: updated.autoConfirm,
      confirmationTimeoutMinutes: updated.confirmationTimeoutMinutes,
      minLeadTimeHours: updated.minLeadTimeHours,
      maxLeadTimeDays: updated.maxLeadTimeDays,
      allowUserCancellation: updated.allowUserCancellation,
      cancellationDeadlineHours: updated.cancellationDeadlineHours,
      allowReschedule: updated.allowReschedule,
      maxRescheduleCount: updated.maxRescheduleCount,
      rescheduleDeadlineHours: updated.rescheduleDeadlineHours,
      sendReminders: updated.sendReminders,
      reminderTimes: (updated.reminderTimes as number[]) || [24, 2],
      defaultSlotDuration: updated.defaultSlotDuration,
      bufferBetweenBookings: updated.bufferBetweenBookings,
      preparationInstructions: updated.preparationInstructions,
      directions: updated.directions,
      parkingInstructions: updated.parkingInstructions,
      contactPersonName: updated.contactPersonName,
      contactPersonPhone: updated.contactPersonPhone,
    };
  }

  const [created] = await db
    .insert(partnerBookingSettings)
    .values({
      id: createId(),
      partnerId,
      bookingEnabled: data.bookingEnabled ?? true,
      autoConfirm: data.autoConfirm ?? false,
      confirmationTimeoutMinutes: data.confirmationTimeoutMinutes ?? 60,
      minLeadTimeHours: data.minLeadTimeHours ?? 2,
      maxLeadTimeDays: data.maxLeadTimeDays ?? 30,
      allowUserCancellation: data.allowUserCancellation ?? true,
      cancellationDeadlineHours: data.cancellationDeadlineHours ?? 2,
      allowReschedule: data.allowReschedule ?? true,
      maxRescheduleCount: data.maxRescheduleCount ?? 1,
      rescheduleDeadlineHours: data.rescheduleDeadlineHours ?? 4,
      sendReminders: data.sendReminders ?? true,
      reminderTimes: data.reminderTimes ?? [24, 2],
      defaultSlotDuration: data.defaultSlotDuration ?? 45,
      bufferBetweenBookings: data.bufferBetweenBookings ?? 15,
      preparationInstructions: data.preparationInstructions,
      directions: data.directions,
      parkingInstructions: data.parkingInstructions,
      contactPersonName: data.contactPersonName,
      contactPersonPhone: data.contactPersonPhone,
    })
    .returning();

  return {
    id: created.id,
    partnerId: created.partnerId,
    bookingEnabled: created.bookingEnabled,
    autoConfirm: created.autoConfirm,
    confirmationTimeoutMinutes: created.confirmationTimeoutMinutes,
    minLeadTimeHours: created.minLeadTimeHours,
    maxLeadTimeDays: created.maxLeadTimeDays,
    allowUserCancellation: created.allowUserCancellation,
    cancellationDeadlineHours: created.cancellationDeadlineHours,
    allowReschedule: created.allowReschedule,
    maxRescheduleCount: created.maxRescheduleCount,
    rescheduleDeadlineHours: created.rescheduleDeadlineHours,
    sendReminders: created.sendReminders,
    reminderTimes: (created.reminderTimes as number[]) || [24, 2],
    defaultSlotDuration: created.defaultSlotDuration,
    bufferBetweenBookings: created.bufferBetweenBookings,
    preparationInstructions: created.preparationInstructions,
    directions: created.directions,
    parkingInstructions: created.parkingInstructions,
    contactPersonName: created.contactPersonName,
    contactPersonPhone: created.contactPersonPhone,
  };
}

/**
 * Get available dates for the next N days for a partner
 * Returns dates that have at least one available slot
 */
export async function getAvailableDates(
  partnerId: string,
  fromDate: Date = new Date(),
  days: number = 30
): Promise<{ date: string; dayOfWeek: number; hasSlots: boolean }[]> {
  const rules = await getPartnerAvailability(partnerId);
  
  if (rules.length === 0) {
    return [];
  }

  const activeDays = new Set(rules.map(r => r.dayOfWeek));
  const excludeDatesSet = new Set(rules.flatMap(r => r.excludeDates));
  
  const result: { date: string; dayOfWeek: number; hasSlots: boolean }[] = [];
  const now = new Date();
  const fromUtc = new Date(fromDate);
  fromUtc.setUTCHours(0, 0, 0, 0);

  for (let i = 0; i < days; i++) {
    const date = new Date(fromUtc.getTime() + i * 24 * 60 * 60 * 1000);
    const dateStr = date.toISOString().split('T')[0];
    const dayOfWeek = date.getUTCDay();

    // Skip past dates (UTC day)
    const todayUtc = new Date(now);
    todayUtc.setUTCHours(0, 0, 0, 0);
    if (date.getTime() < todayUtc.getTime()) {
      continue;
    }

    const hasSlots = activeDays.has(dayOfWeek) && !excludeDatesSet.has(dateStr);

    result.push({ date: dateStr, dayOfWeek, hasSlots });
  }

  return result;
}
