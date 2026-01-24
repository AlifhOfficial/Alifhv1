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
 * if (!user) redirect('/?auth=signin');
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
 * DEPRECATED: This function is removed to prevent duplicate session fetches.
 * 
 * Server components should directly use:
 * - getSessionUser() to get the user
 * - getUserProfileByUserId() from @alifh/database to get profile data
 * 
 * Client components should use:
 * - useUserProfile() hook which calls /api/profile/user-profile
 * 
 * DO NOT fetch API endpoints from server-side code - it causes multiple session fetches.
 */
