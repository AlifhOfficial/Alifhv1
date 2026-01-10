/**
 * Auth Error Page - Alifh Design System
 * Better Auth error redirect target
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
