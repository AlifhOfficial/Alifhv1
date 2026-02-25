/**
 * Admin Listings Queries
 *
 * Centralized admin operations for listings so API routes don't use raw `db`.
 *
 * @module queries/admin/listings-admin-query
 */

import { and, desc, eq, isNotNull, isNull, or, gt, type SQL, sql, asc } from 'drizzle-orm';
import { db } from '../../dbclient';
import { carListing } from '../../schema/listing';
import { user } from '../../schema/auth';
import { partner } from '../../schema/partner';
import { getListingModerationContext, type ListingModerationContext } from '../listings/car-listings/car-listing-context-query';
import { recordVinPublication, updateVinHistoryCurrentListing } from '../listings/car-listings/mutations/vin-history';

export type AdminListingTypeFilter = 'user' | 'partner';

export interface GetAdminListingsOptions {
  /**
   * Legacy overall status filter (maps to moderation/lifecycle).
   * Prefer `moderationStatus` + `lifecycleStatus` when possible.
   */
  status?: string;
  moderationStatus?: 'draft' | 'submitted' | 'pending_review' | 'approved' | 'rejected';
  lifecycleStatus?: 'active' | 'archived' | 'sold' | 'expired' | 'deleted';
  type?: AdminListingTypeFilter;
  sort?: 'newest' | 'oldest' | 'updated';
  limit?: number;
  offset?: number;
}

export async function getAdminListings(options: GetAdminListingsOptions = {}) {
  const { status, moderationStatus, lifecycleStatus, type, sort = 'newest', limit = 50, offset = 0 } = options;
  const now = new Date();

  const conditions: SQL[] = [];
  if (moderationStatus) conditions.push(eq(carListing.moderationStatus, moderationStatus));
  if (lifecycleStatus) conditions.push(eq(carListing.lifecycleStatus, lifecycleStatus));

  if (status && status !== 'all') {
    if (status === 'published' || status === 'public') {
      conditions.push(eq(carListing.moderationStatus, 'approved'));
      conditions.push(eq(carListing.lifecycleStatus, 'active'));
      conditions.push(and(isNotNull(carListing.expiresAt), gt(carListing.expiresAt, now)));
    } else if (status === 'pending' || status === 'in_review') {
      // Only show pending items that are still active (not deleted/archived/etc)
      conditions.push(or(eq(carListing.moderationStatus, 'submitted'), eq(carListing.moderationStatus, 'pending_review')));
      conditions.push(eq(carListing.lifecycleStatus, 'active'));
    } else if (status === 'draft') {
      // Only show drafts that are still active
      conditions.push(eq(carListing.moderationStatus, 'draft'));
      conditions.push(eq(carListing.lifecycleStatus, 'active'));
    } else if (status === 'rejected') {
      // Only show rejected items that are still active
      conditions.push(eq(carListing.moderationStatus, 'rejected'));
      conditions.push(eq(carListing.lifecycleStatus, 'active'));
    } else if (status === 'approved') {
      conditions.push(eq(carListing.moderationStatus, 'approved'));
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
      // Deep inventory: archived, suspended, sold, expired, deleted
      conditions.push(
        or(
          eq(carListing.lifecycleStatus, 'archived'),
          eq(carListing.lifecycleStatus, 'sold'),
          eq(carListing.lifecycleStatus, 'expired'),
          eq(carListing.lifecycleStatus, 'deleted')
        )
      );
    } else if (status === 'archived') {
      // Archived but NOT suspended (no suspension reason) and NOT rejected
      conditions.push(eq(carListing.lifecycleStatus, 'archived'));
      conditions.push(sql<boolean>`${carListing.moderationStatus} <> 'rejected'`);
      conditions.push(
        sql<boolean>`
          coalesce(
            ${carListing.specialNotes} ->> 'suspensionReason',
            ${carListing.specialNotes} -> 'moderation' ->> 'reason'
          ) is null
        `
      );
    } else if (['sold', 'expired', 'deleted', 'active'].includes(status)) {
      conditions.push(eq(carListing.lifecycleStatus, status as any));
    }
  }

  if (type === 'user') {
    conditions.push(isNull(carListing.partnerId));
  } else if (type === 'partner') {
    conditions.push(isNotNull(carListing.partnerId));
  }

  const listings = await db
    .select({
      id: carListing.id,
      make: carListing.make,
      model: carListing.model,
      year: carListing.year,
      trim: carListing.trim,
      price: carListing.price,
      postedByRole: carListing.postedByRole,
      moderationStatus: carListing.moderationStatus,
      lifecycleStatus: carListing.lifecycleStatus,
      isPublic: and(
        eq(carListing.moderationStatus, 'approved'),
        eq(carListing.lifecycleStatus, 'active'),
        isNotNull(carListing.expiresAt),
        gt(carListing.expiresAt, now)
      ),
      userId: carListing.userId,
      partnerId: carListing.partnerId,
      thumbnail: carListing.thumbnail,
      viewCount: carListing.viewCount,
      favouriteCount: carListing.favouriteCount,
      createdAt: carListing.createdAt,
      updatedAt: carListing.updatedAt,
      publishedAt: carListing.publishedAt,
      expiresAt: carListing.expiresAt,
      suspensionReason: sql<string | null>`
        coalesce(
          ${carListing.specialNotes} ->> 'suspensionReason',
          ${carListing.specialNotes} -> 'moderation' ->> 'reason'
        )
      `,
      rejectionReason: carListing.rejectionReason,
      emirate: carListing.emirate,
      mileage: carListing.mileage,
      userName: user.name,
      userEmail: user.email,
      partnerName: partner.brandName,
      specialNotes: carListing.specialNotes,
    })
    .from(carListing)
    .leftJoin(user, eq(user.id, carListing.userId))
    .leftJoin(partner, eq(partner.id, carListing.partnerId))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(
      sort === 'oldest'
        ? asc(sql`coalesce(${carListing.publishedAt}, ${carListing.createdAt})`)
        : sort === 'updated'
          ? desc(carListing.updatedAt)
          : desc(sql`coalesce(${carListing.publishedAt}, ${carListing.createdAt})`)
    )
    .limit(limit)
    .offset(offset);

  return listings;
}

