/**
 * Logo Component
 * Theme-aware logo using pure CSS for instant switching
 * No JS-based theme detection to avoid hydration mismatches
 */

import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
}

export function Logo({ className, width = 100, height = 30, priority = false }: LogoProps) {
  return (
    <span className={cn("inline-block relative", className)}>
      <Image
        src="/assets/Revvup_logo_Black.svg"
        alt="Revvup"
        width={width}
        height={height}
        className="h-full w-auto dark:hidden"
        priority={priority}
      />
      <Image
        src="/assets/Revvup_logo_White.svg"
        alt="Revvup"
        width={width}
        height={height}
        className="h-full w-auto hidden dark:block"
        priority={priority}
      />
    </span>
  );
}
