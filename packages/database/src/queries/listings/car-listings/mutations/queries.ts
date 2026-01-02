/**
 * Car Listing - Query Operations
 * 
 * Functions for querying car listings and statistics.
 * 
 * @module queries/listings/car-listings/mutations/queries
 */

import { eq, and, desc, asc, isNull, isNotNull, gt, or, sql, ilike } from 'drizzle-orm';
import { db } from '../../../../dbclient';
import { carListing } from '../../../../schema/listing';
import { user } from '../../../../schema/auth';
import { userProfile } from '../../../../schema/profile';
import { escapeLikePattern } from './helpers';
import { isPublicSql, suspensionReasonSql, suspendedAtSql } from '../sql-fragments';
import type { 
  ListingPostedByRole,
  ListingModerationStatus,
  ListingLifecycleStatus,
  ListingSummary,
  ListingSummaryWithPoster,
  ListingStats,
  GetListingsByUserOptions,
  GetListingsByPartnerOptions,
} from './types';

/**
 * Build where conditions for status filters
 * Shared between user and partner listing queries
 */
function buildStatusConditions(
  status: string | undefined,
  moderationStatus: ListingModerationStatus | undefined,
  lifecycleStatus: ListingLifecycleStatus | undefined,
  now: Date
): any[] {
  const conditions: any[] = [];

  if (moderationStatus) conditions.push(eq(carListing.moderationStatus, moderationStatus));
  if (lifecycleStatus) conditions.push(eq(carListing.lifecycleStatus, lifecycleStatus));

  if (status && status !== 'all') {
    if (status === 'published' || status === 'public') {
      conditions.push(eq(carListing.moderationStatus, 'approved'));
      conditions.push(eq(carListing.lifecycleStatus, 'active'));
      conditions.push(and(isNotNull(carListing.expiresAt), gt(carListing.expiresAt, now)));
    } else if (status === 'pending' || status === 'in_review') {
      conditions.push(or(eq(carListing.moderationStatus, 'submitted'), eq(carListing.moderationStatus, 'pending_review')));
    } else if (['draft', 'rejected', 'approved'].includes(status)) {
      conditions.push(eq(carListing.moderationStatus, status as any));
    } else if (status === 'suspended') {
      conditions.push(eq(carListing.lifecycleStatus, 'archived'));
      conditions.push(
        sql<boolean>`
          coalesce(
            ${carListing.specialNotes} ->> 'suspensionReason',
            ${carListing.specialNotes} -> 'moderation' ->> 'reason'
          ) is not null
        `
      );
    } else if (status === 'deep_inventory') {
      conditions.push(
        or(
          eq(carListing.lifecycleStatus, 'archived'),
          eq(carListing.lifecycleStatus, 'sold'),
          eq(carListing.lifecycleStatus, 'expired'),
          eq(carListing.lifecycleStatus, 'deleted')
        )
      );
    } else if (['archived', 'sold', 'expired', 'deleted', 'active'].includes(status)) {
      conditions.push(eq(carListing.lifecycleStatus, status as any));
    }
  }

  // Special handling for 'archived' status to exclude suspended
  if (status === 'archived') {
    conditions.push(
      sql<boolean>`
        coalesce(
          ${carListing.specialNotes} ->> 'suspensionReason',
          ${carListing.specialNotes} -> 'moderation' ->> 'reason'
        ) is null
      `
    );
    conditions.push(sql<boolean>`${carListing.moderationStatus} <> 'rejected'`);
  }

  return conditions;
}

/**
 * Build search conditions from query string
 */
function buildSearchConditions(q: string | undefined): any {
  const qTrim = q?.trim();
  if (!qTrim) return undefined;

  const qLike = `%${escapeLikePattern(qTrim)}%`;
  const maybeYear = Number(qTrim);
  const yearFilter =
    Number.isFinite(maybeYear) && Number.isInteger(maybeYear) ? eq(carListing.year, maybeYear) : undefined;

  return or(
    ilike(carListing.make, qLike),
    ilike(carListing.model, qLike),
    ilike(carListing.trim, qLike),
    ilike(carListing.vin, qLike),
    ilike(carListing.id, qLike),
    ...(yearFilter ? [yearFilter] : [])
  );
}

/**
 * Build order by clause from sort option
 * Uses publishedAt (with createdAt fallback) for newest/oldest to sort by publish date
 */
