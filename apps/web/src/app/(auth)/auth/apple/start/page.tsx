/**
 * Apple OAuth Start Page
 * 
 * This page initiates the Apple OAuth flow in a popup.
 * It calls Better Auth's signIn.social which redirects to Apple.
 */

"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { authClient } from "@/lib/auth/client";

export default function AppleStartPage() {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const startAuth = async () => {
      try {
        // Initiate Apple OAuth - this will redirect to Apple
        await authClient.signIn.social({
          provider: "apple",
          callbackURL: "/auth/apple/callback",
        });
      } catch (err) {
        setError("Failed to start Apple sign in");
        // Notify parent window of error
        if (window.opener) {
          window.opener.postMessage({
            type: 'apple-auth-complete',
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
        <p className="text-sm text-muted-foreground">Connecting to Apple...</p>
      </div>
    </div>
  );
}
