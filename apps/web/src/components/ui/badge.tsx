/**
 * Badge Component
 * 
 * Follows Alifh Design Philosophy:
 * - Small size
 * - Semantic colors
 * - Clean rounded corners
 */

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded border px-3 py-1 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary",
        secondary:
          "border-transparent bg-muted text-foreground hover:bg-muted",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive",
        outline: "text-foreground border-border/40",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
