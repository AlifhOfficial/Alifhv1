/**
 * Google OAuth Start Page
 * 
 * This page initiates the Google OAuth flow in a popup.
 * It calls Better Auth's signIn.social which redirects to Google.
 */

"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { authClient } from "@/lib/auth/client";

/**
 * Clears stale Better Auth OAuth state cookies before starting a new flow.
 * This prevents state_mismatch errors when old cookies exist from previous sessions.
 */
function clearStaleOAuthCookies() {
  // Better Auth uses cookies starting with "better-auth" for OAuth state
  const cookies = document.cookie.split(";");
  for (const cookie of cookies) {
    const [name] = cookie.split("=");
    const trimmedName = name.trim();
    // Clear any state-related cookies (oauth state, pkce verifier, etc.)
    if (
      trimmedName.includes("state") || 
      trimmedName.includes("pkce") || 
      trimmedName.includes("oauth") ||
      trimmedName.includes("code_verifier") ||
      (trimmedName.startsWith("better-auth.") && !trimmedName.includes("session"))
    ) {
      // Clear with various path combinations to ensure removal
      const paths = ["/", "/api", "/api/auth", "/auth"];
      for (const path of paths) {
        document.cookie = `${trimmedName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}`;
        document.cookie = `${trimmedName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}; secure`;
      }
    }
  }
}

export default function GoogleStartPage() {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const startAuth = async () => {
      try {
        // Clear any stale OAuth cookies from previous sessions
        clearStaleOAuthCookies();
        
        // Initiate Google OAuth - this will redirect to Google
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
