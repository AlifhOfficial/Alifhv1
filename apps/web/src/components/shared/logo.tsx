/**
 * Logo Component
 * Theme-aware logo that handles hydration properly
 */

"use client";

import Image from "next/image";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
}

export function Logo({ className, width = 100, height = 30, priority = false }: LogoProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Determine if dark theme (includes charcoal)
  const isDark = resolvedTheme === "dark" || resolvedTheme === "charcoal";

  // Before mount, render both with CSS visibility to avoid hydration mismatch
  if (!mounted) {
    return (
      <span className={cn("inline-block", className)}>
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

  // After mount, render the correct logo
  return (
    <Image
      src={isDark ? "/assets/Revvup_logo_White.svg" : "/assets/Revvup_logo_Black.svg"}
      alt="Revvup"
      width={width}
      height={height}
      className={cn("h-full w-auto", className)}
      priority={priority}
    />
  );
}
