/**
 * Apple OAuth Callback Page
 * 
 * This page receives the OAuth callback and sends a postMessage to the parent window
 * to complete the popup-based authentication flow.
 */

"use client";

import { useEffect, useState } from "react";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

export default function AppleCallbackPage() {
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
        
        if (error) {
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
              type: 'apple-auth-complete',
              success: false,
              error: error,
            }, window.location.origin);
            
            setTimeout(() => window.close(), 2500);
          }
          return;
        }

        // Auth was successful - Better Auth already set the session cookie
        // Just notify the parent window
        setStatus('success');
        setMessage('Signed in successfully');
        
        if (isPopup) {
          window.opener.postMessage({
            type: 'apple-auth-complete',
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
            type: 'apple-auth-complete',
            success: false,
            error: 'callback_error',
          }, window.location.origin);
          setTimeout(() => window.close(), 2500);
        }
      }
    };

    completeAuth();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="text-center space-y-3">
        {status === 'loading' && (
          <>
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mx-auto" />
            <p className="text-sm text-muted-foreground">{message}</p>
          </>
        )}
        
        {status === 'success' && (
          <>
            <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto" />
            <p className="text-sm font-medium text-foreground">{message}</p>
            <p className="text-xs text-muted-foreground">This window will close automatically</p>
          </>
        )}
        
        {status === 'error' && (
          <>
            <XCircle className="h-8 w-8 text-destructive mx-auto" />
            <p className="text-sm font-medium text-destructive">{message}</p>
            <p className="text-xs text-muted-foreground">This window will close automatically</p>
          </>
        )}
      </div>
    </div>
  );
}
