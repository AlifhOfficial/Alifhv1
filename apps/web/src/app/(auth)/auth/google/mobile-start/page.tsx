/**
 * Google OAuth Mobile Start Page
 * 
 * This page initiates the Google OAuth flow for mobile apps.
 * Server-side redirect to Better Auth's social sign-in endpoint.
 * Accepts a `redirect` param to pass through for the final app redirect.
 */

import { redirect } from "next/navigation";

export default async function GoogleMobileStartPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const params = await searchParams;
  
  // Build callback URL with the mobile redirect URI
  const callbackURL = params.redirect 
    ? `/auth/google/mobile-callback?redirect=${encodeURIComponent(params.redirect)}`
    : `/auth/google/mobile-callback`;
  
  // Redirect to Better Auth's social sign-in endpoint
  redirect(`/api/auth/signin/social?provider=google&callbackURL=${encodeURIComponent(callbackURL)}`);
}
