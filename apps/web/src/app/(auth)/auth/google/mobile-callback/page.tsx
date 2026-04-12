/**
 * Google OAuth Mobile Callback Page
 * 
 * This page handles OAuth callbacks for mobile apps.
 * After Better Auth sets the session cookie, this page:
 * 1. Reads the session from cookies
 * 2. Redirects to the mobile app with session data in the URL
 */

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect-error";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function normalizeExpiresAt(value: unknown): string {
  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === "string") {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? value : parsed.toISOString();
  }

  const fallback = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  return fallback.toISOString();
}

export default async function GoogleMobileCallbackPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; error_description?: string; redirect?: string }>;
}) {
  const params = await searchParams;
  
  // Use the passed redirect URI or fall back to revvup:// scheme
  const baseRedirect = params.redirect || "revvup://auth/callback";
  
  // Handle OAuth errors
  if (params.error) {
    const errorMessage = params.error === 'access_denied' 
      ? 'cancelled' 
      : params.error_description || params.error;
    return redirect(`${baseRedirect}?error=${encodeURIComponent(errorMessage)}`);
  }
  
  try {
    const headersList = await headers();
    const cookieHeader = headersList.get("cookie");
    const authorizationHeader = headersList.get("authorization");
    const requestHeaders = new Headers();
    if (cookieHeader) requestHeaders.set("cookie", cookieHeader);
    if (authorizationHeader) requestHeaders.set("authorization", authorizationHeader);

    // Get session from Better Auth (primary path)
    let session = await auth.api.getSession({ headers: requestHeaders });

    // Fallback: call the auth endpoint directly with the cookie header.
    if (!session?.user || !session?.session) {
      try {
        const baseUrl = process.env.BETTER_AUTH_URL || "https://revvup.ae";
        const res = await fetch(`${baseUrl}/api/auth/get-session`, {
          method: "GET",
          headers: requestHeaders,
          cache: "no-store",
        });
        if (res.ok) {
          const data = await res.json();
          if (data?.user && data?.session) {
            session = data;
          }
        }
      } catch {
        // Ignore fallback errors and return error below.
      }
    }

    if (!session?.user || !session?.session) {
      const errorCode = cookieHeader ? "session_not_found" : "missing_session_cookie";
      return redirect(`${baseRedirect}?error=${encodeURIComponent(errorCode)}`);
    }
    
    // Build redirect URL with session data
    // We pass the token and user data as URL params
    // The mobile app will store this and complete the auth flow
    const callbackParams = new URLSearchParams({
      success: 'true',
      token: session.session.token,
      expiresAt: normalizeExpiresAt(session.session.expiresAt),
      userId: session.user.id,
      userName: session.user.name || '',
      userEmail: session.user.email,
      userImage: session.user.image || '',
    });
    
    return redirect(`${baseRedirect}?${callbackParams.toString()}`);
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    console.error('[GoogleMobileCallback] Error getting session:', error);
    return redirect(`${baseRedirect}?error=${encodeURIComponent('Failed to get session')}`);
  }
}
