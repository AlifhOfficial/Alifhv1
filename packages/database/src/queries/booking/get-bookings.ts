/**
 * GET BOOKINGS - Universal Booking Getter
 * 
 * One function to rule them all. Everyone uses this with different filters.
 * 
 * @module queries/booking/get-bookings
 */

import { eq, and, gte, lte, inArray, desc, asc, sql, or, ne, SQL, ilike } from 'drizzle-orm';
import { db } from '../../dbclient';
import { booking, bookingStatusEnum, partnerBookingSettings } from '../../schema/booking';
import { carListing } from '../../schema/listing';
import { partner } from '../../schema/partner';
import { user } from '../../schema/auth';
import { userProfile } from '../../schema/profile';

// ============================================================================
// TYPES
// ============================================================================

export type BookingStatus = (typeof bookingStatusEnum.enumValues)[number];

export const ACTIVE_STATUSES: BookingStatus[] = ['pending', 'confirmed'];
export const TERMINAL_STATUSES: BookingStatus[] = ['completed', 'cancelled', 'rejected', 'no_show', 'expired'];

export interface GetBookingsParams {
  // WHO - at least one required for non-admin
  userId?: string;
  partnerId?: string;
  staffUserId?: string;
  
  // WHAT - specific lookup
  id?: string;
  confirmationToken?: string;
  listingId?: string;
  
  // FILTER
  status?: BookingStatus[];
  dateFrom?: Date;
  dateTo?: Date;
  upcoming?: boolean;
  q?: string; // Search query
  
  // OPTIONS
  includeStats?: boolean;
  includePartnerSettings?: boolean;
  sort?: 'newest' | 'oldest' | 'soonest';
  limit?: number;
  offset?: number;
}

export interface BookingRecord {
  id: string;
  status: BookingStatus;
  source: string;
  
  // Schedule
  scheduledDate: Date;
  scheduledStartTime: Date;
  scheduledEndTime: Date;
  
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
  
  // Staff who created the listing
  staffUserId: string | null;
  staffName: string | null;
  
  // Partner info
  partnerId: string;
  partnerName: string;
  partnerLogo: string | null;
  partnerAddress: string | null;
  partnerPhone: string | null;
  
  // Confirmation
  confirmationToken: string;
  verifiedAt: Date | null;
  
  // Details
  notes: string | null;
  specialRequests: string | null;
  numberOfAttendees: number;
  
  // Partner response
  partnerNotes: string | null;
  confirmedAt: Date | null;
  confirmedBy: string | null;
  rejectionReason: string | null;
  
  // Reschedule
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
  
  // Optional: Partner settings (when includePartnerSettings=true)
  partnerSettings?: {
    allowUserCancellation: boolean;
    cancellationDeadlineHours: number;
    allowReschedule: boolean;
    maxRescheduleCount: number;
    rescheduleDeadlineHours: number;
    preparationInstructions: string | null;
    directions: string | null;
    parkingInstructions: string | null;
    contactPersonName: string | null;
    contactPersonPhone: string | null;
  } | null;
}

export interface BookingStats {
  total: number;
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
  rejected: number;
  noShow: number;
  todayCount: number;
  upcomingCount: number;
}

export interface GetBookingsResult {
  bookings: BookingRecord[];
  total: number;
  stats?: BookingStats;
}

// ============================================================================
// MAIN FUNCTION
// ============================================================================

/**
 * Universal booking getter - one function for all use cases
 */
