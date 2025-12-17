import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import type { ExtendedUser } from "@/lib/auth/types";
import type { UserRole } from "@/lib/auth/types";

/**
 * Get extended session data with partner memberships using Better Auth
 * The middleware already handles access control, this just retrieves user data
 * With cookie cache enabled, this is fast and doesn't hit the DB on every call
 */
async function getExtendedSession(): Promise<ExtendedUser | null> {
  try {
    const headersList = await headers();
    
    // Use Better Auth directly - customSession plugin adds role/partner data
    const session = await auth.api.getSession({
      headers: headersList,
    });

    if (!session?.user) {
      return null;
    }

    return session.user as ExtendedUser;
  } catch (error) {
    console.error('[requireAuth] Error fetching session:', error);
    return null;
  }
}

/**
 * Simple auth helper - just requires any authenticated user
 * Use this for pages that need login but no special role
 * Returns user with extended session data (partnerMemberships, hasPartnerAccess, etc.)
 * 
 * NOTE: Middleware already handles access control. This is just for retrieving user data in Server Components.
 */
export async function requireAuth(): Promise<ExtendedUser> {
  const user = await getExtendedSession();

  if (!user) {
    redirect("/sign-in");
  }

  return user;
}

/**
 * Requires specific platform role (admin or super_admin)
 * Use this for admin-only pages
 * 
 * NOTE: Middleware already handles access control. This is just for retrieving user data in Server Components.
 */
export async function requireRole(role: "admin" | "super_admin"): Promise<ExtendedUser> {
  const user = await getExtendedSession();

  if (!user) {
    redirect("/sign-in");
  }

  if (user.role !== role && user.role !== "super_admin") {
    redirect("/access-denied?reason=insufficient-permissions");
  }

  return user;
}
