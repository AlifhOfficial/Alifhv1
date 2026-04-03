/**
 * Google OAuth Callback Page
 * 
 * This page receives the OAuth callback and sends a postMessage to the parent window
 * to complete the popup-based authentication flow.
 */

"use client";

import { useEffect, useState } from "react";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

export default function GoogleCallbackPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Completing sign in...');

  useEffect(() => {
    const completeAuth = async () => {
      try {
        // Check if we're in a popup
        const isPopup = window.opener && window.opener !== window;
        
        // Get the current URL to check for errors
        const url = new URL(window.location.href);
        const error = url.searchParams.get('error');
        const errorDescription = url.searchParams.get('error_description');
        const retryCount = parseInt(url.searchParams.get('retry') || '0', 10);
        
        if (error) {
          // For state_mismatch errors, auto-retry once by restarting the OAuth flow
          // This handles stale state cookies from previous failed attempts
          if (error === 'state_mismatch' && retryCount < 1) {
            setMessage('Retrying sign in...');
            // Redirect to start page with retry flag (passed through callback URL)
            window.location.href = '/auth/google/start?retry=1';
            return;
          }
          
          setStatus('error');
          
          // Provide user-friendly error messages
          let errorMessage = 'Sign in failed';
          if (error === 'access_denied') {
            errorMessage = 'Sign in was cancelled';
          } else if (error === 'state_mismatch') {
            errorMessage = 'Session expired. Please close this window and try again.';
          } else if (errorDescription) {
            errorMessage = errorDescription;
          }
          
          setMessage(errorMessage);
          
          if (isPopup) {
            window.opener.postMessage({
              type: 'google-auth-complete',
              success: false,
              error: error,
            }, window.location.origin);
            
            setTimeout(() => window.close(), 2500);
          }
          return;
        }

        // Auth was successful - Better Auth already set the session cookie
        // Notify the parent window
        setStatus('success');
        setMessage('Signed in successfully');
        
        if (isPopup) {
          window.opener.postMessage({
            type: 'google-auth-complete',
            success: true,
          }, window.location.origin);
          
          // Close popup after a brief delay
          setTimeout(() => window.close(), 800);
        } else {
          // Not in popup - redirect to home
          setTimeout(() => {
            window.location.href = '/';
          }, 1000);
        }
      } catch {
        setStatus('error');
        setMessage('Something went wrong');
        
        if (window.opener && window.opener !== window) {
          window.opener.postMessage({
            type: 'google-auth-complete',
            success: false,
            error: 'unknown_error',
          }, window.location.origin);
          
          setTimeout(() => window.close(), 1500);
        }
      }
    };

    completeAuth();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-xs w-full text-center space-y-4">
        {/* Icon */}
        <div className="flex justify-center">
          {status === 'loading' && (
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Loader2 className="h-6 w-6 text-primary animate-spin" />
            </div>
          )}
          {status === 'success' && (
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-primary" />
            </div>
          )}
          {status === 'error' && (
            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
              <XCircle className="h-6 w-6 text-destructive" />
            </div>
          )}
        </div>

        {/* Message */}
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{message}</p>
          {status === 'loading' && (
            <p className="text-xs text-muted-foreground/70">This window will close automatically</p>
          )}
        </div>
      </div>
    </div>
  );
}
