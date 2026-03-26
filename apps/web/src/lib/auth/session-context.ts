/**
 * Server-Side Session Context
 *
 * Delegates session retrieval entirely to better-auth and the cookie store.
 *
 * @module lib/auth/session-context
 */

import { cookies } from "next/headers";
import { auth } from "@/lib/auth";
import type { ExtendedUser } from "@/types/auth";

/**
 * Retrieves current session user via better-auth using the request cookies.
 *
 * @returns Extended user with role and partner membership data, or null if unauthenticated
 */
export async function getSessionUser(): Promise<ExtendedUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("better-auth.session_token")?.value;
    if (!token) return null;
    const reqHeaders = new Headers();
    reqHeaders.set("cookie", `better-auth.session_token=${token}`);
    const session = await auth.api.getSession({ headers: reqHeaders });
    return (session?.user as ExtendedUser) ?? null;
  } catch (error: any) {
    // Re-throw Next.js static analysis signals so routes are correctly marked dynamic
    if (error?.digest === 'DYNAMIC_SERVER_USAGE') throw error;
    console.error('[getSessionUser] Error:', error);
    return null;
  }
}