/**
 * Get admin listing stats
 */
export async function getAdminListingStats(options?: { type?: AdminListingTypeFilter }): Promise<{
  all: number;
  pending: number;
  public: number;
  draft: number;
  rejected: number;
  archived: number;
  suspended: number;
  sold: number;
  expired: number;
  deleted: number;
  userListings: number;
  partnerListings: number;
}> {
  const now = new Date();
  const type = options?.type;

  const conditions: SQL[] = [];
  if (type === 'user') conditions.push(isNull(carListing.partnerId));
  if (type === 'partner') conditions.push(isNotNull(carListing.partnerId));

  const [stats] = await db
    .select({
      all: sql<number>`count(*)`,
      pending: sql<number>`
        count(*) filter (
          where ${carListing.lifecycleStatus} = 'active'
            and (${carListing.moderationStatus} = 'submitted' or ${carListing.moderationStatus} = 'pending_review')
        )
      `,
      public: sql<number>`
        count(*) filter (
          where ${carListing.moderationStatus} = 'approved'
            and ${carListing.lifecycleStatus} = 'active'
            and ${carListing.expiresAt} is not null
            and ${carListing.expiresAt} > ${now}
        )
      `,
      draft: sql<number>`count(*) filter (where ${carListing.moderationStatus} = 'draft' and ${carListing.lifecycleStatus} = 'active')`,
      rejected: sql<number>`count(*) filter (where ${carListing.moderationStatus} = 'rejected' and ${carListing.lifecycleStatus} = 'active')`,
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
      userListings: sql<number>`count(*) filter (where ${carListing.partnerId} is null)`,
      partnerListings: sql<number>`count(*) filter (where ${carListing.partnerId} is not null)`,
    })
    .from(carListing)
    .where(conditions.length > 0 ? and(...conditions) : undefined);

  return stats ?? {
    all: 0,
    pending: 0,
    public: 0,
    draft: 0,
    rejected: 0,
    archived: 0,
    suspended: 0,
    sold: 0,
    expired: 0,
    deleted: 0,
    userListings: 0,
    partnerListings: 0,
  };
}

/**
 * Soft delete listing as admin (moves to deleted lifecycle status)
 */
export async function deleteListingAsAdmin(listingId: string): Promise<boolean> {
  const now = new Date();
  const updated = await db
    .update(carListing)
    .set({
      lifecycleStatus: 'deleted',
      updatedAt: now,
    })
    .where(eq(carListing.id, listingId))
    .returning({ id: carListing.id });

  return updated.length > 0;
}

