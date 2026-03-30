/**
 * Car Card Mobile (CarCardM) - Revvup Design System
 * Mobile-optimized car listing card following web car-card patterns
 * All data points preserved, theme-driven styling
 * 
 * Uses semantic Text components for cross-platform consistency
 */

import { HapticPressable, Skeleton, SkeletonCircle, Text, FavoriteButton, SuperlikeButton, BlkBadge, BrandAvatar } from '@/components/ui';
import React, { useCallback, memo, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { Share2, CheckCircle2 } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { Colors, Spacing, Radius, Layout, Sizes, AspectRatio, Timing, Stroke, BorderWidths } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { getAppThumbUrl } from '@/lib/config';
import { shareListing } from '@/lib/listing-share';

// ============================================================================
// CONSTANTS
// ============================================================================

const IMAGE_BLURHASH = 'L6PZfSi_.AyE_3t7t7R**0o#DgR4';

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

interface CardTheme {
  bg: string;
  border: string;
  borderWidth: number;
  title: string;
  price: string;
  stats: string;
  meta: string;
  sellerText: string;
  actionIcon: string;
  imageBg: string;
  avatarBg: string;
  avatarBorder: string;
}

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
  onPressIn?: (id: string) => void;
  onLongPress?: (id: string) => void;
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
        borderWidth: BorderWidths.medium,
        title: colors.label,
        price: colors.label,
        stats: colors.labelSecondary,
        meta: colors.labelSecondary,
        sellerText: colors.labelSecondary,
        actionIcon: colors.labelSecondary,
        imageBg: colors.background,
        avatarBg: colors.background,
        avatarBorder: colors.border,
      };
    }
    // Surface aesthetic - standard card styling for normal listings
    return {
      bg: colors.surface,
      border: colors.border,
      borderWidth: StyleSheet.hairlineWidth,
      title: colors.label,
      price: colors.primary,
      stats: colors.labelSecondary,
      meta: colors.labelSecondary,
      sellerText: colors.label,
      actionIcon: colors.label,
      imageBg: colors.surfaceSecondary,
      avatarBg: colors.surface,
      avatarBorder: colors.border,
    };
  }, [colors, isBlkListing]);
}

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
  onPressIn,
  onLongPress,
  onFavoritePress,
  onSuperlikePress,
  onSharePress,
}: CarCardMProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const theme = useCardTheme(colors, isBlkListing);

  // Derived display values - use thumb URL for optimized card display
  const rawImage = thumbnail || images?.[0];
  const displayImage = getAppThumbUrl(rawImage);
  const displaySpecs = formatSpecs(specs || 'GCC');
  const displayEmirate = formatEmirate(emirate);
  const displaySellerName = partnerName || sellerName || 'Private Seller';
  const isVerified = partnerVerified || kycVerified;
  const rawSellerAvatar = partnerLogo || sellerAvatarUrl;
  const sellerAvatar = getAppThumbUrl(rawSellerAvatar);

  // Handlers
  const handlePress = useCallback(() => {
    onPress?.(id);
  }, [id, onPress]);

  const handlePressIn = useCallback(() => {
    onPressIn?.(id);
  }, [id, onPressIn]);

  const handleLongPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onLongPress?.(id);
  }, [id, onLongPress]);

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
      onLongPress={onLongPress ? handleLongPress : undefined}
      delayLongPress={Timing.longPress}
      style={[styles.container, { backgroundColor: theme.bg, borderColor: theme.border, borderWidth: theme.borderWidth }]}
    >
      {/* BLK Accent Line */}
      {isBlkListing && <View style={[styles.blkAccent, { backgroundColor: theme.border }]} />}

      {/* === IMAGE SECTION === */}
      <CardImage 
        uri={displayImage} 
        backgroundColor={theme.imageBg}
        placeholderColor={colors.labelTertiary}
        skeletonColor={colors.skeleton}
      />

      {/* === CONTENT SECTION === */}
      <View style={styles.content}>
        {/* Title row: make+model left, year right */}
        <View style={styles.titleRow}>
          <Text variant="bodyEmphasized" style={[styles.titleText, { color: theme.title }]} numberOfLines={1}>
            {make} {model}
          </Text>
          <Text variant="subhead" style={{ color: theme.meta }}>{year}</Text>
        </View>

        {/* Meta: mileage · specs · location */}
        <Text variant="subhead" style={{ color: theme.meta }}>
          {formatMileage(mileage)} km · {displaySpecs} · {displayEmirate}
        </Text>

        {/* Price */}
        <Text variant="body" style={{ color: theme.price }}>
          {formatPrice(price)}
        </Text>

        {/* Footer: Seller + Actions */}
        <View style={styles.footer}>
          <SellerInfo
            name={displaySellerName}
            isVerified={isVerified}
            isBlackTierPartner={isBlackTierPartner}
            avatarUri={sellerAvatar}
            theme={theme}
            colors={colors}
          />
          <CardActions
            listingId={id}
            isFavorite={isFavoriteProp}
            isSuperliked={isSuperlikedProp}
            isBlkListing={isBlkListing}
            actionIconColor={theme.actionIcon}
            glassBackground={colors.surfaceSecondary}
            glassBorder={colors.border}
            onFavoritePress={onFavoritePress}
            onSuperlikePress={onSuperlikePress}
            onSharePress={handleSharePress}
          />
        </View>
      </View>
    </HapticPressable>
  );
});

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

interface CardImageProps {
  uri?: string | null;
  backgroundColor: string;
  placeholderColor: string;
  skeletonColor: string;
}

