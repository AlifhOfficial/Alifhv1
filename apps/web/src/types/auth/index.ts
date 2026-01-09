/**
 * Authentication Type Definitions - Production
 * 
 * Core types for authentication, authorization, and user context.
 * Defines platform roles, organization roles, and extended user data.
 * 
 * @module types/auth
 */

/** Platform-level role from User table */
export type UserRole = 'user' | 'admin' | 'super_admin';

/** Organization-level role from PartnerStaff table */
export type StaffRole = 'owner' | 'admin' | 'sales' | 'viewer';

/** Partner membership with role and permissions */
export interface PartnerMembership {
  staffId: string;
  partnerId: string;
  partnerName: string;
  partnerLogo: string | null;
  partnerTier: string;
  staffRole: StaffRole;
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
}

/** Base user type with authentication and profile data */
export type User = {
  id: string;
  email: string;
  name: string;
  avatar?: string | null;
  avatarUrl?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  role: UserRole;
  banned: boolean;
  banReason?: string | null;
  banExpires?: Date | null;
  partnerMemberships?: PartnerMembership[];
  hasPartnerAccess?: boolean;
  isAlifhAdmin?: boolean;
};

/** Extended user with session-populated partner context */
export type ExtendedUser = User;

/** Standardized API response for auth operations */
export type AuthResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};
