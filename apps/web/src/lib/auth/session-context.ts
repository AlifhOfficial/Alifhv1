/**
 * Server-Side Session Context
 * 
 * Two-tier caching for session data:
 * 1. unstable_cache: Cross-request cache with 5min TTL (replaces Redis)
 * 2. React cache(): Request-level deduplication (multiple calls in same request)
 * 
 * Critical: Always use these helpers instead of calling auth.api.getSession() directly.
 * 
 * @module lib/auth/session-context
 */

import { cache } from "react";
import { cookies, headers } from "next/headers";
import { unstable_cache } from "next/cache";
import { auth } from "@/lib/auth";
import type { ExtendedUser } from "@/types/auth";

/** 5 minute TTL — matches old Redis session cache */
const SESSION_CACHE_TTL = 300;

/**
 * Extract session token from cookies.
 * Better Auth uses __Secure- prefix in production (HTTPS).
 */
async function getCookieSessionToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return (
    cookieStore.get("__Secure-better-auth.session_token")?.value ??
    cookieStore.get("better-auth.session_token")?.value ??
    null
  );
}

function getBearerSessionToken(headerEntries: [string, string][]): string | null {
  const authHeader = headerEntries.find(([key]) => key.toLowerCase() === "authorization")?.[1] ?? null;
  if (!authHeader) return null;

  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  return match?.[1] ?? null;
}

/**
 * Fetch session from Better Auth and cache for 5 minutes.
 * Uses Next.js data cache (unstable_cache) — no external dependencies.
 *
 * Headers must be resolved OUTSIDE the cache scope (Next.js restriction)
 * and passed in as serializable data that the cached fn can use.
 */
function getCachedSession(sessionToken: string, headerEntries: [string, string][]) {
  return unstable_cache(
    async () => {
      const headersList = new Headers(headerEntries);
      const session = await auth.api.getSession({ headers: headersList });
      return (session?.user as ExtendedUser) ?? null;
    },
    ["session-user", sessionToken],
    {
      revalidate: SESSION_CACHE_TTL,
      tags: [`session:${sessionToken}`],
    }
  )();
}

/**
 * Retrieves current session user with two-tier caching:
 * - React cache() deduplicates within a single request
 * - unstable_cache persists across requests for 5 minutes
 * 
 * @returns Extended user with role and partner membership data, or null if unauthenticated
 */
export const getSessionUser = cache(async (): Promise<ExtendedUser | null> => {
  try {
    // Resolve dynamic sources outside the cache scope
    const headersList = await headers();
    const headerEntries = Array.from(headersList.entries()) as [string, string][];
    const cookieSessionToken = await getCookieSessionToken();
    const bearerSessionToken = getBearerSessionToken(headerEntries);
    const sessionToken = cookieSessionToken ?? bearerSessionToken;

    if (!sessionToken) return null;

    return await getCachedSession(sessionToken, headerEntries);
  } catch (error: any) {
    // Re-throw Next.js static analysis signals so routes are correctly marked dynamic
    if (error?.digest === 'DYNAMIC_SERVER_USAGE') throw error;
    console.error('[getSessionUser] Error:', error);
    return null;
  }
});
