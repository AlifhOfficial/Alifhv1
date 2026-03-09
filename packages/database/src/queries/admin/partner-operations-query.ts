/**
 * Admin Partner Operations Queries
 * 
 * Direct database operations for admin partner management
 * Uses atomic PostgreSQL operations for concurrent safety
 * 
 * @module queries/admin/partner-operations-query
 */

import { eq, sql } from 'drizzle-orm';
import { db } from '../../dbclient';
import { partner } from '../../schema/partner';

// ============================================================================
// Status Operations
// ============================================================================

/**
 * Suspend a partner
 */
export async function suspendPartner(input: {
  partnerId: string;
  reason: string;
  suspendedBy: string; // admin user id
}) {
  const [updated] = await db
    .update(partner)
    .set({
      status: 'suspended',
      updatedAt: new Date(),
    })
    .where(eq(partner.id, input.partnerId))
    .returning();

  return updated;
}

/**
 * Activate/unsuspend a partner
 */
export async function activatePartner(partnerId: string) {
  const [updated] = await db
    .update(partner)
    .set({
      status: 'active',
      updatedAt: new Date(),
    })
    .where(eq(partner.id, partnerId))
    .returning();

  return updated;
}

/**
 * Cancel partner (permanent deactivation)
 */
export async function cancelPartner(partnerId: string) {
  const [updated] = await db
    .update(partner)
    .set({
      status: 'cancelled',
      updatedAt: new Date(),
    })
    .where(eq(partner.id, partnerId))
    .returning();

  return updated;
}

// ============================================================================
// Tier Operations
// ============================================================================

/**
 * Update partner tier
 * Also updates blackListingQuota based on tier:
 * - Black tier: 5 black listing slots
 * - Flow tier: 1 black listing slot
 */
export async function updatePartnerTier(input: {
  partnerId: string;
  tier: 'flow' | 'black';
}) {
  // Set black listing quota based on tier
  const blackListingQuota = input.tier === 'black' ? 5 : 1;
  
  const [updated] = await db
    .update(partner)
    .set({
      tier: input.tier,
      blackListingQuota,
      updatedAt: new Date(),
    })
    .where(eq(partner.id, input.partnerId))
    .returning();

  return updated;
}

// ============================================================================
// Verification Operations
// ============================================================================

/**
 * Verify partner
 */
export async function verifyPartner(input: {
  partnerId: string;
  verifiedBy: string; // admin user id
}) {
  const [updated] = await db
    .update(partner)
    .set({
      isVerified: true,
      verifiedAt: new Date(),
      verifiedBy: input.verifiedBy,
      updatedAt: new Date(),
    })
    .where(eq(partner.id, input.partnerId))
    .returning();

  return updated;
}

/**
 * Unverify partner
 */
export async function unverifyPartner(partnerId: string) {
  const [updated] = await db
    .update(partner)
    .set({
      isVerified: false,
      verifiedAt: null,
      verifiedBy: null,
      updatedAt: new Date(),
    })
    .where(eq(partner.id, partnerId))
    .returning();

  return updated;
}

// ============================================================================
// Tag Operations (atomic - no race conditions)
// ============================================================================

/**
 * Add tag to partner (atomic)
 */
export async function addPartnerTag(partnerId: string, tag: string) {
  const [updated] = await db
    .update(partner)
    .set({
      tags: sql`array_append(coalesce(${partner.tags}, '{}'), ${tag})`,
      updatedAt: new Date(),
    })
    .where(sql`${partner.id} = ${partnerId} AND NOT (${tag} = ANY(coalesce(${partner.tags}, '{}')))`)
    .returning();

  // If no update (tag already exists), fetch current partner
  if (!updated) {
    const [partnerData] = await db.select().from(partner).where(eq(partner.id, partnerId)).limit(1);
    return partnerData;
  }

  return updated;
}

/**
 * Remove tag from partner (atomic)
 */
export async function removePartnerTag(partnerId: string, tag: string) {
  const [updated] = await db
    .update(partner)
    .set({
      tags: sql`array_remove(coalesce(${partner.tags}, '{}'), ${tag})`,
      updatedAt: new Date(),
    })
    .where(eq(partner.id, partnerId))
    .returning();

  return updated;
}

// ============================================================================
// Badge Operations (atomic - no race conditions)
// ============================================================================

/**
 * Add badge to partner (atomic)
 */
export async function addPartnerBadge(partnerId: string, badge: string) {
  const [updated] = await db
    .update(partner)
    .set({
      badges: sql`array_append(coalesce(${partner.badges}, '{}'), ${badge})`,
      updatedAt: new Date(),
    })
    .where(sql`${partner.id} = ${partnerId} AND NOT (${badge} = ANY(coalesce(${partner.badges}, '{}')))`)
    .returning();

  // If no update (badge already exists), fetch current partner
  if (!updated) {
    const [partnerData] = await db.select().from(partner).where(eq(partner.id, partnerId)).limit(1);
    return partnerData;
  }

  return updated;
}

/**
 * Remove badge from partner (atomic)
 */
export async function removePartnerBadge(partnerId: string, badge: string) {
  const [updated] = await db
    .update(partner)
    .set({
      badges: sql`array_remove(coalesce(${partner.badges}, '{}'), ${badge})`,
      updatedAt: new Date(),
    })
    .where(eq(partner.id, partnerId))
    .returning();

  return updated;
}

// ============================================================================
// Delete Partner
// ============================================================================

/**
 * Admin delete partner (hard delete - use with caution)
 */
export async function adminDeletePartner(partnerId: string) {
  const deleted = await db
    .delete(partner)
    .where(eq(partner.id, partnerId))
    .returning();

  return Array.isArray(deleted) ? deleted[0] : deleted;
}