export async function getBookings(params: GetBookingsParams): Promise<GetBookingsResult> {
  const {
    userId,
    partnerId,
    staffUserId,
    id,
    confirmationToken,
    listingId,
    status,
    dateFrom,
    dateTo,
    upcoming,
    q,
    includeStats = false,
    includePartnerSettings = false,
    sort = 'newest',
    limit = 50,
    offset = 0,
  } = params;

  const now = new Date();
  const effectiveStatusSql = getEffectiveBookingStatusSql(now);

  // Build WHERE conditions
  const conditions: SQL[] = [];

  // Single booking lookup by ID
  if (id) {
    conditions.push(eq(booking.id, id));
  }

  // Lookup by confirmation token
  if (confirmationToken) {
    conditions.push(eq(booking.confirmationToken, confirmationToken.toUpperCase()));
  }

  // User filter
  if (userId) {
    conditions.push(eq(booking.userId, userId));
  }

  // Partner filter
  if (partnerId) {
    conditions.push(eq(booking.partnerId, partnerId));
  }

  // Staff filter (bookings for listings created by this staff member)
  if (staffUserId) {
    conditions.push(eq(carListing.userId, staffUserId));
  }

  // Listing filter
  if (listingId) {
    conditions.push(eq(booking.listingId, listingId));
  }

  // Status filter
  if (status && status.length > 0) {
    conditions.push(
      or(...status.map((value) => sql`${effectiveStatusSql} = ${value}`))!
    );
  }

  // Date range
  if (dateFrom) {
    conditions.push(gte(booking.scheduledDate, dateFrom));
  }
  if (dateTo) {
    conditions.push(lte(booking.scheduledDate, dateTo));
  }

  // Upcoming only
  if (upcoming) {
    conditions.push(gte(booking.scheduledStartTime, now));
    conditions.push(
      or(
        sql`${effectiveStatusSql} = 'pending'`,
        sql`${effectiveStatusSql} = 'confirmed'`
      )!
    );
  }

  // Search query (user name, email, listing title, confirmation token)
  if (q && q.trim()) {
    const searchTerm = `%${q.trim()}%`;
    conditions.push(
      or(
        ilike(booking.userName, searchTerm),
        ilike(booking.userEmail, searchTerm),
        ilike(booking.confirmationToken, searchTerm),
        ilike(carListing.make, searchTerm),
        ilike(carListing.model, searchTerm),
      )!
    );
  }

  // Determine sort order
  const orderBy = sort === 'oldest' 
    ? asc(booking.createdAt)
    : sort === 'soonest'
    ? asc(booking.scheduledStartTime)
    : desc(booking.createdAt);

  // Execute main query
  const rows = await db
    .select({
      // Booking fields
      id: booking.id,
      status: effectiveStatusSql.as('effective_status'),
      source: booking.source,
      scheduledDate: booking.scheduledDate,
      scheduledStartTime: booking.scheduledStartTime,
      scheduledEndTime: booking.scheduledEndTime,
      userId: booking.userId,
      userName: booking.userName,
      userEmail: booking.userEmail,
      userPhone: booking.userPhone,
      listingId: booking.listingId,
      partnerId: booking.partnerId,
      confirmationToken: booking.confirmationToken,
      verifiedAt: booking.verifiedAt,
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
      
      // Listing fields
      listingMake: carListing.make,
      listingModel: carListing.model,
      listingYear: carListing.year,
      listingTrim: carListing.trim,
      listingThumbnail: carListing.thumbnail,
      listingPrice: carListing.price,
      staffUserId: carListing.userId,
      staffName: user.name,
      
      // Partner fields
      partnerName: partner.brandName,
      partnerLogo: partner.logo,
      partnerAddress: partner.address,
      partnerPhone: partner.phone,
    })
    .from(booking)
    .innerJoin(carListing, eq(booking.listingId, carListing.id))
    .innerJoin(partner, eq(booking.partnerId, partner.id))
    .leftJoin(user, eq(carListing.userId, user.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(orderBy)
    .limit(limit)
    .offset(offset);

  // Transform rows to BookingRecord
  const bookings: BookingRecord[] = rows.map(row => ({
    id: row.id,
    status: row.status as BookingStatus,
    source: row.source,
    scheduledDate: row.scheduledDate,
    scheduledStartTime: row.scheduledStartTime,
    scheduledEndTime: row.scheduledEndTime,
    userId: row.userId,
    userName: row.userName,
    userEmail: row.userEmail,
    userPhone: row.userPhone,
    listingId: row.listingId,
    listingTitle: formatListingTitle(row.listingYear, row.listingMake, row.listingModel, row.listingTrim),
    listingThumbnail: row.listingThumbnail,
    listingPrice: row.listingPrice ?? 0,
    staffUserId: row.staffUserId,
    staffName: row.staffName,
    partnerId: row.partnerId,
    partnerName: row.partnerName ?? 'Unknown Dealer',
    partnerLogo: row.partnerLogo,
    partnerAddress: row.partnerAddress,
    partnerPhone: row.partnerPhone,
    confirmationToken: row.confirmationToken,
    verifiedAt: row.verifiedAt,
    notes: row.notes,
    specialRequests: row.specialRequests,
    numberOfAttendees: row.numberOfAttendees ?? 1,
    partnerNotes: row.partnerNotes,
    confirmedAt: row.confirmedAt,
    confirmedBy: row.confirmedBy,
    rejectionReason: row.rejectionReason,
    rescheduleCount: row.rescheduleCount,
    maxRescheduleAllowed: row.maxRescheduleAllowed,
    lastRescheduledAt: row.lastRescheduledAt,
    cancelledAt: row.cancelledAt,
    cancelledBy: row.cancelledBy,
    cancellationReason: row.cancellationReason,
    cancellationNotes: row.cancellationNotes,
    completedAt: row.completedAt,
    checkInTime: row.checkInTime,
    checkOutTime: row.checkOutTime,
    noShowReported: row.noShowReported ?? false,
    noShowReportedAt: row.noShowReportedAt,
    feedbackSubmitted: row.feedbackSubmitted ?? false,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    expiresAt: row.expiresAt,
  }));

  // Get total count
  const countResult = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(booking)
    .innerJoin(carListing, eq(booking.listingId, carListing.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined);
  
  const total = countResult[0]?.count ?? 0;

  // Include partner settings if requested
  if (includePartnerSettings && bookings.length > 0) {
    const partnerIds = [...new Set(bookings.map(b => b.partnerId))];
    const settingsRows = await db
      .select()
      .from(partnerBookingSettings)
      .where(inArray(partnerBookingSettings.partnerId, partnerIds));
    
    const settingsMap = new Map(settingsRows.map(s => [s.partnerId, s]));
    
    for (const b of bookings) {
      const settings = settingsMap.get(b.partnerId);
      b.partnerSettings = settings ? {
        allowUserCancellation: settings.allowUserCancellation,
        cancellationDeadlineHours: settings.cancellationDeadlineHours ?? 2,
        allowReschedule: settings.allowReschedule,
        maxRescheduleCount: settings.maxRescheduleCount,
        rescheduleDeadlineHours: settings.rescheduleDeadlineHours ?? 4,
        preparationInstructions: settings.preparationInstructions,
        directions: settings.directions,
        parkingInstructions: settings.parkingInstructions,
        contactPersonName: settings.contactPersonName,
        contactPersonPhone: settings.contactPersonPhone,
      } : null;
    }
  }

  // Calculate stats if requested
  let stats: BookingStats | undefined;
  if (includeStats) {
    // Build base conditions without status filter for accurate counts
    const baseConditions = conditions.filter(c => {
      // Remove status condition for stats calculation
      return true; // Keep all for now, we'll do separate counts
    });

    const statsPartnerId = partnerId;
    const statsUserId = userId;
    const statsStaffUserId = staffUserId;
    
    const todayStart = new Date(now);
    todayStart.setUTCHours(0, 0, 0, 0);
    const todayEnd = new Date(now);
    todayEnd.setUTCHours(23, 59, 59, 999);

    // Build count conditions
    const countConditions: SQL[] = [];
    if (statsPartnerId) countConditions.push(eq(booking.partnerId, statsPartnerId));
    if (statsUserId) countConditions.push(eq(booking.userId, statsUserId));
    // Note: staffUserId filter requires join with carListing, handled below
    
    const baseWhere = countConditions.length > 0 ? and(...countConditions) : undefined;

    // Build stats query - join with carListing if we need to filter by staff
    const statsQuery = statsStaffUserId
      ? db
          .select({
            total: sql<number>`count(*)::int`,
            pending: sql<number>`count(*) filter (where ${effectiveStatusSql} = 'pending')::int`,
            confirmed: sql<number>`count(*) filter (where ${effectiveStatusSql} = 'confirmed')::int`,
            completed: sql<number>`count(*) filter (where ${effectiveStatusSql} = 'completed')::int`,
            cancelled: sql<number>`count(*) filter (where ${effectiveStatusSql} = 'cancelled')::int`,
            rejected: sql<number>`count(*) filter (where ${effectiveStatusSql} = 'rejected')::int`,
            noShow: sql<number>`count(*) filter (where ${effectiveStatusSql} in ('no_show', 'expired'))::int`,
            todayCount: sql<number>`count(*) filter (where ${booking.scheduledDate} >= ${todayStart} and ${booking.scheduledDate} <= ${todayEnd})::int`,
            upcomingCount: sql<number>`count(*) filter (where ${booking.scheduledStartTime} >= ${now} and ${effectiveStatusSql} in ('pending', 'confirmed'))::int`,
          })
          .from(booking)
          .innerJoin(carListing, eq(booking.listingId, carListing.id))
          .where(baseWhere ? and(baseWhere, eq(carListing.userId, statsStaffUserId)) : eq(carListing.userId, statsStaffUserId))
      : db
          .select({
            total: sql<number>`count(*)::int`,
            pending: sql<number>`count(*) filter (where ${effectiveStatusSql} = 'pending')::int`,
            confirmed: sql<number>`count(*) filter (where ${effectiveStatusSql} = 'confirmed')::int`,
            completed: sql<number>`count(*) filter (where ${effectiveStatusSql} = 'completed')::int`,
            cancelled: sql<number>`count(*) filter (where ${effectiveStatusSql} = 'cancelled')::int`,
            rejected: sql<number>`count(*) filter (where ${effectiveStatusSql} = 'rejected')::int`,
            noShow: sql<number>`count(*) filter (where ${effectiveStatusSql} in ('no_show', 'expired'))::int`,
            todayCount: sql<number>`count(*) filter (where ${booking.scheduledDate} >= ${todayStart} and ${booking.scheduledDate} <= ${todayEnd})::int`,
            upcomingCount: sql<number>`count(*) filter (where ${booking.scheduledStartTime} >= ${now} and ${effectiveStatusSql} in ('pending', 'confirmed'))::int`,
          })
          .from(booking)
          .where(baseWhere);

    const [statsResult] = await statsQuery;

    stats = {
      total: statsResult?.total ?? 0,
      pending: statsResult?.pending ?? 0,
      confirmed: statsResult?.confirmed ?? 0,
      completed: statsResult?.completed ?? 0,
      cancelled: statsResult?.cancelled ?? 0,
      rejected: statsResult?.rejected ?? 0,
      noShow: statsResult?.noShow ?? 0,
      todayCount: statsResult?.todayCount ?? 0,
      upcomingCount: statsResult?.upcomingCount ?? 0,
    };
  }

  return { bookings, total, stats };
}

// ============================================================================
// HELPERS
// ============================================================================

function getEffectiveBookingStatusSql(now: Date) {
  return sql<BookingStatus>`
    CASE
      WHEN ${booking.status} = 'pending' AND ${booking.scheduledStartTime} < ${now} THEN 'expired'
      WHEN ${booking.status} = 'confirmed' AND ${booking.scheduledStartTime} < ${now} THEN 'no_show'
      ELSE ${booking.status}
    END
  `;
}

function formatListingTitle(
  year: number | null,
  make: string | null,
  model: string | null,
  trim: string | null
): string {
  const parts = [year, make, model].filter(Boolean);
  const baseTitle = parts.join(' ');
  return trim ? `${baseTitle} ${trim}` : baseTitle;
}

/**
 * Check if a user can book (no limits - always allowed)
 */
export async function checkBookingRestrictions(userId: string): Promise<{
  canBook: boolean;
  reason?: string;
  activeCount: number;
  cancellationCount: number;
}> {
  // No limits - always allow booking
  return { canBook: true, activeCount: 0, cancellationCount: 0 };
}
