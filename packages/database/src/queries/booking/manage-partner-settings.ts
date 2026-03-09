/**
 * MANAGE PARTNER SETTINGS - Partner Booking Configuration
 * 
 * One function to manage all partner booking settings and availability.
 * 
 * @module queries/booking/manage-partner-settings
 */

import { eq, and } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';
import { db } from '../../dbclient';
import { partnerAvailability, partnerBookingSettings } from '../../schema/booking';

// ============================================================================
// TYPES
// ============================================================================

export type PartnerSettingsAction = 
  | 'get'
  | 'setDay'
  | 'initDefaults'
  | 'updateSettings';

export interface ManagePartnerSettingsParams {
  partnerId: string;
  action: PartnerSettingsAction;
  
  // For 'setDay' action
  dayOfWeek?: number; // 0=Sun, 1=Mon, ..., 6=Sat
  startTime?: string; // "09:00"
  endTime?: string;   // "18:00"
  slotDuration?: number;
  maxConcurrentBookings?: number;
  bufferTime?: number;
  isActive?: boolean;
  excludeDates?: string[];
  
  // For 'updateSettings' action
  bookingEnabled?: boolean;
  autoConfirm?: boolean;
  confirmationTimeoutMinutes?: number;
  minLeadTimeHours?: number;
  maxLeadTimeDays?: number;
  allowUserCancellation?: boolean;
  cancellationDeadlineHours?: number;
  allowReschedule?: boolean;
  maxRescheduleCount?: number;
  rescheduleDeadlineHours?: number;
  sendReminders?: boolean;
  reminderTimes?: number[];
  smsReminders?: boolean;
  emailReminders?: boolean;
  defaultSlotDuration?: number;
  bufferBetweenBookings?: number;
  preparationInstructions?: string;
  directions?: string;
  parkingInstructions?: string;
  contactPersonName?: string;
  contactPersonPhone?: string;
}

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

export interface PartnerSettings {
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
  smsReminders: boolean;
  emailReminders: boolean;
  defaultSlotDuration: number;
  bufferBetweenBookings: number | null;
  preparationInstructions: string | null;
  directions: string | null;
  parkingInstructions: string | null;
  contactPersonName: string | null;
  contactPersonPhone: string | null;
}

export interface ManagePartnerSettingsResult {
  success: boolean;
  error?: string;
  availability?: AvailabilityRule[];
  settings?: PartnerSettings | null;
  rule?: AvailabilityRule; // For setDay action
}

// ============================================================================
// DEFAULT CONFIG
// ============================================================================

const DEFAULTS = {
  SLOT_DURATION: 45,
  BUFFER_TIME: 15,
  MAX_CONCURRENT: 1,
  MIN_LEAD_HOURS: 2,
  MAX_LEAD_DAYS: 30,
  DEFAULT_HOURS: [
    { dayOfWeek: 0, startTime: '09:00', endTime: '18:00', isActive: true },  // Sunday
    { dayOfWeek: 1, startTime: '09:00', endTime: '18:00', isActive: true },  // Monday
    { dayOfWeek: 2, startTime: '09:00', endTime: '18:00', isActive: true },  // Tuesday
    { dayOfWeek: 3, startTime: '09:00', endTime: '18:00', isActive: true },  // Wednesday
    { dayOfWeek: 4, startTime: '09:00', endTime: '18:00', isActive: true },  // Thursday
    { dayOfWeek: 5, startTime: '09:00', endTime: '13:00', isActive: false }, // Friday (closed)
    { dayOfWeek: 6, startTime: '09:00', endTime: '18:00', isActive: true },  // Saturday
  ],
} as const;

// ============================================================================
// MAIN FUNCTION
// ============================================================================

/**
 * Universal partner settings manager
 */
export async function managePartnerSettings(
  params: ManagePartnerSettingsParams
): Promise<ManagePartnerSettingsResult> {
  const { partnerId, action } = params;

  try {
    switch (action) {
      case 'get':
        return await getPartnerConfig(partnerId);

      case 'setDay':
        return await setDayAvailability(params);

      case 'initDefaults':
        return await initializeDefaults(partnerId);

      case 'updateSettings':
        return await updateSettings(params);

      default:
        return { success: false, error: `Invalid action: ${action}` };
    }
  } catch (error) {
    console.error('[ManagePartnerSettings] Error:', error);
    return { success: false, error: 'Failed to manage partner settings' };
  }
}

// ============================================================================
// ACTION HANDLERS
// ============================================================================

/**
 * Get all partner configuration (availability + settings)
 */
