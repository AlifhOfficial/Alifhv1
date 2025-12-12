/**
 * Auth Types - Simplified for Better Auth
 * 
 * Clean slate approach using Better Auth admin plugin
 */

// Basic user roles for Better Auth admin plugin
export type UserRole = 'admin' | 'partner' | 'staff' | 'user';

// Basic user type matching Better Auth structure
export type User = {
  id: string;
  email: string;
  name: string;
  image?: string | null;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
};

// API response wrapper
export type AuthResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};