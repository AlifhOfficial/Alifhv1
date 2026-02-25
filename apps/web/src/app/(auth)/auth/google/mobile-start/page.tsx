/**
 * Google OAuth Mobile Start Page
 * 
 * This page initiates the Google OAuth flow for mobile apps.
 * Server-side redirect to Better Auth's social sign-in endpoint.
 */

import { redirect } from "next/navigation";

export default function GoogleMobileStartPage() {
  // Redirect to Better Auth's social sign-in endpoint
  // This will redirect to Google, then back to mobile-callback
  redirect("/api/auth/signin/social?provider=google&callbackURL=/auth/google/mobile-callback");
}
