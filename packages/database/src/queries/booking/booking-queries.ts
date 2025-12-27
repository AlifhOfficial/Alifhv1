/**
 * Booking Queries
 * Read operations for bookings
 * 
 * @module queries/booking/booking-queries
 */

import { eq, and, gte, lte, inArray, desc, asc, sql, or, ne } from 'drizzle-orm';
import { db } from '../../dbclient';
import { booking } from '../../schema/booking';
import { carListing } from '../../schema/listing';
import { partner } from '../../schema/partner';
import { user } from '../../schema/auth';
import { userProfile } from '../../schema/profile';

/**
 * Booking data with related entities
 */
export interface BookingWithDetails {
  id: string;
  status: string;
  source: string;
  scheduledDate: Date;
  scheduledStartTime: Date;
  scheduledEndTime: Date;
  confirmationToken: string;
  verifiedAt: Date | null;
  
  // User info
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  
  // Listing info
  listingId: string;
  listingTitle: string;
  listingThumbnail: string | null;
  listingPrice: number;
  
  // Staff member who created the listing
  staffUserId: string | null;
  staffName: string | null;
  staffAvatar: string | null;
  
  // Partner info
  partnerId: string;
  partnerName: string;
  partnerLogo: string | null;
  partnerAddress: string | null;
  partnerPhone: string;
  
  // Additional details
  notes: string | null;
  specialRequests: string | null;
  numberOfAttendees: number;
  
  // Partner response
  partnerNotes: string | null;
  confirmedAt: Date | null;
  confirmedBy: string | null;
  rejectionReason: string | null;
  
  // Reschedule info
  rescheduleCount: number;
  maxRescheduleAllowed: number;
  lastRescheduledAt: Date | null;
  
  // Cancellation
  cancelledAt: Date | null;
  cancelledBy: string | null;
  cancellationReason: string | null;
  cancellationNotes: string | null;
  
  // Completion
  completedAt: Date | null;
  checkInTime: Date | null;
  checkOutTime: Date | null;
  
  // No-show
  noShowReported: boolean;
  noShowReportedAt: Date | null;
  
  // Feedback
  feedbackSubmitted: boolean;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date | null;
}

export interface BookingVerificationContext {
  id: string;
  partnerId: string;
  status: string;
}

/**
 * Get minimal booking context by confirmation token (for staff verification flow)
 */
export async function getBookingVerificationContextByConfirmationToken(
  confirmationToken: string
): Promise<BookingVerificationContext | null> {
  const token = String(confirmationToken || '').trim().toUpperCase();
  if (!token) return null;

  const record = await db.query.booking.findFirst({
    where: eq(booking.confirmationToken, token),
    columns: {
      id: true,
      partnerId: true,
      status: true,
    },
  });

  return record ?? null;
}

export interface ListingBookingContext {
  id: string;
  partnerId: string | null;
  lifecycleStatus: string;
}

/**
 * Get minimal listing context needed for booking slot lookup.
 */
export async function getListingBookingContext(listingId: string): Promise<ListingBookingContext | null> {
  const record = await db.query.carListing.findFirst({
    where: eq(carListing.id, listingId),
    columns: {
      id: true,
      partnerId: true,
      lifecycleStatus: true,
    },
  });

  return record ?? null;
}

/**
 * Get a single booking by ID
 */
