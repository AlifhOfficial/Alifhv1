/**
 * Car Card List View - Revvup Design System
 * Clean, minimal horizontal list item
 */

import React, { useCallback, memo, useMemo } from 'react';
import { StyleSheet, View, ImageSourcePropType } from 'react-native';
import { Image, ImageSource } from 'expo-image';
import { Share2 } from 'lucide-react-native';

import { Colors, Spacing, Radius, Layout, Sizes } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { 
  HapticPressable, 
  Skeleton, 
  Data, 
  Heading,
  Label, 
  FavoriteButton, 
  SuperlikeButton 
} from '@/components/ui';

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
  background: string;
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
  onPress?: (id: string) => void;
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
        background: colors.blkBackground,
        border: colors.blkBorder,
        text: colors.blkText,
        price: colors.blkText,
        meta: colors.blkTextSecondary,
        icon: colors.blkTextSecondary,
        imageBg: colors.blkBackground,
      };
    }
    // Glass aesthetic - lightweight, airy feel
    return {
      background: colors.glassBackground,
      border: colors.glassBorder,
      text: colors.text,
      price: colors.primary,
      meta: colors.textSecondary,
      icon: colors.icon,
      imageBg: colors.backgroundSecondary,
    };
  }, [colors, isBlkListing]);
}

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
  const theme = useCardTheme(colors, isBlkListing);

  // Derived values
  const displayImage = thumbnail || images?.[0];
  const displayEmirate = emirate ? (EMIRATE_SHORT[emirate.toLowerCase()] || emirate) : '';
  const displaySpecs = specs ? (SPECS_SHORT[specs.toLowerCase()] || specs) : 'GCC';

  // Handlers
  const handlePress = useCallback(() => onPress?.(id), [id, onPress]);
  const handleSharePress = useCallback(() => onSharePress?.(id), [id, onSharePress]);

  return (
    <HapticPressable
      onPress={handlePress}
      style={[styles.container, { backgroundColor: theme.background, borderColor: theme.border }]}
    >
      {/* === IMAGE SECTION === */}
      <ListImage
        imageSource={displayImage}
        backgroundColor={theme.imageBg}
        skeletonColor={colors.skeleton}
        isBlkListing={isBlkListing}
        blkBadgeBackground={colors.blkBadgeBackground}
        blkBadgeBorder={colors.blkBadgeBorder}
        blkBadgeText={colors.blkBadgeText}
      />

      {/* === CONTENT SECTION === */}
      <View style={styles.content}>
        <Heading size="mini" style={{ color: theme.text }} numberOfLines={1}>
          {make} {model}
        </Heading>
        <Data size="mini" style={{ color: theme.meta }}>
          {year}
        </Data>
        <Data size="medium" style={{ color: theme.price }}>
          {formatPrice(price)}
        </Data>
        <Data size="mini" style={{ color: theme.meta }}>
          {formatMileage(mileage)} · {displaySpecs} · {displayEmirate}
        </Data>
      </View>

      {/* === ACTIONS SECTION === */}
      <CardActions
        listingId={id}
        isFavorite={isFavoriteProp}
        isSuperliked={isSuperlikedProp}
        isBlkListing={isBlkListing}
        iconColor={theme.icon}
        glassBackground={colors.glassBackground}
        glassBorder={colors.glassBorder}
        onFavoritePress={onFavoritePress}
        onSuperlikePress={onSuperlikePress}
        onSharePress={handleSharePress}
      />
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
      : imageSource
    : undefined;

  return (
    <View style={[styles.imageContainer, { backgroundColor }]}>
      {source ? (
        <Image source={source} style={styles.image} contentFit="cover" transition={150} />
      ) : (
        <View style={[styles.image, { backgroundColor: skeletonColor }]} />
      )}
      {isBlkListing && (
        <View style={[styles.blkBadge, { backgroundColor: blkBadgeBackground, borderColor: blkBadgeBorder }]}>
          <Label size="badge" uppercase={false} style={{ color: blkBadgeText }}>BLK</Label>
        </View>
      )}
    </View>
  );
});

interface CardActionsProps {
  listingId: string;
  isFavorite?: boolean;
  isSuperliked?: boolean;
  isBlkListing: boolean;
  iconColor: string;
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
  iconColor,
  glassBackground,
  glassBorder,
  onFavoritePress,
  onSuperlikePress,
  onSharePress,
}: CardActionsProps) {
  return (
    <View style={styles.actions}>
      <HapticPressable 
        onPress={onSharePress} 
        hitSlop={Layout.hitSlopSmall}
        style={[styles.actionBubble, { backgroundColor: glassBackground, borderColor: glassBorder }]}
      >
        <Share2 size={Sizes.iconSm} color={iconColor} strokeWidth={1.75} />
      </HapticPressable>
      <View style={[styles.actionBubble, { backgroundColor: glassBackground, borderColor: glassBorder }]}>
        <FavoriteButton
          listingId={listingId}
          size={Sizes.iconSm}
          onPress={onFavoritePress}
          isFavorite={isFavorite}
          isBlkListing={isBlkListing}
        />
      </View>
      <View style={[styles.actionBubble, { backgroundColor: glassBackground, borderColor: glassBorder }]}>
        <SuperlikeButton
          listingId={listingId}
          size={Sizes.iconSm}
          onPress={onSuperlikePress}
          isSuperliked={isSuperliked}
          isBlkListing={isBlkListing}
        />
      </View>
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
    <View style={[styles.container, { backgroundColor: colors.glassBackground, borderColor: colors.glassBorder }]}>
      <Skeleton width={Sizes.cardThumbnailWidth} height={Sizes.cardThumbnailHeight} borderRadius={Radius.md} />
      <View style={styles.content}>
        <Skeleton width="80%" height={Spacing.lg} />
        <Skeleton width="50%" height={Spacing.md} />
        <Skeleton width="60%" height={Spacing.md} />
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
    width: Sizes.cardThumbnailWidth,
    height: Sizes.cardThumbnailHeight,
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
    gap: Spacing.xs,
  },
  actions: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    gap: Spacing.sm,
    paddingLeft: Spacing.sm,
  },
  actionBubble: {
    width: Sizes.bubble,
    height: Sizes.bubble,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Sizes.bubble / 2,
    borderWidth: 1,
  },
  blkBadge: {
    position: 'absolute',
    top: Spacing.sm,
    left: Spacing.sm,
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: Radius.none,
    borderWidth: 1,
  },
});
