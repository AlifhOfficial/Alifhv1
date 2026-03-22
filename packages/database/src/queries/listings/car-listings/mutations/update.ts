/**
 * Car Listing - Update Operations
 * 
 * Functions for updating existing car listings.
 * 
 * @module queries/listings/car-listings/mutations/update
 */

import { eq, and, sql, inArray } from 'drizzle-orm';
import { db } from '../../../../dbclient';
import { carListing } from '../../../../schema/listing';
import { partner } from '../../../../schema/partner';
import { conversation, conversationParticipant } from '../../../../schema/messaging';
import { 
  addDays, 
  recordPriceChange, 
  isListingPublic,
  DEFAULT_LISTING_EXPIRY_DAYS,
  computeQiScore,
  QI_SCORE_KEYS,
} from './helpers';
import { recordVinPublication, updateVinHistoryCurrentListing } from './vin-history';
import type { 
  UpdateCarListingInput, 
  CONTENT_EDIT_KEYS 
} from './types';
import type { 
  ListingModerationStatus, 
  ListingLifecycleStatus 
} from '../../../../schema/listing-constants';
import { MAJOR_CONTENT_EDIT_KEYS, MINOR_CONTENT_EDIT_KEYS } from './types';

/**
 * Check if input contains fields that affect qiScore
 */
function hasQiScoreFields(input: UpdateCarListingInput): boolean {
  return QI_SCORE_KEYS.some((k) => (input as any)[k] !== undefined);
}

/**
 * Build the common update data object from input
 * Shared between owner and staff update functions
 */
function buildUpdateData(input: UpdateCarListingInput, now: Date): Record<string, any> {
  const updateData: Record<string, any> = {};

  // Basic info
  if (input.make !== undefined) updateData.make = input.make;
  if (input.model !== undefined) updateData.model = input.model;
  if (input.year !== undefined) updateData.year = input.year;
  if (input.trim !== undefined) updateData.trim = input.trim;
  if (input.description !== undefined) updateData.description = input.description;
  if (input.vin !== undefined) updateData.vin = input.vin;
  if (input.vinVisibility !== undefined) updateData.vinVisibility = input.vinVisibility;
  if (input.condition !== undefined) updateData.condition = input.condition;

  // Pricing
  if (input.price !== undefined) updateData.price = input.price;
  if (input.currency !== undefined) updateData.currency = input.currency;
  if (input.isNegotiable !== undefined) updateData.isNegotiable = input.isNegotiable;

  // Specifications
  if (input.bodyType !== undefined) updateData.bodyType = input.bodyType;
  if (input.fuelType !== undefined) updateData.fuelType = input.fuelType;
  if (input.transmission !== undefined) updateData.transmission = input.transmission;
  if (input.specs !== undefined) updateData.specs = input.specs;
  if (input.steeringSide !== undefined) updateData.steeringSide = input.steeringSide;
  if (input.engineSize !== undefined) updateData.engineSize = input.engineSize;
  if (input.engineType !== undefined) updateData.engineType = input.engineType;
  if (input.cylinders !== undefined) updateData.cylinders = input.cylinders;
  if (input.powerRange !== undefined) updateData.powerRange = input.powerRange;
  if (input.torque !== undefined) updateData.torque = input.torque;
  if (input.fuelEconomy !== undefined) updateData.fuelEconomy = input.fuelEconomy;
  if (input.doors !== undefined) updateData.doors = input.doors;
  if (input.seatingCapacity !== undefined) updateData.seatingCapacity = input.seatingCapacity;
  if (input.exteriorColor !== undefined) updateData.exteriorColor = input.exteriorColor;
  if (input.interiorColor !== undefined) updateData.interiorColor = input.interiorColor;
  if (input.mileage !== undefined) updateData.mileage = input.mileage;

  // Export
  if (input.exportStatus !== undefined) updateData.exportStatus = input.exportStatus;
  if (input.warrantyType !== undefined) updateData.warrantyType = input.warrantyType;
  if (input.sellerType !== undefined) updateData.sellerType = input.sellerType;

  // Location
  if (input.emirate !== undefined) updateData.emirate = input.emirate;
  if (input.city !== undefined) updateData.city = input.city;

  // Media
  if (input.thumbnail !== undefined) updateData.thumbnail = input.thumbnail;
  if (input.images !== undefined) updateData.images = input.images;
  if (input.videoUrl !== undefined) updateData.videoUrl = input.videoUrl;

  // Features & Notes
  if (input.technicalFeatures !== undefined) updateData.technicalFeatures = input.technicalFeatures;
  if (input.extras !== undefined) updateData.extras = input.extras;
  if (input.specialNotes !== undefined) updateData.specialNotes = input.specialNotes;
  if (input.badges !== undefined) updateData.badges = input.badges;
  if (input.tags !== undefined) updateData.tags = input.tags;

  if (input.rejectionReason !== undefined) updateData.rejectionReason = input.rejectionReason;

  return updateData;
}