const CardImage = memo(function CardImage({ uri, backgroundColor, placeholderColor, skeletonColor }: CardImageProps) {
  return (
    <View style={[styles.imageContainer, { backgroundColor }]}>
      {uri ? (
        <Image
          source={{ uri }}
          style={styles.image}
          contentFit="cover"
          transition={Timing.imageTransition}
          placeholder={{ blurhash: IMAGE_BLURHASH }}
        />
      ) : (
        <View style={[styles.imagePlaceholder, { backgroundColor: skeletonColor }]}>
          <Text variant="subhead" style={{ color: placeholderColor }} tone="secondary">No Image</Text>
        </View>
      )}
    </View>
  );
});

// ============================================================================
// SELLER INFO
// ============================================================================

interface SellerInfoProps {
  name: string;
  isVerified: boolean;
  isBlackTierPartner: boolean;
  avatarUri?: string | null;
  theme: CardTheme;
  colors: typeof Colors.light;
}

const SellerInfo = memo(function SellerInfo({ name, isVerified, isBlackTierPartner, avatarUri, theme, colors }: SellerInfoProps) {
  return (
    <View style={styles.sellerInfo}>
      {isBlackTierPartner && (
        <View style={[styles.avatarRing, { borderColor: colors.border }]} />
      )}
      <BrandAvatar
        src={avatarUri}
        name={name}
        size="sm"
        backgroundColor={theme.avatarBg}
        ringColor={theme.avatarBorder}
      />
      <View style={styles.sellerMeta}>
        <Text variant="subhead" style={[styles.sellerName, { color: theme.sellerText }]} numberOfLines={1}>
          {name}
        </Text>
        {!isBlackTierPartner && isVerified && (
          <CheckCircle2 size={Sizes.iconSm} color={colors.primary} strokeWidth={Stroke.icon} />
        )}
        {isBlackTierPartner && (
          <BlkBadge size="sm" />
        )}
      </View>
    </View>
  );
});

interface CardActionsProps {
  listingId: string;
  isFavorite?: boolean;
  isSuperliked?: boolean;
  isBlkListing: boolean;
  actionIconColor: string;
  glassBackground: string;
  glassBorder: string;
  onFavoritePress?: (id: string) => void;
  onSuperlikePress?: (id: string) => void;
  onSharePress: () => void;
}

const CardActions = memo(function CardActions({
  listingId,
  isFavorite,
  isSuperliked,
  isBlkListing,
  actionIconColor,
  glassBackground,
  glassBorder,
  onFavoritePress,
  onSuperlikePress,
  onSharePress,
}: CardActionsProps) {
  return (
    <View style={styles.actions}>
      <View style={[styles.actionBubble, { backgroundColor: glassBackground, borderColor: glassBorder }]}>
        <FavoriteButton
          listingId={listingId}
          size={Sizes.iconXs}
          onPress={onFavoritePress}
          isFavorite={isFavorite}
          isBlkListing={isBlkListing}
          hitSlop={Layout.hitSlop}
        />
      </View>
      <View style={[styles.actionBubble, { backgroundColor: glassBackground, borderColor: glassBorder }]}>
        <SuperlikeButton
          listingId={listingId}
          size={Sizes.iconXs}
          onPress={onSuperlikePress}
          isSuperliked={isSuperliked}
          isBlkListing={isBlkListing}
          hitSlop={Layout.hitSlop}
        />
      </View>
      <HapticPressable
        onPress={onSharePress}
        hitSlop={Layout.hitSlop}
        style={[styles.actionBubble, { backgroundColor: glassBackground, borderColor: glassBorder }]}
      >
        <Share2 size={Sizes.iconXs} color={actionIconColor} strokeWidth={Stroke.icon} />
      </HapticPressable>
    </View>
  );
});

// ============================================================================
// SKELETON
// ============================================================================

export function CarCardMSkeleton() {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      {/* Image */}
      <View style={styles.imageContainer}>
        <Skeleton width="100%" height={Spacing['5xl'] * 4} borderRadius={Radius['2xl']} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Skeleton width="60%" height={Spacing.lg} />
        <Skeleton width="45%" height={Spacing.md} />
        <Skeleton width="40%" height={Spacing.md} />
        <Skeleton width="25%" height={Spacing.md} />
        <View style={styles.footer}>
          <View style={styles.sellerInfo}>
            <SkeletonCircle size={Sizes.bubble} />
            <Skeleton width="40%" height={Spacing.md} />
          </View>
          <View style={styles.actions}>
            <SkeletonCircle size={Sizes.bubbleXs} />
            <SkeletonCircle size={Sizes.bubbleXs} />
            <SkeletonCircle size={Sizes.bubbleXs} />
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
  // Layout
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
  content: {
    padding: Spacing.md,
    gap: Spacing.xs,
  },

  // Image Section
  imageContainer: {
    width: '100%',
    aspectRatio: AspectRatio.cardImage,
    borderRadius: Radius['2xl'],
    borderCurve: 'continuous',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: Radius['2xl'],
  },
  imagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Footer Section
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Spacing.sm,
    marginTop: Spacing.xs,
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

  // Seller Info
  sellerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
    minWidth: 0,
  },
  avatarRing: {
    position: 'absolute',
    width: Sizes.bubble + 6,
    height: Sizes.bubble + 6,
    borderRadius: (Sizes.bubble + 6) / 2,
    borderWidth: BorderWidths.medium,
    top: -Spacing.xs,
    left: -Spacing.xs,
  },
  sellerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    flex: 1,
    minWidth: 0,
  },
  sellerName: {
    flexShrink: 1,
  },
  // Actions
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  actionBubble: {
    width: Sizes.bubbleXs,
    height: Sizes.bubbleXs,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Sizes.bubbleXs / 2,
    borderWidth: StyleSheet.hairlineWidth,
  },
});
