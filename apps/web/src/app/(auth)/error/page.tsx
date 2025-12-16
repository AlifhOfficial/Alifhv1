/**
 * Auth Error Page
 * 
 * Catches all Better Auth errors and displays them in your modal UI/UX
 * This page is set as the errorURL in Better Auth config
 * 
 * When Better Auth encounters an error (OAuth, verification, etc.),
 * it redirects here with an error code/message in the URL params
 */

import { Suspense } from "react";
import { AuthErrorPageClient } from "./client";

// Disable static generation for this page (uses searchParams)
export const dynamic = 'force-dynamic';

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    }>
      <AuthErrorPageClient />
    </Suspense>
  );
}
