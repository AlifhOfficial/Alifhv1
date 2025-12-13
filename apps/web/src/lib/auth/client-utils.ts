import { UserRole } from '@alifh/shared';

export interface UserWithRole {
  id: string;
  name: string;
  email: string;
  role?: UserRole | null;
}

/**
 * Get the default dashboard route based on user role
 */
export function getDashboardRoute(role?: UserRole | null): string {
  switch (role) {
    case 'super_admin':
    case 'admin':
      return '/admin-dashboard';
    case 'user':
    default:
      return '/user-dashboard';
  }
}

export function hasRole(user: UserWithRole | null, role: UserRole): boolean {
  if (!user) return false;
  
  // Super admin and admin can access everything
  if (user.role === 'super_admin' || user.role === 'admin') return true;
  
  return user.role === role;
}