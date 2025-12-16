/**
 * Auth Constants - Simple Role System
 * 
 * Basic constants for Better Auth admin plugin
 */

import type { UserRole } from './types';

// Basic user roles - platform level only
export const USER_ROLES = {
  SUPER_ADMIN: 'super_admin', // Super admin
  ADMIN: 'admin',              // Platform admin
  USER: 'user',                // Regular users
} as const;

// =============================================================================
// STATUS MAPS
// =============================================================================

// Default redirects for each role
export const DEFAULT_REDIRECTS: Record<UserRole, string> = {
  'super_admin': '/admin-dashboard',
  'admin': '/admin-dashboard',
  'user': '/user-dashboard',
};

// Protected route patterns
export const PROTECTED_ROUTES = {
  USER: ['/user-dashboard/**'],
  PARTNER: ['/partner-dashboard/**'], // Protected by partner_staff membership check
  ADMIN: ['/admin-dashboard/**'],
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