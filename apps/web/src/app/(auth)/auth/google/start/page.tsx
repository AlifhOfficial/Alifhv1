/**
 * Google OAuth Start Page
 * 
 * This page initiates the Google OAuth flow in a popup.
 * It calls Better Auth's signIn.social which redirects to Google.
 * 
 * NOTE: Cookie clearing happens in auth-handlers.ts before popup opens.
 * Do NOT clear cookies here to avoid race conditions with state cookie.
 */

"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { authClient } from "@/lib/auth/client";

export default function GoogleStartPage() {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const startAuth = async () => {
      try {
        // Initiate Google OAuth - this will redirect to Google
        // Cookie clearing already happened in parent window before popup opened
        await authClient.signIn.social({
          provider: "google",
          callbackURL: "/auth/google/callback",
        });
      } catch (err) {
        setError("Failed to start Google sign in");
        // Notify parent window of error
        if (window.opener) {
          window.opener.postMessage({
            type: 'google-auth-complete',
            success: false,
            error: 'failed_to_start',
          }, window.location.origin);
          setTimeout(() => window.close(), 1500);
        }
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
