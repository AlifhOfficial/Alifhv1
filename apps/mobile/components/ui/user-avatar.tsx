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

import { Text } from './text';
import React, { useState, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { useTheme } from '@/context/theme-context';
import { Colors, Sizes, Spacing, Typography, Fonts, Timing } from '@/constants/theme';
import { getAppImageUrl } from '@/lib/config';
import { getAvatarInitials } from './avatar-utils';

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
  xs: Typography.subhead.fontSize,
  sm: Typography.footnoteEmphasized.fontSize,
  md: Typography.subhead.fontSize,
  lg: Typography.body.fontSize,
  xl: Typography.title3Emphasized.fontSize,
  xxl: Typography.largeTitleEmphasized.fontSize,
};

export function UserAvatar({
  src,
  name,
  size = 'md',
   
  useGeneratedAvatar, // deprecated, ignored
}: UserAvatarProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  const pixelSize = sizes[size];
  const fontSize = fontSizes[size];

  // Convert storage key to CDN URL if needed
  const resolvedSrc = src ? getAppImageUrl(src) : null;

  // Show image if available, otherwise show initials
  const showImage = resolvedSrc && failedSrc !== resolvedSrc;

  // Match web styling: bg-card with border-border/40, consistent with BrandAvatar
  const containerStyle = useMemo(() => ({
    width: pixelSize,
    height: pixelSize,
    borderRadius: pixelSize / 2,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
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
          onError={() => setFailedSrc(resolvedSrc)}
          contentFit="cover"
          transition={Timing.avatarTransition}
        />
      )}
      {!showImage && (
        <Text
          style={[
            styles.initials,
            {
              fontSize,
              lineHeight: Math.round(fontSize * 1.1),
              color: colors.labelSecondary,
            },
          ]}
          variant="body"
        >
          {getAvatarInitials(name)}
        </Text>
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
    fontWeight: Fonts.bold,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
});
