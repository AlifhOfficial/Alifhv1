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

export default async function GoogleMobileCallbackPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; error_description?: string }>;
}) {
  const params = await searchParams;
  const scheme = "revvup";
  
  // Handle OAuth errors
  if (params.error) {
    const errorMessage = params.error === 'access_denied' 
      ? 'cancelled' 
      : params.error_description || params.error;
    return redirect(`${scheme}://auth/callback?error=${encodeURIComponent(errorMessage)}`);
  }
  
  try {
    // Get session from Better Auth
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    
    if (!session?.user || !session?.session) {
      return redirect(`${scheme}://auth/callback?error=${encodeURIComponent('No session found')}`);
    }
    
    // Build redirect URL with session data
    // We pass the token and user data as URL params
    // The mobile app will store this and complete the auth flow
    const callbackParams = new URLSearchParams({
      success: 'true',
      token: session.session.token,
      expiresAt: session.session.expiresAt.toISOString(),
      userId: session.user.id,
      userName: session.user.name || '',
      userEmail: session.user.email,
      userImage: session.user.image || '',
    });
    
    return redirect(`${scheme}://auth/callback?${callbackParams.toString()}`);
  } catch (error) {
    console.error('[GoogleMobileCallback] Error getting session:', error);
    return redirect(`${scheme}://auth/callback?error=${encodeURIComponent('Failed to get session')}`);
  }
}