export async function getBookingById(bookingId: string): Promise<BookingWithDetails | null> {
  const result = await db
    .select({
      id: booking.id,
      status: booking.status,
      source: booking.source,
      scheduledDate: booking.scheduledDate,
      scheduledStartTime: booking.scheduledStartTime,
      scheduledEndTime: booking.scheduledEndTime,
      confirmationToken: booking.confirmationToken,
      verifiedAt: booking.verifiedAt,
      userId: booking.userId,
      userName: booking.userName,
      userEmail: booking.userEmail,
      userPhone: booking.userPhone,
      listingId: booking.listingId,
      partnerId: booking.partnerId,
      notes: booking.notes,
      specialRequests: booking.specialRequests,
      numberOfAttendees: booking.numberOfAttendees,
      partnerNotes: booking.partnerNotes,
      confirmedAt: booking.confirmedAt,
      confirmedBy: booking.confirmedBy,
      rejectionReason: booking.rejectionReason,
      rescheduleCount: booking.rescheduleCount,
      maxRescheduleAllowed: booking.maxRescheduleAllowed,
      lastRescheduledAt: booking.lastRescheduledAt,
      cancelledAt: booking.cancelledAt,
      cancelledBy: booking.cancelledBy,
      cancellationReason: booking.cancellationReason,
      cancellationNotes: booking.cancellationNotes,
      completedAt: booking.completedAt,
      checkInTime: booking.checkInTime,
      checkOutTime: booking.checkOutTime,
      noShowReported: booking.noShowReported,
      noShowReportedAt: booking.noShowReportedAt,
      feedbackSubmitted: booking.feedbackSubmitted,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt,
      expiresAt: booking.expiresAt,
      // Related data
      listingMake: carListing.make,
      listingModel: carListing.model,
      listingYear: carListing.year,
      listingTrim: carListing.trim,
      listingThumbnail: carListing.thumbnail,
      listingPrice: carListing.price,
      // Staff info (from listing owner)
      staffUserId: carListing.userId,
      staffName: user.name,
      staffAvatar: userProfile.avatar,
      partnerName: partner.brandName,
      partnerLogo: partner.logo,
      partnerAddress: partner.address,
      partnerPhone: partner.phone,
    })
    .from(booking)
    .leftJoin(carListing, eq(booking.listingId, carListing.id))
    .leftJoin(user, eq(carListing.userId, user.id))
    .leftJoin(userProfile, eq(user.id, userProfile.userId))
    .leftJoin(partner, eq(booking.partnerId, partner.id))
    .where(eq(booking.id, bookingId))
    .limit(1);

  if (result.length === 0) return null;

  const row = result[0];
  return {
    ...row,
    listingTitle: `${row.listingYear} ${row.listingMake} ${row.listingModel}${row.listingTrim ? ` ${row.listingTrim}` : ''}`,
    listingThumbnail: row.listingThumbnail,
    listingPrice: row.listingPrice ?? 0,
    staffUserId: row.staffUserId,
    staffName: row.staffName,
    staffAvatar: row.staffAvatar,
    partnerName: row.partnerName ?? 'Unknown Dealer',
    partnerLogo: row.partnerLogo,
    partnerAddress: row.partnerAddress,
    partnerPhone: row.partnerPhone ?? '',
    numberOfAttendees: row.numberOfAttendees ?? 1,
  };
}

/**
 * Get user's bookings
 */
