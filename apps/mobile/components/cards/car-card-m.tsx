/**
 * Car Card Mobile (CarCardM) - Revvup Design System
 * Mobile-optimized car listing card following web car-card patterns
 * All data points preserved, theme-driven styling
 * 
 * Uses semantic Text components for cross-platform consistency
 */

import React, { useCallback, memo } from 'react';
import {
  StyleSheet,
  View,
  Pressable,
  Share,
} from 'react-native';
import { HapticPressable } from '@/components/ui';
import { Image } from 'expo-image';
import { Share2, CheckCircle2 } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { Colors, Spacing, Radius } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { 
  Skeleton, 
  SkeletonCircle,
  Text,
  Heading,
  Data,
  Label,
  Supporting,
  FavoriteButton,
  SuperlikeButton,
} from '@/components/ui';

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
  onLongPress?: (id: string) => void;
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
  isFavorite: isFavoriteProp,
  isSuperliked: isSuperlikedProp,
  onPress,
  onLongPress,
  onFavoritePress,
  onSuperlikePress,
  onSharePress,
}: CarCardMProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];

  // Derived display values
  const displayImage = thumbnail || images?.[0];
  const displaySpecs = formatSpecs(specs || 'GCC');
  const displayEmirate = formatEmirate(emirate);
  const displaySellerName = partnerName || sellerName || 'Private Seller';
  const isVerified = partnerVerified || kycVerified;
  const carTitle = `${year} ${make} ${model}${trim ? ` ${trim}` : ''}`;

  // BLK listing specific colors
  const cardBg = isBlkListing 
    ? colors.blkBackground 
    : colors.surface;
  const cardBorder = isBlkListing 
    ? colors.blkBorder 
    : colors.border;
  const titleColor = isBlkListing 
    ? colors.blkText 
    : colors.text;
  const priceColor = isBlkListing 
    ? colors.blkText 
    : colors.primary;
  const statsColor = isBlkListing 
    ? colors.blkTextSecondary 
    : colors.textSecondary;
  const metaColor = isBlkListing 
    ? colors.blkTextSecondary 
    : colors.textSecondary;
  const separatorColor = isBlkListing 
    ? colors.blkBorder 
    : colors.textTertiary;
  const sellerTextColor = isBlkListing 
    ? colors.blkTextSecondary 
    : colors.text;
  const actionIconColor = isBlkListing 
    ? colors.blkTextSecondary 
    : colors.icon;

  // Handlers
  const handlePress = useCallback(() => {
    onPress?.(id);
  }, [id, onPress]);

  const handleLongPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onLongPress?.(id);
  }, [id, onLongPress]);

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
    <HapticPressable
      onPress={handlePress}
      onLongPress={onLongPress ? handleLongPress : undefined}
      delayLongPress={400}
      style={[
        styles.container,
        {
          backgroundColor: cardBg,
          borderColor: cardBorder,
        },
      ]}
    >
      {/* BLK Listing Top Accent */}
      {isBlkListing && (
        <View style={[styles.blkAccent, { backgroundColor: colors.blkBorder }]} />
      )}

      {/* Image Section */}
      <View style={[styles.imageContainer, { backgroundColor: isBlkListing ? colors.blkBackground : colors.backgroundSecondary }]}>
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
            <Supporting size="small" style={{ color: colors.textTertiary }}>
              No Image
            </Supporting>
          </View>
        )}
      </View>

      {/* Content Section */}
      <View style={styles.content}>
        {/* Title Row */}
        <View style={styles.titleRow}>
          <Heading 
            size="mini"
            style={[styles.title, { color: titleColor }]} 
            numberOfLines={1}
          >
            {make} {model}
          </Heading>
          <Data size="medium" style={{ color: metaColor }}>
            {year}
          </Data>
        </View>

        {/* Price */}
        <Text variant="priceTag" style={{ color: priceColor }}>
          {formatPrice(price)}
        </Text>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <Data size="medium" style={{ color: statsColor }}>
            {formatMileage(mileage)} km
          </Data>
          <Data size="medium" style={[styles.separator, { color: separatorColor }]}>·</Data>
          <Data size="medium" style={{ color: statsColor }}>
            {displaySpecs}
          </Data>
          <Data size="medium" style={[styles.separator, { color: separatorColor }]}>·</Data>
          <Data size="medium" style={{ color: statsColor }} numberOfLines={1}>
            {displayEmirate}
          </Data>
        </View>

        {/* Bottom Section: Seller + Actions */}
        <View style={styles.bottomRow}>
          {/* Seller Info */}
          <View style={styles.sellerInfo}>
            {/* Avatar */}
            <View style={[
              styles.avatar,
              { 
                backgroundColor: isBlkListing ? colors.blkBackground : colors.backgroundSecondary,
                borderColor: isBlackTierPartner ? colors.blkBackground : (isBlkListing ? colors.blkBorder : colors.border),
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
                <Text variant="avatarSmall" style={{ color: metaColor }}>
                  {displaySellerName.charAt(0).toUpperCase()}
                </Text>
              )}
            </View>
            
            {/* Seller Name + Badge Container */}
            <View style={styles.sellerNameContainer}>
              <Data 
                size="small"
                style={[styles.sellerName, { color: sellerTextColor }]} 
                numberOfLines={1}
              >
                {displaySellerName}
              </Data>

              {/* Verification Badge */}
              {!isBlackTierPartner && isVerified && (
                <CheckCircle2 
                  size={ICON_SIZE_SM} 
                  color={colors.primary}
                />
              )}

              {/* BLK Badge */}
              {isBlackTierPartner && (
                <View style={[styles.blkBadge, { backgroundColor: colors.blkBadgeBackground }]}>
                  <Label size="badge" uppercase={false} style={{ color: colors.blkBadgeText }}>
                    BLK
                  </Label>
                </View>
              )}
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actions}>
            {/* Favorite */}
            <FavoriteButton
              listingId={id}
              size={ICON_SIZE}
              onPress={onFavoritePress}
              isFavorite={isFavoriteProp}
              isBlkListing={isBlkListing}
              hitSlop={10}
            />

            {/* Superlike */}
            <SuperlikeButton
              listingId={id}
              size={ICON_SIZE}
              onPress={onSuperlikePress}
              isSuperliked={isSuperlikedProp}
              isBlkListing={isBlkListing}
              hitSlop={10}
            />

            {/* Share */}
            <HapticPressable
              onPress={handleSharePress}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={styles.actionButton}
            >
              <Share2 
                size={ICON_SIZE} 
                color={actionIconColor}
                strokeWidth={1.75}
              />
            </HapticPressable>
          </View>
        </View>
      </View>
    </HapticPressable>
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
      <View style={styles.imageContainer}>
        <Skeleton width="100%" height={200} borderRadius={0} />
      </View>

      {/* Content Skeleton */}
      <View style={styles.content}>
        {/* Title Row */}
        <View style={styles.titleRow}>
          <Skeleton width="60%" height={17} />
          <Skeleton width={AVATAR_SIZE_SM} height={13} />
        </View>

        {/* Price */}
        <Skeleton width={100} height={20} style={{ marginVertical: Spacing.xs }} />

        {/* Stats */}
        <View style={styles.statsRow}>
          <Skeleton width={50} height={14} />
          <Skeleton width={30} height={14} />
          <Skeleton width={45} height={14} />
        </View>

        {/* Bottom */}
        <View style={styles.bottomRow}>
          <View style={styles.sellerInfo}>
            <SkeletonCircle size={AVATAR_SIZE_SM} />
            <Skeleton width={90} height={15} />
          </View>
          <View style={styles.actions}>
            <SkeletonCircle size={ACTION_BUTTON_SIZE_SM} />
            <SkeletonCircle size={ACTION_BUTTON_SIZE_SM} />
          </View>
        </View>
      </View>
    </View>
  );
}

