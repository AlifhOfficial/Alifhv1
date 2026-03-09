/**
 * MANAGE PARTNER SETTINGS - Partner Booking Configuration
 * 
 * One function to manage all partner booking settings and availability.
 * 
 * @module queries/booking/manage-partner-settings
 */

import { eq, and, isNull, or, gte, lt, inArray } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';
import { db } from '../../dbclient';
import { partnerAvailability, partnerBookingSettings, booking } from '../../schema/booking';
import { carListing } from '../../schema/listing';

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
  
  // For staff-specific settings (null = partner-level default)
  staffUserId?: string | null;
  
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
  staffUserId: string | null;
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
  staffUserId: string | null;
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
  const { partnerId, action, staffUserId } = params;

  try {
    switch (action) {
      case 'get':
        return await getPartnerConfig(partnerId, staffUserId ?? null);

      case 'setDay':
        return await setDayAvailability(params);

      case 'initDefaults':
        return await initializeDefaults(partnerId, staffUserId ?? null);

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
 * Returns staff-specific settings only - no fallback to partner defaults
 */
async function getPartnerConfig(partnerId: string, staffUserId: string | null): Promise<ManagePartnerSettingsResult> {
  
  // Only get staff-specific rules - no fallback
  if (!staffUserId) {
    return { success: true, availability: [], settings: null };
  }

  const [availabilityRows, settingsRow] = await Promise.all([
    db.query.partnerAvailability.findMany({
      where: and(
        eq(partnerAvailability.partnerId, partnerId),
        eq(partnerAvailability.staffUserId, staffUserId)
      ),
      orderBy: partnerAvailability.dayOfWeek,
    }),
    db.query.partnerBookingSettings.findFirst({
      where: and(
        eq(partnerBookingSettings.partnerId, partnerId),
        eq(partnerBookingSettings.staffUserId, staffUserId)
      ),
    }),
  ]);

  const availability = availabilityRows.map(mapAvailabilityRule);
  const settings = settingsRow ? mapSettings(settingsRow) : null;

  return { success: true, availability, settings };
}

/**
 * Set availability for a specific day
 * If staffUserId is provided, sets staff-specific availability, otherwise partner default
 */
async function setDayAvailability(
  params: ManagePartnerSettingsParams
): Promise<ManagePartnerSettingsResult> {
  const {
    partnerId,
    staffUserId,
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
  
  // Check if rule exists for this partner + staff (or partner default if no staffUserId)
  const whereCondition = staffUserId
    ? and(
        eq(partnerAvailability.partnerId, partnerId),
        eq(partnerAvailability.staffUserId, staffUserId),
        eq(partnerAvailability.dayOfWeek, dayOfWeek)
      )
    : and(
        eq(partnerAvailability.partnerId, partnerId),
        isNull(partnerAvailability.staffUserId),
        eq(partnerAvailability.dayOfWeek, dayOfWeek)
      );

  const existing = await db.query.partnerAvailability.findFirst({
    where: whereCondition,
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
      staffUserId: staffUserId ?? null,
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
 * If staffUserId is provided, initializes staff-specific defaults, otherwise partner defaults
 */
async function initializeDefaults(partnerId: string, staffUserId: string | null): Promise<ManagePartnerSettingsResult> {
  
  // Insert default hours
  for (const rule of DEFAULTS.DEFAULT_HOURS) {
    const whereCondition = staffUserId
      ? and(
          eq(partnerAvailability.partnerId, partnerId),
          eq(partnerAvailability.staffUserId, staffUserId),
          eq(partnerAvailability.dayOfWeek, rule.dayOfWeek)
        )
      : and(
          eq(partnerAvailability.partnerId, partnerId),
          isNull(partnerAvailability.staffUserId),
          eq(partnerAvailability.dayOfWeek, rule.dayOfWeek)
        );
    
    const existing = await db.query.partnerAvailability.findFirst({
      where: whereCondition,
    });

    if (!existing) {
      await db.insert(partnerAvailability).values({
        id: createId(),
        partnerId,
        staffUserId: staffUserId ?? null,
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
  const settingsWhereCondition = staffUserId
    ? and(
        eq(partnerBookingSettings.partnerId, partnerId),
        eq(partnerBookingSettings.staffUserId, staffUserId)
      )
    : and(
        eq(partnerBookingSettings.partnerId, partnerId),
        isNull(partnerBookingSettings.staffUserId)
      );

  const existingSettings = await db.query.partnerBookingSettings.findFirst({
    where: settingsWhereCondition,
  });

  if (!existingSettings) {
    await db.insert(partnerBookingSettings).values({
      id: createId(),
      partnerId,
      staffUserId: staffUserId ?? null,
      bookingEnabled: true,
      autoConfirm: false,
      minLeadTimeHours: DEFAULTS.MIN_LEAD_HOURS,
      maxLeadTimeDays: DEFAULTS.MAX_LEAD_DAYS,
      defaultSlotDuration: DEFAULTS.SLOT_DURATION,
      bufferBetweenBookings: DEFAULTS.BUFFER_TIME,
    });
  }

  // Return full config
  return await getPartnerConfig(partnerId, staffUserId);
}

/**
 * Update booking settings
 * If staffUserId is provided, updates staff-specific settings, otherwise partner defaults
 */
async function updateSettings(
  params: ManagePartnerSettingsParams
): Promise<ManagePartnerSettingsResult> {
  const { partnerId, staffUserId, ...data } = params;

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
  
  // Find existing settings for this partner + staff (or partner default)
  const whereCondition = staffUserId
    ? and(
        eq(partnerBookingSettings.partnerId, partnerId),
        eq(partnerBookingSettings.staffUserId, staffUserId)
      )
    : and(
        eq(partnerBookingSettings.partnerId, partnerId),
        isNull(partnerBookingSettings.staffUserId)
      );

  const existing = await db.query.partnerBookingSettings.findFirst({
    where: whereCondition,
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
      staffUserId: staffUserId ?? null,
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
    staffUserId: row.staffUserId ?? null,
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
    staffUserId: row.staffUserId ?? null,
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
 * Filters out already-booked slots for the specific staff member
 * Uses staff-specific availability rules if they exist, otherwise partner defaults
 * 
 * @param partnerId - The partner ID
 * @param date - The date to check
 * @param staffUserId - Optional staff member ID. When provided:
 *                      1. Uses staff-specific availability rules (falls back to partner defaults)
 *                      2. Only checks conflicts with bookings for listings assigned to this staff member
 *                      This allows multiple staff members to have independent schedules.
 */
export async function getAvailableSlots(
  partnerId: string,
  date: Date,
  staffUserId?: string | null
): Promise<TimeSlot[]> {
  // Staff must have their own settings - no fallback
  if (!staffUserId) return [];

  const dayOfWeek = date.getUTCDay();
  const dateStr = date.toISOString().split('T')[0];

  // Get staff-specific availability rule only - no fallback
  const rule = await db.query.partnerAvailability.findFirst({
    where: and(
      eq(partnerAvailability.partnerId, partnerId),
      eq(partnerAvailability.staffUserId, staffUserId),
      eq(partnerAvailability.dayOfWeek, dayOfWeek),
      eq(partnerAvailability.isActive, true)
    ),
  });

  if (!rule) return [];

  // Check if date is excluded
  const excludeDates = (rule.excludeDates as string[]) || [];
  if (excludeDates.includes(dateStr)) return [];

  // Get existing bookings for this staff member on this date (active statuses only)
  // If staffUserId is provided, only check conflicts with that staff member's listings
  // This allows each staff member to have independent booking schedules
  const dayStart = new Date(date);
  dayStart.setUTCHours(0, 0, 0, 0);
  const dayEnd = new Date(date);
  dayEnd.setUTCHours(23, 59, 59, 999);

  // Build where conditions
  const bookingConditions = [
    eq(booking.partnerId, partnerId),
    gte(booking.scheduledDate, dayStart),
    lt(booking.scheduledDate, dayEnd),
    inArray(booking.status, ['pending', 'confirmed']),
  ];

  let existingBookings: { scheduledStartTime: Date; scheduledEndTime: Date }[];

  if (staffUserId) {
    // Filter bookings to only those for listings assigned to this specific staff member
    // This prevents cross-staff booking conflicts
    existingBookings = await db
      .select({
        scheduledStartTime: booking.scheduledStartTime,
        scheduledEndTime: booking.scheduledEndTime,
      })
      .from(booking)
      .innerJoin(carListing, eq(booking.listingId, carListing.id))
      .where(and(
        ...bookingConditions,
        eq(carListing.userId, staffUserId)
      ));
  } else {
    // Fallback: check all partner bookings (legacy behavior)
    existingBookings = await db.query.booking.findMany({
      where: and(...bookingConditions),
      columns: {
        scheduledStartTime: true,
        scheduledEndTime: true,
      },
    });
  }

  // Get staff's slot duration setting from their settings
  let slotDuration = rule.slotDuration;
  let bufferTime = rule.bufferTime || 0;
  
  // Get staff-specific settings only - no fallback
  const staffSettings = await db.query.partnerBookingSettings.findFirst({
    where: and(
      eq(partnerBookingSettings.partnerId, partnerId),
      eq(partnerBookingSettings.staffUserId, staffUserId)
    ),
    columns: { defaultSlotDuration: true, bufferBetweenBookings: true },
  });
  
  if (staffSettings?.defaultSlotDuration) {
    slotDuration = staffSettings.defaultSlotDuration;
  }
  if (staffSettings?.bufferBetweenBookings !== undefined && staffSettings?.bufferBetweenBookings !== null) {
    bufferTime = staffSettings.bufferBetweenBookings;
  }

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
    const slotEnd = new Date(slotStart.getTime() + slotDuration * 60 * 1000);
    
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
      duration: slotDuration,
      status,
      isAvailable: status === 'available',
    });

    // Move to next slot (duration + buffer)
    slotStart = new Date(slotEnd.getTime() + bufferTime * 60 * 1000);
    slotIndex++;
  }

  return slots;
}

/**
 * Get available dates for the next N days
 * Uses staff-specific settings only - no fallback
 */
export async function getAvailableDates(
  partnerId: string,
  days: number = 30,
  staffUserId?: string | null
): Promise<AvailableDate[]> {
  // Staff must have their own settings - no fallback
  if (!staffUserId) return [];
  
  // Get staff-specific settings only
  const settings = await db.query.partnerBookingSettings.findFirst({
    where: and(
      eq(partnerBookingSettings.partnerId, partnerId),
      eq(partnerBookingSettings.staffUserId, staffUserId)
    ),
  });

  // No settings = not accepting bookings
  if (!settings) return [];

  const minLeadHours = settings.minLeadTimeHours ?? DEFAULTS.MIN_LEAD_HOURS;
  const maxLeadDays = settings.maxLeadTimeDays ?? DEFAULTS.MAX_LEAD_DAYS;
  const effectiveDays = Math.min(days, maxLeadDays);

  // Get staff-specific availability rules only
  const rules = await db.query.partnerAvailability.findMany({
    where: and(
      eq(partnerAvailability.partnerId, partnerId),
      eq(partnerAvailability.staffUserId, staffUserId),
      eq(partnerAvailability.isActive, true)
    ),
  });

  // No availability rules = not accepting bookings
  if (rules.length === 0) return [];

  const rulesByDay = new Map<number, typeof partnerAvailability.$inferSelect>();
  for (const rule of rules) {
    rulesByDay.set(rule.dayOfWeek, rule);
  }
  
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
 * Get listing context for booking (partnerId and staffUserId from listing)
 */
export async function getListingBookingContext(listingId: string): Promise<{
  id: string;
  partnerId: string | null;
  userId: string | null; // Staff member assigned to the listing
  lifecycleStatus: string;
} | null> {
  const listing = await db.query.carListing.findFirst({
    where: eq(carListing.id, listingId),
    columns: { id: true, partnerId: true, userId: true, lifecycleStatus: true },
  });

  return listing ?? null;
}