function buildOrderBy(sort: 'newest' | 'oldest' | 'updated' | 'expiring'): any[] {
  switch (sort) {
    case 'oldest':
      return [asc(sql`coalesce(${carListing.publishedAt}, ${carListing.createdAt})`)];
    case 'updated':
      return [desc(carListing.updatedAt)];
    case 'expiring':
      return [
        sql`(${carListing.expiresAt} is null) asc`,
        asc(carListing.expiresAt),
        desc(sql`coalesce(${carListing.publishedAt}, ${carListing.createdAt})`),
      ];
    default:
      return [desc(sql`coalesce(${carListing.publishedAt}, ${carListing.createdAt})`)];
  }
}

/**
 * Common select fields for listing summaries
 */
function getListingSummaryFields(now: Date) {
  return {
    id: carListing.id,
    make: carListing.make,
    model: carListing.model,
    year: carListing.year,
    trim: carListing.trim,
    price: carListing.price,
    postedByRole: carListing.postedByRole,
    moderationStatus: carListing.moderationStatus,
    lifecycleStatus: carListing.lifecycleStatus,
    isPublic: isPublicSql(now),
    isBlkListing: carListing.isBlkListing,
    rejectionReason: carListing.rejectionReason,
    suspensionReason: suspensionReasonSql(),
    suspendedAt: suspendedAtSql(),
    thumbnail: carListing.thumbnail,
    viewCount: carListing.viewCount,
    favouriteCount: carListing.favouriteCount,
    partnerId: carListing.partnerId,
    createdAt: carListing.createdAt,
    updatedAt: carListing.updatedAt,
    publishedAt: carListing.publishedAt,
    expiresAt: carListing.expiresAt,
    extensionCount: carListing.extensionCount,
    lastExtendedAt: carListing.lastExtendedAt,
  };
}

/**
 * Get all listings by user ID
 * Useful for "My Listings" page
 * 
 * @param listingType - 'personal' for user listings (no partnerId), 'work' for staff listings (with partnerId), or undefined for all
 */
export async function getListingsByUserId(
  userId: string,
  options?: GetListingsByUserOptions
): Promise<ListingSummary[]> {
  const { status, moderationStatus, lifecycleStatus, q, sort = 'newest', limit = 50, offset = 0, listingType } = options ?? {};
  const now = new Date();

  const whereConditions = [eq(carListing.userId, userId)];

  // Add status conditions
  whereConditions.push(...buildStatusConditions(status, moderationStatus, lifecycleStatus, now));

  // Filter by listing type
  if (listingType === 'personal') {
    whereConditions.push(isNull(carListing.partnerId));
  } else if (listingType === 'work') {
    whereConditions.push(isNotNull(carListing.partnerId));
  }

  // Add search conditions
  const searchCondition = buildSearchConditions(q);
  if (searchCondition) whereConditions.push(searchCondition);

  return db
    .select(getListingSummaryFields(now))
    .from(carListing)
    .where(and(...whereConditions))
    .orderBy(...buildOrderBy(sort))
    .limit(limit)
    .offset(offset) as Promise<ListingSummary[]>;
}

/**
 * Get listings by partner ID
 * Used by staff dashboards for "work listings"
 */
export async function getListingsByPartnerId(
  partnerId: string,
  options?: GetListingsByPartnerOptions
): Promise<ListingSummaryWithPoster[]> {
  const { status, moderationStatus, lifecycleStatus, userId, q, sort = 'newest', limit = 50, offset = 0 } = options ?? {};
  const now = new Date();

  const whereConditions = [eq(carListing.partnerId, partnerId)];

  // Filter by specific user if provided
  if (userId) whereConditions.push(eq(carListing.userId, userId));

  // Add status conditions
  whereConditions.push(...buildStatusConditions(status, moderationStatus, lifecycleStatus, now));

  // Add search conditions
  const searchCondition = buildSearchConditions(q);
  if (searchCondition) whereConditions.push(searchCondition);

  return db
    .select({
      ...getListingSummaryFields(now),
      postedByUserId: carListing.userId,
      postedByDisplayName: user.name,
      postedByEmail: user.email,
      postedByAvatar: userProfile.avatar,
    })
    .from(carListing)
    .leftJoin(user, eq(carListing.userId, user.id))
    .leftJoin(userProfile, eq(user.id, userProfile.userId))
    .where(and(...whereConditions))
    .orderBy(...buildOrderBy(sort))
    .limit(limit)
    .offset(offset) as Promise<ListingSummaryWithPoster[]>;
}

/**
 * Get listing statistics for a user
 */
