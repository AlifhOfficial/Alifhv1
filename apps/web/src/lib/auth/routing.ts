/**
 * User Routing & Access Control Utilities - Production
 * 
 * Helper functions for determining user access levels and routing logic.
 * Used by middleware and navigation components to enforce role-based access.
 * 
 * @module lib/auth/routing
 * @see {@link docs/Auth/ROUTING_IMPLEMENTATION.md} for routing architecture
 */

import type { ExtendedUser } from "@/types/auth";

export interface UserPortalAccess {
  admin: boolean;
  partnerOwner: boolean;
  partnerStaff: boolean;
  user: boolean;
}

/**
 * Checks if user has owner role in any partner organization
 * @param user - Extended user with partner memberships
 * @returns True if user is an owner of at least one partner
 */
export function isDealerOwner(user: ExtendedUser): boolean {
  return user.partnerMemberships?.some((membership) => membership.staffRole === "owner") === true;
}

/**
 * Checks if user has partner access but is not an owner
 * Staff roles include: sales, admin, viewer, manager, staff
 * @param user - Extended user with partner memberships
 * @returns True if user has partner access as staff (non-owner)
 */
export function isDealerStaff(user: ExtendedUser): boolean {
  // Check if user has any partner membership with a non-owner role
  const hasStaffRole = user.partnerMemberships?.some((membership) => 
    membership.staffRole && membership.staffRole !== 'owner'
  ) === true;
  
  return user.hasPartnerAccess === true && hasStaffRole;
}

/**
 * Checks if user's staff membership has active billing
 * Used to gate staff dashboard access when partner billing is inactive
 * @param user - Extended user with partner memberships
 * @returns True if user has at least one staff membership with active billing
 */
export function hasActiveBillingAsStaff(user: ExtendedUser): boolean {
  return user.partnerMemberships?.some((membership) => 
    membership.staffRole !== 'owner' && membership.billingActive === true
  ) === true;
}

/**
 * Checks if user's owner membership has active billing
 * Used to gate partner dashboard access when billing is inactive
 * @param user - Extended user with partner memberships
 * @returns True if user has at least one owner membership with active billing
 */
export function hasActiveBillingAsOwner(user: ExtendedUser): boolean {
  return user.partnerMemberships?.some((membership) => 
    membership.staffRole === 'owner' && membership.billingActive === true
  ) === true;
}

/**
 * Computes all portal access flags for a user
 * Used by middleware and navigation to show/hide portal links
 * 
 * @param user - Extended user with role and membership data
 * @returns Object with boolean flags for each portal type
 */
export function getUserPortalAccess(user: ExtendedUser): UserPortalAccess {
  const owner = isDealerOwner(user);
  const staff = isDealerStaff(user);

  return {
    admin: user.isAlifhAdmin === true,
    partnerOwner: owner,
    partnerStaff: staff,
    user: true,
  };
}
