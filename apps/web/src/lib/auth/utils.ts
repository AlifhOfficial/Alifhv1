/**
 * Auth API Utilities
 * 
 * Helper functions for testing and managing auth operations.
 */

import { auth } from '@/lib/auth';
import type { PlatformRole, UserStatus } from '@alifh/shared/auth';

// Get user with Better Auth session
export async function getAuthUser(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    return session?.user || null;
  } catch (error) {
    console.error('Error getting auth user:', error);
    return null;
  }
}

// Update user role (for testing) - moved to API endpoints to avoid client-side DB operations
export async function updateUserRole(userId: string, role: PlatformRole) {
  // This would be implemented in an API endpoint
  throw new Error('Use API endpoint /api/admin/update-user-role instead');
}

// Update user status (for testing) - moved to API endpoints
export async function updateUserStatus(userId: string, status: UserStatus) {
  // This would be implemented in an API endpoint
  throw new Error('Use API endpoint /api/admin/update-user-status instead');
}

// Test auth endpoints
export async function testAuthEndpoints() {
  const results = {
    signUp: false,
    signIn: false,
    session: false,
    signOut: false,
  };

  // Note: This function is for testing purposes
  // In a real app, you'd test these endpoints server-side or with a test runner
  console.log('Auth endpoints test - would need proper test environment');
  
  return results;
}