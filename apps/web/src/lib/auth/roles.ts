import { redirect } from "next/navigation";
import type { ExtendedUser } from "@/lib/auth/types";
import type { UserRole } from "@/lib/auth/types";
import { getSessionUser } from "./session-context";

/**
 * Simple auth helper - just requires any authenticated user
 * Use this for pages that need login but no special role
 * Returns user with extended session data (partnerMemberships, hasPartnerAccess, etc.)
 * 
 * NOTE: Uses React cache() so multiple calls in same request return cached result
 */
export async function requireAuth(): Promise<ExtendedUser> {
  const user = await getSessionUser();

  if (!user) {
    redirect("/sign-in");
  }

  return user;
}

/**
 * Requires specific platform role (admin or super_admin)
 * Use this for admin-only pages
 * 
 * NOTE: Uses React cache() so multiple calls in same request return cached result
 */
export async function requireRole(role: "admin" | "super_admin"): Promise<ExtendedUser> {
  const user = await getSessionUser();

  if (!user) {
    redirect("/sign-in");
  }

  if (user.role !== role && user.role !== "super_admin") {
    redirect("/access-denied?reason=insufficient-permissions");
  }

  return user;
}
