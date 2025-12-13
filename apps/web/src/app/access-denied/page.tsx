import Link from "next/link";
import { ShieldAlert } from "lucide-react";

export default async function AccessDeniedPage({
  searchParams,
}: {
  searchParams: Promise<{ required?: string; current?: string }>;
}) {
  const params = await searchParams;
  const requiredRole = params.required || "unknown";
  const currentRole = params.current || "user";

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full mx-auto p-8">
        <div className="text-center space-y-6">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="rounded-full bg-destructive/10 p-6">
              <ShieldAlert className="h-12 w-12 text-destructive" />
            </div>
          </div>

          {/* Content */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Access Denied</h1>
            <p className="text-muted-foreground">
              You don't have permission to access this page.
            </p>
          </div>

          {/* Details */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Required Role:</span>
              <span className="font-medium capitalize">{requiredRole}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Your Role:</span>
              <span className="font-medium capitalize">{currentRole}</span>
            </div>
          </div>

          {/* Action */}
          <div className="pt-4">
            <Link
              href={`/${currentRole}-dashboard`}
              className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Go to My Dashboard
            </Link>
          </div>

          {/* Help text */}
          <p className="text-xs text-muted-foreground">
            If you believe this is an error, please contact your administrator.
          </p>
        </div>
      </div>
    </div>
  );
}
