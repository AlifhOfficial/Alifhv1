"use client";

/**
 * Avatar component with Safari-safe image handling and graceful fallback for missing photos.
 */

import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  initials?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
}

const sizeClasses: Record<NonNullable<AvatarProps["size"]>, string> = {
  xs: "h-6 w-6 text-xs",
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
  xl: "h-16 w-16 text-lg",
};

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, src, alt = "Avatar", initials = "U", size = "md", ...props }, ref) => {
    const [hasError, setHasError] = React.useState(false);

    React.useEffect(() => {
      setHasError(false);
    }, [src]);

    // Validate URL before attempting to use it
    const isValidUrl = React.useMemo(() => {
      if (!src || typeof src !== 'string' || src.trim() === '') return false;
      try {
        // Check if it's a valid URL or a valid path
        if (src.startsWith('/') || src.startsWith('http://') || src.startsWith('https://')) {
          new URL(src, src.startsWith('/') ? 'http://localhost' : undefined);
          return true;
        }
        return false;
      } catch {
        return false;
      }
    }, [src]);

    const showImage = isValidUrl && !hasError;

    return (
      <div
        ref={ref}
        className={cn(
          "relative inline-flex items-center justify-center overflow-hidden rounded-full border border-border bg-card font-medium text-foreground",
          sizeClasses[size!],
          className
        )}
        {...props}
      >
        {showImage ? (
          <Image
            src={src as string}
            alt={alt}
            fill
            sizes="(max-width: 768px) 32px, 40px"
            className="object-cover"
            onError={() => setHasError(true)}
            referrerPolicy="no-referrer"
            priority={false}
          />
        ) : (
          <span className="uppercase">{initials}</span>
        )}
      </div>
    );
  }
);
Avatar.displayName = "Avatar";

export { Avatar };
export type { AvatarProps };
