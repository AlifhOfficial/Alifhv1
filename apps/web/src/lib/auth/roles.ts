import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { UserRole } from "@alifh/shared";
import { UserWithRole, getDashboardRoute } from "./client-utils";

/**
 * Get the current authenticated user with their role
 */
export async function getCurrentUser(): Promise<UserWithRole | null> {
  const session = await auth.api.getSession({
    headers: await headers()
  });
  
  if (!session?.user) {
    return null;
  }

  return {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    role: session.user.role as UserRole | null
  };
}

/**
 * Check if a user has a specific role
 * Uses Better Auth's role system
 */
export function hasRole(user: UserWithRole | null, role: UserRole): boolean {
  if (!user || !user.role) return false;
  
  // Check exact role match
  if (user.role === role) return true;
  
  // Admin has access to everything
  if (user.role === 'admin') return true;
  
  return false;
}

/**
 * Check if a user has permission for a specific action
 * Uses Better Auth admin plugin's permission system
 */
export async function hasPermission(
  permissions: Record<string, string[]>
): Promise<boolean> {
  try {
    const result = await auth.api.userHasPermission({
      headers: await headers(),
      body: { permissions }
    });
    return (result as any)?.hasPermission ?? false;
  } catch (error) {
    return false;
  }
}

/**
 * Require a specific role, redirecting if not authorized
 */
export async function requireRole(role: UserRole): Promise<UserWithRole> {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/signin?error=unauthorized');
  }
  
  if (!hasRole(user, role)) {
    // Redirect to access denied page with info about required role
    redirect(`/access-denied?required=${role}&current=${user.role || 'user'}`);
  }
  
  return user;
}

/**
 * Require authentication, redirecting to home if not logged in
 */
export async function requireAuth(): Promise<UserWithRole> {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/');
  }
  
  return user;
}

/**
 * Require admin role
 */
export async function requireAdmin(): Promise<UserWithRole> {
  return requireRole('admin');
}

/**
 * Require partner role
 */
export async function requirePartner(): Promise<UserWithRole> {
  return requireRole('partner');
}

/**
 * Require staff role
 */
export async function requireStaff(): Promise<UserWithRole> {
  return requireRole('staff');
}

