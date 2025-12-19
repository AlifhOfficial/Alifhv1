/**
 * Server-Side Session Context - Production
 * 
 * Request-scoped session and profile retrieval with React cache() deduplication.
 * Integrates with middleware for header-based caching to minimize database queries.
 * 
 * Critical: Always use these helpers instead of calling auth.api.getSession() directly.
 * They ensure consistent caching behavior and middleware integration.
 * 
 * @module lib/auth/session-context
 * @see {@link middleware} for session header injection
 * @see {@link docs/System_Docs/SESSION_OPTIMIZATION_GUIDE.md} for architecture
 */

import { cache } from "react";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import type { ExtendedUser } from "@/types/auth";

const SESSION_HEADER_KEY = "x-auth-user";
const PROFILE_HEADER_KEY = "x-user-profile";

/**
 * Retrieves current session user with request-level caching
 * Checks middleware-injected headers first, falls back to Better Auth API
 * 
 * @returns Extended user with role and partner membership data, or null if unauthenticated
 * @example
 * const user = await getSessionUser();
 * if (!user) redirect('/sign-in');
 */
export const getSessionUser = cache(async (): Promise<ExtendedUser | null> => {
  try {
    const headersList = await headers();
    
    const cachedUser = headersList.get(SESSION_HEADER_KEY);
    if (cachedUser) {
      try {
        return JSON.parse(cachedUser) as ExtendedUser;
      } catch {
        // Fall through to fetch
      }
    }
    
    const session = await auth.api.getSession({
      headers: headersList,
    });

    return (session?.user as ExtendedUser) ?? null;
  } catch (error) {
    console.error('[getSessionUser] Error:', error);
    return null;
  }
});

/**
 * Retrieves user profile with avatar URL signing and request-level caching
 * Uses API endpoint to avoid direct database access from presentation layer
 * Generates temporary signed URLs for R2-stored avatars (10min expiry)
 * 
 * @returns User profile with avatarUrl, or null if not found
 * @example
 * const profile = await getUserProfile();
 * if (profile?.avatarUrl) displayAvatar(profile.avatarUrl);
 */
export const getUserProfile = cache(async () => {
  try {
    const headersList = await headers();
    
    const cachedProfile = headersList.get(PROFILE_HEADER_KEY);
    if (cachedProfile) {
      try {
        return JSON.parse(cachedProfile);
      } catch {
        // Fall through to fetch
      }
    }
    
    const user = await getSessionUser();
    if (!user?.id) return null;

    // Use API endpoint instead of direct database access
    // This respects the presentation/API layer separation
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/profile/user-profile`, {
      headers: headersList,
      next: { revalidate: 30 }, // Cache for 30s
    });

    if (!response.ok) return null;
    
    const data = await response.json();
    return data.profile || null;
  } catch (error) {
    console.error('[getUserProfile] Error:', error);
    return null;
  }
});
