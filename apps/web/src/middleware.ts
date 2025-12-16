import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_CONFIG } from "@/lib/auth/config";
import {
  getUserPortalAccess,
  isDealerOwner,
  isDealerStaff,
} from "@/lib/auth/routing";
import {
  getCachedSession,
  setCachedSession,
} from "@/lib/auth/session-cache";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get session token from cookies - Better Auth stores session data in cookies
  const sessionToken = request.cookies.get('better-auth.session_token')?.value;
  
  // Only redirect to sign-in if no session token AND it's a protected route
  if (!sessionToken) {
    const signInUrl = new URL('/sign-in', request.url);
    signInUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(signInUrl);
  }

  // For role-specific admin/partner routes, we need to verify access
  // But for user-dashboard, just check token exists (handled above)
  const needsRoleCheck = 
    pathname.startsWith('/admin-dashboard') || 
    pathname.startsWith('/partner-dashboard') ||
    pathname.startsWith('/staff-dashboard');
  
  if (needsRoleCheck) {
    try {
      // Check cache first (5 min TTL)
      let user = getCachedSession(sessionToken);

      // Only fetch if not cached - this drastically reduces DB load
      if (!user) {
        const url = new URL(AUTH_CONFIG.ENDPOINTS.GET_SESSION, request.url);
        const sessionResponse = await fetch(url, {
          headers: {
            cookie: request.headers.get('cookie') || '',
          },
        });

        if (!sessionResponse.ok) {
          return NextResponse.redirect(new URL('/sign-in', request.url));
        }

        const sessionData = await sessionResponse.json();
        user = sessionData?.user;

        if (!user) {
          return NextResponse.redirect(new URL('/sign-in', request.url));
        }

        // Cache for 5 minutes to avoid repeated DB queries
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