/**
 * Check if input contains any MAJOR content edits that would trigger re-moderation.
 * Only triggers when description or price ACTUALLY changed (not just present in payload).
 * Minor edits (extras, tags, specs, colors, etc.) do not trigger re-moderation.
 */
function hasMajorContentEdits(
  input: UpdateCarListingInput,
  current: { description: string | null; price: number | null }
): boolean {
  // Check if description actually changed
  if (input.description !== undefined) {
    const oldDesc = current.description ?? '';
    const newDesc = input.description ?? '';
    if (oldDesc !== newDesc) return true;
  }
  // Check if price actually changed
  if (input.price !== undefined) {
    if (current.price !== input.price) return true;
  }
  return false;
}

/**
 * Check if input contains any MINOR content edits (for lastEditedAt tracking).
 */
function hasMinorContentEdits(input: UpdateCarListingInput): boolean {
  return MINOR_CONTENT_EDIT_KEYS.some((k) => (input as any)[k] !== undefined);
}

/**
 * Apply lifecycle status updates to the update data
 * Also clears BLK status when transitioning to non-active status
 */
function applyLifecycleUpdates(
  updateData: Record<string, any>,
  lifecycleStatus: ListingLifecycleStatus | undefined,
  now: Date
): void {
  if (lifecycleStatus === undefined) return;
  
  updateData.lifecycleStatus = lifecycleStatus;
  if (lifecycleStatus === 'archived') updateData.archivedAt = now;
  if (lifecycleStatus === 'sold') updateData.soldAt = now;
  if (lifecycleStatus === 'deleted') updateData.deletedAt = now;
  
  // Clear BLK status when transitioning to non-active status
  // BLK is only valid for active listings
  if (lifecycleStatus !== 'active') {
    updateData.isBlkListing = false;
  }
}

/**
 * Apply moderation status updates to the update data
 */
function applyModerationUpdates(
  updateData: Record<string, any>,
  moderationStatus: ListingModerationStatus | undefined,
  now: Date
): void {
  if (moderationStatus === undefined) return;

  updateData.moderationStatus = moderationStatus;
  updateData.lastModeratedAt = now;

  if (moderationStatus === 'approved') {
    updateData.approvedAt = now;
    updateData.needsRemoderation = false;
    updateData.rejectionReason = null;
  } else if (moderationStatus === 'rejected') {
    updateData.needsRemoderation = false;
  } else if (moderationStatus === 'submitted' || moderationStatus === 'pending_review') {
    updateData.submittedAt = now;
    updateData.needsRemoderation = true;
  } else {
    updateData.needsRemoderation = false;
  }
}

/**
 * Ensure publish fields are set when listing becomes public
 * Also sets originalPublishedAt for anti-abuse sorting if not already set
 * 
 * IMPORTANT: When originalPublishedAt is not set, we check VIN history to
 * inherit the original publication date (anti-abuse: prevents delete & repost to bump)
 */
