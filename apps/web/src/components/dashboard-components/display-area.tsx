import type { ReactNode } from "react";

interface DashboardDisplayAreaProps {
  title?: string;
  description?: string;
  action?: ReactNode;
  children?: ReactNode;
}

export function DashboardDisplayArea({ title, description, action, children }: DashboardDisplayAreaProps) {
  return (
    <main className="flex-1 overflow-y-auto">
      {title ? (
        <header className="space-y-2 border-b border-border bg-card px-6 py-6 md:px-10">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-medium text-foreground">{title}</h1>
              {description ? (
                <p className="text-sm text-muted-foreground mt-2">{description}</p>
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
      <div className="h-full w-full">{children}</div>
    </main>
  );
}
