/**
 * Auth Error Page
 * 
 * Catches all Better Auth errors and displays them in your modal UI/UX
 * This page is set as the errorURL in Better Auth config
 * 
 * When Better Auth encounters an error (OAuth, verification, etc.),
 * it redirects here with an error code/message in the URL params
 */

import { Suspense } from "react";
import { AuthErrorView } from "@/components/auth/auth-error-view";
import { PageLoader } from "@/components/shared/page-loader";

export default function AuthErrorPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <AuthErrorView />
    </Suspense>
  );
}
