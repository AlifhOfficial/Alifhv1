import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

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
 * Lightweight middleware proxy.
 *
 * Middleware handles only a cookie-existence check to redirect unauthenticated
 * users from protected dashboard pages.
 *
 * Matcher is scoped tightly - static public pages never hit this middleware.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Auth routes should remain publicly reachable.
  if (isAuthPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // API routes handle their own authentication and authorization.
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
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
  // Broad matcher keeps dashboard redirects active while static assets are skipped.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