export async function getUserBookings(
  userId: string,
  options: {
    status?: string[];
    limit?: number;
    offset?: number;
    upcoming?: boolean;
  } = {}
): Promise<{ bookings: BookingWithDetails[]; total: number }> {
  const { status, limit = 20, offset = 0, upcoming } = options;

  const conditions = [eq(booking.userId, userId)];

  if (status && status.length > 0) {
    conditions.push(inArray(booking.status, status as any[]));
  }

  if (upcoming) {
    conditions.push(gte(booking.scheduledStartTime, new Date()));
  }

  const [results, countResult] = await Promise.all([
    db
      .select({
        id: booking.id,
        status: booking.status,
        source: booking.source,
        scheduledDate: booking.scheduledDate,
        scheduledStartTime: booking.scheduledStartTime,
        scheduledEndTime: booking.scheduledEndTime,
        confirmationToken: booking.confirmationToken,
        verifiedAt: booking.verifiedAt,
        userId: booking.userId,
        userName: booking.userName,
        userEmail: booking.userEmail,
        userPhone: booking.userPhone,
        listingId: booking.listingId,
        partnerId: booking.partnerId,
        notes: booking.notes,
        specialRequests: booking.specialRequests,
        numberOfAttendees: booking.numberOfAttendees,
        partnerNotes: booking.partnerNotes,
        confirmedAt: booking.confirmedAt,
        confirmedBy: booking.confirmedBy,
        rejectionReason: booking.rejectionReason,
        rescheduleCount: booking.rescheduleCount,
        maxRescheduleAllowed: booking.maxRescheduleAllowed,
        lastRescheduledAt: booking.lastRescheduledAt,
        cancelledAt: booking.cancelledAt,
        cancelledBy: booking.cancelledBy,
        cancellationReason: booking.cancellationReason,
        cancellationNotes: booking.cancellationNotes,
        completedAt: booking.completedAt,
        checkInTime: booking.checkInTime,
        checkOutTime: booking.checkOutTime,
        noShowReported: booking.noShowReported,
        noShowReportedAt: booking.noShowReportedAt,
        feedbackSubmitted: booking.feedbackSubmitted,
        createdAt: booking.createdAt,
        updatedAt: booking.updatedAt,
        expiresAt: booking.expiresAt,
        listingMake: carListing.make,
        listingModel: carListing.model,
        listingYear: carListing.year,
        listingTrim: carListing.trim,
        listingThumbnail: carListing.thumbnail,
        listingPrice: carListing.price,
        // Staff info (from listing owner)
        staffUserId: carListing.userId,
        staffName: user.name,
        staffAvatar: userProfile.avatar,
        partnerName: partner.brandName,
        partnerLogo: partner.logo,
        partnerAddress: partner.address,
        partnerPhone: partner.phone,
      })
      .from(booking)
      .leftJoin(carListing, eq(booking.listingId, carListing.id))
      .leftJoin(user, eq(carListing.userId, user.id))
      .leftJoin(userProfile, eq(user.id, userProfile.userId))
      .leftJoin(partner, eq(booking.partnerId, partner.id))
      .where(and(...conditions))
      // Priority: show earlier appointments first
      .orderBy(asc(booking.scheduledStartTime))
      .limit(limit)
      .offset(offset),

    db
      .select({ count: sql<number>`count(*)::int` })
      .from(booking)
      .where(and(...conditions)),
  ]);

  return {
    bookings: results.map(row => ({
      ...row,
      listingTitle: `${row.listingYear} ${row.listingMake} ${row.listingModel}${row.listingTrim ? ` ${row.listingTrim}` : ''}`,
      listingThumbnail: row.listingThumbnail,
      listingPrice: row.listingPrice ?? 0,
      staffUserId: row.staffUserId,
      staffName: row.staffName,
      staffAvatar: row.staffAvatar,
      partnerName: row.partnerName ?? 'Unknown Dealer',
      partnerLogo: row.partnerLogo,
      partnerAddress: row.partnerAddress,
      partnerPhone: row.partnerPhone ?? '',
      numberOfAttendees: row.numberOfAttendees ?? 1,
    })),
    total: countResult[0]?.count ?? 0,
  };
}

/**
 * Get partner/staff's bookings for listings they manage
 */
