/**
 * Server-Side Session Context
 * 
 * Direct session retrieval with no caching.
 * All session calls go directly to Better Auth.
 * 
 * @module lib/auth/session-context
 */

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import type { ExtendedUser } from "@/types/auth";

/**
 * Retrieves current session user directly from Better Auth.
 * No caching - every call hits the auth layer.
 * 
 * @returns Extended user with role and partner membership data, or null if unauthenticated
 */
export async function getSessionUser(): Promise<ExtendedUser | null> {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({ headers: headersList });
    return (session?.user as ExtendedUser) ?? null;
  } catch (error: any) {
    // Re-throw Next.js static analysis signals so routes are correctly marked dynamic
    if (error?.digest === 'DYNAMIC_SERVER_USAGE') throw error;
    console.error('[getSessionUser] Error:', error);
    return null;
  }
}
