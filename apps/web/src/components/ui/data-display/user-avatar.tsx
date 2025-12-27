"use client";

/**
 * UserAvatar Component - Single Source of Truth for User Avatars
 * 
 * Avatar resolution:
 * 1. User-set profile image (uploaded) - if exists, show it
 * 2. No profile image → show DiceBear robot OR initials (based on preference)
 * 
 * NOTE: OAuth images (Google, etc.) are NOT used as fallback.
 * Once a user interacts with their avatar (upload/remove), only their
 * preference (robot or initials) is used as fallback.
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
 *   useGeneratedAvatar={preferences?.useGeneratedAvatar ?? true}
 * />
 */

import * as React from "react";
import Image from "next/image";
import { cn, getPublicUrl } from "@/utils";

// DiceBear style - fun robot characters with transparent backgrounds
const DICEBEAR_STYLE = "bottts";

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
  
  /** User's display name for initials/generated avatar seed */
  name?: string | null;
  
  /** Alt text for the image */
  alt?: string;
  
  /** Avatar size */
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  
  /**
   * Fallback preference: true = DiceBear robot, false = initials
   * Controlled by user in settings. Defaults to true (robot).
   */
  useGeneratedAvatar?: boolean;
}

const sizeClasses: Record<NonNullable<UserAvatarProps["size"]>, string> = {
  xs: "h-6 w-6 text-xs",
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
  xl: "h-16 w-16 text-lg",
};

/** Generate DiceBear avatar URL */
function getGeneratedAvatarUrl(seed: string, size: number): string {
  const encodedSeed = encodeURIComponent(seed.trim() || "user");
  return `https://api.dicebear.com/9.x/${DICEBEAR_STYLE}/svg?seed=${encodedSeed}&size=${size}&backgroundColor=transparent`;
}

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
    useGeneratedAvatar = true,
    ...props 
  }, ref) => {
    const [imageError, setImageError] = React.useState(false);
    const [generatedError, setGeneratedError] = React.useState(false);

    // Resolve avatar URL: src or profileAvatar (no OAuth fallback)
    const resolvedUrl = React.useMemo(() => {
      const avatarSource = directSrc || profileAvatar;
      if (avatarSource) return getPublicUrl(avatarSource);
      return null;
    }, [directSrc, profileAvatar]);

    // Reset error states when inputs change
    React.useEffect(() => setImageError(false), [resolvedUrl]);
    React.useEffect(() => setGeneratedError(false), [name, size]);

    // Calculate sizes
    const pixelSize = size === "xs" ? 24 : size === "sm" ? 32 : size === "md" ? 40 : size === "lg" ? 48 : 64;
    const displayName = name || "User";
    const generatedAvatarUrl = getGeneratedAvatarUrl(displayName, pixelSize * 2);

    // Determine what to show: image → generated robot → initials
    const showImage = resolvedUrl && !imageError;
    const showGenerated = !showImage && useGeneratedAvatar && !generatedError;
    const showInitials = !showImage && !showGenerated;

    return (
      <div
        ref={ref}
        className={cn(
          "relative inline-flex items-center justify-center overflow-hidden rounded-full border border-border bg-card font-medium text-foreground",
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {showImage && resolvedUrl && (
          <Image
            key={resolvedUrl}
            src={resolvedUrl}
            alt={alt}
            fill
            sizes={`${pixelSize * 2}px`}
            className="object-cover"
            onError={() => setImageError(true)}
            referrerPolicy="no-referrer"
            unoptimized={resolvedUrl.includes('r2.dev')}
          />
        )}
        {showGenerated && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={generatedAvatarUrl}
            alt={alt}
            className="h-full w-full"
            onError={() => setGeneratedError(true)}
          />
        )}
        {showInitials && (
          <span className="select-none">{getInitials(name)}</span>
        )}
      </div>
    );
  }
);
UserAvatar.displayName = "UserAvatar";

export { UserAvatar };
export type { UserAvatarProps };
