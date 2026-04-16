/**
 * Server-Side Session Context
 * 
 * Session retrieval with short-lived per-session caching.
 * Uses Next Data Cache for 5 minutes keyed by Better Auth session token.
 * 
 * @module lib/auth/session-context
 */

import { cache } from "react";
import { unstable_cache } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import type { ExtendedUser } from "@/types/auth";

const SESSION_CACHE_REVALIDATE_SECONDS = 300;

const DEBUG = process.env.CACHE_DEBUG === '1';
const dbg = (msg: string) => { if (DEBUG) console.warn(`[cache] ${msg}`); };

type SessionTokenSource = 'session-cookie' | 'bearer-token';

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

function extractBearerToken(authorizationHeader: string | null): string | null {
  if (!authorizationHeader) return null;

  const match = authorizationHeader.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() || null;
}

const getCachedSessionUserByToken = unstable_cache(
  async (tokenSource: SessionTokenSource, token: string) => {
    dbg(`MISS auth-session source=${tokenSource} token=${token.slice(0, 8)}…`);
    const requestHeaders = new Headers();

    if (tokenSource === 'bearer-token') {
      requestHeaders.set('authorization', `Bearer ${token}`);
    } else {
      const encodedToken = encodeURIComponent(token);
      requestHeaders.set(
        'cookie',
        `better-auth.session_token=${encodedToken}; __Secure-better-auth.session_token=${encodedToken}`
      );
    }

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
export const getSessionUser = cache(async (): Promise<ExtendedUser | null> => {
  try {
    const headersList = await headers();
    const cookieHeader = headersList.get("cookie");
    const authorizationHeader = headersList.get("authorization");
    const sessionToken = extractSessionToken(cookieHeader);
    const bearerToken = extractBearerToken(authorizationHeader);
    const cacheKeyToken = sessionToken || bearerToken;

    if (!cacheKeyToken) {
      return null;
    }

    dbg(`REQUEST auth-session source=${sessionToken ? 'session-cookie' : 'bearer-token'} token=${cacheKeyToken.slice(0, 8)}…`);
    return getCachedSessionUserByToken(
      sessionToken ? 'session-cookie' : 'bearer-token',
      cacheKeyToken
    );
  } catch (error: any) {
    // Re-throw Next.js static analysis signals so routes are correctly marked dynamic
    if (error?.digest === 'DYNAMIC_SERVER_USAGE') throw error;
    console.error('[getSessionUser] Error:', error);
    return null;
  }
});
