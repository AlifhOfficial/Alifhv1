import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import {
  getUserPortalAccess,
  isDealerOwner,
  isDealerStaff,
} from "@/lib/auth/routing";
import type { ExtendedUser } from "@/types/auth";
import { getCachedSession, setCachedSession } from "@/lib/redis";

// Request-scoped session cache key
const SESSION_HEADER_KEY = "x-auth-user";

// Site password protection cookie name
const SITE_ACCESS_COOKIE = "site-access-granted";

// Routes that bypass site password protection
const BYPASS_SITE_PASSWORD = [
  '/staging-login',      // The password entry page
  '/api/',               // All API routes (mobile app, webhooks, etc.)
  '/api/staging-auth',   // The password verification endpoint
  '/_next/',             // Next.js assets
  '/favicon.ico',
  '/robots.txt',
  '/sitemap.xml',
];

/**
 * Check if site password protection is enabled and handle access
 * Returns NextResponse if access denied, or null if access granted/not required
 */
function checkSitePassword(request: NextRequest): NextResponse | null {
  const sitePassword = process.env.SITE_PASSWORD;
  
  // No password set = no protection
  if (!sitePassword) {
    return null;
  }
  
  const { pathname } = request.nextUrl;
  
  // Allow bypass routes
  if (BYPASS_SITE_PASSWORD.some(route => pathname.startsWith(route))) {
    return null;
  }
  
  // Check for access cookie
  const accessCookie = request.cookies.get(SITE_ACCESS_COOKIE)?.value;
  if (accessCookie === 'true') {
    return null;
  }
  
  // Redirect to staging login page
  const loginUrl = new URL('/staging-login', request.url);
  loginUrl.searchParams.set('redirect', pathname);
  return NextResponse.redirect(loginUrl);
}

// Public API routes that skip proxy entirely (no session caching needed)
// These are high-traffic public endpoints for marketplace, search, and system operations
const PUBLIC_API_ROUTES = [
  '/api/auth/',           // Better Auth handlers
  '/api/bookings/slots',  // View available booking slots
  '/api/cron/',           // Cron jobs (expire-listings, sync-google-reviews)
  '/api/health',          // Health check
  '/api/internal/',       // Internal operations (warm-cache)
  '/api/listings/search', // Marketplace search & suggest
  '/api/listings/car-card',
  '/api/listings/check-vin',
  '/api/listings/impressions',
  '/api/listings/black',  // Black listings public view
  '/api/sellers/stats',   // Public seller stats
  '/api/showroom',        // Public showroom views
  '/api/storage/status',  // Storage status check
  '/api/communications',  // Public communications
  '/api/dev/',            // Dev tools (email-log)
];

// Dynamic public routes that need pattern matching
const PUBLIC_API_PATTERNS = [
  /^\/api\/listings\/[^/]+\/detailed$/, // /api/listings/[id]/detailed
  /^\/api\/listings\/[^/]+\/similar$/,  // /api/listings/[id]/similar
  /^\/api\/showroom\/[^/]+$/,           // /api/showroom/[slug]
];

function isPublicApiRoute(pathname: string): boolean {
  // Check exact prefix matches
  if (PUBLIC_API_ROUTES.some(route => pathname.startsWith(route))) {
    return true;
  }
  // Check dynamic patterns
  if (PUBLIC_API_PATTERNS.some(pattern => pattern.test(pathname))) {
    return true;
  }
  return false;
}

function isExtendedUser(user: unknown): user is ExtendedUser {
  if (!user || typeof user !== "object") return false;
  const u = user as Record<string, unknown>;
  // More lenient check - only require id and email (basic user fields)
  // Extended fields (role, banned, etc.) may not be present for new users
  return typeof u.id === "string" && typeof u.email === "string";
}

// Ensure extended fields have defaults for new users
function normalizeExtendedUser(user: Record<string, unknown>): ExtendedUser {
  return {
    ...user,
    role: (user.role as string) || "user",
    banned: user.banned === true,
    hasPartnerAccess: user.hasPartnerAccess === true,
    isAlifhAdmin: user.isAlifhAdmin === true || user.isRevvupAdmin === true,
  } as ExtendedUser;
}

// Next.js 16+ proxy function
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Site password protection - gates entire site when SITE_PASSWORD is set
  const sitePasswordResponse = checkSitePassword(request);
  if (sitePasswordResponse) {
    return sitePasswordResponse;
  }
  
  const isApiRoute = pathname.startsWith('/api/');
  
  // Skip public API routes entirely - no session caching overhead
  if (isApiRoute && isPublicApiRoute(pathname)) {
    return NextResponse.next();
  }
  
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
  // In production with HTTPS, cookies are prefixed with __Secure-
  const sessionToken = 
    request.cookies.get("__Secure-better-auth.session_token")?.value ||
    request.cookies.get("better-auth.session_token")?.value;

  // Redirect to sign-in if no session token (pages only, not API routes)
  if (!sessionToken) {
    if (isApiRoute) {
      // API routes handle their own 401 responses
      return NextResponse.next();
    }
    const signInUrl = new URL("/", request.url);
    signInUrl.searchParams.set("auth", "signin");
    signInUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Fetch session once for all protected routes
  try {
    // Check Upstash Redis cache first (avoids DB hit on every request)
    let user: ExtendedUser | null = null;
    let sessionSource = 'unknown';
    const sessionStart = Date.now();
    const cached = await getCachedSession<ExtendedUser>(sessionToken);
    const cacheMs = Date.now() - sessionStart;

    if (cached && isExtendedUser(cached)) {
      user = normalizeExtendedUser(cached as Record<string, unknown>);
      sessionSource = 'redis';
    } else {
      // Cache miss — fetch from Better Auth (hits DB)
      const dbStart = Date.now();
      const session = await auth.api.getSession({
        headers: request.headers,
      });
      const dbMs = Date.now() - dbStart;

      if (!session?.user || !isExtendedUser(session.user)) {
        if (isApiRoute) {
          return NextResponse.next();
        }
        const signInUrl = new URL("/", request.url);
        signInUrl.searchParams.set("auth", "signin");
        signInUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(signInUrl);
      }

      user = normalizeExtendedUser(session.user as Record<string, unknown>);
      sessionSource = 'db';

      // Cache in Redis (fire-and-forget, non-blocking)
      setCachedSession(sessionToken, user);
      
      if (dbMs > 200) {
        console.warn(`[proxy] Slow session fetch from DB: ${dbMs}ms (cache lookup: ${cacheMs}ms) ${pathname}`);
      }
    }

    const sessionMs = Date.now() - sessionStart;
    if (sessionMs > 200) {
      console.warn(`[proxy] Session resolution: ${sessionMs}ms (source=${sessionSource}, cache=${cacheMs}ms) ${pathname}`);
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
    const signInUrl = new URL("/", request.url);
    signInUrl.searchParams.set("auth", "signin");
    signInUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(signInUrl);
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
