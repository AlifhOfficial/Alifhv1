import type { ExtendedUser, PartnerMembership } from "./types";

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

export function isDealerOwner(user: ExtendedUser): boolean {
  return user.partnerMemberships?.some((membership) => membership.staffRole === "owner") === true;
}

export function isDealerStaff(user: ExtendedUser): boolean {
  return user.hasPartnerAccess === true && !isDealerOwner(user);
}

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