export async function getListingStatsByUserId(
  userId: string,
  options?: { listingType?: 'personal' | 'work' }
): Promise<ListingStats> {
  const now = new Date();
  const listingType = options?.listingType;

  const whereBase = [eq(carListing.userId, userId)];
  if (listingType === 'personal') whereBase.push(isNull(carListing.partnerId));
  if (listingType === 'work') whereBase.push(isNotNull(carListing.partnerId));

  const [stats] = await db
    .select({
      all: sql<number>`count(*)`,
      active: sql<number>`count(*) filter (where ${carListing.lifecycleStatus} = 'active')`,
      public: sql<number>`
        count(*) filter (
          where ${carListing.moderationStatus} = 'approved'
            and ${carListing.lifecycleStatus} = 'active'
            and ${carListing.expiresAt} is not null
            and ${carListing.expiresAt} > ${now}
        )
      `,
      inReview: sql<number>`
        count(*) filter (
          where ${carListing.lifecycleStatus} = 'active'
            and (${carListing.moderationStatus} = 'submitted' or ${carListing.moderationStatus} = 'pending_review')
        )
      `,
      draft: sql<number>`count(*) filter (where ${carListing.moderationStatus} = 'draft')`,
      rejected: sql<number>`count(*) filter (where ${carListing.moderationStatus} = 'rejected')`,
      suspended: sql<number>`
        count(*) filter (
          where ${carListing.lifecycleStatus} = 'archived'
            and coalesce(
              ${carListing.specialNotes} ->> 'suspensionReason',
              ${carListing.specialNotes} -> 'moderation' ->> 'reason'
            ) is not null
        )
      `,
      archived: sql<number>`
        count(*) filter (
          where ${carListing.lifecycleStatus} = 'archived'
            and ${carListing.moderationStatus} <> 'rejected'
            and coalesce(
              ${carListing.specialNotes} ->> 'suspensionReason',
              ${carListing.specialNotes} -> 'moderation' ->> 'reason'
            ) is null
        )
      `,
      sold: sql<number>`count(*) filter (where ${carListing.lifecycleStatus} = 'sold')`,
      expired: sql<number>`count(*) filter (where ${carListing.lifecycleStatus} = 'expired')`,
      deleted: sql<number>`count(*) filter (where ${carListing.lifecycleStatus} = 'deleted')`,
    })
    .from(carListing)
    .where(and(...whereBase));

  return (
    stats ?? {
      all: 0,
      active: 0,
      public: 0,
      inReview: 0,
      draft: 0,
      rejected: 0,
      archived: 0,
      suspended: 0,
      sold: 0,
      expired: 0,
      deleted: 0,
    }
  );
}

/**
 * Get listing statistics for a partner
 */
export async function getListingStatsByPartnerId(partnerId: string): Promise<ListingStats> {
  const now = new Date();

  const [stats] = await db
    .select({
      all: sql<number>`count(*)`,
      active: sql<number>`count(*) filter (where ${carListing.lifecycleStatus} = 'active')`,
      public: sql<number>`
        count(*) filter (
          where ${carListing.moderationStatus} = 'approved'
            and ${carListing.lifecycleStatus} = 'active'
            and ${carListing.expiresAt} is not null
            and ${carListing.expiresAt} > ${now}
        )
      `,
      inReview: sql<number>`
        count(*) filter (
          where ${carListing.lifecycleStatus} = 'active'
            and (${carListing.moderationStatus} = 'submitted' or ${carListing.moderationStatus} = 'pending_review')
        )
      `,
      draft: sql<number>`count(*) filter (where ${carListing.moderationStatus} = 'draft')`,
      rejected: sql<number>`count(*) filter (where ${carListing.moderationStatus} = 'rejected')`,
      suspended: sql<number>`
        count(*) filter (
          where ${carListing.lifecycleStatus} = 'archived'
            and coalesce(
              ${carListing.specialNotes} ->> 'suspensionReason',
              ${carListing.specialNotes} -> 'moderation' ->> 'reason'
            ) is not null
        )
      `,
      archived: sql<number>`
        count(*) filter (
          where ${carListing.lifecycleStatus} = 'archived'
            and ${carListing.moderationStatus} <> 'rejected'
            and coalesce(
              ${carListing.specialNotes} ->> 'suspensionReason',
              ${carListing.specialNotes} -> 'moderation' ->> 'reason'
            ) is null
        )
      `,
      sold: sql<number>`count(*) filter (where ${carListing.lifecycleStatus} = 'sold')`,
      expired: sql<number>`count(*) filter (where ${carListing.lifecycleStatus} = 'expired')`,
      deleted: sql<number>`count(*) filter (where ${carListing.lifecycleStatus} = 'deleted')`,
    })
    .from(carListing)
    .where(eq(carListing.partnerId, partnerId));

  return (
    stats ?? {
      all: 0,
      active: 0,
      public: 0,
      inReview: 0,
      draft: 0,
      rejected: 0,
      archived: 0,
      suspended: 0,
      sold: 0,
      expired: 0,
      deleted: 0,
    }
  );
}