async function ensurePublishFields(
  updateData: Record<string, any>,
  currentPublishedAt: Date | null,
  currentOriginalPublishedAt: Date | null,
  currentExpiresAt: Date | null,
  nextModerationStatus: ListingModerationStatus,
  nextLifecycleStatus: ListingLifecycleStatus,
  now: Date,
  listingId: string,
  userId: string,
  vin: string | null
): Promise<void> {
  const willBePublic = nextModerationStatus === 'approved' && nextLifecycleStatus === 'active';

  if (willBePublic && (!currentPublishedAt || !currentExpiresAt || !currentOriginalPublishedAt)) {
    const publishedAt = currentPublishedAt ?? now;
    if (!currentPublishedAt) updateData.publishedAt = publishedAt;
    if (!currentExpiresAt) updateData.expiresAt = addDays(publishedAt, DEFAULT_LISTING_EXPIRY_DAYS);
    
    // Set originalPublishedAt for anti-abuse sorting
    // Check VIN history to inherit original date (prevents delete & repost abuse)
    if (!currentOriginalPublishedAt) {
      if (vin) {
        try {
          const vinResult = await recordVinPublication({
            vin,
            userId,
            listingId,
            publishedAt,
          });
          updateData.originalPublishedAt = vinResult.originalPublishedAt;
          
          // Update VIN history with current listing ID (listing exists in updates)
          await updateVinHistoryCurrentListing({
            vin,
            userId,
            listingId,
          });
          
          if (vinResult.isRepost) {
            if (vinResult.cooldownReset) {
              console.log(`[anti-abuse] VIN repost after cooldown: ${vin} by user ${userId}. Fresh date granted.`);
            } else {
              console.log(`[anti-abuse] VIN repost detected on update: ${vin} by user ${userId}. Using original date: ${vinResult.originalPublishedAt.toISOString()}`);
            }
          }
        } catch (error) {
          console.error(`[ensurePublishFields] VIN history lookup failed:`, error);
          updateData.originalPublishedAt = publishedAt;
        }
      } else {
        // No VIN - use current publish time
        updateData.originalPublishedAt = publishedAt;
      }
    }
  }
}

/**
 * Update an existing car listing
 * Only allows updates by the listing owner or staff
 * 
 * Price changes are automatically recorded in listing_price_history table
 */
