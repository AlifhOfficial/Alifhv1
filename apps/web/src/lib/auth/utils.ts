/**
 * Auth API Utilities
 * 
 * Helper functions for testing and managing auth operations.
 */

import { auth } from '@/lib/auth';

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