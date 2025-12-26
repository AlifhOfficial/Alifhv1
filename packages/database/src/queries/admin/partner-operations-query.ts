/**
 * Admin Partner Operations Queries
 * 
 * Direct database operations for admin partner management
 * Similar structure to user operations
 * 
 * @module queries/admin/partner-operations-query
 */

import { eq } from 'drizzle-orm';
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
 */
export async function updatePartnerTier(input: {
  partnerId: string;
  tier: 'standard' | 'gold' | 'platinum' | 'black';
}) {
  const [updated] = await db
    .update(partner)
    .set({
      tier: input.tier,
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
// Tag Operations
// ============================================================================

/**
 * Add tag to partner
 */
export async function addPartnerTag(partnerId: string, tag: string) {
  const [partnerData] = await db
    .select()
    .from(partner)
    .where(eq(partner.id, partnerId))
    .limit(1);

  if (!partnerData) {
    throw new Error('Partner not found');
  }

  const currentTags = (partnerData.tags as string[]) || [];
  if (currentTags.includes(tag)) {
    return partnerData; // Already has this tag
  }

  const newTags = [...currentTags, tag];

  const [updated] = await db
    .update(partner)
    .set({
      tags: newTags,
      updatedAt: new Date(),
    })
    .where(eq(partner.id, partnerId))
    .returning();

  return updated;
}

/**
 * Remove tag from partner
 */
export async function removePartnerTag(partnerId: string, tag: string) {
  const [partnerData] = await db
    .select()
    .from(partner)
    .where(eq(partner.id, partnerId))
    .limit(1);

  if (!partnerData) {
    throw new Error('Partner not found');
  }

  const currentTags = (partnerData.tags as string[]) || [];
  const newTags = currentTags.filter(t => t !== tag);

  const [updated] = await db
    .update(partner)
    .set({
      tags: newTags,
      updatedAt: new Date(),
    })
    .where(eq(partner.id, partnerId))
    .returning();

  return updated;
}

// ============================================================================
// Badge Operations
// ============================================================================

/**
 * Add badge to partner
 */
export async function addPartnerBadge(partnerId: string, badge: string) {
  const [partnerData] = await db
    .select()
    .from(partner)
    .where(eq(partner.id, partnerId))
    .limit(1);

  if (!partnerData) {
    throw new Error('Partner not found');
  }

  const currentBadges = (partnerData.badges as string[]) || [];
  if (currentBadges.includes(badge)) {
    return partnerData; // Already has this badge
  }

  const newBadges = [...currentBadges, badge];

  const [updated] = await db
    .update(partner)
    .set({
      badges: newBadges,
      updatedAt: new Date(),
    })
    .where(eq(partner.id, partnerId))
    .returning();

  return updated;
}

/**
 * Remove badge from partner
 */
export async function removePartnerBadge(partnerId: string, badge: string) {
  const [partnerData] = await db
    .select()
    .from(partner)
    .where(eq(partner.id, partnerId))
    .limit(1);

  if (!partnerData) {
    throw new Error('Partner not found');
  }

  const currentBadges = (partnerData.badges as string[]) || [];
  const newBadges = currentBadges.filter(b => b !== badge);

  const [updated] = await db
    .update(partner)
    .set({
      badges: newBadges,
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
