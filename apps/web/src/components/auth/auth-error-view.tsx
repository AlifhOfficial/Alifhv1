/**
 * Auth Error Page View Component
 * Displays authentication error modal with appropriate actions
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthErrorModal } from "@/components/auth/feedback/auth-error-modal";
import { getAuthErrorInfo, AuthErrorAction } from "@/lib/auth/errors";
import { Navbar } from "@/components/shared/navbar";

export function AuthErrorView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);

  // Extract error from URL params
  const errorParam = searchParams.get("error") || 
                     searchParams.get("error_code") || 
                     searchParams.get("message") ||
                     "unknown_error";

  const errorInfo = getAuthErrorInfo(errorParam);

  useEffect(() => {
    // Open modal when page loads
    setOpen(true);
  }, []);

  const handleClose = () => {
    setOpen(false);
    // Navigate back to home after closing
    setTimeout(() => {
      router.push("/");
    }, 300);
  };

  const handleAction = (action: AuthErrorAction) => {
    setOpen(false);
    
    setTimeout(() => {
      switch (action) {
        case "SIGN_IN":
          // Use window.location for reliable auth modal trigger (avoids race conditions)
          window.location.href = "/?auth=signin";
          break;
        
        case "SIGN_UP":
          // Use window.location for reliable auth modal trigger (avoids race conditions)
          window.location.href = "/?auth=signup";
          break;
        
        case "RETRY":
          // Navigate back to home
          router.push("/");
          break;
        
        case "CONTACT_SUPPORT":
          // Navigate to contact/support page
          router.push("/contact");
          break;
        
        case "CLOSE":
        default:
          // Navigate back to home
          router.push("/");
          break;
      }
    }, 300);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Modal */}
      <AuthErrorModal
        open={open}
        onClose={handleClose}
        errorInfo={errorInfo}
        onAction={handleAction}
      />
      
      {/* Background content - shown when modal is closed */}
      <div className="pt-32 px-4 max-w-md mx-auto text-center">
        <div className="space-y-2">
          <h1 className="text-xl font-semibold text-foreground">
            Authentication Error
          </h1>
          <p className="text-sm text-muted-foreground">
            We encountered a problem during authentication.
          </p>
        </div>
      </div>
    </div>
  );
}
