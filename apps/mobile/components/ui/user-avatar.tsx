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
 */

import React, { useState, useMemo, useEffect } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { useTheme } from '@/context/theme-context';
import { Colors, Sizes, Spacing, Typography } from '@/constants/theme';
import { getPublicUrl } from '@/lib/config';
import { Body } from './text';

// DiceBear style - fun robot characters with transparent backgrounds
const DICEBEAR_STYLE = 'bottts';

interface UserAvatarProps {
  /** 
   * Avatar URL from profile
   * This is the ONLY image source - no OAuth fallback
   */
  src?: string | null;
  
  /** User's display name for initials/generated avatar seed */
  name?: string | null;
  
  /** Avatar size */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  
  /**
   * Fallback preference: true = DiceBear robot, false = initials
   * Controlled by user in settings. Defaults to true (robot).
   */
  useGeneratedAvatar?: boolean;
}

// Avatar sizes mapped to theme tokens
const sizes = {
  xs: Sizes.iconLg,                           // 24
  sm: Sizes.avatarSm,                         // 32
  md: Sizes.avatarMd,                         // 40
  lg: Sizes.avatarLg,                         // 48
  xl: Sizes.avatarLg + Spacing.lg,            // 64
  xxl: Sizes.avatarLg * 2 + Spacing.lg,       // 112
};

// Font sizes for initials - proportional to avatar size
const fontSizes = {
  xs: Typography.labelBadge.fontSize,         // ~10
  sm: Typography.labelSmall.fontSize,         // ~12
  md: Typography.labelMedium.fontSize,        // ~14
  lg: Typography.bodyMedium.fontSize,         // ~16
  xl: Typography.headingSmall.fontSize,       // ~22
  xxl: Typography.displayLarge.fontSize,      // ~34
};

/** Generate DiceBear avatar URL */
function getGeneratedAvatarUrl(seed: string, size: number): string {
  const encodedSeed = encodeURIComponent(seed.trim() || 'user');
  return `https://api.dicebear.com/9.x/${DICEBEAR_STYLE}/png?seed=${encodedSeed}&size=${size}&backgroundColor=transparent`;
}

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
  useGeneratedAvatar = true,
}: UserAvatarProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  
  const [imageError, setImageError] = useState(false);
  const [generatedError, setGeneratedError] = useState(false);

  // Reset error states when inputs change
  useEffect(() => setImageError(false), [src]);
  useEffect(() => setGeneratedError(false), [name, size]);

  const pixelSize = sizes[size];
  const fontSize = fontSizes[size];
  const displayName = name || 'User';
  const generatedAvatarUrl = getGeneratedAvatarUrl(displayName, pixelSize * 2);

  // Convert storage key to CDN URL if needed
  const resolvedSrc = src ? getPublicUrl(src) : null;

  // Determine what to show: image → generated robot → initials
  const showImage = resolvedSrc && !imageError;
  const showGenerated = !showImage && useGeneratedAvatar && !generatedError;
  const showInitials = !showImage && !showGenerated;

  // Match web styling: border-border bg-card for container
  // For initials fallback: bg-muted with text-foreground
  const containerStyle = useMemo(() => ({
    width: pixelSize,
    height: pixelSize,
    borderRadius: pixelSize / 2,
    backgroundColor: showInitials 
      ? colors.surfaceSecondary
      : colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  }), [pixelSize, showInitials, colors]);

  return (
    <View style={containerStyle}>
      {showImage && resolvedSrc && (
        <Image
          source={{ uri: resolvedSrc }}
          style={styles.image}
          onError={() => setImageError(true)}
          resizeMode="cover"
        />
      )}
      {showGenerated && (
        <Image
          source={{ uri: generatedAvatarUrl }}
          style={styles.image}
          onError={() => setGeneratedError(true)}
          resizeMode="contain"
        />
      )}
      {showInitials && (
        <Body style={[styles.initials, { fontSize }]}>
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
    fontFamily: 'Inter_500Medium', // font-medium like web
  },
});
