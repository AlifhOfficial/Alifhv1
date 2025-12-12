/**
 * Next.js Middleware - Role-Based Route Protection
 * 
 * Simple, clean middleware that handles authentication and basic role routing.
 * Follows Next.js conventions and respects clean architecture.
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

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
  
  console.log(`🔍 Middleware called for: ${pathname}`);

  // Skip middleware for ignored routes
  if (isIgnoredRoute(pathname)) {
    console.log(`⏭️ Skipping ignored route: ${pathname}`);
    return NextResponse.next();
  }

  // Allow public routes
  if (isPublicRoute(pathname)) {
    console.log(`🌍 Allowing public route: ${pathname}`);
    return NextResponse.next();
  }

  try {
    // Simple session check - look for Better Auth session cookie
    const sessionToken = request.cookies.get('better-auth.session_token');
    
    console.log(`🍪 Session token present: ${!!sessionToken}`);

    // No session cookie - redirect to sign in for protected routes
    if (!sessionToken) {
      console.log(`🚫 No session token, redirecting to sign in`);
      const signInUrl = new URL('/auth/signin', request.url);
      signInUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(signInUrl);
    }

    // For now, if there's a session cookie, allow access
    // The detailed role-based checks will be handled by the page components
    console.log(`✅ Session token found, allowing access to: ${pathname}`);
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