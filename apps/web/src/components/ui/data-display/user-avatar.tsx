"use client";

/**
 * UserAvatar Component - Single Source of Truth for User Avatars
 * 
 * Avatar resolution:
 * 1. User-set profile image (uploaded) - if exists, show it
 * 2. No profile image → show initials
 * 
 * NOTE: OAuth images (Google, etc.) are NOT used as fallback.
 * Boring avatars/DiceBear robots have been removed - initials only.
 * 
 * Usage:
 * @example
 * // From pre-resolved DB query (profile.avatar only, no COALESCE with OAuth)
 * <UserAvatar src={avatarUrl} name={displayName} />
 * 
 * @example
 * // From session/profile data
 * <UserAvatar 
 *   src={profile?.avatarUrl}
 *   name={displayName}
 * />
 */

import * as React from "react";
import { cn, getPublicUrl } from "@/utils";

interface UserAvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 
   * Avatar URL or storage key from profile
   * This is the ONLY image source - no OAuth fallback
   */
  src?: string | null;
  
  /** 
   * @deprecated Use `src` instead. Kept for backward compatibility.
   * Profile avatar (user-uploaded)
   */
  profileAvatar?: string | null;
  
  /** User's display name for initials */
  name?: string | null;
  
  /** Alt text for the image */
  alt?: string;
  
  /** Avatar size */
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  
  /**
   * @deprecated No longer used - always shows initials when no photo
   */
  useGeneratedAvatar?: boolean;
  
  /** Updated timestamp for cache busting (Date, string, or timestamp) */
  updatedAt?: Date | string | number | null;
}

const sizeClasses: Record<NonNullable<UserAvatarProps["size"]>, string> = {
  xs: "h-6 w-6 text-xs",
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
  xl: "h-16 w-16 text-lg",
};

/** Generate initials from a name */
function getInitials(name?: string | null): string {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

const UserAvatar = React.forwardRef<HTMLDivElement, UserAvatarProps>(
  ({ 
    className, 
    src: directSrc,
    profileAvatar, // deprecated, kept for backward compat
    name,
    alt = "User avatar", 
    size = "md",
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    useGeneratedAvatar, // deprecated, ignored
    updatedAt,
    ...props 
  }, ref) => {
    const [imageError, setImageError] = React.useState(false);

    // Resolve avatar URL: src or profileAvatar (no OAuth fallback) with cache busting
    const resolvedUrl = React.useMemo(() => {
      const avatarSource = directSrc || profileAvatar;
      if (!avatarSource) return null;
      const cacheBuster = updatedAt ? new Date(updatedAt).getTime() : undefined;
      return getPublicUrl(avatarSource, cacheBuster);
    }, [directSrc, profileAvatar, updatedAt]);

    // Reset error state when src changes
    React.useEffect(() => setImageError(false), [resolvedUrl]);

    // Calculate sizes
    const pixelSize = size === "xs" ? 24 : size === "sm" ? 32 : size === "md" ? 40 : size === "lg" ? 48 : 64;

    // Show image if available, otherwise show initials
    const showImage = resolvedUrl && !imageError;

    return (
      <div
        ref={ref}
        className={cn(
          "relative inline-flex items-center justify-center overflow-hidden rounded-full bg-card border border-border/40 flex-shrink-0",
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {showImage && resolvedUrl && (
          <img
            key={resolvedUrl}
            src={resolvedUrl}
            alt={alt}
            className="absolute inset-0 h-full w-full object-cover"
            onError={() => setImageError(true)}
            referrerPolicy="no-referrer"
            loading="lazy"
            decoding="async"
          />
        )}
        {!showImage && (
          <span className="font-bold text-muted-foreground select-none">{getInitials(name)}</span>
        )}
      </div>
    );
  }
);
UserAvatar.displayName = "UserAvatar";

export { UserAvatar };
export type { UserAvatarProps };
