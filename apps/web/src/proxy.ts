import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Site password protection cookie name
const SITE_ACCESS_COOKIE = "site-access-granted";

function isAuthPublicRoute(pathname: string): boolean {
  if (pathname === "/reset-password" || pathname === "/verify-email") {
    return true;
  }

  if (pathname.startsWith("/auth/") || pathname.startsWith("/magic-link/")) {
    return true;
  }

  return false;
}

/**
 * Check if site password protection is enabled and handle access
 * Returns NextResponse if access denied, or null if access granted/not required
 */
function checkSitePassword(request: NextRequest): NextResponse | null {
  // Only enforce when SITE_PASSWORD is set — skip entirely in dev mode
  if (process.env.NODE_ENV === "development") return null;

  const sitePassword = process.env.SITE_PASSWORD;
  if (!sitePassword) return null;

  const accessCookie = request.cookies.get(SITE_ACCESS_COOKIE)?.value;
  if (accessCookie === "true") return null;

  const { pathname } = request.nextUrl;
  const loginUrl = new URL("/staging-login", request.url);
  loginUrl.searchParams.set("redirect", pathname);
  return NextResponse.redirect(loginUrl);
}

/**
 * Lightweight middleware proxy.
 *
 * Middleware only handles:
 * 1. Site password protection (staging environments)
 * 2. Cookie-existence check -> redirect unauthenticated users from protected dashboard pages
 *
 * Matcher is scoped tightly - static public pages never hit this middleware.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Auth and staging access routes must never be blocked by site-password checks.
  if (pathname === "/staging-login" || isAuthPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // API routes must never be blocked by the site-password gate — the staging-auth
  // endpoint itself needs to be reachable to set the access cookie
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // Site password protection (staging only - skipped when SITE_PASSWORD unset or in dev)
  const sitePasswordResponse = checkSitePassword(request);
  if (sitePasswordResponse) {
    return sitePasswordResponse;
  }

  // Cookie-existence gate for protected dashboard routes only
  // Auth validation + role checks happen in server component layouts
  const isDashboard =
    pathname.startsWith("/user-dashboard") ||
    pathname.startsWith("/partner-dashboard") ||
    pathname.startsWith("/staff-dashboard") ||
    pathname.startsWith("/admin-dashboard");

  if (isDashboard) {
    const sessionToken =
      request.cookies.get("__Secure-better-auth.session_token")?.value ||
      request.cookies.get("better-auth.session_token")?.value;

    if (!sessionToken) {
      const signInUrl = new URL("/", request.url);
      signInUrl.searchParams.set("auth", "signin");
      signInUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(signInUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  // Broad matcher so staging gate covers all pages, not just dashboards.
  // Short-circuits quickly for public pages when SITE_PASSWORD is unset.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
