/**
 * Saved Listing Item - Individual listing card in saved list
 * Simplified version of CarCardM for the saved listings view
 */

import React from 'react';
import { StyleSheet, View, Text, Pressable, Alert } from 'react-native';
import { Image } from 'expo-image';
import { CheckCircle2 } from 'lucide-react-native';

import { Radius, Typography } from '@/constants/theme';
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
    <Pressable
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
            source={{ uri: listing.thumbnail }}
            style={styles.image}
            contentFit="cover"
            transition={200}
          />
        ) : (
          <View style={[styles.imagePlaceholder, { backgroundColor: colors.surfaceSecondary }]}>
            <Text style={[styles.placeholderText, { color: colors.textTertiary }]}>
              No Image
            </Text>
          </View>
        )}
        
        {/* BLK Badge */}
        {listing.isBlkListing && (
          <View style={styles.blkBadge}>
            <Text style={styles.blkText}>BLK</Text>
          </View>
        )}
      </View>

      {/* Details */}
      <View style={styles.details}>
        {/* Title */}
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
          {carTitle}
        </Text>
        
        {/* Trim */}
        {listing.trim && (
          <Text style={[styles.trim, { color: colors.textSecondary }]} numberOfLines={1}>
            {listing.trim}
          </Text>
        )}

        {/* Price */}
        <Text style={[styles.price, { color: colors.primary }]}>
          {formatPrice(listing.price || 0)}
        </Text>

        {/* Meta */}
        <View style={styles.meta}>
          <Text style={[styles.metaText, { color: colors.textTertiary }]}>
            {formatMileage(listing.mileage || 0)}
          </Text>
          <Text style={[styles.metaDot, { color: colors.textMuted }]}>•</Text>
          <Text style={[styles.metaText, { color: colors.textTertiary }]}>
            {displayEmirate}
          </Text>
        </View>

        {/* Seller */}
        <View style={styles.seller}>
          <Text style={[styles.sellerName, { color: colors.textSecondary }]} numberOfLines={1}>
            {sellerName}
          </Text>
          {isVerified && (
            <CheckCircle2 size={12} color={colors.success} strokeWidth={2} />
          )}
        </View>
      </View>
    </Pressable>
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
    width: 100,
    height: 100,
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
  placeholderText: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
  },
  blkBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: '#000',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  blkText: {
    ...Typography.labelBadge,
    color: '#FFF',
  },
  details: {
    flex: 1,
    padding: 10,
    justifyContent: 'center',
  },
  title: {
    ...Typography.dataMedium,
  },
  trim: {
    ...Typography.supportingSmall,
    marginTop: 2,
  },
  price: {
    ...Typography.priceTag,
    marginTop: 4,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  metaText: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
  },
  metaDot: {
    fontSize: 11,
    marginHorizontal: 4,
  },
  seller: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  sellerName: {
    ...Typography.supportingSmall,
    fontSize: 11,
    flex: 1,
  },
});