export async function updateCarListing(
  listingId: string,
  userId: string,
  input: UpdateCarListingInput
): Promise<boolean> {
  const now = new Date();

  const existing = await db
    .select({
      id: carListing.id,
      postedByRole: carListing.postedByRole,
      moderationStatus: carListing.moderationStatus,
      lifecycleStatus: carListing.lifecycleStatus,
      publishedAt: carListing.publishedAt,
      originalPublishedAt: carListing.originalPublishedAt,
      expiresAt: carListing.expiresAt,
      price: carListing.price,
      vin: carListing.vin,
      // BLK tracking
      isBlkListing: carListing.isBlkListing,
      partnerId: carListing.partnerId,
      // QiScore fields for recomputation
      images: carListing.images,
      description: carListing.description,
      extras: carListing.extras,
      tags: carListing.tags,
      videoUrl: carListing.videoUrl,
      partnerVerified: carListing.partnerVerified,
      vinVisibility: carListing.vinVisibility,
    })
    .from(carListing)
    .where(and(eq(carListing.id, listingId), eq(carListing.userId, userId)))
    .limit(1);

  if (existing.length === 0) return false;

  const current = existing[0];
  const oldPrice = current.price;
  const isCurrentlyPublic = isListingPublic(
    current.moderationStatus,
    current.lifecycleStatus,
    current.expiresAt,
    now
  );
  const canSelfModerate = current.postedByRole === 'staff';

  const updateData: Record<string, any> = {
    updatedAt: now,
    lastEditedAt: now,
    ...buildUpdateData(input, now),
  };

  // Recompute qiScore if any quality-affecting fields changed
  if (hasQiScoreFields(input)) {
    updateData.qiScore = computeQiScore({
      images: input.images ?? current.images,
      description: input.description ?? current.description,
      extras: input.extras ?? current.extras,
      tags: input.tags ?? current.tags,
      videoUrl: input.videoUrl ?? current.videoUrl,
      partnerVerified: current.partnerVerified ?? false, // Admin-controlled, not user-editable
      vinVisibility: input.vinVisibility ?? current.vinVisibility ?? 'public',
    });
  }

  // Lifecycle updates (owner-controlled)
  applyLifecycleUpdates(updateData, input.lifecycleStatus, now);

  // Moderation updates (only staff-posted listings can self-moderate)
  if (input.moderationStatus !== undefined) {
    if (!canSelfModerate && input.moderationStatus !== 'draft' && input.moderationStatus !== 'submitted') {
      throw new Error('Not authorized to change moderation status for this listing');
    }
    applyModerationUpdates(updateData, input.moderationStatus, now);
  }

  // User-posted listings: MAJOR edits while public trigger re-moderation (V1: hide on edit).
  // Minor edits (extras, tags, specs, colors, etc.) do NOT trigger re-moderation.
  if (current.postedByRole === 'user' && isCurrentlyPublic && hasMajorContentEdits(input, current)) {
    updateData.moderationStatus = 'pending_review';
    // Don't update submittedAt - keep original submission date so listing doesn't appear as new
    updateData.lastModeratedAt = now;
    updateData.needsRemoderation = true;
  }

  // Ensure publish fields are set the first time it becomes public.
  const nextModerationStatus = (updateData.moderationStatus ?? current.moderationStatus) as ListingModerationStatus;
  const nextLifecycleStatus = (updateData.lifecycleStatus ?? current.lifecycleStatus) as ListingLifecycleStatus;
  await ensurePublishFields(
    updateData,
    current.publishedAt,
    current.originalPublishedAt,
    current.expiresAt,
    nextModerationStatus,
    nextLifecycleStatus,
    now,
    listingId,
    userId,
    input.vin ?? current.vin
  );

  // Staff/admin-controlled timestamp overrides (ignored for user-posted listings).
  if (canSelfModerate) {
    if (input.submittedAt !== undefined) updateData.submittedAt = input.submittedAt;
    if (input.approvedAt !== undefined) updateData.approvedAt = input.approvedAt;
    if (input.lastModeratedAt !== undefined) updateData.lastModeratedAt = input.lastModeratedAt;
    if (input.needsRemoderation !== undefined) updateData.needsRemoderation = input.needsRemoderation;
    if (input.publishedAt !== undefined) updateData.publishedAt = input.publishedAt;
    if (input.expiresAt !== undefined) updateData.expiresAt = input.expiresAt;
    if (input.deletedAt !== undefined) updateData.deletedAt = input.deletedAt;
    if (input.rejectionReason !== undefined) updateData.rejectionReason = input.rejectionReason;
  }

  // Perform update and record price history in parallel for better performance
  const newPrice = input.price;
  const priceChanged = newPrice !== undefined && newPrice !== oldPrice;

  // Check if BLK status is being cleared due to lifecycle change
  const wasBlk = current.isBlkListing;
  const blkBeingCleared = wasBlk && updateData.isBlkListing === false;

  const [result] = await Promise.all([
    db.update(carListing)
      .set(updateData)
      .where(and(eq(carListing.id, listingId), eq(carListing.userId, userId)))
      .returning({ id: carListing.id }),
    // Record price history if price changed (with error handling)
    priceChanged 
      ? recordPriceChange(listingId, oldPrice, newPrice, userId).catch((err) => {
          console.error(`[updateCarListing] Failed to record price history for ${listingId}:`, err);
          // Don't fail the update if price history fails
          return null;
        })
      : Promise.resolve(),
  ]);

  // Decrement partner BLK count if BLK status was cleared
  if (result.length > 0 && blkBeingCleared && current.partnerId) {
    await db
      .update(partner)
      .set({
        activeBlackListingsCount: sql`GREATEST(0, ${partner.activeBlackListingsCount} - 1)`,
        updatedAt: now,
      })
      .where(eq(partner.id, current.partnerId));
    console.log(`[blk-cleanup] Cleared BLK on lifecycle change for listing ${listingId}, partner: ${current.partnerId}`);
  }

  return result.length > 0;
}

/**
 * Update listing by staff (no user ownership check)
 * Used by admin/staff to modify any listing
 * 
 * Price changes are automatically recorded in listing_price_history table
 */