export async function getPartnerBookings(
  partnerId: string,
  options: {
    status?: string[];
    date?: Date;
    listingId?: string;
    limit?: number;
    offset?: number;
  } = {}
): Promise<{ bookings: BookingWithDetails[]; total: number }> {
  const { status, date, listingId, limit = 20, offset = 0 } = options;

  const conditions = [eq(booking.partnerId, partnerId)];

  if (status && status.length > 0) {
    conditions.push(inArray(booking.status, status as any[]));
  }

  if (listingId) {
    conditions.push(eq(booking.listingId, listingId));
  }

  if (date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    conditions.push(
      and(
        gte(booking.scheduledStartTime, startOfDay),
        lte(booking.scheduledStartTime, endOfDay)
      ) as any
    );
  }

  const [results, countResult] = await Promise.all([
    db
      .select({
        id: booking.id,
        status: booking.status,
        source: booking.source,
        scheduledDate: booking.scheduledDate,
        scheduledStartTime: booking.scheduledStartTime,
        scheduledEndTime: booking.scheduledEndTime,
        confirmationToken: booking.confirmationToken,
        verifiedAt: booking.verifiedAt,
        userId: booking.userId,
        userName: booking.userName,
        userEmail: booking.userEmail,
        userPhone: booking.userPhone,
        listingId: booking.listingId,
        partnerId: booking.partnerId,
        notes: booking.notes,
        specialRequests: booking.specialRequests,
        numberOfAttendees: booking.numberOfAttendees,
        partnerNotes: booking.partnerNotes,
        confirmedAt: booking.confirmedAt,
        confirmedBy: booking.confirmedBy,
        rejectionReason: booking.rejectionReason,
        rescheduleCount: booking.rescheduleCount,
        maxRescheduleAllowed: booking.maxRescheduleAllowed,
        lastRescheduledAt: booking.lastRescheduledAt,
        cancelledAt: booking.cancelledAt,
        cancelledBy: booking.cancelledBy,
        cancellationReason: booking.cancellationReason,
        cancellationNotes: booking.cancellationNotes,
        completedAt: booking.completedAt,
        checkInTime: booking.checkInTime,
        checkOutTime: booking.checkOutTime,
        noShowReported: booking.noShowReported,
        noShowReportedAt: booking.noShowReportedAt,
        feedbackSubmitted: booking.feedbackSubmitted,
        createdAt: booking.createdAt,
        updatedAt: booking.updatedAt,
        expiresAt: booking.expiresAt,
        listingMake: carListing.make,
        listingModel: carListing.model,
        listingYear: carListing.year,
        listingTrim: carListing.trim,
        listingThumbnail: carListing.thumbnail,
        listingPrice: carListing.price,
        staffUserId: carListing.userId,
        staffName: user.name,
        staffAvatar: userProfile.avatar,
        partnerName: partner.brandName,
        partnerLogo: partner.logo,
        partnerAddress: partner.address,
        partnerPhone: partner.phone,
      })
      .from(booking)
      .leftJoin(carListing, eq(booking.listingId, carListing.id))
      .leftJoin(user, eq(carListing.userId, user.id))
      .leftJoin(userProfile, eq(user.id, userProfile.userId))
      .leftJoin(partner, eq(booking.partnerId, partner.id))
      .where(and(...conditions))
      .orderBy(asc(booking.scheduledStartTime))
      .limit(limit)
      .offset(offset),

    db
      .select({ count: sql<number>`count(*)::int` })
      .from(booking)
      .where(and(...conditions)),
  ]);

  return {
    bookings: results.map(row => ({
      ...row,
      listingTitle: `${row.listingYear} ${row.listingMake} ${row.listingModel}${row.listingTrim ? ` ${row.listingTrim}` : ''}`,
      listingThumbnail: row.listingThumbnail,
      listingPrice: row.listingPrice ?? 0,
      staffUserId: row.staffUserId,
      staffName: row.staffName,
      staffAvatar: row.staffAvatar,
      partnerName: row.partnerName ?? 'Unknown Dealer',
      partnerLogo: row.partnerLogo,
      partnerAddress: row.partnerAddress,
      partnerPhone: row.partnerPhone ?? '',
      numberOfAttendees: row.numberOfAttendees ?? 1,
    })),
    total: countResult[0]?.count ?? 0,
  };
}

/**
 * Get bookings for a specific staff member's listings
 */
