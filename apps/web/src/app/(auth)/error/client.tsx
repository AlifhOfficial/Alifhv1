"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthErrorModal } from "@/components/auth/feedback/auth-error-modal";
import { getAuthErrorInfo, AuthErrorAction } from "@/lib/auth/errors";
import { Navbar } from "@/components/navbar";

export function AuthErrorPageClient() {
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
          // Navigate to home and trigger sign-in modal
          router.push("/?auth=signin");
          break;
        
        case "SIGN_UP":
          // Navigate to home and trigger sign-up modal
          router.push("/?auth=signup");
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
      <div className="pt-32 px-4 max-w-2xl mx-auto text-center">
        <div className="space-y-4 opacity-50">
          <h1 className="text-2xl font-bold text-foreground">
            Authentication Error
          </h1>
          <p className="text-muted-foreground">
            We encountered a problem during authentication.
          </p>
        </div>
      </div>
    </div>
  );
}
