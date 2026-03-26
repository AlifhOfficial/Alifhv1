/**
 * Saved Listing Item - Individual listing card in saved list
 * Simplified version of CarCardM for the saved listings view
 */

import React from 'react';
import { StyleSheet, View, Alert } from 'react-native';
import { HapticPressable } from '@/components/ui';
import { Image } from 'expo-image';
import { CheckCircle2 } from 'lucide-react-native';

import { Radius, Sizes, Spacing, Typography } from '@/constants/theme';
import { getAppThumbUrl } from '@/lib/config';
import { Data, Supporting, Price, Label, Body } from '@/components/ui';
import { SavedListingCard } from '@/lib/saved-api';
import type { ThemeColors } from './types';

// ============================================================================
// FORMAT UTILITIES
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
  if (km >= 1000) {
    return `${(km / 1000).toFixed(0)}k km`;
  }
  return `${km} km`;
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

// ============================================================================
// COMPONENT
// ============================================================================

interface SavedListingItemProps {
  listing: SavedListingCard;
  colors: ThemeColors;
}

export function SavedListingItem({ listing, colors }: SavedListingItemProps) {
  const handlePress = () => {
    // TODO: Navigate to listing detail when route is available
    Alert.alert('Coming Soon', `View listing: ${listing.year} ${listing.make} ${listing.model}`);
  };

  const carTitle = `${listing.year} ${listing.make} ${listing.model}`;
  const displayEmirate = formatEmirate(listing.emirate || '');
  const isVerified = listing.partnerVerified || listing.sellerKycVerified;
  const sellerName = listing.partnerName || listing.sellerName || 'Private Seller';

  return (
    <HapticPressable
      style={({ pressed }) => [
        styles.container,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          opacity: pressed ? 0.9 : 1,
        },
      ]}
      onPress={handlePress}
    >
      {/* Image */}
      <View style={styles.imageContainer}>
        {listing.thumbnail ? (
          <Image
            source={{ uri: getAppThumbUrl(listing.thumbnail)! }}
            style={styles.image}
            contentFit="cover"
            transition={200}
          />
        ) : (
          <View style={[styles.imagePlaceholder, { backgroundColor: colors.surface2 }]}>
            <Supporting size="mini" tone="muted">No Image</Supporting>
          </View>
        )}
        
        {/* BLK Badge */}
        {listing.isBlkListing && (
          <View style={[styles.blkBadge, { backgroundColor: colors.blkBadgeBg, borderColor: colors.blkBadgeBorder }]}>
            <Label size="badge" uppercase style={{ color: colors.blkBadgeFg }}>BLK</Label>
          </View>
        )}
      </View>

      {/* Details */}
      <View style={styles.details}>
        {/* Title */}
        <Data size="medium" numberOfLines={1}>{carTitle}</Data>
        
        {/* Trim */}
        {listing.trim && (
          <Supporting size="small" tone="secondary" numberOfLines={1} style={styles.trim}>
            {listing.trim}
          </Supporting>
        )}

        {/* Price */}
        <Price size="tag" style={styles.price}>{formatPrice(listing.price || 0)}</Price>

        {/* Meta */}
        <View style={styles.meta}>
          <Supporting size="mini" tone="muted">{formatMileage(listing.mileage || 0)}</Supporting>
          <Body size="mini" tone="muted" style={styles.metaDot}>•</Body>
          <Supporting size="mini" tone="muted">{displayEmirate}</Supporting>
        </View>

        {/* Seller */}
        <View style={styles.seller}>
          <Supporting size="mini" tone="secondary" numberOfLines={1} style={styles.sellerName}>
            {sellerName}
          </Supporting>
          {isVerified && (
            <CheckCircle2 size={Sizes.iconXs - 2} color={colors.success} strokeWidth={2} />
          )}
        </View>
      </View>
    </HapticPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: Radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  imageContainer: {
    width: Sizes.cardThumbnailHeight,
    height: Sizes.cardThumbnailHeight,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  blkBadge: {
    position: 'absolute',
    top: Spacing.xs,
    left: Spacing.xs,
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: Radius.none,
    borderWidth: 1,
  },
  details: {
    flex: 1,
    padding: Spacing.sm,
    justifyContent: 'center',
  },
  trim: {
    marginTop: Sizes.badgePaddingV,
  },
  price: {
    marginTop: Spacing.xs,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  metaDot: {
    ...Typography.micro,
    marginHorizontal: Spacing.xs,
  },
  seller: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  sellerName: {
    flex: 1,
  },
});