async function getPartnerConfig(partnerId: string): Promise<ManagePartnerSettingsResult> {
  const [availabilityRows, settingsRow] = await Promise.all([
    db.query.partnerAvailability.findMany({
      where: eq(partnerAvailability.partnerId, partnerId),
      orderBy: partnerAvailability.dayOfWeek,
    }),
    db.query.partnerBookingSettings.findFirst({
      where: eq(partnerBookingSettings.partnerId, partnerId),
    }),
  ]);

  const availability: AvailabilityRule[] = availabilityRows.map(mapAvailabilityRule);
  const settings = settingsRow ? mapSettings(settingsRow) : null;

  return { success: true, availability, settings };
}

/**
 * Set availability for a specific day
 */
async function setDayAvailability(
  params: ManagePartnerSettingsParams
): Promise<ManagePartnerSettingsResult> {
  const {
    partnerId,
    dayOfWeek,
    startTime,
    endTime,
    slotDuration,
    maxConcurrentBookings,
    bufferTime,
    isActive,
    excludeDates,
  } = params;

  if (dayOfWeek === undefined || !startTime || !endTime) {
    return { success: false, error: 'dayOfWeek, startTime, and endTime are required' };
  }

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
        startTime,
        endTime,
        slotDuration: slotDuration ?? existing.slotDuration,
        maxConcurrentBookings: maxConcurrentBookings ?? existing.maxConcurrentBookings,
        bufferTime: bufferTime ?? existing.bufferTime,
        isActive: isActive ?? existing.isActive,
        excludeDates: excludeDates ?? existing.excludeDates,
        updatedAt: new Date(),
      })
      .where(eq(partnerAvailability.id, existing.id))
      .returning();

    return { success: true, rule: mapAvailabilityRule(updated) };
  }

  // Create new
  const [created] = await db
    .insert(partnerAvailability)
    .values({
      id: createId(),
      partnerId,
      dayOfWeek,
      startTime,
      endTime,
      slotDuration: slotDuration ?? DEFAULTS.SLOT_DURATION,
      maxConcurrentBookings: maxConcurrentBookings ?? DEFAULTS.MAX_CONCURRENT,
      bufferTime: bufferTime ?? DEFAULTS.BUFFER_TIME,
      isActive: isActive ?? true,
      excludeDates: excludeDates ?? [],
    })
    .returning();

  return { success: true, rule: mapAvailabilityRule(created) };
}

/**
 * Initialize default availability (Mon-Sat 9-6, Fri closed)
 */
async function initializeDefaults(partnerId: string): Promise<ManagePartnerSettingsResult> {
  // Insert default hours
  for (const rule of DEFAULTS.DEFAULT_HOURS) {
    const existing = await db.query.partnerAvailability.findFirst({
      where: and(
        eq(partnerAvailability.partnerId, partnerId),
        eq(partnerAvailability.dayOfWeek, rule.dayOfWeek)
      ),
    });

    if (!existing) {
      await db.insert(partnerAvailability).values({
        id: createId(),
        partnerId,
        dayOfWeek: rule.dayOfWeek,
        startTime: rule.startTime,
        endTime: rule.endTime,
        slotDuration: DEFAULTS.SLOT_DURATION,
        maxConcurrentBookings: DEFAULTS.MAX_CONCURRENT,
        bufferTime: DEFAULTS.BUFFER_TIME,
        isActive: rule.isActive,
        excludeDates: [],
      });
    }
  }

  // Create default settings if not exist
  const existingSettings = await db.query.partnerBookingSettings.findFirst({
    where: eq(partnerBookingSettings.partnerId, partnerId),
  });

  if (!existingSettings) {
    await db.insert(partnerBookingSettings).values({
      id: createId(),
      partnerId,
      bookingEnabled: true,
      autoConfirm: false,
      minLeadTimeHours: DEFAULTS.MIN_LEAD_HOURS,
      maxLeadTimeDays: DEFAULTS.MAX_LEAD_DAYS,
      defaultSlotDuration: DEFAULTS.SLOT_DURATION,
      bufferBetweenBookings: DEFAULTS.BUFFER_TIME,
    });
  }

  // Return full config
  return await getPartnerConfig(partnerId);
}

/**
 * Update booking settings
 */
