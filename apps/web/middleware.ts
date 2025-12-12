/**
 * Next.js Middleware - Role-Based Route Protection
 * 
 * Simple, clean middleware that handles authentication and basic role routing.
 * Follows Next.js conventions and respects clean architecture.
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  '/',
  '/auth/signin',
  '/auth/signup',
  '/auth/verify',
  '/auth/reset-password',
  '/auth/magic-link',
];

// Routes that should be ignored by middleware
const IGNORED_ROUTES = [
  '/api/',
  '/_next/',
  '/favicon.ico',
  '/static/',
  '/public/',
];

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(route => pathname === route || pathname.startsWith(route));
}

function isIgnoredRoute(pathname: string): boolean {
  return IGNORED_ROUTES.some(route => pathname.startsWith(route));
}

function getDefaultDashboard(platformRole: string): string {
  switch (platformRole) {
    case 'super-admin':
    case 'admin':
    case 'staff':
      return '/admin-dashboard';
    case 'user':
    default:
      return '/user-dashboard';
  }
}

async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for ignored routes
  if (isIgnoredRoute(pathname)) {
    return NextResponse.next();
  }

  // Allow public routes
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  try {
    // Get session using Better Auth
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    // No session - redirect to sign in
    if (!session?.user) {
      const signInUrl = new URL('/auth/signin', request.url);
      signInUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(signInUrl);
    }

    const user = session.user as any;

    // Check if user is active
    if (user.status !== 'active') {
      return NextResponse.redirect(new URL('/auth/inactive', request.url));
    }

    // Handle root-level portal access
    if (pathname === '/admin' || pathname.startsWith('/admin/')) {
      const canAccessAdmin = ['super-admin', 'admin', 'staff'].includes(user.platformRole);
      if (!canAccessAdmin) {
        return NextResponse.redirect(new URL('/auth/unauthorized', request.url));
      }
    }

    if (pathname === '/partner' || pathname.startsWith('/partner/')) {
      // For partner routes, we need to check if user has an active partner
      if (!user.activePartnerId) {
        return NextResponse.redirect(new URL(getDefaultDashboard(user.platformRole), request.url));
      }
    }

    // Redirect bare portal paths to appropriate dashboards
    if (pathname === '/admin') {
      return NextResponse.redirect(new URL('/admin-dashboard', request.url));
    }

    if (pathname === '/partner') {
      return NextResponse.redirect(new URL('/partner/owner-dashboard', request.url));
    }

    if (pathname === '/user') {
      return NextResponse.redirect(new URL('/user-dashboard', request.url));
    }

    // Handle common dashboard shortcuts for users with partner access
    if (user.activePartnerId) {
      if (pathname === '/owner-dashboard') {
        return NextResponse.redirect(new URL('/partner/owner-dashboard', request.url));
      }
      if (pathname === '/admin-dashboard' && !['super-admin', 'admin', 'staff'].includes(user.platformRole)) {
        // If user tries to access admin dashboard but doesn't have admin role, redirect to partner dashboard
        return NextResponse.redirect(new URL('/partner/owner-dashboard', request.url));
      }
    }

    // All other routes proceed normally
    return NextResponse.next();

  } catch (error) {
    console.error('Middleware auth error:', error);
    
    // On error, redirect to sign in
    const signInUrl = new URL('/auth/signin', request.url);
    signInUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(signInUrl);
  }
}

export { middleware };
export default middleware;

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};