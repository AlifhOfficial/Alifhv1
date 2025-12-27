"use client";

/**
 * UserAvatar Component - Single Source of Truth for User Avatars
 * 
 * This component establishes a consistent avatar resolution strategy:
 * 1. Custom profile avatar (uploaded by user) - highest priority
 * 2. OAuth provider image (e.g., Google profile picture) - fallback
 * 3. Initials - final fallback
 * 
 * Always use this component for displaying user avatars throughout the app.
 * For brand/partner logos, use BrandAvatar instead.
 * 
 * @example
 * // With profile data (from useUserProfile hook)
 * <UserAvatar 
 *   profileAvatar={profile?.avatarUrl}
 *   oauthImage={user?.image}
 *   name={displayName}
 * />
 * 
 * // With pre-resolved URL (from database queries)
 * <UserAvatar 
 *   src={sellerAvatarUrl}
 *   name={sellerName}
 * />
 */

import * as React from "react";
import Image from "next/image";
import { cn, getPublicUrl } from "@/utils";

// DiceBear avatar styles - gender neutral illustrated characters with transparent backgrounds
// Options: "lorelei" (minimal faces), "notionists" (notion-style), "personas" (illustrated people)
// "adventurer-neutral" (adventure characters), "fun-emoji" (emoji faces)
const DICEBEAR_STYLE = "bottts"; // Fun robot/creature characters with big eyes

interface UserAvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 
   * Pre-resolved avatar URL - use when source is already determined
   * (e.g., from database COALESCE query)
   */
  src?: string | null;
  
  /**
   * Profile avatar URL or storage key - takes priority over oauthImage
   * Use this with profile?.avatarUrl from useUserProfile hook
   */
  profileAvatar?: string | null;
  
  /**
   * OAuth provider image URL (e.g., Google profile picture)
   * Used as fallback when profileAvatar is not set
   */
  oauthImage?: string | null;
  
  /** User's display name for generating initials */
  name?: string | null;
  
  /** Explicit initials to display (overrides name-derived initials) */
  initials?: string;
  
  /** Alt text for the image */
  alt?: string;
  
  /** Avatar size */
  size?: "xs" | "sm" | "md" | "lg" | "xl";
}

const sizeClasses: Record<NonNullable<UserAvatarProps["size"]>, string> = {
  xs: "h-6 w-6 text-xs",
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
  xl: "h-16 w-16 text-lg",
};

// Boring Avatars color palette - matches our design system
const AVATAR_COLORS = ["#0ea5e9", "#8b5cf6", "#ec4899", "#f97316", "#10b981"];

/**
 * Generates a DiceBear avatar URL with transparent background
 * Using lorelei-neutral style for clean, gender-neutral illustrated faces
 */
function getGeneratedAvatarUrl(seed: string, size: number): string {
  const encodedSeed = encodeURIComponent(seed.trim() || "user");
  return `https://api.dicebear.com/9.x/${DICEBEAR_STYLE}/svg?seed=${encodedSeed}&size=${size}&backgroundColor=transparent`;
}

/**
 * Generates initials from a name
 */
function getInitials(name?: string | null, fallback = "U"): string {
  if (!name) return fallback;
  
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return fallback;
  
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

const UserAvatar = React.forwardRef<HTMLDivElement, UserAvatarProps>(
  ({ 
    className, 
    src: directSrc,
    profileAvatar,
    oauthImage,
    name,
    initials,
    alt = "User avatar", 
    size = "md", 
    ...props 
  }, ref) => {
    const [hasError, setHasError] = React.useState(false);

    // Resolve the avatar URL with priority:
    // 1. Direct src (pre-resolved, e.g., from DB query)
    // 2. Profile avatar (custom upload)
    // 3. OAuth image (Google, etc.)
    const resolvedUrl = React.useMemo(() => {
      // If direct src is provided, use it (already resolved)
      if (directSrc) {
        return getPublicUrl(directSrc);
      }
      
      // Profile avatar takes priority over OAuth
      if (profileAvatar) {
        return getPublicUrl(profileAvatar);
      }
      
      // Fall back to OAuth image
      if (oauthImage) {
        // OAuth images are already full URLs
        return oauthImage;
      }
      
      return null;
    }, [directSrc, profileAvatar, oauthImage]);

    // Reset error state when URL changes
    React.useEffect(() => {
      setHasError(false);
    }, [resolvedUrl]);

    const displayName = name || initials || "User";
    const showImage = resolvedUrl && !hasError;

    // Get pixel size for generated avatars
    const avatarSize = size === "xs" ? 24 : size === "sm" ? 32 : size === "md" ? 40 : size === "lg" ? 48 : 64;
    
    // Generate fallback avatar URL
    const generatedAvatarUrl = getGeneratedAvatarUrl(displayName, avatarSize * 2); // 2x for retina

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
        {showImage ? (
          <Image
            src={resolvedUrl}
            alt={alt}
            fill
            sizes="(max-width: 768px) 32px, 40px"
            className="object-cover"
            onError={() => setHasError(true)}
            referrerPolicy="no-referrer"
            priority={false}
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={generatedAvatarUrl}
            alt={alt}
            className="h-full w-full"
          />
        )}
      </div>
    );
  }
);
UserAvatar.displayName = "UserAvatar";

export { UserAvatar };
export type { UserAvatarProps };