async function updateSettings(
  params: ManagePartnerSettingsParams
): Promise<ManagePartnerSettingsResult> {
  const { partnerId, ...data } = params;

  // Remove action and non-settings fields
  const settingsData: Record<string, unknown> = {};
  const settingsFields = [
    'bookingEnabled', 'autoConfirm', 'confirmationTimeoutMinutes',
    'minLeadTimeHours', 'maxLeadTimeDays',
    'allowUserCancellation', 'cancellationDeadlineHours',
    'allowReschedule', 'maxRescheduleCount', 'rescheduleDeadlineHours',
    'sendReminders', 'reminderTimes', 'smsReminders', 'emailReminders',
    'defaultSlotDuration', 'bufferBetweenBookings',
    'preparationInstructions', 'directions', 'parkingInstructions',
    'contactPersonName', 'contactPersonPhone',
  ];

  for (const field of settingsFields) {
    if ((data as any)[field] !== undefined) {
      settingsData[field] = (data as any)[field];
    }
  }

  const existing = await db.query.partnerBookingSettings.findFirst({
    where: eq(partnerBookingSettings.partnerId, partnerId),
  });

  if (existing) {
    const [updated] = await db
      .update(partnerBookingSettings)
      .set({ ...settingsData, updatedAt: new Date() })
      .where(eq(partnerBookingSettings.id, existing.id))
      .returning();

    return { success: true, settings: mapSettings(updated) };
  }

  // Create new
  const [created] = await db
    .insert(partnerBookingSettings)
    .values({
      id: createId(),
      partnerId,
      ...settingsData,
    } as any)
    .returning();

  return { success: true, settings: mapSettings(created) };
}

// ============================================================================
// HELPERS
// ============================================================================

function mapAvailabilityRule(row: any): AvailabilityRule {
  return {
    id: row.id,
    partnerId: row.partnerId,
    dayOfWeek: row.dayOfWeek,
    startTime: row.startTime,
    endTime: row.endTime,
    slotDuration: row.slotDuration,
    maxConcurrentBookings: row.maxConcurrentBookings,
    bufferTime: row.bufferTime,
    isActive: row.isActive,
    excludeDates: (row.excludeDates as string[]) || [],
  };
}

function mapSettings(row: any): PartnerSettings {
  return {
    id: row.id,
    partnerId: row.partnerId,
    bookingEnabled: row.bookingEnabled,
    autoConfirm: row.autoConfirm,
    confirmationTimeoutMinutes: row.confirmationTimeoutMinutes,
    minLeadTimeHours: row.minLeadTimeHours,
    maxLeadTimeDays: row.maxLeadTimeDays,
    allowUserCancellation: row.allowUserCancellation,
    cancellationDeadlineHours: row.cancellationDeadlineHours,
    allowReschedule: row.allowReschedule,
    maxRescheduleCount: row.maxRescheduleCount,
    rescheduleDeadlineHours: row.rescheduleDeadlineHours,
    sendReminders: row.sendReminders,
    reminderTimes: (row.reminderTimes as number[]) || [24, 2],
    smsReminders: row.smsReminders,
    emailReminders: row.emailReminders,
    defaultSlotDuration: row.defaultSlotDuration,
    bufferBetweenBookings: row.bufferBetweenBookings,
    preparationInstructions: row.preparationInstructions,
    directions: row.directions,
    parkingInstructions: row.parkingInstructions,
    contactPersonName: row.contactPersonName,
    contactPersonPhone: row.contactPersonPhone,
  };
}

// ============================================================================
// SLOT GENERATION (for public availability API)
// ============================================================================

export interface TimeSlot {
  id: string;
  startTime: Date;
  endTime: Date;
  duration: number;
  status: 'available' | 'booked' | 'blocked' | 'past';
  isAvailable: boolean;
}

export interface AvailableDate {
  date: string;
  dayOfWeek: number;
  hasSlots: boolean;
}

const TIMEZONE_OFFSET_MINUTES = 4 * 60; // Asia/Dubai = UTC+4

/**
 * Get available time slots for a specific date
 * Filters out already-booked slots
 */
