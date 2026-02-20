/**
 * BrandAvatar Component - Reusable Avatar for Partners/Dealers/Brands
 * 
 * Features:
 * - Image with automatic CDN URL handling
 * - Fallback to initial letter when image fails or missing
 * - Round (private) or squared (dealer) variants
 * - Multiple sizes
 */

import React, { memo, useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { Image } from 'expo-image';

import { Sizes, Spacing, Radius } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { getThumbUrl } from '@/lib/config';
import { Heading } from './text';

// ============================================================================
// TYPES
// ============================================================================

export type BrandAvatarSize = 'sm' | 'md' | 'lg' | 'xl';
export type BrandAvatarShape = 'round' | 'square';

export interface BrandAvatarProps {
  /** Image URL (handles CDN conversion automatically) */
  src?: string | null;
  /** Name for fallback initial */
  name: string;
  /** Avatar size */
  size?: BrandAvatarSize;
  /** Shape: round for private sellers, square for dealers/brands */
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

  const pixelSize = SIZES[size];
  const borderRadius = shape === 'round' ? pixelSize / 2 : Radius.sm;
  
  // Glass styling or custom background
  const bgColor = glass ? colors.glassBackground : (backgroundColor ?? colors.surfaceSecondary);
  const borderColor = glass ? colors.glassBorderOnDark : (ringColor ?? colors.glassBorderOnDark);
  const shouldShowBorder = glass || showRing;
  
  // Convert to CDN URL if needed
  const imageUri = src ? (getThumbUrl(src) || src) : null;
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
        },
        shouldShowBorder && {
          borderWidth: glass ? 1 : 2,
          borderColor,
        },
      ]}
    >
      {showFallback ? (
        <Heading size="small" tone="secondary">
          {name.charAt(0).toUpperCase()}
        </Heading>
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
