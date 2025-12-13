/**
 * Auth Routing Logic
 * 
 * Centralized routing decisions based on user session
 */

export type PortalType = 'public' | 'user' | 'partner' | 'admin';

export interface PortalAccess {
  canAccessPublic: boolean;
  canAccessUser: boolean;
  canAccessPartner: boolean;
  canAccessAdmin: boolean;
}

export interface ExtendedUser {
  id: string;
  role: 'user' | 'admin' | 'super_admin';
  hasPartnerAccess?: boolean;
  isAlifhAdmin?: boolean;
  partnerMemberships?: Array<{
    staffId: string;
    partnerId: string;
    partnerName: string;
    staffRole: string;
  }>;
}

/**
 * Determine which portals a user can access
 */
export function getUserPortalAccess(user: ExtendedUser | null): PortalAccess {
  if (!user) {
    return {
      canAccessPublic: true,
      canAccessUser: false,
      canAccessPartner: false,
      canAccessAdmin: false,
    };
  }

  return {
    canAccessPublic: true,
    canAccessUser: true,
    canAccessPartner: user.hasPartnerAccess === true,
    canAccessAdmin: user.isAlifhAdmin === true,
  };
}

/**
 * Get default redirect after login based on user's highest privilege
 */
export function getDefaultRedirect(user: ExtendedUser): string {
  // Priority: Admin > Partner > User
  
  if (user.isAlifhAdmin) {
    return '/admin-dashboard';
  }
  
  if (user.hasPartnerAccess) {
    // Check if user is owner or staff
    const hasOwnerRole = user.partnerMemberships?.some(m => m.staffRole === 'owner');
    if (hasOwnerRole) {
      return '/partner-dashboard';
    }
    return '/staff-dashboard';
  }
  
  return '/user-dashboard';
}

/**
 * Check if user can access a specific portal
 */
export function canAccessPortal(user: ExtendedUser | null, portal: PortalType): boolean {
  const access = getUserPortalAccess(user);
  
  switch (portal) {
    case 'public':
      return access.canAccessPublic;
    case 'user':
      return access.canAccessUser;
    case 'partner':
      return access.canAccessPartner;
    case 'admin':
      return access.canAccessAdmin;
    default:
      return false;
  }
}

/**
 * Get user's primary role display name
 */
export function getUserRoleDisplay(user: ExtendedUser): string {
  if (user.role === 'super_admin') return 'Super Admin';
  if (user.role === 'admin') return 'Admin';
  
  // Check partner role
  if (user.hasPartnerAccess && user.partnerMemberships?.[0]) {
    const primaryMembership = user.partnerMemberships[0];
    switch (primaryMembership.staffRole) {
      case 'owner':
        return 'Dealer Owner';
      case 'admin':
        return 'Dealer Manager';
      case 'sales':
        return 'Sales Staff';
      case 'viewer':
        return 'Viewer';
      default:
        return 'Partner Staff';
    }
  }
  
  return 'User';
}

/**
 * Get user's partner context (if they have multiple)
 */
export function getUserPartnerContext(user: ExtendedUser): {
  partners: Array<{
    staffId: string;
    partnerId: string;
    partnerName: string;
    staffRole: string;
  }>;
  defaultPartnerId: string | null;
  hasMultiplePartnerships: boolean;
} {
  const partners = user.partnerMemberships || [];
  return {
    partners,
    defaultPartnerId: partners[0]?.partnerId || null,
    hasMultiplePartnerships: partners.length > 1,
  };
}

/**
 * Check if user is a dealer owner (has 'owner' role in any partnership)
 */
export function isDealerOwner(user: ExtendedUser): boolean {
  return user.partnerMemberships?.some(m => m.staffRole === 'owner') === true;
}

/**
 * Check if user is dealer staff (has partner access but not owner)
 */
export function isDealerStaff(user: ExtendedUser): boolean {
  return (
    user.hasPartnerAccess === true && 
    !isDealerOwner(user)
  );
}
