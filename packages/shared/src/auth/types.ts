/**
 * Auth Types - Clean Domain Models
 * 
 * Simple, focused types that Web/WS/Mobile can all use.
 * No database specifics, no Better Auth details.
 */

// =============================================================================
// ENUMS AS STRING UNIONS
// =============================================================================

export type PlatformRole = 'super-admin' | 'admin' | 'staff' | 'user';
export type PartnerRole = 'owner' | 'admin' | 'staff';
export type UserStatus = 'active' | 'pending' | 'suspended' | 'inactive';
export type PartnerStatus = 'draft' | 'active' | 'suspended' | 'banned';
export type RequestStatus = 'pending' | 'approved' | 'rejected';

// =============================================================================
// CORE DOMAIN TYPES
// =============================================================================

export type User = {
  id: string;
  email: string;
  name: string;
  image: string | null;
  platformRole: PlatformRole;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
};

export type Partner = {
  id: string;
  name: string;
  slug: string;
  status: PartnerStatus;
  email: string;
  createdAt: Date;
  updatedAt: Date;
};

export type PartnerMember = {
  id: string;
  userId: string;
  partnerId: string;
  role: PartnerRole;
  isActive: boolean;
  createdAt: Date;
};

export type PartnerRequest = {
  id: string;
  userId: string;
  businessName: string;
  businessEmail: string;
  status: RequestStatus;
  createdAt: Date;
};

// =============================================================================
// API RESPONSE TYPES
// =============================================================================

export type AuthResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};