export async function updateCarListingByStaff(
  listingId: string,
  input: UpdateCarListingInput,
  staffUserId?: string // Optional: staff user ID for price history tracking
): Promise<boolean> {
  const now = new Date();

  const existing = await db
    .select({
      id: carListing.id,
      userId: carListing.userId,
      postedByRole: carListing.postedByRole,
      moderationStatus: carListing.moderationStatus,
      lifecycleStatus: carListing.lifecycleStatus,
      publishedAt: carListing.publishedAt,
      originalPublishedAt: carListing.originalPublishedAt,
      expiresAt: carListing.expiresAt,
      price: carListing.price,
      vin: carListing.vin,
      // BLK tracking
      isBlkListing: carListing.isBlkListing,
      partnerId: carListing.partnerId,
      // QiScore fields for recomputation
      images: carListing.images,
      description: carListing.description,
      extras: carListing.extras,
      tags: carListing.tags,
      videoUrl: carListing.videoUrl,
      partnerVerified: carListing.partnerVerified,
      vinVisibility: carListing.vinVisibility,
    })
    .from(carListing)
    .where(eq(carListing.id, listingId))
    .limit(1);

  if (existing.length === 0) return false;

  const current = existing[0];
  const oldPrice = current.price;
  const isCurrentlyPublic = isListingPublic(
    current.moderationStatus,
    current.lifecycleStatus,
    current.expiresAt,
    now
  );

  const updateData: Record<string, any> = {
    updatedAt: now,
    ...buildUpdateData(input, now),
  };

  // Recompute qiScore if any quality-affecting fields changed
  if (hasQiScoreFields(input)) {
    updateData.qiScore = computeQiScore({
      images: input.images ?? current.images,
      description: input.description ?? current.description,
      extras: input.extras ?? current.extras,
      tags: input.tags ?? current.tags,
      videoUrl: input.videoUrl ?? current.videoUrl,
      partnerVerified: current.partnerVerified ?? false, // Admin-controlled, not user-editable
      vinVisibility: input.vinVisibility ?? current.vinVisibility ?? 'public',
    });
  }

  // Only treat as an "edit" when content/lifecycle changes (not just moderation).
  // Use major content check + minor content keys for lastEditedAt
  if (hasMajorContentEdits(input, current) || hasMinorContentEdits(input) || input.lifecycleStatus !== undefined) {
    updateData.lastEditedAt = now;
  }

  // Lifecycle updates
  applyLifecycleUpdates(updateData, input.lifecycleStatus, now);

  // Moderation updates (staff/admin controlled)
  applyModerationUpdates(updateData, input.moderationStatus, now);

  // User-posted listings: MAJOR edits while public trigger re-moderation (V1: hide on edit).
  // Minor edits (extras, tags, specs, colors, etc.) do NOT trigger re-moderation.
  // Skip re-moderation if admin explicitly set moderationStatus to 'approved' (admin override).
  const adminApproved = input.moderationStatus === 'approved';
  if (current.postedByRole === 'user' && isCurrentlyPublic && hasMajorContentEdits(input, current) && !adminApproved) {
    updateData.moderationStatus = 'pending_review';
    // Don't update submittedAt - keep original submission date so listing doesn't appear as new
    updateData.lastModeratedAt = now;
    updateData.needsRemoderation = true;
  }

  // Ensure publish fields are set the first time it becomes public.
  const nextModerationStatus = (updateData.moderationStatus ?? current.moderationStatus) as ListingModerationStatus;
  const nextLifecycleStatus = (updateData.lifecycleStatus ?? current.lifecycleStatus) as ListingLifecycleStatus;
  await ensurePublishFields(
    updateData,
    current.publishedAt,
    current.originalPublishedAt,
    current.expiresAt,
    nextModerationStatus,
    nextLifecycleStatus,
    now,
    listingId,
    current.userId,
    input.vin ?? current.vin
  );

  // Explicit overrides (admin/system)
  if (input.submittedAt !== undefined) updateData.submittedAt = input.submittedAt;
  if (input.approvedAt !== undefined) updateData.approvedAt = input.approvedAt;
  if (input.lastModeratedAt !== undefined) updateData.lastModeratedAt = input.lastModeratedAt;
  if (input.needsRemoderation !== undefined) updateData.needsRemoderation = input.needsRemoderation;
  if (input.publishedAt !== undefined) updateData.publishedAt = input.publishedAt;
  if (input.expiresAt !== undefined) updateData.expiresAt = input.expiresAt;
  if (input.deletedAt !== undefined) updateData.deletedAt = input.deletedAt;

  // Perform update and record price history in parallel for better performance
  const newPrice = input.price;
  const priceChanged = newPrice !== undefined && newPrice !== oldPrice;

  const [result] = await Promise.all([
    db.update(carListing)
      .set(updateData)
      .where(eq(carListing.id, listingId))
      .returning({ id: carListing.id }),
    // Record price history if price changed (staff userId is optional, with error handling)
    priceChanged 
      ? recordPriceChange(listingId, oldPrice, newPrice, staffUserId ?? null, 'Staff update').catch((err) => {
          console.error(`[updateCarListingByStaff] Failed to record price history for ${listingId}:`, err);
          // Don't fail the update if price history fails
          return null;
        })
      : Promise.resolve(),
  ]);

  // Decrement partner BLK count if BLK status was cleared
  const wasBlk = current.isBlkListing;
  const blkBeingCleared = wasBlk && updateData.isBlkListing === false;
  
  if (result.length > 0 && blkBeingCleared && current.partnerId) {
    await db
      .update(partner)
      .set({
        activeBlackListingsCount: sql`GREATEST(0, ${partner.activeBlackListingsCount} - 1)`,
        updatedAt: now,
      })
      .where(eq(partner.id, current.partnerId));
    console.log(`[blk-cleanup] Cleared BLK on staff lifecycle change for listing ${listingId}, partner: ${current.partnerId}`);
  }

  return result.length > 0;
}

