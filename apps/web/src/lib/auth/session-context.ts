/**
 * Server-Side Session Context
 * 
 * Session retrieval with short-lived per-session caching.
 * Uses Next Data Cache for 5 minutes keyed by Better Auth session token.
 * 
 * @module lib/auth/session-context
 */

import { unstable_cache } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import type { ExtendedUser } from "@/types/auth";

const SESSION_CACHE_REVALIDATE_SECONDS = 300;

function extractSessionToken(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;

  const secureMatch = cookieHeader.match(
    /(?:^|;\s*)__Secure-better-auth\.session_token=([^;]+)/
  );
  if (secureMatch?.[1]) {
    return decodeURIComponent(secureMatch[1]);
  }

  const standardMatch = cookieHeader.match(
    /(?:^|;\s*)better-auth\.session_token=([^;]+)/
  );
  if (standardMatch?.[1]) {
    return decodeURIComponent(standardMatch[1]);
  }

  return null;
}

const getCachedSessionUserByToken = unstable_cache(
  async (_sessionToken: string, cookieHeader: string) => {
    const requestHeaders = new Headers({ cookie: cookieHeader });
    const session = await auth.api.getSession({ headers: requestHeaders });
    return (session?.user as ExtendedUser) ?? null;
  },
  ["auth-session-user-by-token"],
  { revalidate: SESSION_CACHE_REVALIDATE_SECONDS }
);

/**
 * Retrieves current session user from Better Auth.
 * Cached per session token for 5 minutes.
 * 
 * @returns Extended user with role and partner membership data, or null if unauthenticated
 */
export async function getSessionUser(): Promise<ExtendedUser | null> {
  try {
    const headersList = await headers();
    const cookieHeader = headersList.get("cookie");
    const sessionToken = extractSessionToken(cookieHeader);

    if (!cookieHeader || !sessionToken) {
      return null;
    }

    return getCachedSessionUserByToken(sessionToken, cookieHeader);
  } catch (error: any) {
    // Re-throw Next.js static analysis signals so routes are correctly marked dynamic
    if (error?.digest === 'DYNAMIC_SERVER_USAGE') throw error;
    console.error('[getSessionUser] Error:', error);
    return null;
  }
}
