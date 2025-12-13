import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  type ExtendedUser,
  getUserPortalAccess,
  isDealerOwner,
  isDealerStaff,
} from "@/lib/auth/routing";

interface CachedSession {
  user: ExtendedUser;
  expiresAt: number;
}

const SESSION_CACHE_TTL_MS = 30_000; // 30s edge-side cache
const isDev = process.env.NODE_ENV !== "production";

const globalForSessionCache = globalThis as typeof globalThis & {
  __alifhSessionCache?: Map<string, CachedSession>;
};

const sessionCache =
  globalForSessionCache.__alifhSessionCache ??
  (globalForSessionCache.__alifhSessionCache = new Map<string, CachedSession>());

function getCachedSession(token: string | undefined): ExtendedUser | null {
  if (!token) return null;
  const cached = sessionCache.get(token);
  if (!cached) return null;
  if (cached.expiresAt < Date.now()) {
    sessionCache.delete(token);
    return null;
  }
  return cached.user;
}

function setCachedSession(token: string, user: ExtendedUser) {
  sessionCache.set(token, {
    user,
    expiresAt: Date.now() + SESSION_CACHE_TTL_MS,
  });
}

function debugLog(message: string, payload?: Record<string, unknown>) {
  if (!isDev) return;
  // eslint-disable-next-line no-console
  console.debug(`[Middleware] ${message}`, payload ?? {});
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  debugLog('Request received', {
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
    debugLog(`${routeType}, skipping auth check`);
    return NextResponse.next();
  }

  // Get session token from cookies - Better Auth stores session data in cookies
  const sessionToken = request.cookies.get('better-auth.session_token')?.value;
  
  if (!sessionToken) {
    debugLog('No session token found, redirecting to sign-in');
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
          debugLog('Invalid session, redirecting to sign-in');
          return NextResponse.redirect(new URL('/sign-in', request.url));
        }

        const sessionData = await sessionResponse.json();
        user = sessionData?.user;

        if (!user) {
          debugLog('No user in session payload, redirecting to sign-in');
          return NextResponse.redirect(new URL('/sign-in', request.url));
        }

        setCachedSession(sessionToken, user);
      }

      const access = getUserPortalAccess(user);

      debugLog('Role check', {
        pathname,
        userRole: user.role,
        access,
        partnershipCount: user.partnerMemberships?.length || 0,
      });

      // Admin dashboard - ONLY super_admin or admin (platform admins)
      if (pathname.startsWith('/admin-dashboard')) {
        if (!access.admin) {
          debugLog('Access denied: admin dashboard requires platform admin role');
          return NextResponse.redirect(new URL('/access-denied?reason=insufficient-permissions', request.url));
        }
        debugLog('Admin access granted');
      }

      // Partner dashboard - ONLY dealer owners (users with staffRole === 'owner')
      if (pathname.startsWith('/partner-dashboard')) {
        if (!isDealerOwner(user)) {
          debugLog('Access denied: partner dashboard requires dealer owner');
          return NextResponse.redirect(new URL('/access-denied?reason=not-dealer-owner', request.url));
        }
        debugLog('Dealer owner access granted');
      }

      // Staff dashboard - ONLY dealer staff (has partner access but NOT owner)
      if (pathname.startsWith('/staff-dashboard')) {
        if (!isDealerStaff(user)) {
          debugLog('Access denied: staff dashboard requires partner staff');
          return NextResponse.redirect(new URL('/access-denied?reason=not-dealer-staff', request.url));
        }
        debugLog('Staff access granted');
      }
    } catch (error) {
      console.error('[Middleware] Error checking role:', error);
      return NextResponse.redirect(new URL('/sign-in', request.url));
    }
  }

  // Session token exists, allow access
  debugLog('Session valid, allowing access');
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
