import type { ReactNode } from "react";

interface DashboardDisplayAreaProps {
  title?: string;
  description?: string;
  action?: ReactNode;
  children?: ReactNode;
}

export function DashboardDisplayArea({ title, description, action, children }: DashboardDisplayAreaProps) {
  return (
    <div className="min-h-screen">
      {title ? (
        <header className="sticky top-0 z-10 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 px-6 py-4 md:px-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-base font-semibold text-foreground tracking-tight">{title}</h1>
              {description ? (
                <p className="text-sm text-muted-foreground/70 mt-0.5">{description}</p>
              ) : null}
            </div>
            {action && (
              <div className="flex-shrink-0">
                {action}
              </div>
            )}
          </div>
        </header>
      ) : null}
      <div className="w-full">{children}</div>
    </div>
  );
}
