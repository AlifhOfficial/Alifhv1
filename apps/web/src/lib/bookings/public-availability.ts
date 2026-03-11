import {
  getAvailableDates,
  getAvailableSlots,
  getListingBookingContext,
  managePartnerSettings,
} from '@alifh/database';

export interface PublicBookingSettings {
  minLeadTimeHours: number;
  maxLeadTimeDays: number;
  defaultSlotDuration: number;
  preparationInstructions?: string | null;
  directions?: string | null;
  parkingInstructions?: string | null;
  contactPersonName?: string | null;
  contactPersonPhone?: string | null;
  allowUserCancellation?: boolean;
  cancellationDeadlineHours?: number | null;
  allowReschedule?: boolean;
  maxRescheduleCount?: number;
  rescheduleDeadlineHours?: number | null;
}

export interface PublicBookingTimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  duration: number;
  status: 'available' | 'booked' | 'blocked' | 'past';
  isAvailable: boolean;
}

export interface PublicBookingDate {
  date: string;
  dayOfWeek: number;
  hasSlots: boolean;
}

export interface PublicBookingAvailabilityResponse {
  available: boolean;
  partnerId?: string;
  reason?: string;
  date?: string;
  dates?: PublicBookingDate[];
  slots?: PublicBookingTimeSlot[];
  slotsByDate?: Record<string, PublicBookingTimeSlot[]>;
  settings?: PublicBookingSettings | null;
}

function mapSettings(settings: any): PublicBookingSettings {
  return {
    minLeadTimeHours: settings.minLeadTimeHours,
    maxLeadTimeDays: settings.maxLeadTimeDays,
    defaultSlotDuration: settings.defaultSlotDuration,
    preparationInstructions: settings.preparationInstructions,
    directions: settings.directions,
    parkingInstructions: settings.parkingInstructions,
    contactPersonName: settings.contactPersonName,
    contactPersonPhone: settings.contactPersonPhone,
    allowUserCancellation: settings.allowUserCancellation,
    cancellationDeadlineHours: settings.cancellationDeadlineHours,
    allowReschedule: settings.allowReschedule,
    maxRescheduleCount: settings.maxRescheduleCount,
    rescheduleDeadlineHours: settings.rescheduleDeadlineHours,
  };
}

export async function getPublicBookingAvailability(
  listingId: string,
  options?: { mode?: 'dates' | 'slots'; date?: string | null; prefetchSlots?: boolean }
): Promise<PublicBookingAvailabilityResponse> {
  const mode = options?.mode ?? 'slots';
  const listing = await getListingBookingContext(listingId);

  if (!listing) {
    return { available: false, reason: 'Listing not found' };
  }

  if (!listing.partnerId) {
    return { available: false, reason: 'This listing does not support bookings' };
  }

  const config = await managePartnerSettings({
    partnerId: listing.partnerId,
    staffUserId: listing.userId,
    action: 'get',
  });

  const settings = config.settings;
  const availability = config.availability || [];

  if (!settings) {
    return {
      available: false,
      reason: 'This seller is not accepting bookings at this time',
      dates: [],
      slots: [],
    };
  }

  if (!settings.bookingEnabled) {
    return {
      available: false,
      reason: 'This seller is not accepting bookings at this time',
      dates: [],
      slots: [],
    };
  }

  if (availability.length === 0) {
    return {
      available: false,
      reason: 'This seller has not set up their availability yet',
      dates: [],
      slots: [],
    };
  }

  if (mode === 'dates') {
    const dates = await getAvailableDates(listing.partnerId, 30, listing.userId);
    let slotsByDate: Record<string, PublicBookingTimeSlot[]> | undefined;

    if (options?.prefetchSlots) {
      const slotEntries = await Promise.all(
        dates
          .filter((date) => date.hasSlots)
          .map(async (date) => {
            const dateResult = await getPublicBookingAvailability(listingId, {
              mode: 'slots',
              date: date.date,
            });

            return [date.date, dateResult.slots || []] as const;
          })
      );

      slotsByDate = Object.fromEntries(slotEntries);
    }

    return {
      available: true,
      partnerId: listing.partnerId,
      dates,
      slotsByDate,
      settings: mapSettings(settings),
    };
  }

  const date = options?.date ? new Date(options.date) : new Date();
  date.setUTCHours(0, 0, 0, 0);

  const slots = await getAvailableSlots(listing.partnerId, date, listing.userId);
  const now = new Date();

  const filteredSlots = slots.filter((slot) => {
    if (!slot.isAvailable) return false;
    if (settings.minLeadTimeHours) {
      const minTime = new Date(now.getTime() + settings.minLeadTimeHours * 60 * 60 * 1000);
      if (slot.startTime < minTime) return false;
    }
    if (settings.maxLeadTimeDays) {
      const maxTime = new Date(now.getTime() + settings.maxLeadTimeDays * 24 * 60 * 60 * 1000);
      if (slot.startTime > maxTime) return false;
    }
    return true;
  });

  return {
    available: true,
    partnerId: listing.partnerId,
    date: date.toISOString().split('T')[0],
    slots: filteredSlots.map((slot) => ({
      id: slot.id,
      startTime: slot.startTime.toISOString(),
      endTime: slot.endTime.toISOString(),
      duration: slot.duration,
      status: slot.status,
      isAvailable: slot.isAvailable,
    })),
    settings: mapSettings(settings),
  };
}
