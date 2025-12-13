import { redirect } from "next/navigation";
import { auth } from "./index";
import { headers } from "next/headers";

/**
 * Simple auth helper - just requires any authenticated user
 * Use this for pages that need login but no special role
 */
export async function requireAuth() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/sign-in");
  }

  return session.user;
}

/**
 * Requires specific platform role (admin or super_admin)
 * Use this for admin-only pages
 */
export async function requireRole(role: "admin" | "super_admin") {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/sign-in");
  }

  if (session.user.role !== role && session.user.role !== "super_admin") {
    redirect("/access-denied?reason=insufficient-permissions");
  }

  return session.user;
}
