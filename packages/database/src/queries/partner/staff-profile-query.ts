/**
 * Staff Profile Queries - Production
 * 
 * Query functions for staff profile operations.
 * 
 * @module queries/partner/staff-profile-query
 */

import { eq, and } from 'drizzle-orm';
import { db } from '../../dbclient';
import { partnerStaff, partner } from '../../schema';

// ============================================================================
// Types
// ============================================================================

export interface StaffProfileData {
  id: string;
  displayName: string | null;
  workEmail: string | null;
  workPhone: string | null;
  title: string | null;
  department: string | null;
  role: string;
}

export interface StaffProfileWithPartner {
  id: string;
  userId: string;
  partnerId: string;
  role: string;
  isOwner: boolean;
  isPrimaryContact: boolean;
  status: string;
  displayName: string | null;
  workEmail: string | null;
  workPhone: string | null;
  joinedAt: Date | null;
  partner: {
    id: string;
    brandName: string | null;
    companyNameLegal: string | null;
    logo: string | null;
    emirate: string | null;
    city: string | null;
  };
}

export interface UpdateStaffProfileInput {
  displayName?: string | null;
  workEmail?: string | null;
  workPhone?: string | null;
}

export interface ActivePartnerStaffMembership {
  staffId: string;
  partnerId: string;
  role: string;
  isOwner: boolean;
}

// ============================================================================
// Query Functions
// ============================================================================

/**
 * Get staff profile by partner and user ID
 */
export async function getStaffProfile(
  partnerId: string,
  userId: string
): Promise<StaffProfileData | null> {
  const [record] = await db
    .select({
      id: partnerStaff.id,
      displayName: partnerStaff.displayName,
      workEmail: partnerStaff.workEmail,
      workPhone: partnerStaff.workPhone,
      title: partnerStaff.title,
      department: partnerStaff.department,
      role: partnerStaff.role,
    })
    .from(partnerStaff)
    .where(
      and(
        eq(partnerStaff.partnerId, partnerId),
        eq(partnerStaff.userId, userId)
      )
    )
    .limit(1);

  return record ?? null;
}

/**
 * Get staff profile with partner details (for non-owner staff)
 */
export async function getStaffProfileWithPartner(
  userId: string
): Promise<StaffProfileWithPartner | null> {
  const [record] = await db
    .select({
      id: partnerStaff.id,
      userId: partnerStaff.userId,
      partnerId: partnerStaff.partnerId,
      role: partnerStaff.role,
      isOwner: partnerStaff.isOwner,
      isPrimaryContact: partnerStaff.isPrimaryContact,
      status: partnerStaff.status,
      displayName: partnerStaff.displayName,
      workEmail: partnerStaff.workEmail,
      workPhone: partnerStaff.workPhone,
      joinedAt: partnerStaff.joinedAt,
      partner: {
        id: partner.id,
        brandName: partner.brandName,
        companyNameLegal: partner.companyNameLegal,
        logo: partner.logo,
        emirate: partner.emirate,
        city: partner.city,
      },
    })
    .from(partnerStaff)
    .innerJoin(partner, eq(partnerStaff.partnerId, partner.id))
    .where(
      and(
        eq(partnerStaff.userId, userId),
        eq(partnerStaff.isOwner, false),
        eq(partnerStaff.status, 'active')
      )
    )
    .limit(1);

  return record ?? null;
}

/**
 * Update staff profile
 */
export async function updateStaffProfile(
  partnerId: string,
  userId: string,
  input: UpdateStaffProfileInput
): Promise<StaffProfileData | null> {
  const [updated] = await db
    .update(partnerStaff)
    .set({
      displayName: input.displayName,
      workEmail: input.workEmail,
      workPhone: input.workPhone,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(partnerStaff.partnerId, partnerId),
        eq(partnerStaff.userId, userId)
      )
    )
    .returning({
      id: partnerStaff.id,
      displayName: partnerStaff.displayName,
      workEmail: partnerStaff.workEmail,
      workPhone: partnerStaff.workPhone,
      title: partnerStaff.title,
      department: partnerStaff.department,
      role: partnerStaff.role,
    });

  return updated ?? null;
}

/**
 * Update staff profile by staff ID (for non-owner)
 */
export async function updateStaffProfileById(
  staffId: string,
  input: UpdateStaffProfileInput
): Promise<boolean> {
  const result = await db
    .update(partnerStaff)
    .set({
      displayName: input.displayName,
      workEmail: input.workEmail,
      workPhone: input.workPhone,
      updatedAt: new Date(),
    })
    .where(eq(partnerStaff.id, staffId));

  return (result.rowCount ?? 0) > 0;
}

/**
 * Get staff ID for a non-owner user
 */
export async function getStaffIdForUser(userId: string): Promise<string | null> {
  const [record] = await db
    .select({ id: partnerStaff.id })
    .from(partnerStaff)
    .where(
      and(
        eq(partnerStaff.userId, userId),
        eq(partnerStaff.isOwner, false),
        eq(partnerStaff.status, 'active')
      )
    )
    .limit(1);

  return record?.id ?? null;
}

/**
 * Get active staff membership for a user (owner or staff)
 */
export async function getActivePartnerStaffMembershipByUserId(
  userId: string
): Promise<ActivePartnerStaffMembership | null> {
  const [record] = await db
    .select({
      staffId: partnerStaff.id,
      partnerId: partnerStaff.partnerId,
      role: partnerStaff.role,
      isOwner: partnerStaff.isOwner,
    })
    .from(partnerStaff)
    .where(and(eq(partnerStaff.userId, userId), eq(partnerStaff.status, 'active')))
    .limit(1);

  return record ?? null;
}

/**
 * Get active staff membership for a user for a specific partner
 * Useful for authorization checks in API routes when session data is incomplete.
 */
export async function getActivePartnerStaffMembershipByUserIdAndPartnerId(
  userId: string,
  partnerId: string
): Promise<ActivePartnerStaffMembership | null> {
  const [record] = await db
    .select({
      staffId: partnerStaff.id,
      partnerId: partnerStaff.partnerId,
      role: partnerStaff.role,
      isOwner: partnerStaff.isOwner,
    })
    .from(partnerStaff)
    .where(
      and(
        eq(partnerStaff.userId, userId),
        eq(partnerStaff.partnerId, partnerId),
        eq(partnerStaff.status, 'active')
      )
    )
    .limit(1);

  return record ?? null;
}
