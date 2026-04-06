/**
 * Logo Component
 * Shared canonical brand SVG wrapper.
 */

import { BRAND_LOGO_SVG } from "@/lib/brand-assets";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
}

export function Logo({ className, width = 100, height = 30, priority = false }: LogoProps) {
  return (
    <span
      aria-label="Revvup"
      className={cn("inline-flex items-center text-foreground", className)}
      style={{ width, height }}
      data-priority={priority ? "true" : undefined}
    >
      <img
        src={BRAND_LOGO_SVG}
        alt="Revvup"
        width={width}
        height={height}
        className="block h-full w-full object-contain invert dark:invert-0"
      />
    </span>
  );
}
