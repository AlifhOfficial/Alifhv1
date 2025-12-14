import type { ReactNode } from "react";

interface DashboardDisplayAreaProps {
  title?: string;
  description?: string;
  children?: ReactNode;
}

export function DashboardDisplayArea({ title, description, children }: DashboardDisplayAreaProps) {
  return (
    <main className="flex-1 overflow-y-auto">
      {title ? (
        <header className="space-y-2 border-b border-border bg-card px-6 py-6 md:px-10">
          <h1 className="text-xl font-medium text-foreground">{title}</h1>
          {description ? (
            <p className="text-sm text-muted-foreground">{description}</p>
          ) : null}
        </header>
      ) : null}
      <div className="h-full w-full">{children}</div>
    </main>
  );
}
