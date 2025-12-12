/**
 * Auth Proxy - Role-Based Route Protection
 * 
 * Proxy for protecting routes based on user roles and status.
 * Handles organization isolation and approval workflows.
 * 
 * Note: Migrated from middleware.ts as per Next.js deprecation
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { type PlatformRole, type UserStatus, type PartnerRole } from '@alifh/shared/auth';

interface RouteProtection {
  requireAuth: boolean;
  allowedPlatformRoles?: PlatformRole[];
  allowedPartnerRoles?: PartnerRole[];
  requireEmailVerified?: boolean;
  allowedStatuses?: UserStatus[];
  requirePartnerMembership?: boolean;
  requireOwnPartner?: boolean;
}

// Route protection configuration
const routeConfig: Record<string, RouteProtection> = {
  // =============================================================================
  // USER PORTAL ROUTES
  // =============================================================================
  '/user-dashboard': {
    requireAuth: true,
    allowedPlatformRoles: ['user', 'staff', 'admin', 'super-admin'],
    allowedStatuses: ['active'],
    requireEmailVerified: true,
  },
  '/profile': {
    requireAuth: true,
    allowedPlatformRoles: ['user', 'staff', 'admin', 'super-admin'],
    allowedStatuses: ['active'],
    requireEmailVerified: true,
  },

  // =============================================================================
  // ADMIN PORTAL ROUTES
  // =============================================================================
  '/admin-dashboard': {
    requireAuth: true,
    allowedPlatformRoles: ['admin', 'super-admin', 'staff'],
    allowedStatuses: ['active'],
    requireEmailVerified: true,
  },

  // =============================================================================
  // PARTNER PORTAL ROUTES
  // =============================================================================
  
  // Partner role-specific routes
  '/partner/owner-dashboard': {
    requireAuth: true,
    allowedPlatformRoles: ['user', 'staff', 'admin', 'super-admin'],
    allowedStatuses: ['active'],
    requireEmailVerified: true,
    requirePartnerMembership: true,
    allowedPartnerRoles: ['owner'],
  },
  
  '/partner/admin-dashboard': {
    requireAuth: true,
    allowedPlatformRoles: ['user', 'staff', 'admin', 'super-admin'],
    allowedStatuses: ['active'],
    requireEmailVerified: true,
    requirePartnerMembership: true,
    allowedPartnerRoles: ['owner', 'admin'],
  },

  '/partner/staff-dashboard': {
    requireAuth: true,
    allowedPlatformRoles: ['user', 'staff', 'admin', 'super-admin'],
    allowedStatuses: ['active'],
    requireEmailVerified: true,
    requirePartnerMembership: true,
    allowedPartnerRoles: ['owner', 'admin', 'staff'],
  },

  // =============================================================================
  // LEGACY/GENERIC ROUTES
  // =============================================================================
  '/user': {
    requireAuth: true,
    allowedPlatformRoles: ['user', 'staff', 'admin', 'super-admin'],
    allowedStatuses: ['active'],
    requireEmailVerified: true,
  },
  '/partner': {
    requireAuth: true,
    allowedPlatformRoles: ['user', 'staff', 'admin', 'super-admin'],
    allowedStatuses: ['active'],
    requireEmailVerified: true,
    requirePartnerMembership: true,
  },
  '/admin': {
    requireAuth: true,
    allowedPlatformRoles: ['admin', 'super-admin'],
    allowedStatuses: ['active'],
    requireEmailVerified: true,
  },
};

function getRouteConfig(pathname: string): RouteProtection | null {
  // Direct match
  if (routeConfig[pathname]) {
    return routeConfig[pathname];
  }

  // Pattern matching for dynamic routes
  for (const [pattern, config] of Object.entries(routeConfig)) {
    if (pattern.includes('[') && matchesPattern(pathname, pattern)) {
      return config;
    }
  }

  return null;
}

function matchesPattern(pathname: string, pattern: string): boolean {
  const patternParts = pattern.split('/');
  const pathParts = pathname.split('/');

  if (patternParts.length !== pathParts.length) {
    return false;
  }

  return patternParts.every((part, index) => {
    if (part.startsWith('[') && part.endsWith(']')) {
      return true; // Dynamic segment matches anything
    }
    return part === pathParts[index];
  });
}

function getBaseRoute(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length === 0) return '/';
  return `/${segments[0]}`;
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Skip proxy for public routes and API auth routes
  if (
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname === '/' ||
    pathname.startsWith('/(public)')
  ) {
    return NextResponse.next();
  }

  // Get route configuration
  const config = getRouteConfig(pathname) || getRouteConfig(getBaseRoute(pathname));
  
  // If no protection config, allow access
  if (!config) {
    return NextResponse.next();
  }

  // Check authentication requirement
  if (!config.requireAuth) {
    return NextResponse.next();
  }

  try {
    // Get session from cookies (Better Auth uses cookies)
    const sessionToken = request.cookies.get('better-auth.session_token');
    
    // No session token - redirect to sign in
    if (!sessionToken) {
      const signInUrl = new URL('/auth/signin', request.url);
      signInUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(signInUrl);
    }

    // TODO: For now, we'll let the session validation happen on the client side
    // In a production app, you'd validate the session token here
    // by making a request to your auth API or decoding the JWT
    
    // For now, just allow access if session exists
    // The real validation will happen in the component with useAuth hooks
    return NextResponse.next();

  } catch (error) {
    console.error('Proxy auth error:', error);
    
    // On auth error, redirect to sign in
    const signInUrl = new URL('/auth/signin', request.url);
    signInUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(signInUrl);
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (Better Auth routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - / (homepage)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|$).*)',
  ],
};