export async function getStaffListingsBookings(
  staffUserId: string,
  partnerId: string,
  options: {
    status?: string[];
    limit?: number;
    offset?: number;
  } = {}
): Promise<{ bookings: BookingWithDetails[]; total: number }> {
  const { status, limit = 20, offset = 0 } = options;

  // Get listings posted by this staff member
  const conditions = [
    eq(booking.partnerId, partnerId),
  ];

  if (status && status.length > 0) {
    conditions.push(inArray(booking.status, status as any[]));
  }

  // Join with carListing to filter by staff's posted listings
  const [results, countResult] = await Promise.all([
    db
      .select({
        id: booking.id,
        status: booking.status,
        source: booking.source,
        scheduledDate: booking.scheduledDate,
        scheduledStartTime: booking.scheduledStartTime,
        scheduledEndTime: booking.scheduledEndTime,
        confirmationToken: booking.confirmationToken,
        verifiedAt: booking.verifiedAt,
        userId: booking.userId,
        userName: booking.userName,
        userEmail: booking.userEmail,
        userPhone: booking.userPhone,
        listingId: booking.listingId,
        partnerId: booking.partnerId,
        notes: booking.notes,
        specialRequests: booking.specialRequests,
        numberOfAttendees: booking.numberOfAttendees,
        partnerNotes: booking.partnerNotes,
        confirmedAt: booking.confirmedAt,
        confirmedBy: booking.confirmedBy,
        rejectionReason: booking.rejectionReason,
        rescheduleCount: booking.rescheduleCount,
        maxRescheduleAllowed: booking.maxRescheduleAllowed,
        lastRescheduledAt: booking.lastRescheduledAt,
        cancelledAt: booking.cancelledAt,
        cancelledBy: booking.cancelledBy,
        cancellationReason: booking.cancellationReason,
        cancellationNotes: booking.cancellationNotes,
        completedAt: booking.completedAt,
        checkInTime: booking.checkInTime,
        checkOutTime: booking.checkOutTime,
        noShowReported: booking.noShowReported,
        noShowReportedAt: booking.noShowReportedAt,
        feedbackSubmitted: booking.feedbackSubmitted,
        createdAt: booking.createdAt,
        updatedAt: booking.updatedAt,
        expiresAt: booking.expiresAt,
        listingMake: carListing.make,
        listingModel: carListing.model,
        listingYear: carListing.year,
        listingTrim: carListing.trim,
        listingThumbnail: carListing.thumbnail,
        listingPrice: carListing.price,
        // Staff info (the staff member who created the listing)
        staffUserId: carListing.userId,
        staffName: user.name,
        staffAvatar: userProfile.avatar,
        partnerName: partner.brandName,
        partnerLogo: partner.logo,
        partnerAddress: partner.address,
        partnerPhone: partner.phone,
      })
      .from(booking)
      .innerJoin(carListing, and(
        eq(booking.listingId, carListing.id),
        eq(carListing.userId, staffUserId)
      ))
      .leftJoin(user, eq(carListing.userId, user.id))
      .leftJoin(userProfile, eq(user.id, userProfile.userId))
      .leftJoin(partner, eq(booking.partnerId, partner.id))
      .where(and(...conditions))
      // Priority: show earlier appointments first
      .orderBy(asc(booking.scheduledStartTime))
      .limit(limit)
      .offset(offset),

    db
      .select({ count: sql<number>`count(*)::int` })
      .from(booking)
      .innerJoin(carListing, and(
        eq(booking.listingId, carListing.id),
        eq(carListing.userId, staffUserId)
      ))
      .where(and(...conditions)),
  ]);

  return {
    bookings: results.map(row => ({
      ...row,
      listingTitle: `${row.listingYear} ${row.listingMake} ${row.listingModel}${row.listingTrim ? ` ${row.listingTrim}` : ''}`,
      listingThumbnail: row.listingThumbnail,
      listingPrice: row.listingPrice ?? 0,
      staffUserId: row.staffUserId,
      staffName: row.staffName,
      staffAvatar: row.staffAvatar,
      partnerName: row.partnerName ?? 'Unknown Dealer',
      partnerLogo: row.partnerLogo,
      partnerAddress: row.partnerAddress,
      partnerPhone: row.partnerPhone ?? '',
      numberOfAttendees: row.numberOfAttendees ?? 1,
    })),
    total: countResult[0]?.count ?? 0,
  };
}

