/**
 * Server-Side Session Context
 *
 * Session retrieval cached for 5 minutes per session token via Next.js unstable_cache.
 * Eliminates repeated DB round-trips across server renders and API route calls.
 *
 * @module lib/auth/session-context
 */

import { unstable_cache } from "next/cache";
import { cookies } from "next/headers";
import { auth } from "@/lib/auth";
import type { ExtendedUser } from "@/types/auth";

/** Cached lookup keyed by session token — revalidates every 5 minutes */
const fetchSessionByToken = unstable_cache(
  async (token: string): Promise<ExtendedUser | null> => {
    const reqHeaders = new Headers();
    reqHeaders.set("cookie", `better-auth.session_token=${token}`);
    const session = await auth.api.getSession({ headers: reqHeaders });
    return (session?.user as ExtendedUser) ?? null;
  },
  ["session-user"],
  { revalidate: 300 },
);

/**
 * Retrieves current session user, cached for 5 minutes per session token.
 *
 * @returns Extended user with role and partner membership data, or null if unauthenticated
 */
export async function getSessionUser(): Promise<ExtendedUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("better-auth.session_token")?.value;
    if (!token) return null;
    return await fetchSessionByToken(token);
  } catch (error: any) {
    // Re-throw Next.js static analysis signals so routes are correctly marked dynamic
    if (error?.digest === 'DYNAMIC_SERVER_USAGE') throw error;
    console.error('[getSessionUser] Error:', error);
    return null;
  }
}
