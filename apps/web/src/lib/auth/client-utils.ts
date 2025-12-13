import { UserRole } from '@alifh/shared';

export interface UserWithRole {
  id: string;
  name: string;
  email: string;
  role?: UserRole | null; // null = regular user
}
export function getDashboardRoute(role?: UserRole | null): string {
  // Everyone gets user dashboard by default
  // Additional roles get their special dashboard
  switch (role) {
    case 'admin':
      return '/admin-dashboard';
    case 'partner':
      return '/partner-dashboard';
    case 'staff':
      return '/staff-dashboard';
    default:
      return '/user-dashboard'; // Default for all users
  }
}

export function hasRole(user: UserWithRole | null, role: UserRole): boolean {
  if (!user) return false;
  if (user.role === 'admin') return true; // Admin can access everything
  return user.role === role;
}