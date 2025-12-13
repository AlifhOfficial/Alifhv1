/**
 * Auth Constants - Simple Role System
 * 
 * Basic constants for Better Auth admin plugin
 */

import type { UserRole } from './types';

// Basic user roles for our 4-portal system
export const USER_ROLES = {
  ADMIN: 'admin',     // Platform admin
  PARTNER: 'partner', // Dealership owner
  STAFF: 'staff',     // Dealership staff
  USER: 'user',       // Individual users
} as const;

// =============================================================================
// STATUS MAPS
// =============================================================================

// Default redirects for each role
export const DEFAULT_REDIRECTS: Record<UserRole, string> = {
  'admin': '/admin-dashboard',
  'partner': '/partner-dashboard', 
  'staff': '/staff-dashboard',
  'user': '/user-dashboard',
};

// Protected route patterns for our 4-portal system
export const PROTECTED_ROUTES = {
  USER: ['/user-dashboard/**'],
  PARTNER: ['/partner-dashboard/**'],
  STAFF: ['/staff-dashboard/**'], 
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