/**
 * Reassign a listing to a different staff member
 * Used when staff leaves or for workload balancing
 * Only changes the userId (manager), not the partnerId (owner)
 * 
 * Also reassigns:
 * - Conversation participants (replaces old staff with new staff in listing conversations)
 */
export async function reassignListingManager(input: {
  listingId: string;
  newUserId: string;
  partnerId: string;
}): Promise<{ id: string; userId: string; conversationsReassigned: number }> {
  const now = new Date();

  // First, get the current listing to find the old userId
  const [currentListing] = await db
    .select({ userId: carListing.userId })
    .from(carListing)
    .where(
      and(
        eq(carListing.id, input.listingId),
        eq(carListing.partnerId, input.partnerId)
      )
    );

  if (!currentListing) {
    throw new Error('Listing not found or not owned by this partner');
  }

  const oldUserId = currentListing.userId;

  // Don't do anything if reassigning to the same user
  if (oldUserId === input.newUserId) {
    return { id: input.listingId, userId: input.newUserId, conversationsReassigned: 0 };
  }

  // Update the listing
  const [result] = await db
    .update(carListing)
    .set({
      userId: input.newUserId,
      updatedAt: now,
    })
    .where(
      and(
        eq(carListing.id, input.listingId),
        eq(carListing.partnerId, input.partnerId)
      )
    )
    .returning({ id: carListing.id, userId: carListing.userId });

  if (!result) {
    throw new Error('Failed to update listing');
  }

  // Find all conversations for this listing where the old staff is a participant
  // OPTIMIZED: Use JOINs instead of N+1 queries
  const conversationsWithOldStaff = await db
    .select({
      conversationId: conversation.id,
      participantId: conversationParticipant.id,
    })
    .from(conversation)
    .innerJoin(
      conversationParticipant,
      and(
        eq(conversationParticipant.conversationId, conversation.id),
        eq(conversationParticipant.userId, oldUserId)
      )
    )
    .where(eq(conversation.listingId, input.listingId));

  if (conversationsWithOldStaff.length === 0) {
    return { ...result, conversationsReassigned: 0 };
  }

  const conversationIds = conversationsWithOldStaff.map(c => c.conversationId);
  const participantIdsToUpdate = conversationsWithOldStaff.map(c => c.participantId);

  // Check which conversations already have the new staff as a participant
  const existingNewStaffParticipants = await db
    .select({ conversationId: conversationParticipant.conversationId })
    .from(conversationParticipant)
    .where(
      and(
        inArray(conversationParticipant.conversationId, conversationIds),
        eq(conversationParticipant.userId, input.newUserId)
      )
    );

  const conversationsWithNewStaff = new Set(
    existingNewStaffParticipants.map(p => p.conversationId)
  );

  // Split participants: those to mark as left vs those to reassign
  const participantsToMarkLeft: string[] = [];
  const participantsToReassign: string[] = [];

  for (const conv of conversationsWithOldStaff) {
    if (conversationsWithNewStaff.has(conv.conversationId)) {
      // New staff already exists, mark old staff as left
      participantsToMarkLeft.push(conv.participantId);
    } else {
      // Reassign old staff to new staff
      participantsToReassign.push(conv.participantId);
    }
  }

  // Batch update: mark old staff as left
  if (participantsToMarkLeft.length > 0) {
    await db
      .update(conversationParticipant)
      .set({ leftAt: now, updatedAt: now })
      .where(inArray(conversationParticipant.id, participantsToMarkLeft));
  }

  // Batch update: reassign to new staff
  if (participantsToReassign.length > 0) {
    await db
      .update(conversationParticipant)
      .set({
        userId: input.newUserId,
        updatedAt: now,
        unreadCount: 0,
      })
      .where(inArray(conversationParticipant.id, participantsToReassign));
  }

  return { ...result, conversationsReassigned: conversationsWithOldStaff.length };
}
