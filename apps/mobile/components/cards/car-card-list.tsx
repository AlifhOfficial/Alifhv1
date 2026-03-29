/**
 * Car Card List View - Revvup Design System
 * Clean, minimal horizontal list item
 * Fully adaptive - all values from theme constants
 */

import { HapticPressable, Skeleton, SkeletonCircle, Text, FavoriteButton, SuperlikeButton } from '@/components/ui';
import React, { useCallback, memo, useMemo } from 'react';
import { StyleSheet, View, ImageSourcePropType } from 'react-native';
import { Image, ImageSource } from 'expo-image';
import { Share2 } from 'lucide-react-native';

import { Colors, Spacing, Radius, Layout, Sizes } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { getAppThumbUrl } from '@/lib/config';
import { shareListing } from '@/lib/listing-share';

// ============================================================================
// CONSTANTS (Adaptive)
// ============================================================================

const IMAGE_TRANSITION_MS = 150;
const ICON_STROKE_WIDTH = 1.75;

// ============================================================================
// UTILITIES
// ============================================================================

const priceFormatter = new Intl.NumberFormat('en-AE', {
  style: 'currency',
  currency: 'AED',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

function formatPrice(amount: number): string {
  return priceFormatter.format(amount);
}

function formatMileage(km: number): string {
  return km >= 1000 ? `${(km / 1000).toFixed(0)}k km` : `${km} km`;
}

const EMIRATE_SHORT: Record<string, string> = {
  'dubai': 'DXB',
  'abu_dhabi': 'AUH',
  'abu dhabi': 'AUH',
  'abudhabi': 'AUH',
  'sharjah': 'SHJ',
  'ajman': 'AJM',
  'ras_al_khaimah': 'RAK',
  'ras al khaimah': 'RAK',
  'ras al-khaimah': 'RAK',
  'rasalkhaimah': 'RAK',
  'fujairah': 'FUJ',
  'umm_al_quwain': 'UAQ',
  'umm al quwain': 'UAQ',
  'umm al-quwain': 'UAQ',
  'ummalquwain': 'UAQ',
};

const SPECS_SHORT: Record<string, string> = {
  'gcc': 'GCC',
  'us': 'US',
  'european': 'EU',
  'japanese': 'JP',
  'canadian': 'CA',
  'american': 'US',
};

// ============================================================================
// TYPES
// ============================================================================

interface CardTheme {
  bg: string;
  border: string;
  text: string;
  price: string;
  meta: string;
  icon: string;
  imageBg: string;
}

export interface CarCardListProps {
  id: string;
  make: string;
  model: string;
  year: number;
  trim?: string | null;
  price: number;
  mileage: number;
  emirate: string;
  specs?: string | null;
  thumbnail?: ImageSourcePropType | string | null;
  images?: (ImageSourcePropType | string)[];
  isBlkListing?: boolean;
  partnerName?: string | null;
  partnerLogo?: string | null;
  partnerVerified?: boolean;
  isBlackTierPartner?: boolean;
  sellerName?: string | null;
  sellerAvatarUrl?: string | null;
  kycVerified?: boolean;
  isFavorite?: boolean;
  isSuperliked?: boolean;
  showSuperlike?: boolean;
  showShare?: boolean;
  onPress?: (id: string) => void;
  onPressIn?: (id: string) => void;
  onFavoritePress?: (id: string) => void;
  onSuperlikePress?: (id: string) => void;
  onSharePress?: (id: string) => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

/** Derives card theme colors based on listing type */
function useCardTheme(colors: typeof Colors.light, isBlkListing: boolean): CardTheme {
  return useMemo(() => {
    if (isBlkListing) {
      return {
        bg: colors.background,
        border: colors.border,
        text: colors.label,
        price: colors.label,
        meta: colors.labelSecondary,
        icon: colors.labelSecondary,
        imageBg: colors.background,
      };
    }
    // Surface aesthetic - standard card styling (matches car-card-m)
    return {
      bg: colors.surface,
      border: colors.border,
      text: colors.label,
      price: colors.primary,
      meta: colors.labelSecondary,
      icon: colors.label,
      imageBg: colors.surfaceSecondary,
    };
  }, [colors, isBlkListing]);
}

export const CarCardList = memo(function CarCardList({
  id,
  make,
  model,
  year,
  trim,
  price,
  mileage,
  emirate,
  specs = 'GCC',
  thumbnail,
  images,
  isBlkListing = false,
  isFavorite: isFavoriteProp,
  isSuperliked: isSuperlikedProp,
  showSuperlike = true,
  showShare = true,
  onPress,
  onPressIn,
  onFavoritePress,
  onSuperlikePress,
  onSharePress,
}: CarCardListProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const theme = useCardTheme(colors, isBlkListing);

  // Derived values - use thumb URL for optimized card display
  const rawImage = thumbnail || images?.[0];
  // Only apply thumb URL conversion for string URLs (not local require() assets)
  const displayImage = typeof rawImage === 'string' ? getAppThumbUrl(rawImage) : rawImage;
  const displayEmirate = emirate ? (EMIRATE_SHORT[emirate.toLowerCase()] || emirate) : '';
  const displaySpecs = specs ? (SPECS_SHORT[specs.toLowerCase()] || specs) : 'GCC';

  // Handlers
  const handlePress = useCallback(() => onPress?.(id), [id, onPress]);
  const handlePressIn = useCallback(() => onPressIn?.(id), [id, onPressIn]);
  const handleSharePress = useCallback(async () => {
    if (onSharePress) {
      onSharePress(id);
      return;
    }

    try {
      await shareListing({
        listingId: id,
        year,
        make,
        model,
        trim,
        price,
        mileage,
        emirate,
        specs,
      });
    } catch {
      // Share cancelled or failed
    }
  }, [id, year, make, model, trim, price, mileage, emirate, specs, onSharePress]);

  return (
    <HapticPressable
      onPress={handlePress}
      onPressIn={onPressIn ? handlePressIn : undefined}
      style={[styles.container, { backgroundColor: theme.bg, borderColor: theme.border }]}
    >
      {/* === IMAGE SECTION === */}
      <ListImage
        imageSource={displayImage}
        backgroundColor={theme.imageBg}
        skeletonColor={colors.skeleton}
        isBlkListing={isBlkListing}
        blkBadgeBackground={colors.blkBadgeBg}
        blkBadgeBorder={colors.blkBadgeBorder}
        blkBadgeText={colors.blkBadgeFg}
      />

      {/* === INFO SECTION === */}
      <View style={styles.infoSection}>
        {/* Content - Top */}
        <View style={styles.content}>
          <Text variant="body" style={{ color: theme.text }} numberOfLines={1}>
            {make} {model}
          </Text>
          <Text variant="bodySm" style={{ color: theme.meta }} tone="secondary">
            {year}
          </Text>
          <Text style={{ color: theme.price }} variant="heading" tone="primary">
            {formatPrice(price)}
          </Text>
          <Text variant="bodySm" style={{ color: theme.meta }} tone="secondary">
            {formatMileage(mileage)} · {displaySpecs} · {displayEmirate}
          </Text>
        </View>

        {/* Actions - Bottom Row */}
        <View style={styles.bottomActions}>
          <View style={[styles.actionBubble, { backgroundColor: theme.bg, borderColor: theme.border }]}>
            <FavoriteButton
              listingId={id}
              size={Sizes.iconXs}
              onPress={onFavoritePress}
              isFavorite={isFavoriteProp}
              isBlkListing={isBlkListing}
            />
          </View>
          {showSuperlike && (
            <View style={[styles.actionBubble, { backgroundColor: theme.bg, borderColor: theme.border }]}>
              <SuperlikeButton
                listingId={id}
                size={Sizes.iconXs}
                onPress={onSuperlikePress}
                isSuperliked={isSuperlikedProp}
                isBlkListing={isBlkListing}
              />
            </View>
          )}
          {showShare && (
            <HapticPressable 
              onPress={handleSharePress} 
              hitSlop={Layout.hitSlopSmall}
              style={[styles.actionBubble, { backgroundColor: theme.bg, borderColor: theme.border }]}
            >
              <Share2 size={Sizes.iconXs} color={theme.icon} strokeWidth={ICON_STROKE_WIDTH} />
            </HapticPressable>
          )}
        </View>
      </View>
    </HapticPressable>
  );
});

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

interface ListImageProps {
  imageSource?: ImageSourcePropType | string | null;
  backgroundColor: string;
  skeletonColor: string;
  isBlkListing: boolean;
  blkBadgeBackground: string;
  blkBadgeBorder: string;
  blkBadgeText: string;
}

const ListImage = memo(function ListImage({
  imageSource,
  backgroundColor,
  skeletonColor,
  isBlkListing,
  blkBadgeBackground,
  blkBadgeBorder,
  blkBadgeText,
}: ListImageProps) {
  // Handle both local require() assets (number) and URL strings
  const source: ImageSource | undefined = imageSource
    ? typeof imageSource === 'string'
      ? { uri: imageSource }
      : (imageSource as ImageSource)
    : undefined;

  return (
    <View style={[styles.imageContainer, { backgroundColor }]}>
      {source ? (
        <Image source={source} style={styles.image} contentFit="cover" transition={IMAGE_TRANSITION_MS} />
      ) : (
        <View style={[styles.image, { backgroundColor: skeletonColor }]} />
      )}
      {isBlkListing && (
        <View style={[styles.blkBadge, { backgroundColor: blkBadgeBackground, borderColor: blkBadgeBorder }]}>
          <Text variant="caption" uppercase={false} style={{ color: blkBadgeText }}>BLK</Text>
        </View>
      )}
    </View>
  );
});

// ============================================================================
// SKELETON
// ============================================================================

export function CarCardListSkeleton() {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Skeleton width={Sizes.cardThumbnailWidth} height={Sizes.cardThumbnailHeight} borderRadius={Radius.lg} />
      <View style={styles.infoSection}>
        <View style={styles.content}>
          <Skeleton width="80%" height={Spacing.lg} />
          <Skeleton width="30%" height={Spacing.md} />
          <Skeleton width="50%" height={Spacing.md} />
          <Skeleton width="60%" height={Spacing.sm} />
        </View>
        <View style={styles.bottomActions}>
          <SkeletonCircle size={Sizes.bubbleXs} />
          <SkeletonCircle size={Sizes.bubbleXs} />
          <SkeletonCircle size={Sizes.bubbleXs} />
        </View>
      </View>
    </View>
  );
}

// ============================================================================
// STYLES (All values from theme constants)
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: Radius['2xl'],
    borderWidth: 1,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    gap: Spacing.xl,
  },
  imageContainer: {
    width: Sizes.cardThumbnailWidth,
    height: Sizes.cardThumbnailHeight,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  infoSection: {
    flex: 1,
    justifyContent: 'space-between',
    height: Sizes.cardThumbnailHeight,
  },
  content: {
    gap: Spacing.xs,
  },
  bottomActions: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  actionBubble: {
    width: Sizes.bubbleXs,
    height: Sizes.bubbleXs,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Sizes.bubbleXs / 2,
    borderWidth: 1,
  },
  blkBadge: {
    position: 'absolute',
    top: Spacing.sm,
    left: Spacing.sm,
    paddingHorizontal: Spacing.xs,
    paddingVertical: Spacing.xs / 2,
    borderRadius: Radius.none,
    borderWidth: 1,
  },
});
