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

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get session token from cookies - Better Auth stores session data in cookies
  const sessionToken = request.cookies.get("better-auth.session_token")?.value;

  // Only redirect to sign-in if no session token AND it's a protected route
  if (!sessionToken) {
    const signInUrl = new URL("/sign-in", request.url);
    signInUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Fetch session once for all protected routes (including user-dashboard)
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }

    // Better Auth typing can be a union; only proceed once we confirm customSession fields exist.
    if (!isExtendedUser(session.user)) {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }

    const user = session.user;

    // Store session in request headers for Server Components to reuse
    // This eliminates redundant session fetches during the request lifecycle
    const response = NextResponse.next();
    response.headers.set(SESSION_HEADER_KEY, JSON.stringify(user));

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

    return response;
  } catch (error) {
    console.error("[Proxy] Error checking session:", error);
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }
}

export const config = {
  matcher: [
    "/user-dashboard/:path*",
    "/admin-dashboard/:path*",
    "/partner-dashboard/:path*",
    "/staff-dashboard/:path*",
  ],
};