export async function approveListingAsAdmin(listingId: string, adminUserId: string): Promise<ListingModerationContext | null> {
  const now = new Date();
  const existing = await db
    .select({
      id: carListing.id,
      userId: carListing.userId,
      vin: carListing.vin,
      lifecycleStatus: carListing.lifecycleStatus,
      publishedAt: carListing.publishedAt,
      originalPublishedAt: carListing.originalPublishedAt,
      expiresAt: carListing.expiresAt,
    })
    .from(carListing)
    .where(eq(carListing.id, listingId))
    .limit(1);

  if (existing.length === 0) return null;

  const row = existing[0];
  const shouldPublishNow = row.lifecycleStatus === 'active';

  const updateData: any = {
    moderationStatus: 'approved',
    approvedAt: now,
    lastModeratedAt: now,
    needsRemoderation: false,
    rejectionReason: null,
    updatedAt: now,
  };

  if (shouldPublishNow) {
    const publishedAt = row.publishedAt ?? now;
    if (!row.publishedAt) updateData.publishedAt = publishedAt;
    if (!row.expiresAt) updateData.expiresAt = new Date(now.getTime() + 24 * 24 * 60 * 60 * 1000);
    
    // Anti-abuse: Set originalPublishedAt from VIN history if not already set
    if (!row.originalPublishedAt) {
      if (row.vin) {
        try {
          const vinResult = await recordVinPublication({
            vin: row.vin,
            userId: row.userId,
            listingId,
            publishedAt,
          });
          updateData.originalPublishedAt = vinResult.originalPublishedAt;
          
          // Update VIN history with current listing ID
          await updateVinHistoryCurrentListing({
            vin: row.vin,
            userId: row.userId,
            listingId,
          });
          
          if (vinResult.isRepost) {
            if (vinResult.cooldownReset) {
              console.log(`[anti-abuse] Admin approve - VIN repost after cooldown: ${row.vin}. Fresh date granted.`);
            } else {
              console.log(`[anti-abuse] Admin approve - VIN repost detected: ${row.vin}. Using original date: ${vinResult.originalPublishedAt.toISOString()}`);
            }
          }
        } catch (error) {
          console.error(`[approveListingAsAdmin] VIN history lookup failed:`, error);
          updateData.originalPublishedAt = publishedAt;
        }
      } else {
        // No VIN - use current publish time
        updateData.originalPublishedAt = publishedAt;
      }
    }
  }

  const updated = await db
    .update(carListing)
    .set(updateData)
    .where(eq(carListing.id, listingId))
    .returning({ id: carListing.id });

  if (updated.length === 0) return null;
  
  return getListingModerationContext(listingId);
}

export async function rejectListingAsAdmin(input: {
  listingId: string;
  adminUserId: string;
  adminName?: string | null;
  reason: string;
}): Promise<ListingModerationContext | null> {
  const existing = await db
    .select({ id: carListing.id, specialNotes: carListing.specialNotes })
    .from(carListing)
    .where(eq(carListing.id, input.listingId))
    .limit(1);

  if (existing.length === 0) return null;

  const now = new Date();
  const updated = await db
    .update(carListing)
    .set({
      moderationStatus: 'rejected',
      lifecycleStatus: 'archived',
      archivedAt: now,
      lastModeratedAt: now,
      needsRemoderation: false,
      rejectionReason: input.reason,
      updatedAt: now,
    })
    .where(eq(carListing.id, input.listingId))
    .returning({ id: carListing.id });

  if (updated.length === 0) return null;
  
  return getListingModerationContext(input.listingId);
}

export async function suspendListingAsAdmin(input: {
  listingId: string;
  adminUserId: string;
  adminName?: string | null;
  reason: string;
}): Promise<ListingModerationContext | null> {
  const now = new Date();
  const existing = await db
    .select({ id: carListing.id, specialNotes: carListing.specialNotes })
    .from(carListing)
    .where(eq(carListing.id, input.listingId))
    .limit(1);

  if (existing.length === 0) return null;

  const mergedSpecialNotes = {
    ...(existing[0]?.specialNotes ?? {}),
    suspensionReason: input.reason,
    suspendedAt: now.toISOString(),
    suspendedBy: input.adminUserId,
    suspendedByName: input.adminName ?? null,
  };

  const updated = await db
    .update(carListing)
    .set({
      lifecycleStatus: 'archived',
      archivedAt: now,
      specialNotes: mergedSpecialNotes,
      updatedAt: now,
    })
    .where(eq(carListing.id, input.listingId))
    .returning({ id: carListing.id });

  if (updated.length === 0) return null;
  
  return getListingModerationContext(input.listingId);
}

export async function unsuspendListingAsAdmin(input: {
  listingId: string;
  adminUserId: string;
  adminName?: string | null;
  setLifecycleStatus?: 'active' | 'archived';
}): Promise<ListingModerationContext | null> {
  const now = new Date();
  const existing = await db
    .select({ id: carListing.id, specialNotes: carListing.specialNotes })
    .from(carListing)
    .where(eq(carListing.id, input.listingId))
    .limit(1);

  if (existing.length === 0) return null;

  const prev = (existing[0]?.specialNotes ?? {}) as any;
  const prevModeration = prev?.moderation && typeof prev.moderation === 'object' ? prev.moderation : undefined;

  const mergedSpecialNotes = {
    ...prev,
    suspensionReason: null,
    suspendedAt: null,
    suspendedBy: null,
    suspendedByName: null,
    moderation: prevModeration
      ? { ...prevModeration, action: 'unsuspended', reason: null, suspendedAt: null }
      : prevModeration,
  };

  const updated = await db
    .update(carListing)
    .set({
      lifecycleStatus: input.setLifecycleStatus ?? 'archived',
      specialNotes: mergedSpecialNotes,
      updatedAt: now,
    })
    .where(eq(carListing.id, input.listingId))
    .returning({ id: carListing.id });

  if (updated.length === 0) return null;
  
  return getListingModerationContext(input.listingId);
}
