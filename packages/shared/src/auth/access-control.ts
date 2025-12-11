/**
 * Role-Based Access Control Utilities
 * 
 * Comprehensive role checking for portal access control
 */

import { PlatformRole, UserStatus } from './types';

export interface UserWithRoles {
  id: string;
  email: string;
  name: string;
  platformRole: PlatformRole;
  status: UserStatus;
  activePartnerId?: string | null;
}

// =============================================================================
// PLATFORM ROLE HELPERS
// =============================================================================

export function isAlifhUser(user: UserWithRoles): boolean {
  return ['super-admin', 'admin', 'staff'].includes(user.platformRole);
}

export function isPartnerUser(user: UserWithRoles): boolean {
  return !!user.activePartnerId && user.status === 'active';
}

export function isRegularUser(user: UserWithRoles): boolean {
  return user.platformRole === 'user' && !user.activePartnerId;
}

// =============================================================================
// ACCESS CONTROL FUNCTIONS
// =============================================================================

export function canAccessUserPortal(user: UserWithRoles): boolean {
  // All authenticated active users can access user portal
  return user.status === 'active';
}

export function canAccessPartnerPortal(user: UserWithRoles): boolean {
  // Only users with active partner membership can access partner portal
  return isPartnerUser(user);
}

export function canAccessAdminPortal(user: UserWithRoles): boolean {
  // Only Alifh staff/admin/super-admin can access admin portal
  return isAlifhUser(user) && user.status === 'active';
}

export function canAccessPublicPortal(): boolean {
  // Everyone can access public portal (no auth required)
  return true;
}

// =============================================================================
// SPECIFIC ROLE CHECKS
// =============================================================================

export function isSuperAdmin(user: UserWithRoles): boolean {
  return user.platformRole === 'super-admin' && user.status === 'active';
}

export function isAdmin(user: UserWithRoles): boolean {
  return user.platformRole === 'admin' && user.status === 'active';
}

export function isStaff(user: UserWithRoles): boolean {
  return user.platformRole === 'staff' && user.status === 'active';
}

export function isPartnerOwner(user: UserWithRoles): boolean {
  return isPartnerUser(user); // For now, all partner users are owners
}

// =============================================================================
// PORTAL ACCESS SUMMARY
// =============================================================================

export function getUserPortalAccess(user: UserWithRoles | null) {
  if (!user) {
    return {
      public: true,
      user: false,
      partner: false,
      admin: false,
      userType: 'anonymous' as const,
    };
  }

  const access = {
    public: canAccessPublicPortal(),
    user: canAccessUserPortal(user),
    partner: canAccessPartnerPortal(user),
    admin: canAccessAdminPortal(user),
    userType: getUserType(user),
  };

  return access;
}

export function getUserType(user: UserWithRoles): 'alifh' | 'partner' | 'regular' {
  if (isAlifhUser(user)) return 'alifh';
  if (isPartnerUser(user)) return 'partner';
  return 'regular';
}

// =============================================================================
// USER FRIENDLY LABELS
// =============================================================================

export function getRoleDisplayName(user: UserWithRoles): string {
  if (user.platformRole === 'super-admin') return 'Super Admin';
  if (user.platformRole === 'admin') return 'Admin';
  if (user.platformRole === 'staff') return 'Staff';
  if (isPartnerUser(user)) return 'Partner';
  return 'User';
}

export function getUserTypeDisplayName(user: UserWithRoles): string {
  const type = getUserType(user);
  if (type === 'alifh') return 'Alifh Team';
  if (type === 'partner') return 'Partner';
  return 'User';
}