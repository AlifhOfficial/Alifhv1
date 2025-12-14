'use client';

import { type ReactNode } from 'react';

export function DashboardLayoutProvider({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      {children}
    </div>
  );
}

export function DashboardMainContent({ children }: { children: ReactNode }) {
  return (
    <main className="flex-1 h-screen overflow-y-auto">
      {children}
    </main>
  );
}