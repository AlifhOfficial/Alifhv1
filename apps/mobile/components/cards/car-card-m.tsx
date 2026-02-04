/**
 * Car Card Mobile (CarCardM) - Revvup Design System
 * Mobile-optimized car listing card following web car-card patterns
 * All data points preserved, theme-driven styling
 */

import React, { useCallback, memo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  Share,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { Heart, Share2, Sparkles, CheckCircle2 } from 'lucide-react-native';

import { Colors, Spacing, Radius, Typography, Shadows } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';

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
    return `${(km / 1000).toFixed(0)}k`;
  }
  return km.toString();
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

export interface CarCardMProps {
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
  viewCount?: number;
  qiScore?: number | null;
  isBlkListing?: boolean;
  // Partner/Dealer info
  partnerName?: string | null;
  partnerLogo?: string | null;
  partnerVerified?: boolean;
  isBlackTierPartner?: boolean;
  sellerName?: string | null;
  sellerAvatarUrl?: string | null;
  kycVerified?: boolean;
  // Interaction state (will connect to hooks later)
  isFavorite?: boolean;
  isSuperliked?: boolean;
  // Callbacks
  onPress?: (id: string) => void;
  onFavoritePress?: (id: string) => void;
  onSuperlikePress?: (id: string) => void;
  onSharePress?: (id: string) => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const CarCardM = memo(function CarCardM({
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
  partnerName,
  partnerLogo,
  partnerVerified = false,
  isBlackTierPartner = false,
  sellerName,
  sellerAvatarUrl,
  kycVerified = false,
  isFavorite = false,
  isSuperliked = false,
  onPress,
  onFavoritePress,
  onSuperlikePress,
  onSharePress,
}: CarCardMProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const isDark = colorScheme === 'dark';

  // Derived display values
  const displayImage = thumbnail || images?.[0];
  const displaySpecs = formatSpecs(specs || 'GCC');
  const displayEmirate = formatEmirate(emirate);
  const displaySellerName = partnerName || sellerName || 'Private Seller';
  const isPartnerListing = Boolean(partnerLogo || partnerName);
  const isVerified = partnerVerified || kycVerified;
  const carTitle = `${year} ${make} ${model}${trim ? ` ${trim}` : ''}`;

  // BLK listing specific colors
  const cardBg = isBlkListing 
    ? '#000000' 
    : colors.surface;
  const cardBorder = isBlkListing 
    ? '#262626' 
    : colors.border;
  const titleColor = isBlkListing 
    ? '#FFFFFF' 
    : colors.text;
  const priceColor = isBlkListing 
    ? '#FFFFFF' 
    : colors.primary;
  const metaColor = isBlkListing 
    ? '#525252' 
    : colors.textSecondary;
  const separatorColor = isBlkListing 
    ? '#333333' 
    : colors.textTertiary;
  const sellerTextColor = isBlkListing 
    ? '#E5E5E5' 
    : colors.text;
  const actionIconColor = isBlkListing 
    ? '#525252' 
    : colors.icon;

  // Handlers
  const handlePress = useCallback(() => {
    onPress?.(id);
  }, [id, onPress]);

  const handleFavoritePress = useCallback(() => {
    onFavoritePress?.(id);
  }, [id, onFavoritePress]);

  const handleSuperlikePress = useCallback(() => {
    onSuperlikePress?.(id);
  }, [id, onSuperlikePress]);

  const handleSharePress = useCallback(async () => {
    if (onSharePress) {
      onSharePress(id);
      return;
    }
    // Default share behavior
    try {
      await Share.share({
        message: `Check out this ${carTitle}`,
        title: carTitle,
      });
    } catch {
      // Share cancelled or failed
    }
  }, [id, carTitle, onSharePress]);

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.container,
        {
          backgroundColor: cardBg,
          borderColor: cardBorder,
          opacity: pressed ? 0.95 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
      ]}
    >
      {/* BLK Listing Top Accent */}
      {isBlkListing && (
        <View style={styles.blkAccent} />
      )}

      {/* Image Section */}
      <View style={[styles.imageContainer, { backgroundColor: isBlkListing ? '#0A0A0A' : colors.backgroundSecondary }]}>
        {displayImage ? (
          <Image
            source={{ uri: displayImage }}
            style={styles.image}
            contentFit="cover"
            transition={200}
            placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
          />
        ) : (
          <View style={[styles.imagePlaceholder, { backgroundColor: colors.skeleton }]}>
            <Text style={[styles.placeholderText, { color: colors.textTertiary }]}>
              No Image
            </Text>
          </View>
        )}
      </View>

      {/* Content Section */}
      <View style={styles.content}>
        {/* Title Row */}
        <View style={styles.titleRow}>
          <Text 
            style={[styles.title, { color: titleColor }]} 
            numberOfLines={1}
          >
            {make} {model}
          </Text>
          <Text style={[styles.year, { color: metaColor }]}>
            {year}
          </Text>
        </View>

        {/* Price */}
        <Text style={[styles.price, { color: priceColor }]}>
          {formatPrice(price)}
        </Text>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <Text style={[styles.stat, { color: metaColor }]}>
            {formatMileage(mileage)} km
          </Text>
          <Text style={[styles.separator, { color: separatorColor }]}>·</Text>
          <Text style={[styles.stat, { color: metaColor }]}>
            {displaySpecs}
          </Text>
          <Text style={[styles.separator, { color: separatorColor }]}>·</Text>
          <Text style={[styles.stat, { color: metaColor }]} numberOfLines={1}>
            {displayEmirate}
          </Text>
        </View>

        {/* Bottom Section: Seller + Actions */}
        <View style={styles.bottomRow}>
          {/* Seller Info */}
          <View style={styles.sellerInfo}>
            {/* Avatar */}
            <View style={[
              styles.avatar,
              { 
                backgroundColor: isBlkListing ? '#1A1A1A' : colors.backgroundSecondary,
                borderColor: isBlkListing ? '#262626' : colors.border,
              },
              isBlackTierPartner && styles.avatarBlackTier,
            ]}>
              {(partnerLogo || sellerAvatarUrl) ? (
                <Image
                  source={{ uri: partnerLogo || sellerAvatarUrl || '' }}
                  style={styles.avatarImage}
                  contentFit="cover"
                  transition={150}
                />
              ) : (
                <Text style={[styles.avatarInitial, { color: metaColor }]}>
                  {displaySellerName.charAt(0).toUpperCase()}
                </Text>
              )}
            </View>
            
            {/* Seller Name + Badge Container */}
            <View style={styles.sellerNameContainer}>
              <Text 
                style={[styles.sellerName, { color: sellerTextColor }]} 
                numberOfLines={1}
              >
                {displaySellerName}
              </Text>

              {/* Verification Badge */}
              {!isBlackTierPartner && isVerified && (
                <CheckCircle2 
                  size={18} 
                  color={colors.primary}
                />
              )}

              {/* BLK Badge */}
              {isBlackTierPartner && (
                <View style={styles.blkBadge}>
                  <Text style={styles.blkBadgeText}>BLK</Text>
                </View>
              )}
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actions}>
            {/* Share */}
            <Pressable
              onPress={handleSharePress}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={({ pressed }) => [
                styles.actionButton,
                { opacity: pressed ? 0.6 : 1 },
              ]}
            >
              <Share2 
                size={22} 
                color={actionIconColor}
                strokeWidth={1.75}
              />
            </Pressable>