/**
 * Get booking statistics for a partner
 */
export interface BookingStats {
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  noShowBookings: number;
  todayBookings: number;
  upcomingBookings: number;
}

export async function getPartnerBookingStats(partnerId: string): Promise<BookingStats> {
  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date(now);
  endOfToday.setHours(23, 59, 59, 999);

  // OPTIMIZED: Single query with FILTER aggregations (8 queries → 1 query)
  const result = await db
    .select({
      totalBookings: sql<number>`count(*)::int`,
      pendingBookings: sql<number>`count(*) filter (where ${booking.status} = 'pending')::int`,
      confirmedBookings: sql<number>`count(*) filter (where ${booking.status} = 'confirmed')::int`,
      completedBookings: sql<number>`count(*) filter (where ${booking.status} = 'completed')::int`,
      cancelledBookings: sql<number>`count(*) filter (where ${booking.status} = 'cancelled')::int`,
      noShowBookings: sql<number>`count(*) filter (where ${booking.status} = 'no_show')::int`,
      todayBookings: sql<number>`count(*) filter (
        where ${booking.scheduledStartTime} >= ${startOfToday}
        and ${booking.scheduledStartTime} <= ${endOfToday}
        and ${booking.status} in ('pending', 'confirmed')
      )::int`,
      upcomingBookings: sql<number>`count(*) filter (
        where ${booking.scheduledStartTime} >= ${now}
        and ${booking.status} in ('pending', 'confirmed')
      )::int`,
    })
    .from(booking)
    .where(eq(booking.partnerId, partnerId));

  const stats = result[0];
  
  return {
    totalBookings: stats?.totalBookings ?? 0,
    pendingBookings: stats?.pendingBookings ?? 0,
    confirmedBookings: stats?.confirmedBookings ?? 0,
    completedBookings: stats?.completedBookings ?? 0,
    cancelledBookings: stats?.cancelledBookings ?? 0,
    noShowBookings: stats?.noShowBookings ?? 0,
    todayBookings: stats?.todayBookings ?? 0,
    upcomingBookings: stats?.upcomingBookings ?? 0,
  };
}

/**
 * Get booking statistics for a specific staff member's listings
 * Only counts bookings for listings owned by this staff member
 */
export async function getStaffBookingStats(
  staffUserId: string,
  partnerId: string
): Promise<BookingStats> {
  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date(now);
  endOfToday.setHours(23, 59, 59, 999);

  // Join with carListing to filter by staff's listings
  const result = await db
    .select({
      totalBookings: sql<number>`count(*)::int`,
      pendingBookings: sql<number>`count(*) filter (where ${booking.status} = 'pending')::int`,
      confirmedBookings: sql<number>`count(*) filter (where ${booking.status} = 'confirmed')::int`,
      completedBookings: sql<number>`count(*) filter (where ${booking.status} = 'completed')::int`,
      cancelledBookings: sql<number>`count(*) filter (where ${booking.status} = 'cancelled')::int`,
      noShowBookings: sql<number>`count(*) filter (where ${booking.status} = 'no_show')::int`,
      todayBookings: sql<number>`count(*) filter (
        where ${booking.scheduledStartTime} >= ${startOfToday}
        and ${booking.scheduledStartTime} <= ${endOfToday}
        and ${booking.status} in ('pending', 'confirmed')
      )::int`,
      upcomingBookings: sql<number>`count(*) filter (
        where ${booking.scheduledStartTime} >= ${now}
        and ${booking.status} in ('pending', 'confirmed')
      )::int`,
    })
    .from(booking)
    .innerJoin(carListing, and(
      eq(booking.listingId, carListing.id),
      eq(carListing.userId, staffUserId)
    ))
    .where(eq(booking.partnerId, partnerId));

  const stats = result[0];
  
  return {
    totalBookings: stats?.totalBookings ?? 0,
    pendingBookings: stats?.pendingBookings ?? 0,
    confirmedBookings: stats?.confirmedBookings ?? 0,
    completedBookings: stats?.completedBookings ?? 0,
    cancelledBookings: stats?.cancelledBookings ?? 0,
    noShowBookings: stats?.noShowBookings ?? 0,
    todayBookings: stats?.todayBookings ?? 0,
    upcomingBookings: stats?.upcomingBookings ?? 0,
  };
}

