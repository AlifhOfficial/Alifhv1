"use client";

/**
 * UserAvatar Component - Single Source of Truth for User Avatars
 * 
 * Built on shadcn's Avatar component with smart resolution strategy:
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn, getPublicUrl } from "@/utils";

interface UserAvatarProps extends React.ComponentProps<typeof Avatar> {
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
  
  /** Avatar shape */
  shape?: "circle" | "square";
}

const sizeClasses: Record<NonNullable<UserAvatarProps["size"]>, string> = {
  xs: "h-6 w-6 text-xs",
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
  xl: "h-16 w-16 text-lg",
};

const shapeClasses: Record<NonNullable<UserAvatarProps["shape"]>, string> = {
  circle: "rounded-full",
  square: "rounded-lg",
};

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

function UserAvatar({ 
  className, 
  src: directSrc,
  profileAvatar,
  oauthImage,
  name,
  initials,
  alt = "User avatar", 
  size = "md",
  shape = "circle",
  ...props 
}: UserAvatarProps) {
  // Resolve the avatar URL with priority:
  // 1. Direct src (pre-resolved, e.g., from DB query)
  // 2. Profile avatar (custom upload)
  // 3. OAuth image (Google, etc.)
  // 4. Generated avatar (DiceBear/Boring Avatars)
  const resolvedUrl = React.useMemo(() => {
    let url: string | null = null;
    
    // If direct src is provided, use it (already resolved)
    if (directSrc) {
      url = getPublicUrl(directSrc);
    }
    // Profile avatar takes priority over OAuth
    else if (profileAvatar) {
      url = getPublicUrl(profileAvatar);
    }
    // Fall back to OAuth image
    else if (oauthImage) {
      // OAuth images are already full URLs
      url = oauthImage;
    }
    // Generate avatar if no image available
    else if (name) {
      // Use DiceBear bottts - cute robots, gender-neutral
      const seed = encodeURIComponent(name);
      url = `https://api.dicebear.com/7.x/bottts/svg?seed=${seed}`;
    }
    
    return url;
  }, [directSrc, profileAvatar, oauthImage, name]);

  const displayInitials = initials || getInitials(name);

  return (
    <Avatar
      className={cn(
        "border border-border",
        sizeClasses[size],
        shapeClasses[shape],
        className
      )}
      {...props}
    >
      {resolvedUrl && (
        <AvatarImage 
          src={resolvedUrl} 
          alt={alt}
        />
      )}
      <AvatarFallback className={cn("uppercase font-medium", shapeClasses[shape])}>
        {displayInitials}
      </AvatarFallback>
    </Avatar>
  );
}

export { UserAvatar };
export type { UserAvatarProps };
