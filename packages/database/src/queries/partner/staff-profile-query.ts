/**
 * Staff Profile Queries - Production
 * 
 * Query functions for staff profile operations.
 * 
 * @module queries/partner/staff-profile-query
 */

import { eq, and } from 'drizzle-orm';
import { db } from '../../dbclient';
import { partnerStaff, partner, user, userProfile } from '../../schema';
import { memoryCache, CacheKeys, CacheTTL } from '../../caches/memory-cache';

// ============================================================================
// Types
// ============================================================================

export interface StaffProfileData {
  id: string;
  displayName: string | null;
  workPhone: string | null;
  usePersonalPhone: boolean;
  workPhoneVerified: boolean;
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
  workPhone: string | null;
  usePersonalPhone: boolean;
  workPhoneVerified: boolean;
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
  workPhone?: string | null;
  usePersonalPhone?: boolean;
  workPhoneVerified?: boolean;
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
      workPhone: partnerStaff.workPhone,
      usePersonalPhone: partnerStaff.usePersonalPhone,
      workPhoneVerified: partnerStaff.workPhoneVerified,
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
      workPhone: partnerStaff.workPhone,
      usePersonalPhone: partnerStaff.usePersonalPhone,
      workPhoneVerified: partnerStaff.workPhoneVerified,
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
      ...(input.displayName !== undefined && { displayName: input.displayName }),
      ...(input.workPhone !== undefined && { workPhone: input.workPhone }),
      ...(input.usePersonalPhone !== undefined && { usePersonalPhone: input.usePersonalPhone }),
      ...(input.workPhoneVerified !== undefined && { workPhoneVerified: input.workPhoneVerified }),
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
      workPhone: partnerStaff.workPhone,
      usePersonalPhone: partnerStaff.usePersonalPhone,
      workPhoneVerified: partnerStaff.workPhoneVerified,
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
      ...(input.displayName !== undefined && { displayName: input.displayName }),
      ...(input.workPhone !== undefined && { workPhone: input.workPhone }),
      ...(input.usePersonalPhone !== undefined && { usePersonalPhone: input.usePersonalPhone }),
      ...(input.workPhoneVerified !== undefined && { workPhoneVerified: input.workPhoneVerified }),
      updatedAt: new Date(),
    })
    .where(eq(partnerStaff.id, staffId));

  return (result.rowCount ?? 0) > 0;
}

/**
 * Get staff effective phone for contact display
 * Priority: 1. Work phone (if set and not using personal)
 *           2. Personal phone from user profile
 * 
 * Cached for 5 minutes - invalidated on staff profile updates via invalidateStaffPhone()
 * 
 * @param staffUserId - The user ID of the staff member
 * @param partnerId - The partner ID (for staff lookup)
 * @returns The effective phone number to display, or null
 */
export async function getStaffEffectivePhone(
  staffUserId: string,
  partnerId: string
): Promise<{ phone: string | null; displayName: string | null }> {
  // Check cache first
  const cacheKey = CacheKeys.staffPhone(staffUserId, partnerId);
  const cached = memoryCache.get<{ phone: string | null; displayName: string | null }>(cacheKey);
  if (cached) {
    return cached;
  }

  const [result] = await db
    .select({
      workPhone: partnerStaff.workPhone,
      usePersonalPhone: partnerStaff.usePersonalPhone,
      displayName: partnerStaff.displayName,
      personalPhone: userProfile.phone,
      userName: user.name,
    })
    .from(partnerStaff)
    .innerJoin(user, eq(user.id, partnerStaff.userId))
    .leftJoin(userProfile, eq(userProfile.userId, partnerStaff.userId))
    .where(
      and(
        eq(partnerStaff.userId, staffUserId),
        eq(partnerStaff.partnerId, partnerId),
        eq(partnerStaff.status, 'active')
      )
    )
    .limit(1);

  if (!result) {
    const empty = { phone: null, displayName: null };
    memoryCache.set(cacheKey, empty, CacheTTL.staffPhone);
    return empty;
  }

  // Priority: work phone (if not using personal) → personal phone
  const effectivePhone = result.usePersonalPhone 
    ? result.personalPhone 
    : (result.workPhone ?? result.personalPhone);

  // Display name with fallback to user name
  const effectiveDisplayName = result.displayName ?? result.userName;

  const response = { 
    phone: effectivePhone, 
    displayName: effectiveDisplayName 
  };
  
  // Cache for 5 minutes
  memoryCache.set(cacheKey, response, CacheTTL.staffPhone);
  
  return response;
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
