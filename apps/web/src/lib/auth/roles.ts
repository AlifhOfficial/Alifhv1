import { redirect } from "next/navigation";
import { auth } from "./index";
import { headers } from "next/headers";
import type { ExtendedUser } from "./routing";
import type { UserRole } from "@alifh/shared";

/**
 * Simple auth helper - just requires any authenticated user
 * Use this for pages that need login but no special role
 * Returns user with extended session data (partnerMemberships, hasPartnerAccess, etc.)
 */
export async function requireAuth(): Promise<ExtendedUser> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/sign-in");
  }

  // Cast to ExtendedUser since fetchUser() in auth config adds these fields
  return session.user as ExtendedUser;
}

/**
 * Requires specific platform role (admin or super_admin)
 * Use this for admin-only pages
 */
export async function requireRole(role: "admin" | "super_admin"): Promise<ExtendedUser> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/sign-in");
  }

  const user = session.user as ExtendedUser;

  if (user.role !== role && user.role !== "super_admin") {
    redirect("/access-denied?reason=insufficient-permissions");
  }

  return user;
}
