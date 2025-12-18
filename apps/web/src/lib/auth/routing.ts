/**
 * User Routing & Access Control Utilities - Production
 * 
 * Helper functions for determining user access levels and routing logic.
 * Used by middleware and navigation components to enforce role-based access.
 * 
 * @module lib/auth/routing
 * @see {@link docs/Auth/ROUTING_IMPLEMENTATION.md} for routing architecture
 */

import type { ExtendedUser, PartnerMembership } from "@/types/auth";

export interface UserPortalAccess {
  admin: boolean;
  partnerOwner: boolean;
  partnerStaff: boolean;
  user: boolean;
}

export interface UserPartnerContext {
  totalActivePartners: number;
  defaultPartnerId: string | null;
  ownerPartnerIds: string[];
  staffPartnerIds: string[];
}

/**
 * Determines default redirect path based on user's highest privilege level
 * Priority: Admin → Partner Owner → Partner Staff → User
 * 
 * @param user - Extended user with role and membership data
 * @returns Default dashboard route for the user
 */
export function getDefaultRedirect(user: ExtendedUser): string {
  if (user.isAlifhAdmin) {
    return "/admin-dashboard";
  }

  if (user.hasPartnerAccess) {
    const hasOwnerRole = user.partnerMemberships?.some(
      (membership) => membership.staffRole === "owner"
    );

    if (hasOwnerRole) {
      return "/partner-dashboard";
    }

    return "/staff-dashboard";
  }

  return "/user-dashboard";
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
 * @param user - Extended user with partner memberships
 * @returns True if user has partner access as staff (non-owner)
 */
export function isDealerStaff(user: ExtendedUser): boolean {
  return user.hasPartnerAccess === true && !isDealerOwner(user);
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

/**
 * Extracts partner membership context for dashboard initialization
 * Provides default partner selection and categorizes memberships by role
 * 
 * @param user - Extended user with partner memberships
 * @returns Context object with partner IDs and counts
 */
export function getUserPartnerContext(user: ExtendedUser): UserPartnerContext {
  const memberships: PartnerMembership[] = user.partnerMemberships ?? [];

  const ownerPartnerIds = memberships
    .filter((membership) => membership.staffRole === "owner")
    .map((membership) => membership.partnerId);

  const staffPartnerIds = memberships
    .filter((membership) => membership.staffRole !== "owner")
    .map((membership) => membership.partnerId);

  const defaultPartnerId =
    ownerPartnerIds[0] ?? memberships[0]?.partnerId ?? null;

  return {
    totalActivePartners: memberships.length,
    defaultPartnerId,
    ownerPartnerIds,
    staffPartnerIds,
  };
}