// ============================================================================
// CONSTANTS
// ============================================================================

const CARD_PADDING = Spacing.md;
const AVATAR_SIZE = Spacing['4xl']; // 40 → using 32 (Spacing['3xl'] + 8)
const AVATAR_SIZE_SM = 32;
const ACTION_BUTTON_SIZE = Spacing['5xl']; // 48 → close to 40
const ACTION_BUTTON_SIZE_SM = 40;
const ICON_SIZE = 22;
const ICON_SIZE_SM = 18;
const SEPARATOR_OPACITY = 0.4;

// ============================================================================
// STYLES
// ============================================================================

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
  },
  
  // Image
  imageContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
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

  // Content
  content: {
    padding: CARD_PADDING,
    gap: Spacing.sm,
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
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  separator: {
    opacity: SEPARATOR_OPACITY,
  },

  // Bottom Row
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    width: AVATAR_SIZE_SM,
    height: AVATAR_SIZE_SM,
    borderRadius: Radius.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarBlackTier: {
    borderWidth: 2,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  sellerNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    flex: 1,
    minWidth: 0,
  },
  sellerName: {
    flexShrink: 1,
  },
  blkBadge: {
    paddingHorizontal: Spacing.sm - 2, // 6
    paddingVertical: Spacing.xs - 1,  // 3
    borderRadius: Radius.none,
  },

  // Actions
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  actionButton: {
    width: ACTION_BUTTON_SIZE_SM,
    height: ACTION_BUTTON_SIZE_SM,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.full,
  },
});