/**
 * Anti-abuse: Check if user can make a new booking
 * Returns restrictions if user has hit limits
 */
export interface BookingRestriction {
  canBook: boolean;
  reason?: string;
  activeBookings: number;
  maxActiveBookings: number;
  recentCancellations: number;
  maxCancellationsPerMonth: number;
  cooldownUntil?: Date;
}

export async function checkUserBookingRestrictions(userId: string): Promise<BookingRestriction> {
  const MAX_ACTIVE_BOOKINGS = 3;
  const MAX_CANCELLATIONS_PER_MONTH = 2;
  const COOLDOWN_HOURS_AFTER_CANCEL = 2; // 2 hours cooldown after cancellation

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // OPTIMIZED: Single query with FILTER aggregations (2 queries → 1)
  const result = await db
    .select({
      activeBookings: sql<number>`count(*) filter (where ${booking.status} in ('pending', 'confirmed'))::int`,
      recentCancellations: sql<number>`count(*) filter (
        where ${booking.status} = 'cancelled'
        and ${booking.cancelledBy} = 'user'
        and ${booking.cancelledAt} >= ${thirtyDaysAgo}
      )::int`,
      latestCancel: sql<Date | null>`max(${booking.cancelledAt}) filter (
        where ${booking.status} = 'cancelled'
        and ${booking.cancelledBy} = 'user'
        and ${booking.cancelledAt} >= ${thirtyDaysAgo}
      )`,
    })
    .from(booking)
    .where(eq(booking.userId, userId));

  const activeBookings = result[0]?.activeBookings ?? 0;
  const recentCancellations = result[0]?.recentCancellations ?? 0;
  const latestCancel = result[0]?.latestCancel;

  // Check cooldown after cancellation
  let cooldownUntil: Date | undefined;
  if (latestCancel) {
    const cooldownEnd = new Date(latestCancel.getTime() + COOLDOWN_HOURS_AFTER_CANCEL * 60 * 60 * 1000);
    if (cooldownEnd > now) {
      cooldownUntil = cooldownEnd;
    }
  }

  // Determine if user can book
  let canBook = true;
  let reason: string | undefined;

  if (activeBookings >= MAX_ACTIVE_BOOKINGS) {
    canBook = false;
    reason = `You have reached the maximum of ${MAX_ACTIVE_BOOKINGS} active bookings. Please complete or cancel an existing booking first.`;
  } else if (recentCancellations >= MAX_CANCELLATIONS_PER_MONTH) {
    canBook = false;
    reason = `You have cancelled ${MAX_CANCELLATIONS_PER_MONTH} bookings this month. Please wait until next month to book again.`;
  } else if (cooldownUntil) {
    canBook = false;
    reason = `Please wait ${Math.ceil((cooldownUntil.getTime() - now.getTime()) / (60 * 1000))} minutes before making another booking.`;
  }

  return {
    canBook,
    reason,
    activeBookings,
    maxActiveBookings: MAX_ACTIVE_BOOKINGS,
    recentCancellations,
    maxCancellationsPerMonth: MAX_CANCELLATIONS_PER_MONTH,
    cooldownUntil,
  };
}