            {/* Favorite */}
            <Pressable
              onPress={handleFavoritePress}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={({ pressed }) => [
                styles.actionButton,
                { opacity: pressed ? 0.6 : 1 },
              ]}
            >
              <Heart
                size={22}
                color={isFavorite ? '#F43F5E' : actionIconColor}
                fill={isFavorite ? '#F43F5E' : 'none'}
                strokeWidth={isFavorite ? 2.25 : 1.75}
              />
            </Pressable>

            {/* Superlike */}
            <Pressable
              onPress={handleSuperlikePress}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={({ pressed }) => [
                styles.actionButton,
                { opacity: pressed ? 0.6 : 1 },
              ]}
            >
              <Sparkles
                size={22}
                color={isSuperliked ? '#EAB308' : actionIconColor}
                fill={isSuperliked ? '#EAB308' : 'none'}
                strokeWidth={isSuperliked ? 2.25 : 1.75}
              />
            </Pressable>
          </View>
        </View>
      </View>
    </Pressable>
  );
});

// ============================================================================
// SKELETON
// ============================================================================

export function CarCardMSkeleton() {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];

  return (
    <View style={[
      styles.container,
      { backgroundColor: colors.surface, borderColor: colors.border },
    ]}>
      {/* Image Skeleton */}
      <View style={[styles.imageContainer, { backgroundColor: colors.skeleton }]} />

      {/* Content Skeleton */}
      <View style={styles.content}>
        {/* Title Row */}
        <View style={styles.titleRow}>
          <View style={[styles.skeletonTitle, { backgroundColor: colors.skeleton }]} />
          <View style={[styles.skeletonYear, { backgroundColor: colors.skeleton }]} />
        </View>

        {/* Price */}
        <View style={[styles.skeletonPrice, { backgroundColor: colors.skeleton }]} />

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={[styles.skeletonStat, { backgroundColor: colors.skeleton }]} />
          <View style={[styles.skeletonStat, { backgroundColor: colors.skeleton, width: 30 }]} />
          <View style={[styles.skeletonStat, { backgroundColor: colors.skeleton, width: 45 }]} />
        </View>

        {/* Bottom */}
        <View style={styles.bottomRow}>
          <View style={styles.sellerInfo}>
            <View style={[styles.skeletonAvatar, { backgroundColor: colors.skeleton }]} />
            <View style={[styles.skeletonSellerName, { backgroundColor: colors.skeleton }]} />
          </View>
          <View style={styles.actions}>
            <View style={[styles.skeletonAction, { backgroundColor: colors.skeleton }]} />
            <View style={[styles.skeletonAction, { backgroundColor: colors.skeleton }]} />
            <View style={[styles.skeletonAction, { backgroundColor: colors.skeleton }]} />
          </View>
        </View>
      </View>
    </View>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_PADDING = Spacing.md;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: Radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  blkAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#333333',
  },
  
  // Image
  imageContainer: {
    width: '100%',
    aspectRatio: 16 / 10,
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
  placeholderText: {
    ...Typography.footnote,
  },

  // Content
  content: {
    padding: CARD_PADDING,
    gap: Spacing.xs,
  },

  // Title Row
  titleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  title: {
    flex: 1,
    ...Typography.headline,
    fontFamily: 'Inter_700Bold',
    fontWeight: '700',
  },
  year: {
    ...Typography.footnote,
    fontFamily: 'Inter_600SemiBold',
    fontWeight: '600',
  },

  // Price
  price: {
    ...Typography.h4,
    fontFamily: 'Inter_700Bold',
    fontWeight: '700',
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  stat: {
    ...Typography.footnote,
    fontFamily: 'Inter_600SemiBold',
    fontWeight: '600',
  },
  separator: {
    ...Typography.footnote,
  },

  // Bottom Row
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Spacing.md,
    marginTop: Spacing.xs,
  },

  // Seller Info
  sellerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
    minWidth: 0,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarBlackTier: {
    borderWidth: 2,
    borderColor: '#000000',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarInitial: {
    ...Typography.subhead,
    fontFamily: 'Inter_600SemiBold',
    fontWeight: '600',
  },
  sellerNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    minWidth: 0,
  },
  sellerName: {
    ...Typography.subhead,
    fontFamily: 'Inter_600SemiBold',
    fontWeight: '600',
    flexShrink: 1,
  },
  blkBadge: {
    backgroundColor: '#000000',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 3,
  },
  blkBadgeText: {
    fontSize: 9,
    fontFamily: 'Inter_700Bold',
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1.2,
  },

  // Actions
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginRight: -Spacing.sm,
  },
  actionButton: {
    padding: Spacing.sm,
  },

  // Skeleton styles
  skeletonTitle: {
    height: 17,
    width: '60%',
    borderRadius: Radius.sm,
  },
  skeletonYear: {
    height: 13,
    width: 32,
    borderRadius: Radius.sm,
  },
  skeletonPrice: {
    height: 20,
    width: 100,
    borderRadius: Radius.sm,
    marginVertical: Spacing.xs,
  },
  skeletonStat: {
    height: 13,
    width: 50,
    borderRadius: Radius.sm,
  },
  skeletonAvatar: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
  },
  skeletonSellerName: {
    height: 15,
    width: 90,
    borderRadius: Radius.sm,
  },
  skeletonAction: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
  },
});
