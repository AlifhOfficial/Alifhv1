/**
 * Auth Constants - Role Maps & Route Patterns
 * 
 * Lean constants for roles, redirects, and protected routes.
 */

import type {
  PlatformRole,
  PartnerRole,
  UserStatus,
  PartnerStatus,
  RequestStatus,
} from './types';

// =============================================================================
// ROLE CONSTANTS
// =============================================================================

export const PLATFORM_ROLES = {
  SUPER_ADMIN: 'super-admin',
  ADMIN: 'admin',
  STAFF: 'staff',
  USER: 'user',
} as const;

export const PARTNER_ROLES = {
  OWNER: 'owner',
  ADMIN: 'admin',
  STAFF: 'staff',
} as const;

// =============================================================================
// STATUS MAPS
// =============================================================================

export const USER_STATUSES: Record<UserStatus, UserStatus> = {
  active: 'active',
  pending: 'pending',
  suspended: 'suspended',
  inactive: 'inactive',
};

export const PARTNER_STATUSES: Record<PartnerStatus, PartnerStatus> = {
  draft: 'draft',
  active: 'active',
  suspended: 'suspended',
  banned: 'banned',
};

export const REQUEST_STATUSES: Record<RequestStatus, RequestStatus> = {
  pending: 'pending',
  approved: 'approved',
  rejected: 'rejected',
};

// =============================================================================
// DEFAULT REDIRECTS
// =============================================================================

export const DEFAULT_REDIRECTS: Record<PlatformRole, string> = {
  'user': '/user',
  'staff': '/admin',
  'admin': '/admin',
  'super-admin': '/admin',
};

// =============================================================================
// PROTECTED ROUTE PATTERNS
// =============================================================================

export const PROTECTED_ROUTES = {
  USER: ['/user/**'],
  PARTNER: ['/partner/**'],
  ADMIN: ['/admin/**'],
} as const;

// =============================================================================
// ERROR MESSAGES
// =============================================================================

export const AUTH_ERRORS = {
  UNAUTHORIZED: 'Authentication required',
  FORBIDDEN: 'Insufficient permissions',
  INVALID_CREDENTIALS: 'Invalid email or password',
  EMAIL_ALREADY_EXISTS: 'Account with this email already exists',
  ACCOUNT_SUSPENDED: 'Your account has been suspended',
  ACCOUNT_BANNED: 'Your account has been banned',
  EMAIL_NOT_VERIFIED: 'Please verify your email address',
} as const;

// =============================================================================
// SUCCESS MESSAGES
// =============================================================================

export const AUTH_MESSAGES = {
  SIGN_UP_SUCCESS: 'Account created successfully. Please check your email to verify.',
  SIGN_IN_SUCCESS: 'Welcome back!',
  SIGN_OUT_SUCCESS: 'You have been signed out successfully',
  EMAIL_VERIFIED: 'Email verified successfully',
  PASSWORD_RESET_SENT: 'Password reset link sent to your email',
} as const;