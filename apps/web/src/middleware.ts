import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isDealerOwner, isDealerStaff } from "@/lib/auth/routing";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  console.log('[Middleware] Request:', {
    pathname,
    method: request.method,
  });

  // Public routes that don't need auth
  const publicRoutes = [
    '/sign-in',
    '/sign-up',
    '/verify-email',
    '/reset-password',
    '/magic-link',
    '/showcase',
    '/access-denied',
  ];

  // Check if it's the exact homepage or a public route
  const isHomepage = pathname === '/';
  const isPublicRoute = publicRoutes.some(route => {
    // Exact match or starts with the route followed by a slash
    return pathname === route || pathname.startsWith(route + '/');
  });
  const isApiRoute = pathname.startsWith('/api');
  
  // Skip auth check for public routes and API routes (Better Auth handles API auth)
  if (isHomepage || isPublicRoute || isApiRoute) {
    const routeType = isApiRoute ? 'API route' : isHomepage ? 'Homepage' : 'Public route';
    console.log(`[Middleware] ${routeType}, skipping auth check`);
    return NextResponse.next();
  }

  // Get session token from cookies - Better Auth stores session data in cookies
  const sessionToken = request.cookies.get('better-auth.session_token')?.value;
  
  if (!sessionToken) {
    console.log('[Middleware] No session token found, redirecting to sign-in');
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  // Session exists! Better Auth validates it on the server side
  // For role-based access control, we need to check the session data
  
  // For role-specific routes, we need to fetch session data
  const needsRoleCheck = 
    pathname.startsWith('/admin-dashboard') || 
    pathname.startsWith('/partner-dashboard') ||
    pathname.startsWith('/staff-dashboard');
  
  if (needsRoleCheck) {
    try {
      const url = new URL('/api/auth/get-session', request.url);
      const sessionResponse = await fetch(url, {
        headers: {
          cookie: request.headers.get('cookie') || '',
        },
        cache: 'no-store', // Don't cache role checks
      });

      if (!sessionResponse.ok) {
        console.log('[Middleware] Invalid session, redirecting to sign-in');
        return NextResponse.redirect(new URL('/sign-in', request.url));
      }

      const sessionData = await sessionResponse.json();
      const user = sessionData?.user;

      if (!user) {
        console.log('[Middleware] No user in session, redirecting to sign-in');
        return NextResponse.redirect(new URL('/sign-in', request.url));
      }

      console.log('[Middleware] Role check:', {
        pathname,
        userRole: user.role,
        hasPartnerAccess: user.hasPartnerAccess,
        isAlifhAdmin: user.isAlifhAdmin,
        partnershipCount: user.partnerMemberships?.length || 0,
      });

      // Admin dashboard - ONLY super_admin or admin (platform admins)
      if (pathname.startsWith('/admin-dashboard')) {
        if (!user.isAlifhAdmin) {
          console.log('[Middleware] ❌ Access DENIED - Only platform admins can access admin dashboard');
          return NextResponse.redirect(new URL('/access-denied?reason=insufficient-permissions', request.url));
        }
        console.log('[Middleware] ✅ Admin access GRANTED');
      }

      // Partner dashboard - ONLY dealer owners (users with staffRole === 'owner')
      if (pathname.startsWith('/partner-dashboard')) {
        if (!isDealerOwner(user)) {
          console.log('[Middleware] ❌ Access DENIED - Only dealer owners can access partner dashboard');
          return NextResponse.redirect(new URL('/access-denied?reason=not-dealer-owner', request.url));
        }
        console.log('[Middleware] ✅ Dealer Owner access GRANTED');
      }

      // Staff dashboard - ONLY dealer staff (has partner access but NOT owner)
      if (pathname.startsWith('/staff-dashboard')) {
        if (!isDealerStaff(user)) {
          console.log('[Middleware] ❌ Access DENIED - Only dealer staff can access staff dashboard');
          return NextResponse.redirect(new URL('/access-denied?reason=not-dealer-staff', request.url));
        }
        console.log('[Middleware] ✅ Staff access GRANTED');
      }
    } catch (error) {
      console.error('[Middleware] Error checking role:', error);
      return NextResponse.redirect(new URL('/sign-in', request.url));
    }
  }

  // Session token exists, allow access
  console.log('[Middleware] Session valid, allowing access');
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
