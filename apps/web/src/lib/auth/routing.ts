/**
 * Auth Routing Logic
 * 
 * Centralized routing decisions based on user session
 */

export interface ExtendedUser {
  // Base Better Auth fields
  id: string;
  email: string;
  name: string;
  image?: string | null;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  banned: boolean;
  banReason?: string | null;
  banExpires?: Date | null;
  
  // Platform role
  role: 'user' | 'admin' | 'super_admin';
  
  // Extended fields (computed on-demand)
  hasPartnerAccess?: boolean;
  isAlifhAdmin?: boolean;
  partnerMemberships?: Array<{
    staffId: string;
    partnerId: string;
    partnerName: string;
    partnerTier: string;
    staffRole: 'owner' | 'admin' | 'sales' | 'viewer';
    permissions: {
      manageListings: boolean;
      manageTeam: boolean;
      viewAnalytics: boolean;
      manageBookings: boolean;
      respondToLeads: boolean;
      manageFinancials: boolean;
      manageSettings: boolean;
      exportData: boolean;
    };
  }>;
}

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

/**
 * Compute the full portal access matrix for navigation and middleware guards
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
 * Provide consistent partner context derived from the session
 */
export function getUserPartnerContext(user: ExtendedUser): UserPartnerContext {
  const memberships = user.partnerMemberships ?? [];
  const ownerPartnerIds = memberships
    .filter(m => m.staffRole === 'owner')
    .map(m => m.partnerId);
  const staffPartnerIds = memberships
    .filter(m => m.staffRole !== 'owner')
    .map(m => m.partnerId);

  const defaultPartnerId = ownerPartnerIds[0] ?? memberships[0]?.partnerId ?? null;

  return {
    totalActivePartners: memberships.length,
    defaultPartnerId,
    ownerPartnerIds,
    staffPartnerIds,
  };
}