export async function getAvailableSlots(
  partnerId: string,
  date: Date
): Promise<TimeSlot[]> {
  const dayOfWeek = date.getUTCDay();
  const dateStr = date.toISOString().split('T')[0];

  // Get availability rule for this day
  const rule = await db.query.partnerAvailability.findFirst({
    where: and(
      eq(partnerAvailability.partnerId, partnerId),
      eq(partnerAvailability.dayOfWeek, dayOfWeek),
      eq(partnerAvailability.isActive, true)
    ),
  });

  if (!rule) return [];

  // Check if date is excluded
  const excludeDates = (rule.excludeDates as string[]) || [];
  if (excludeDates.includes(dateStr)) return [];

  // Get existing bookings for this partner on this date (active statuses only)
  const { booking, bookingStatusEnum } = await import('../../schema/booking');
  const { and: andOp, eq: eqOp, gte: gteOp, lt: ltOp, inArray: inArrayOp } = await import('drizzle-orm');
  
  const dayStart = new Date(date);
  dayStart.setUTCHours(0, 0, 0, 0);
  const dayEnd = new Date(date);
  dayEnd.setUTCHours(23, 59, 59, 999);
  
  const existingBookings = await db.query.booking.findMany({
    where: andOp(
      eqOp(booking.partnerId, partnerId),
      gteOp(booking.scheduledDate, dayStart),
      ltOp(booking.scheduledDate, dayEnd),
      inArrayOp(booking.status, ['pending', 'confirmed'])
    ),
    columns: {
      scheduledStartTime: true,
      scheduledEndTime: true,
    },
  });

  // Generate slots
  const slots: TimeSlot[] = [];
  const [startHour, startMin] = rule.startTime.split(':').map(Number);
  const [endHour, endMin] = rule.endTime.split(':').map(Number);

  const dayStartUtc = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0, 0);
  const partnerDayStart = dayStartUtc - TIMEZONE_OFFSET_MINUTES * 60 * 1000;
  
  const startDate = new Date(partnerDayStart + (startHour * 60 + startMin) * 60 * 1000);
  const endDate = new Date(partnerDayStart + (endHour * 60 + endMin) * 60 * 1000);

  const now = new Date();
  let slotStart = new Date(startDate);
  let slotIndex = 0;

  while (slotStart < endDate) {
    const slotEnd = new Date(slotStart.getTime() + rule.slotDuration * 60 * 1000);
    
    if (slotEnd > endDate) break;

    const isPast = slotStart < now;
    
    // Check if this slot overlaps with any existing booking
    const isBooked = existingBookings.some(b => {
      const bookingStart = new Date(b.scheduledStartTime).getTime();
      const bookingEnd = new Date(b.scheduledEndTime).getTime();
      const slotStartMs = slotStart.getTime();
      const slotEndMs = slotEnd.getTime();
      // Overlap: slot starts before booking ends AND slot ends after booking starts
      return slotStartMs < bookingEnd && slotEndMs > bookingStart;
    });

    const status: TimeSlot['status'] = isPast ? 'past' : isBooked ? 'booked' : 'available';
    
    slots.push({
      id: `${dateStr}-${slotIndex}`,
      startTime: new Date(slotStart),
      endTime: new Date(slotEnd),
      duration: rule.slotDuration,
      status,
      isAvailable: status === 'available',
    });

    // Move to next slot (duration + buffer)
    slotStart = new Date(slotEnd.getTime() + (rule.bufferTime || 0) * 60 * 1000);
    slotIndex++;
  }

  return slots;
}

/**
 * Get available dates for the next N days
 */
export async function getAvailableDates(
  partnerId: string,
  days: number = 30
): Promise<AvailableDate[]> {
  // Get settings for lead time
  const settings = await db.query.partnerBookingSettings.findFirst({
    where: eq(partnerBookingSettings.partnerId, partnerId),
  });

  const minLeadHours = settings?.minLeadTimeHours ?? DEFAULTS.MIN_LEAD_HOURS;
  const maxLeadDays = settings?.maxLeadTimeDays ?? DEFAULTS.MAX_LEAD_DAYS;
  const effectiveDays = Math.min(days, maxLeadDays);

  // Get all availability rules
  const rules = await db.query.partnerAvailability.findMany({
    where: and(
      eq(partnerAvailability.partnerId, partnerId),
      eq(partnerAvailability.isActive, true)
    ),
  });

  const rulesByDay = new Map(rules.map(r => [r.dayOfWeek, r]));
  const dates: AvailableDate[] = [];

  const now = new Date();
  const minLeadTime = new Date(now.getTime() + minLeadHours * 60 * 60 * 1000);

  for (let i = 0; i < effectiveDays; i++) {
    const date = new Date(now);
    date.setUTCDate(date.getUTCDate() + i);
    date.setUTCHours(0, 0, 0, 0);

    const dayOfWeek = date.getUTCDay();
    const dateStr = date.toISOString().split('T')[0];
    const rule = rulesByDay.get(dayOfWeek);

    let hasSlots = false;

    if (rule && rule.isActive) {
      const excludeDates = (rule.excludeDates as string[]) || [];
      if (!excludeDates.includes(dateStr)) {
        // Check if any slots would be available
        const [endHour, endMin] = rule.endTime.split(':').map(Number);
        const dayEnd = new Date(Date.UTC(
          date.getUTCFullYear(),
          date.getUTCMonth(),
          date.getUTCDate(),
          endHour - 4, // Convert from Dubai to UTC
          endMin
        ));
        
        hasSlots = dayEnd > minLeadTime;
      }
    }

    dates.push({
      date: dateStr,
      dayOfWeek,
      hasSlots,
    });
  }

  return dates;
}

/**
 * Get listing context for booking (partnerId from listing)
 */
export async function getListingBookingContext(listingId: string): Promise<{
  id: string;
  partnerId: string | null;
  lifecycleStatus: string;
} | null> {
  const { carListing } = await import('../../schema/listing');
  
  const listing = await db.query.carListing.findFirst({
    where: eq(carListing.id, listingId),
    columns: { id: true, partnerId: true, lifecycleStatus: true },
  });

  return listing ?? null;
}
