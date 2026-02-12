/**
 * Car Card List View - Revvup Design System
 * Clean, minimal horizontal list item
 */

import React, { useCallback, memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { HapticPressable } from '@/components/ui';
import { Image } from 'expo-image';
import { Share2 } from 'lucide-react-native';

import { Colors, Spacing, Radius } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { Skeleton, Data, Label, FavoriteButton, SuperlikeButton } from '@/components/ui';

// ============================================================================
// UTILITIES
// ============================================================================

function formatPrice(amount: number): string {
  return new Intl.NumberFormat('en-AE', {
    style: 'currency',
    currency: 'AED',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
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
  onPress?: (id: string) => void;
  onFavoritePress?: (id: string) => void;
  onSuperlikePress?: (id: string) => void;
  onSharePress?: (id: string) => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

const IMAGE_WIDTH = 160;
const IMAGE_HEIGHT = 140;

export const CarCardList = memo(function CarCardList({
  id,
  make,
  model,
  year,
  price,
  mileage,
  emirate,
  specs = 'GCC',
  thumbnail,
  images,
  isBlkListing = false,
  isFavorite: isFavoriteProp,
  isSuperliked: isSuperlikedProp,
  onPress,
  onFavoritePress,
  onSuperlikePress,
  onSharePress,
}: CarCardListProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];

  const displayImage = thumbnail || images?.[0];
  const displayEmirate = emirate ? (EMIRATE_SHORT[emirate.toLowerCase()] || emirate) : '';
  const displaySpecs = specs ? (SPECS_SHORT[specs.toLowerCase()] || specs) : 'GCC';
  
  // Colors
  const cardBg = isBlkListing ? colors.blkBackground : colors.surface;
  const cardBorder = isBlkListing ? colors.blkBorder : colors.border;
  const textColor = isBlkListing ? colors.blkText : colors.text;
  const priceColor = isBlkListing ? colors.blkText : colors.primary;
  const metaColor = isBlkListing ? colors.blkTextSecondary : colors.textSecondary;
  const iconColor = isBlkListing ? colors.blkTextSecondary : colors.icon;

  const handlePress = useCallback(() => onPress?.(id), [id, onPress]);
  const handleSharePress = useCallback(() => onSharePress?.(id), [id, onSharePress]);

  return (
    <HapticPressable
      onPress={handlePress}
      style={[styles.container, { backgroundColor: cardBg, borderColor: cardBorder }]}
    >
      {/* Image */}
      <View style={[styles.imageContainer, { backgroundColor: colors.backgroundSecondary }]}>
        {displayImage ? (
          <Image
            source={{ uri: displayImage }}
            style={styles.image}
            contentFit="cover"
            transition={150}
          />
        ) : (
          <View style={[styles.image, { backgroundColor: colors.skeleton }]} />
        )}
        {isBlkListing && (
          <View style={[styles.blkBadge, { backgroundColor: colors.blkBadgeBackground }]}>
            <Label size="badge" uppercase={false} style={{ color: colors.blkBadgeText }}>
              BLK
            </Label>
          </View>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Name */}
        <Data size="small" style={{ color: textColor, fontWeight: '600' }} numberOfLines={1}>
          {make} {model}
        </Data>

        {/* Year */}
        <Data size="mini" style={{ color: metaColor }}>
          {year}
        </Data>

        {/* Row 3: Price */}
        <Data size="medium" style={{ color: priceColor, fontWeight: '700' }}>
          {formatPrice(price)}
        </Data>

        {/* Row 4: Meta */}
        <Data size="mini" style={{ color: metaColor }}>
          {formatMileage(mileage)} · {displaySpecs} · {displayEmirate}
        </Data>
      </View>

      {/* Vertical Actions */}
      <View style={styles.actionsVertical}>
        <HapticPressable onPress={handleSharePress} hitSlop={8}>
          <Share2 size={18} color={iconColor} strokeWidth={1.75} />
        </HapticPressable>
        <FavoriteButton
          listingId={id}
          size={18}
          onPress={onFavoritePress}
          isFavorite={isFavoriteProp}
          isBlkListing={isBlkListing}
        />
        <SuperlikeButton
          listingId={id}
          size={18}
          onPress={onSuperlikePress}
          isSuperliked={isSuperlikedProp}
          isBlkListing={isBlkListing}
        />
      </View>
    </HapticPressable>
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
      <Skeleton width={IMAGE_WIDTH} height={IMAGE_HEIGHT} borderRadius={Radius.md} />
      <View style={styles.content}>
        <Skeleton width={130} height={14} />
        <Skeleton width={90} height={15} />
        <Skeleton width={110} height={12} />
      </View>
    </View>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    gap: Spacing.md,
  },
  imageContainer: {
    width: IMAGE_WIDTH,
    height: IMAGE_HEIGHT,
    borderRadius: Radius.md,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  content: {
    flex: 1,
    gap: 2,
  },
  actionsVertical: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    gap: Spacing.md,
    paddingLeft: Spacing.sm,
  },
  blkBadge: {
    position: 'absolute',
    top: Spacing.sm,
    left: Spacing.sm,
    paddingHorizontal: Spacing.sm - 2,
    paddingVertical: 2,
    borderRadius: Radius.none,
  },
});
