'use client';

import { cn } from '@/utils';

interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}

export function FormField({ label, required, error, hint, children, className }: FormFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-baseline justify-between">
        <label className="text-footnote font-semibold tracking-tight text-foreground">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
        {hint && !error && (
          <span className="text-caption1 text-muted-foreground/60">{hint}</span>
        )}
      </div>
      {children}
      {error && (
        <p className="text-caption1 font-semibold text-red-500">{error}</p>
      )}
    </div>
  );
}
