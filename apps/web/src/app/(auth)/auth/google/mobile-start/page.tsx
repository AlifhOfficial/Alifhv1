/**
 * Google OAuth Mobile Start Page
 *
 * This page initiates the Google OAuth flow for mobile apps.
 * It must POST to Better Auth's social endpoint so the state cookie is set
 * in the browser before redirecting to Google.
 */

"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

function GoogleMobileStartContent() {
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const startAuth = async () => {
      try {
        const redirectParam = searchParams.get("redirect");
        const callbackURL = redirectParam
          ? `/auth/google/mobile-callback?redirect=${encodeURIComponent(redirectParam)}`
          : `/auth/google/mobile-callback`;

        const response = await fetch("/api/auth/sign-in/social", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            provider: "google",
            callbackURL,
          }),
        });

        if (!response.ok) {
          setError("Failed to start Google sign in");
          return;
        }

        const result = (await response.json()) as { url?: string };
        if (!result?.url) {
          setError("Failed to start Google sign in");
          return;
        }

        window.location.href = result.url;
      } catch {
        setError("Failed to start Google sign in");
      }
    };

    startAuth();
  }, [searchParams]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="text-center">
          <p className="text-subhead text-destructive">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="text-center space-y-3">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mx-auto" />
        <p className="text-subhead text-muted-foreground">Connecting to Google...</p>
      </div>
    </div>
  );
}

export default function GoogleMobileStartPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
          <div className="text-center space-y-3">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mx-auto" />
            <p className="text-subhead text-muted-foreground">Loading...</p>
          </div>
        </div>
      }
    >
      <GoogleMobileStartContent />
    </Suspense>
  );
}
