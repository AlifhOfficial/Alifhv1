import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import {
  getUserPortalAccess,
  isDealerOwner,
  isDealerStaff,
} from "@/lib/auth/routing";
import type { ExtendedUser } from "@/types/auth";

// Request-scoped session cache key
const SESSION_HEADER_KEY = "x-auth-user";
const CACHE_TTL = 60_000; // 1 minute in-memory (ms) - increased from 10s for v1

/**
 * In-memory session cache (v1 - no Redis)
 * Note: Cache is per-serverless instance, not shared across Vercel containers.
 * This is acceptable for v1 - each instance builds its own cache over time.
 */
const sessionCache = new Map<string, { user: ExtendedUser; expires: number }>();
const CACHE_MAX_SIZE = 1000;

function getCachedSession(key: string): ExtendedUser | null {
  const entry = sessionCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expires) {
    sessionCache.delete(key);
    return null;
  }
  return entry.user;
}

function setCachedSession(key: string, user: ExtendedUser): void {
  // Simple LRU: if at max size, delete oldest entry
  if (sessionCache.size >= CACHE_MAX_SIZE) {
    const firstKey = sessionCache.keys().next().value;
    if (firstKey) sessionCache.delete(firstKey);
  }
  sessionCache.set(key, { user, expires: Date.now() + CACHE_TTL });
}

function isExtendedUser(user: unknown): user is ExtendedUser {
  if (!user || typeof user !== "object") return false;
  const u = user as Record<string, unknown>;
  return (
    typeof u.role === "string" &&
    typeof u.banned === "boolean" &&
    typeof u.hasPartnerAccess === "boolean" &&
    typeof u.isAlifhAdmin === "boolean"
  );
}

// Next.js 16+ proxy function
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isApiRoute = pathname.startsWith('/api/');
  const isProtectedRoute = 
    pathname.startsWith('/user-dashboard') ||
    pathname.startsWith('/admin-dashboard') ||
    pathname.startsWith('/partner-dashboard') ||
    pathname.startsWith('/staff-dashboard') ||
    isApiRoute;

  // Skip non-protected routes entirely
  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  // Get session token from cookies - Better Auth stores session data in cookies
  const sessionToken = request.cookies.get("better-auth.session_token")?.value;

  // Redirect to sign-in if no session token (pages only, not API routes)
  if (!sessionToken) {
    if (isApiRoute) {
      // API routes handle their own 401 responses
      return NextResponse.next();
    }
    const signInUrl = new URL("/sign-in", request.url);
    signInUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Fetch session once for all protected routes
  try {
    const cacheKey = `session:${sessionToken.slice(0, 32)}`;
    
    // Check in-memory cache first
    let user: ExtendedUser | null = getCachedSession(cacheKey);
    
    if (!user) {
      // Cache miss - fetch from Better Auth
      const session = await auth.api.getSession({
        headers: request.headers,
      });

      if (!session?.user || !isExtendedUser(session.user)) {
        if (isApiRoute) {
          return NextResponse.next();
        }
        return NextResponse.redirect(new URL("/sign-in", request.url));
      }

      user = session.user;
      
      // Cache for subsequent requests in this serverless instance
      setCachedSession(cacheKey, user);
    }

    if (!user) {
      if (isApiRoute) {
        return NextResponse.next();
      }
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }

    // Check if user is banned - redirect to banned page
    if (user.banned) {
      if (isApiRoute) {
        return NextResponse.json(
          { error: 'Account banned', reason: 'Your account has been suspended' },
          { status: 403 }
        );
      }
      return NextResponse.redirect(new URL('/banned', request.url));
    }

    // Clone request headers and add session data for Server Components to reuse
    // This eliminates redundant session fetches during the request lifecycle
    // IMPORTANT: Use NextResponse.next({ request: { headers } }) to make headers available upstream
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set(SESSION_HEADER_KEY, JSON.stringify(user));

    // API routes don't need role-based redirects - they handle their own auth
    if (isApiRoute) {
      return NextResponse.next({
        request: { headers: requestHeaders },
      });
    }

    // Role-based access control for specific dashboards
    const needsRoleCheck =
      pathname.startsWith("/admin-dashboard") ||
      pathname.startsWith("/partner-dashboard") ||
      pathname.startsWith("/staff-dashboard");

    if (needsRoleCheck) {
      const access = getUserPortalAccess(user);

      // Admin dashboard - ONLY super_admin or admin (platform admins)
      if (pathname.startsWith("/admin-dashboard")) {
        if (!access.admin) {
          return NextResponse.redirect(
            new URL(
              "/access-denied?reason=insufficient-permissions",
              request.url
            )
          );
        }
      }

      // Partner dashboard - ONLY dealer owners (users with staffRole === 'owner')
      if (pathname.startsWith("/partner-dashboard")) {
        if (!isDealerOwner(user)) {
          return NextResponse.redirect(
            new URL("/access-denied?reason=not-dealer-owner", request.url)
          );
        }
      }

      // Staff dashboard - ONLY dealer staff (has partner access but NOT owner)
      if (pathname.startsWith("/staff-dashboard")) {
        if (!isDealerStaff(user)) {
          return NextResponse.redirect(
            new URL("/access-denied?reason=not-dealer-staff", request.url)
          );
        }
      }
    }

    // Return response with session header passed to downstream handlers
    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  } catch (error) {
    console.error("[Proxy] Error checking session:", error);
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
