/**
 * UserAvatar Component - Single Source of Truth for User Avatars
 * 
 * Avatar resolution:
 * 1. User-set profile image (uploaded) - if exists, show it
 * 2. No profile image → show initials
 * 
 * NOTE: OAuth images (Google, etc.) are NOT used as fallback.
 * Boring avatars/DiceBear robots have been removed - initials only.
 */

import React, { useState, useMemo, useEffect } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { useTheme } from '@/context/theme-context';
import { Colors, Sizes, Spacing, Typography } from '@/constants/theme';
import { getPublicUrl } from '@/lib/config';
import { Body } from './text';

interface UserAvatarProps {
  /** 
   * Avatar URL from profile
   * This is the ONLY image source - no OAuth fallback
   */
  src?: string | null;
  
  /** User's display name for initials */
  name?: string | null;
  
  /** Avatar size */
  size?: 'xxs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  
  /**
   * @deprecated No longer used - always shows initials when no photo
   */
  useGeneratedAvatar?: boolean;
}

// Avatar sizes mapped to theme tokens
const sizes = {
  xxs: Sizes.iconSm,                          // 16
  xs: Sizes.iconLg,                           // 24
  sm: Sizes.avatarSm,                         // 32
  md: Sizes.avatarMd,                         // 40
  lg: Sizes.avatarLg,                         // 48
  xl: Sizes.avatarLg + Spacing.lg,            // 64
  xxl: Sizes.avatarLg * 2 + Spacing.lg,       // 112
};

// Font sizes for initials - proportional to avatar size
const fontSizes = {
  xxs: 8,                                     // tiny
  xs: Typography.labelBadge.fontSize,         // ~10
  sm: Typography.labelSmall.fontSize,         // ~12
  md: Typography.labelMedium.fontSize,        // ~14
  lg: Typography.bodyMedium.fontSize,         // ~16
  xl: Typography.headingSmall.fontSize,       // ~22
  xxl: Typography.displayLarge.fontSize,      // ~34
};

/** Generate initials from a name */
function getInitials(name?: string | null): string {
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'U';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export function UserAvatar({
  src,
  name,
  size = 'md',
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  useGeneratedAvatar, // deprecated, ignored
}: UserAvatarProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  
  const [imageError, setImageError] = useState(false);

  // Reset error state when src changes
  useEffect(() => setImageError(false), [src]);

  const pixelSize = sizes[size];
  const fontSize = fontSizes[size];

  // Convert storage key to CDN URL if needed
  const resolvedSrc = src ? getPublicUrl(src) : null;

  // Show image if available, otherwise show initials
  const showImage = resolvedSrc && !imageError;

  // Match web styling: bg-card with border-border/40, consistent with BrandAvatar
  const containerStyle = useMemo(() => ({
    width: pixelSize,
    height: pixelSize,
    borderRadius: pixelSize / 2,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.glassBorderOnDark,
    overflow: 'hidden' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  }), [pixelSize, colors]);

  return (
    <View style={containerStyle}>
      {showImage && resolvedSrc && (
        <Image
          source={{ uri: resolvedSrc }}
          style={[styles.image, { borderRadius: pixelSize / 2 }]}
          onError={() => setImageError(true)}
          resizeMode="cover"
        />
      )}
      {!showImage && (
        <Body style={[styles.initials, { fontSize, color: colors.textSecondary }]}>
          {getInitials(name)}
        </Body>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    width: '100%',
    height: '100%',
  },
  initials: {
    fontFamily: 'Inter_700Bold', // font-bold to match BrandAvatar
  },
});
