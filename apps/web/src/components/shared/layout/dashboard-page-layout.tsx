/**
 * Dashboard Page Layout - Revvup Design System
 * Reusable layout component for consistent spacing and structure across all dashboard pages
 */

import { type ReactNode } from 'react';

interface DashboardPageLayoutProps {
  /** Page title displayed in header - can be string or ReactNode for complex titles */
  title: ReactNode;
  /** Optional action buttons/components in the header */
  headerActions?: ReactNode;
  /** Main content of the page */
  children: ReactNode;
  /** Optional footer content */
  footer?: ReactNode;
  /** Show footer - defaults to false */
  showFooter?: boolean;
}

export function DashboardPageLayout({
  title,
  headerActions,
  children,
  footer,
  showFooter = false,
}: DashboardPageLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        {/* Header */}
        <header className="flex items-center justify-between mb-4 sm:mb-6 pb-4 sm:pb-6 border-b border-border">
          <div className="text-lg sm:text-xl lg:text-2xl font-semibold tracking-tight">{title}</div>
          {headerActions && <div>{headerActions}</div>}
        </header>

        {/* Content */}
        <div>{children}</div>

        {/* Footer */}
        {showFooter && footer && (
          <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-border">{footer}</div>
        )}
      </div>
    </div>
  );
}
