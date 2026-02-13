/**
 * Widget Thumbnail — Quiet Car Card
 *
 * Simple, clean card that doesn't scream:
 *  • 16:9 image
 *  • Small dark price pill (top-left)
 *  • Small fav circle (bottom-right)
 *  • Year Make Model + trim below
 *
 * Semi-transparent glass surface sits on any blurred bg.
 * No bold accent colors on the card itself — the widget bg does the talking.
 */

import React, { useCallback, memo } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { HapticPressable, FavoriteButton, Data, Supporting } from '@/components/ui';
import { Colors, Radius } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';

import type { WidgetThumbnailProps } from './types';

// ============================================================================
// DIMENSIONS
// ============================================================================

const SCREEN_WIDTH = Dimensions.get('window').width;

/** Compact thumb — fits ~2.7 per screen with gaps */
export const THUMB_SM = (SCREEN_WIDTH - 32 - 20) / 2.7;
/** Medium thumb — fits ~1.8 per screen (brand layout) */
export const THUMB_MD = (SCREEN_WIDTH - 32 - 12) / 1.8;
/** Large thumb — fits ~1.15 per screen (banner hero) */
export const THUMB_LG = SCREEN_WIDTH - 56;
/** Grid thumb — half width minus gap */
export const THUMB_GRID = (SCREEN_WIDTH - 28 - 32 - 10) / 2;

// ============================================================================
// PRICE FORMATTER
// ============================================================================

function formatCompactPrice(amount: number): string {
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `${Math.round(amount / 1_000)}K`;
  return `${amount}`;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const WidgetThumbnail = memo(function WidgetThumbnail({
  listing,
  width,
  onPress,
  onFavoritePress,
}: WidgetThumbnailProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const imageHeight = width * (9 / 16);

  const handlePress = useCallback(() => {
    onPress?.(listing.id);
  }, [listing.id, onPress]);

  // Glass surface
  const cardBg = colorScheme === 'dark'
    ? 'rgba(255, 255, 255, 0.08)'
    : 'rgba(255, 255, 255, 0.85)';

  return (
    <HapticPressable onPress={handlePress} style={[styles.card, { width, backgroundColor: cardBg }]}>
      {/* Image */}
      <View style={[styles.imageWrap, { height: imageHeight }]}>
        {listing.thumbnail ? (
          <Image
            source={{ uri: listing.thumbnail }}
            style={styles.image}
            contentFit="cover"
            transition={200}
            recyclingKey={listing.id}
            placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
          />
        ) : (
          <View style={[styles.imagePlaceholder, { backgroundColor: colorScheme === 'dark' ? '#222' : '#E5E5E5' }]}>
            <Supporting size="small" style={{ color: '#999' }}>No Image</Supporting>
          </View>
        )}

        {/* Price pill — dark, quiet */}
        <View style={styles.pricePill}>
          <Data size="small" style={styles.priceText}>
            AED {formatCompactPrice(listing.price)}
          </Data>
        </View>

        {/* Fav */}
        <View style={styles.favWrap}>
          <FavoriteButton
            listingId={listing.id}
            size={14}
            onPress={onFavoritePress}
            isBlkListing={listing.isBlkListing}
            hitSlop={8}
          />
        </View>
      </View>

      {/* Info */}
      <View style={styles.info}>
        <Data size="small" numberOfLines={1} style={{ color: colorScheme === 'dark' ? '#E5E5E5' : '#1A1A1A' }}>
          {listing.year} {listing.make} {listing.model}
        </Data>
        {listing.trim && (
          <Supporting size="small" numberOfLines={1} style={{ color: colorScheme === 'dark' ? '#888' : '#777' }}>
            {listing.trim}
          </Supporting>
        )}
      </View>
    </HapticPressable>
  );
});

// ============================================================================
// SKELETON
// ============================================================================

export function WidgetThumbnailSkeleton({ width }: { width: number }) {
  const { colorScheme } = useTheme();
  const imageHeight = width * (9 / 16);
  const skeletonBg = colorScheme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
  const shimmer = colorScheme === 'dark' ? '#2A2A2A' : '#E0E0E0';

  return (
    <View style={[styles.card, { width, backgroundColor: skeletonBg }]}>
      <View style={[styles.imageWrap, { height: imageHeight, backgroundColor: shimmer }]} />
      <View style={styles.info}>
        <View style={{ width: '75%', height: 11, borderRadius: 3, backgroundColor: shimmer }} />
        <View style={{ width: '45%', height: 9, borderRadius: 3, backgroundColor: shimmer, marginTop: 4 }} />
      </View>
    </View>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.lg,
    overflow: 'hidden',
  },
  imageWrap: {
    width: '100%',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pricePill: {
    position: 'absolute',
    top: 6,
    left: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
  },
  priceText: {
    color: '#FFFFFF',
    fontSize: 10,
  },
  favWrap: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    paddingHorizontal: 8,
    paddingTop: 5,
    paddingBottom: 6,
  },
});
