import Link from "next/link";
import { AlertCircle } from "lucide-react";

export default async function AccessDeniedPage({
  searchParams,
}: {
  searchParams: Promise<{ required?: string; current?: string }>;
}) {
  const params = await searchParams;
  const currentRole = params.current || "user";

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full mx-auto text-center space-y-8">
        <div className="space-y-3">
          <div className="flex justify-center mb-4">
            <AlertCircle className="w-10 h-10 text-rose-600" />
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">Access Denied</h1>
          <p className="text-muted-foreground">
            You don't have permission to access this page
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href={`/${currentRole}-dashboard`}
            className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Go to Dashboard
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-lg border border-border px-6 py-2.5 text-sm font-medium hover:bg-accent transition-colors"
          >
            Home
          </Link>
        </div>

        <p className="text-sm text-muted-foreground">
          If you think we made a mistake, please reach out to us
        </p>
      </div>
    </div>
  );
}
