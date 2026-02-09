/**
 * Car Card List View - Revvup Design System
 * Clean, minimal horizontal list item
 */

import React, { useCallback, memo } from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { Heart } from 'lucide-react-native';

import { Colors, Spacing, Radius } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { Skeleton, Text, Data } from '@/components/ui';

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
  onPress?: (id: string) => void;
  onFavoritePress?: (id: string) => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

const IMAGE_WIDTH = 150;
const IMAGE_HEIGHT = 110;

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
  isFavorite = false,
  onPress,
  onFavoritePress,
}: CarCardListProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];

  const displayImage = thumbnail || images?.[0];
  const displayEmirate = EMIRATE_SHORT[emirate?.toLowerCase()] || emirate;
  const displaySpecs = SPECS_SHORT[specs?.toLowerCase()] || specs;
  
  // Colors
  const cardBg = isBlkListing ? colors.blkBackground : colors.surface;
  const cardBorder = isBlkListing ? colors.blkBorder : colors.border;
  const textColor = isBlkListing ? colors.blkText : colors.text;
  const priceColor = isBlkListing ? colors.blkText : colors.primary;
  const metaColor = isBlkListing ? colors.blkTextSecondary : colors.textSecondary;
  const iconColor = isBlkListing ? colors.blkTextSecondary : colors.icon;

  const handlePress = useCallback(() => onPress?.(id), [id, onPress]);
  const handleFavoritePress = useCallback(() => onFavoritePress?.(id), [id, onFavoritePress]);

  return (
    <Pressable
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
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Name */}
        <Data size="medium" style={{ color: textColor, fontWeight: '600' }} numberOfLines={1}>
          {make} {model}
        </Data>

        {/* Year */}
        <Data size="small" style={{ color: metaColor }}>
          {year}
        </Data>

        {/* Price */}
        <Text variant="priceMini" style={{ color: priceColor }}>
          {formatPrice(price)}
        </Text>

        {/* Meta + Fav */}
        <View style={styles.bottomRow}>
          <Data size="small" style={{ color: metaColor }}>
            {formatMileage(mileage)} · {displaySpecs} · {displayEmirate}
          </Data>
          <Pressable
            onPress={handleFavoritePress}
            hitSlop={10}
            style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}
          >
            <Heart
              size={20}
              color={isFavorite ? colors.favorite : iconColor}
              fill={isFavorite ? colors.favorite : 'none'}
              strokeWidth={1.75}
            />
          </Pressable>
        </View>
      </View>
    </Pressable>
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
        <View>
          <Skeleton width={100} height={14} />
          <Skeleton width={40} height={12} style={{ marginTop: 4 }} />
        </View>
        <Skeleton width={85} height={18} />
        <Skeleton width={120} height={12} />
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
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
    gap: Spacing.md,
  },
  imageContainer: {
    width: IMAGE_WIDTH,
    height: IMAGE_HEIGHT,
    borderRadius: Radius.md,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
