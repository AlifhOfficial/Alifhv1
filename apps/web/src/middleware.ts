import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  getUserPortalAccess,
  isDealerOwner,
  isDealerStaff,
  getCachedSession,
  setCachedSession,
} from "@alifh/shared/auth";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get session token from cookies - Better Auth stores session data in cookies
  const sessionToken = request.cookies.get('better-auth.session_token')?.value;
  
  if (!sessionToken) {
    const signInUrl = new URL('/sign-in', request.url);
    signInUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(signInUrl);
  }

  // For role-specific routes, we need to check the session data
  const needsRoleCheck = 
    pathname.startsWith('/admin-dashboard') || 
    pathname.startsWith('/partner-dashboard') ||
    pathname.startsWith('/staff-dashboard');
  
  if (needsRoleCheck) {
    try {
      let user = getCachedSession(sessionToken);

      if (!user) {
        const url = new URL('/api/auth/get-session', request.url);
        const sessionResponse = await fetch(url, {
          headers: {
            cookie: request.headers.get('cookie') || '',
          },
          cache: 'no-store',
        });

        if (!sessionResponse.ok) {
          return NextResponse.redirect(new URL('/sign-in', request.url));
        }

        const sessionData = await sessionResponse.json();
        user = sessionData?.user;

        if (!user) {
          return NextResponse.redirect(new URL('/sign-in', request.url));
        }

        setCachedSession(sessionToken, user);
      }

      const access = getUserPortalAccess(user);

      // Admin dashboard - ONLY super_admin or admin (platform admins)
      if (pathname.startsWith('/admin-dashboard')) {
        if (!access.admin) {
          return NextResponse.redirect(new URL('/access-denied?reason=insufficient-permissions', request.url));
        }
      }

      // Partner dashboard - ONLY dealer owners (users with staffRole === 'owner')
      if (pathname.startsWith('/partner-dashboard')) {
        if (!isDealerOwner(user)) {
          return NextResponse.redirect(new URL('/access-denied?reason=not-dealer-owner', request.url));
        }
      }

      // Staff dashboard - ONLY dealer staff (has partner access but NOT owner)
      if (pathname.startsWith('/staff-dashboard')) {
        if (!isDealerStaff(user)) {
          return NextResponse.redirect(new URL('/access-denied?reason=not-dealer-staff', request.url));
        }
      }
    } catch (error) {
      console.error('[Middleware] Error checking role:', error);
      return NextResponse.redirect(new URL('/sign-in', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Only match protected routes - no need to run middleware on public routes
    '/user-dashboard/:path*',
    '/admin-dashboard/:path*', 
    '/partner-dashboard/:path*',
    '/staff-dashboard/:path*'
  ],
};
