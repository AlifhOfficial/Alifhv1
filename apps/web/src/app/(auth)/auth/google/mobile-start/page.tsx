/**
 * Google OAuth Mobile Start Page
 * 
 * This page initiates the Google OAuth flow for mobile apps.
 * It calls Better Auth's signIn.social which redirects to Google,
 * then redirects back to the mobile-callback page.
 */

"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { authClient } from "@/lib/auth/client";

export default function GoogleMobileStartPage() {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const startAuth = async () => {
      try {
        // Initiate Google OAuth - this will redirect to Google
        // After Google auth, Better Auth redirects to mobile-callback
        await authClient.signIn.social({
          provider: "google",
          callbackURL: "/auth/google/mobile-callback",
        });
      } catch (err) {
        console.error("[GoogleMobileStart] Error:", err);
        setError("Failed to start Google sign in");
      }
    };

    startAuth();
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="text-center">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="text-center space-y-3">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mx-auto" />
        <p className="text-sm text-muted-foreground">Connecting to Google...</p>
      </div>
    </div>
  );
}
