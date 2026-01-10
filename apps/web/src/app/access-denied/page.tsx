import Link from "next/link";
import { ShieldX, Home, LayoutDashboard } from "lucide-react";
import { cn } from "@/utils/cn";

export default async function AccessDeniedPage({
  searchParams,
}: {
  searchParams: Promise<{ required?: string; current?: string }>;
}) {
  const params = await searchParams;
  const currentRole = params.current || "user";

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-sm w-full text-center space-y-6">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
            <ShieldX className="h-6 w-6 text-destructive" />
          </div>
        </div>

        {/* Message */}
        <div className="space-y-1">
          <h1 className="text-xl font-semibold text-foreground tracking-tight">
            Access denied
          </h1>
          <p className="text-sm text-muted-foreground">
            You don't have permission to access this page.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 pt-2">
          <Link
            href={`/${currentRole}-dashboard`}
            className={cn(
              "h-10 inline-flex items-center justify-center gap-2 rounded-lg text-sm font-semibold transition-colors",
              "bg-primary text-primary-foreground hover:bg-primary/90"
            )}
          >
            <LayoutDashboard className="h-4 w-4" />
            Go to dashboard
          </Link>
          <Link
            href="/"
            className={cn(
              "h-10 inline-flex items-center justify-center gap-2 rounded-lg text-sm font-semibold transition-colors",
              "bg-muted/30 text-foreground hover:bg-muted/50"
            )}
          >
            <Home className="h-4 w-4" />
            Go home
          </Link>
        </div>

        {/* Help text */}
        <p className="text-xs text-muted-foreground">
          Think this is a mistake? Contact support.
        </p>
      </div>
    </div>
  );
}
