/**
 * Skeleton Component
 * 
 * Follows Alifh Design Philosophy:
 * - Subtle loading state
 * - Minimal animation
 */

import { cn } from "@/lib/utils";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-lg bg-muted", className)}
      {...props}
    />
  );
}

export { Skeleton };
