/**
 * BrandAvatar Component - Reusable Avatar for Partners/Dealers/Brands
 * 
 * Features:
 * - Image with automatic CDN URL handling
 * - Fallback to initials when image fails or missing
 * - Circular shape across the mobile app
 * - Multiple sizes
 */

import { Text } from './text';
import React, { memo, useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { Image } from 'expo-image';

import { Sizes, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { getAppThumbUrl } from '@/lib/config';
import { getAvatarInitials } from './avatar-utils';

// ============================================================================
// TYPES
// ============================================================================

export type BrandAvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type BrandAvatarShape = 'round';

export interface BrandAvatarProps {
  /** Image URL (handles CDN conversion automatically) */
  src?: string | null;
  /** Name for fallback initial */
  name: string;
  /** Avatar size */
  size?: BrandAvatarSize;
  /** @deprecated Mobile avatars are standardized to circular. */
  shape?: BrandAvatarShape;
  /** Custom background color (defaults to surfaceSecondary) */
  backgroundColor?: string;
  /** Show border ring (for BLK partners) */
  showRing?: boolean;
  /** Ring border color */
  ringColor?: string;
  /** Use glass styling (transparent with border) */
  glass?: boolean;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const SIZES: Record<BrandAvatarSize, number> = {
  xs: Sizes.bubbleXs,
  sm: Sizes.avatarSm,                    // 32
  md: Sizes.avatarMd,                    // 40
  lg: Sizes.avatarLg,                    // 48
  xl: Sizes.avatarLg + Spacing.lg,       // 64
};

const IMAGE_BLURHASH = 'L6PZfSi_.AyE_3t7t7R**0o#DgR4';

// ============================================================================
// COMPONENT
// ============================================================================

export const BrandAvatar = memo(function BrandAvatar({
  src,
  name,
  size = 'lg',
  shape = 'round',
  backgroundColor,
  showRing = false,
  ringColor,
  glass = false,
}: BrandAvatarProps) {
  const { colors } = useTheme();
  const [imageError, setImageError] = useState(false);

  const handleImageError = useCallback(() => {
    setImageError(true);
  }, []);

  React.useEffect(() => {
    setImageError(false);
  }, [src]);

  const pixelSize = SIZES[size];
  const borderRadius = pixelSize / 2;
  
  // Glass styling or custom background
  const bgColor = glass ? colors.background : (backgroundColor ?? colors.surfaceSecondary);
  const borderColor = ringColor ?? colors.border;
  const borderWidth = showRing ? 2 : 1;
  
  // Convert to CDN URL if needed
  const imageUri = src ? getAppThumbUrl(src) : null;
  const showFallback = !imageUri || imageError;

  return (
    <View
      style={[
        styles.container,
        {
          width: pixelSize,
          height: pixelSize,
          borderRadius,
          backgroundColor: bgColor,
          borderWidth,
          borderColor,
        },
      ]}
    >
      {showFallback ? (
        <Text variant={size === 'xs' || size === 'sm' ? 'caption1Emphasized' : 'headline'} tone="secondary">
          {getAvatarInitials(name, 'B')}
        </Text>
      ) : (
        <Image
          source={{ uri: imageUri! }}
          style={[styles.image, { borderRadius }]}
          contentFit="cover"
          placeholder={IMAGE_BLURHASH}
          transition={200}
          onError={handleImageError}
        />
      )}
    </View>
  );
});

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
