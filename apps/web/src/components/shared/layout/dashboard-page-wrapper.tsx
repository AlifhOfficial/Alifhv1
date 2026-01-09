/**
 * Dashboard Page Wrapper
 * Consistent layout wrapper for all dashboard pages
 * Provides uniform max-width, padding, and spacing
 */

import { cn } from '@/utils/cn';

interface DashboardPageWrapperProps {
  children: React.ReactNode;
  className?: string;
  /** Use wide layout for grid-based pages (favorites, superlikes, etc.) */
  wide?: boolean;
}

export function DashboardPageWrapper({ 
  children, 
  className,
  wide = false,
}: DashboardPageWrapperProps) {
  return (
    <div 
      className={cn(
        'mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8',
        wide ? 'max-w-6xl' : 'max-w-5xl',
        className
      )}
    >
      {children}
    </div>
  );
}

/**
 * Dashboard Page Header
 * Consistent header styling for dashboard pages
 */
interface DashboardPageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export function DashboardPageHeader({ 
  title, 
  description, 
  children 
}: DashboardPageHeaderProps) {
  return (
    <header className="flex items-start justify-between gap-4">
      <div className="space-y-1.5">
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {description && (
          <p className="text-[15px] font-medium text-muted-foreground/70">{description}</p>
        )}
      </div>
      {children && (
        <div className="flex items-center gap-2 shrink-0">
          {children}
        </div>
      )}
    </header>
  );
}
