/**
 * Server-Side Authentication Guards - Production
 * 
 * Route protection helpers for Next.js server components and server actions.
 * All functions leverage React cache() for request-level memoization.
 * 
 * @module lib/auth/roles
 * @see {@link getSessionUser} for the underlying cached session retrieval
 */

import { redirect } from "next/navigation";
import type { ExtendedUser } from "@/types/auth";
import { getSessionUser } from "./session-context";

/**
 * Requires authenticated user (any role)
 * Redirects to sign-in if unauthenticated
 * 
 * @returns Extended user with partner memberships and role data
 * @throws {redirect} Redirects to /?auth=signin if no session
 */
export async function requireAuth(): Promise<ExtendedUser> {
  const user = await getSessionUser();

  if (!user) {
    redirect("/?auth=signin");
  }

  return user;
}

/**
 * Requires specific platform role
 * Redirects to sign-in if unauthenticated, access-denied if insufficient role
 * 
 * @param role - Required role ("admin" or "super_admin")
 * @returns Extended user with confirmed role
 * @throws {redirect} Redirects to /?auth=signin or /access-denied
 */
export async function requireRole(role: "admin" | "super_admin"): Promise<ExtendedUser> {
  const user = await getSessionUser();

  if (!user) {
    redirect("/?auth=signin");
  }

  if (user.role !== role && user.role !== "super_admin") {
    redirect("/access-denied?reason=insufficient-permissions");
  }

  return user;
}
