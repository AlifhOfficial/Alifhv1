/**
 * Google OAuth Start Page
 * 
 * This page initiates the Google OAuth flow in a popup.
 * It calls Better Auth's signIn.social which redirects to Google.
 * 
 * Supports retry parameter from callback page for auto-retry on state_mismatch errors.
 */

"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { authClient } from "@/lib/auth/client";

function GoogleStartContent() {
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    const startAuth = async () => {
      try {
        // Better Auth handles OAuth state management internally
        // No manual cookie clearing needed - it can cause state_mismatch errors
        
        // Check if this is a retry attempt (passed from callback on state_mismatch)
        const retry = searchParams.get('retry');
        const callbackURL = retry 
          ? `/auth/google/callback?retry=${retry}`
          : "/auth/google/callback";
        
        // Initiate Google OAuth - this will redirect to Google
        await authClient.signIn.social({
          provider: "google",
          callbackURL,
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
  }, [searchParams]);

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

export default function GoogleStartPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="text-center space-y-3">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mx-auto" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <GoogleStartContent />
    </Suspense>
  );
}
