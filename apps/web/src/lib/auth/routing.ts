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
