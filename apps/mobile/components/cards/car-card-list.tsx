/**
 * Car Card Compact - Revvup Design System
 * Compact vertical card — lighter than CarCardM, same visual language.
 * No seller info row; suitable for grids, feeds, and tight layouts.
 */

import { HapticPressable, Skeleton, SkeletonCircle, Text, FavoriteButton, SuperlikeButton } from '@/components/ui';
import React, { useCallback, memo, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { Share2 } from 'lucide-react-native';

import { Colors, Spacing, Radius, Layout, Sizes, AspectRatio, Timing, Stroke, BorderWidths } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { getAppThumbUrl } from '@/lib/config';
import { shareListing } from '@/lib/listing-share';

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
  return km >= 1000 ? `${(km / 1000).toFixed(0)}k` : km.toString();
}

const EMIRATE_MAP: Record<string, string> = {
  'dubai': 'Dubai',
  'abu_dhabi': 'Abu Dhabi',
  'sharjah': 'Sharjah',
  'ajman': 'Ajman',
  'ras_al_khaimah': 'RAK',
  'fujairah': 'Fujairah',
  'umm_al_quwain': 'UAQ',
};

function formatEmirate(emirate: string): string {
  return EMIRATE_MAP[emirate.toLowerCase()] || emirate;
}

const SPECS_MAP: Record<string, string> = {
  'gcc': 'GCC',
  'us': 'US',
  'european': 'EU',
  'japanese': 'JP',
  'canadian': 'CA',
  'american': 'US',
};

function formatSpecs(specs: string): string {
  return SPECS_MAP[specs.toLowerCase()] || specs;
}

// ============================================================================
// TYPES
// ============================================================================

interface CardTheme {
  bg: string;
  border: string;
  borderWidth: number;
  title: string;
  price: string;
  meta: string;
  actionIcon: string;
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
  thumbnail?: string | null;
  images?: string[];
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

function useCardTheme(colors: typeof Colors.light, isBlkListing: boolean): CardTheme {
  return useMemo(() => {
    if (isBlkListing) {
      return {
        bg: colors.background,
        border: colors.border,
        borderWidth: BorderWidths.medium,
        title: colors.label,
        price: colors.label,
        meta: colors.labelSecondary,
        actionIcon: colors.labelSecondary,
        imageBg: colors.background,
      };
    }
    return {
      bg: colors.surface,
      border: colors.border,
      borderWidth: StyleSheet.hairlineWidth,
      title: colors.label,
      price: colors.primary,
      meta: colors.labelSecondary,
      actionIcon: colors.label,
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

  const rawImage = thumbnail || images?.[0];
  const displayImage = getAppThumbUrl(rawImage);
  const displayEmirate = formatEmirate(emirate);
  const displaySpecs = formatSpecs(specs || 'GCC');

  const handlePress = useCallback(() => onPress?.(id), [id, onPress]);
  const handlePressIn = useCallback(() => onPressIn?.(id), [id, onPressIn]);
  const handleSharePress = useCallback(async () => {
    if (onSharePress) {
      onSharePress(id);
      return;
    }
    try {
      await shareListing({ listingId: id, year, make, model, trim, price, mileage, emirate, specs });
    } catch {
      // Share cancelled or failed
    }
  }, [id, year, make, model, trim, price, mileage, emirate, specs, onSharePress]);

  return (
    <HapticPressable
      onPress={handlePress}
      onPressIn={onPressIn ? handlePressIn : undefined}
      style={[styles.container, { backgroundColor: theme.bg, borderColor: theme.border, borderWidth: theme.borderWidth }]}
    >
      {/* BLK Accent Line */}
      {isBlkListing && <View style={[styles.blkAccent, { backgroundColor: theme.border }]} />}

      {/* === IMAGE === */}
      <CompactImage
        uri={displayImage}
        backgroundColor={theme.imageBg}
        skeletonColor={colors.skeleton}
      />

      {/* === CONTENT === */}
      <View style={styles.content}>
        {/* Title row: make+model left, year right */}
        <View style={styles.titleRow}>
          <Text variant="subheadEmphasized" style={[styles.titleText, { color: theme.title }]} numberOfLines={1}>
            {make} {model}
          </Text>
          <Text variant="footnote" style={{ color: theme.meta }}>{year}</Text>
        </View>

        {/* Meta: mileage · specs · location */}
        <Text variant="footnote" style={{ color: theme.meta }}>
          {formatMileage(mileage)} km · {displaySpecs} · {displayEmirate}
        </Text>

        {/* Price + Actions */}
        <View style={styles.footer}>
          <Text variant="callout" style={{ color: theme.price }}>
            {formatPrice(price)}
          </Text>
          <View style={styles.actions}>
            <View style={[styles.actionBubble, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
              <FavoriteButton
                listingId={id}
                size={Sizes.iconXs}
                onPress={onFavoritePress}
                isFavorite={isFavoriteProp}
                isBlkListing={isBlkListing}
                hitSlop={Layout.hitSlop}
              />
            </View>
            {showSuperlike && (
              <View style={[styles.actionBubble, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
                <SuperlikeButton
                  listingId={id}
                  size={Sizes.iconXs}
                  onPress={onSuperlikePress}
                  isSuperliked={isSuperlikedProp}
                  isBlkListing={isBlkListing}
                  hitSlop={Layout.hitSlop}
                />
              </View>
            )}
            {showShare && (
              <HapticPressable
                onPress={handleSharePress}
                hitSlop={Layout.hitSlop}
                style={[styles.actionBubble, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}
              >
                <Share2 size={Sizes.iconXs} color={theme.actionIcon} strokeWidth={Stroke.icon} />
              </HapticPressable>
            )}
          </View>
        </View>
      </View>
    </HapticPressable>
  );
});

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

interface CompactImageProps {
  uri?: string | null;
  backgroundColor: string;
  skeletonColor: string;
}

const CompactImage = memo(function CompactImage({
  uri,
  backgroundColor,
  skeletonColor,
}: CompactImageProps) {
  return (
    <View style={[styles.imageContainer, { backgroundColor }]}>
      {uri ? (
        <Image
          source={{ uri }}
          style={styles.image}
          contentFit="cover"
          transition={Timing.imageTransition}
        />
      ) : (
        <View style={[styles.image, { backgroundColor: skeletonColor }]} />
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
      <View style={[styles.imageContainer, { backgroundColor: colors.skeleton }]} />
      <View style={styles.content}>
        <Skeleton width="70%" height={Spacing.lg} />
        <Skeleton width="55%" height={Spacing.md} />
        <View style={styles.footer}>
          <Skeleton width="35%" height={Spacing.md} />
          <View style={styles.actions}>
            <SkeletonCircle size={Sizes.iconXs} />
            <SkeletonCircle size={Sizes.iconXs} />
            <SkeletonCircle size={Sizes.iconXs} />
          </View>
        </View>
      </View>
    </View>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: Radius['2xl'],
    borderCurve: 'continuous',
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  blkAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: BorderWidths.medium,
    zIndex: 1,
  },
  imageContainer: {
    marginHorizontal: Spacing.sm,
    marginTop: Spacing.sm,
    aspectRatio: AspectRatio.cardImage,
    borderRadius: Radius['2xl'],
    borderCurve: 'continuous',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  content: {
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: Spacing.xs,
  },
  titleText: {
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Spacing.xs,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  actionBubble: {
    width: Sizes.bubbleXs,
    height: Sizes.bubbleXs,
    borderRadius: Sizes.bubbleXs / 2,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },

});
