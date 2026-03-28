/**
 * Car Card Mobile (CarCardM) - Revvup Design System
 * Mobile-optimized car listing card following web car-card patterns
 * All data points preserved, theme-driven styling
 * 
 * Uses semantic Text components for cross-platform consistency
 */

import React, { useCallback, memo, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { Share2, CheckCircle2 } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { Colors, Spacing, Radius, Layout, Sizes, ZIndex, BorderWidths, Timing, Stroke, AspectRatio } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { getAppThumbUrl } from '@/lib/config';
import { shareListing } from '@/lib/listing-share';
import { 
  HapticPressable,
  Skeleton, 
  SkeletonCircle,
  Text,
  Heading,
  Data,
  Label,
  Supporting,
  Price,
  FavoriteButton,
  SuperlikeButton,
} from '@/components/ui';

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
function useCardTheme(colors: typeof Colors.light, isBlkListing: boolean, isBlackTierPartner: boolean): CardTheme {
  return useMemo(() => {
    if (isBlkListing) {
      return {
        bg: colors.blkBg,
        border: colors.blkBorder,
        title: colors.blkText,
        price: colors.blkText,
        stats: colors.blkText2,
        meta: colors.blkText2,
        sellerText: colors.blkText2,
        actionIcon: colors.blkText2,
        imageBg: colors.blkBg,
        avatarBg: colors.blkBg,
        avatarBorder: colors.blkBorder,
      };
    }
    // Surface aesthetic - standard card styling for normal listings
    return {
      bg: colors.surface,
      border: colors.border,
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
  }, [colors, isBlkListing, isBlackTierPartner]);
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
  const theme = useCardTheme(colors, isBlkListing, isBlackTierPartner);

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
      style={[styles.container, { backgroundColor: theme.bg, borderColor: theme.border }]}
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
        {/* Header: Title + Year */}
        <CardHeader 
          make={make} 
          model={model} 
          year={year} 
          titleColor={theme.title}
          metaColor={theme.meta}
        />

        {/* Price */}
        <Price style={{ color: theme.price }}>
          {formatPrice(price)}
        </Price>

        {/* Stats: Mileage · Specs · Location */}
        <CardStats
          mileage={mileage}
          specs={displaySpecs}
          emirate={displayEmirate}
          statsColor={theme.stats}
          separatorColor={theme.meta}
        />

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
            glassBackground={colors.glassBg}
            glassBorder={colors.glassBorder}
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
          <Supporting size="bodySm" style={{ color: placeholderColor }}>No Image</Supporting>
        </View>
      )}
    </View>
  );
});

interface CardHeaderProps {
  make: string;
  model: string;
  year: number;
  titleColor: string;
  metaColor: string;
}

const CardHeader = memo(function CardHeader({ make, model, year, titleColor, metaColor }: CardHeaderProps) {
  return (
    <View style={styles.header}>
      <Heading size="subheading" style={[styles.title, { color: titleColor }]} numberOfLines={1}>
        {make} {model}
      </Heading>
      <Data size="bodySm" style={{ color: metaColor }}>{year}</Data>
    </View>
  );
});

interface CardStatsProps {
  mileage: number;
  specs: string;
  emirate: string;
  statsColor: string;
  separatorColor: string;
}

const CardStats = memo(function CardStats({ mileage, specs, emirate, statsColor, separatorColor }: CardStatsProps) {
  return (
    <View style={styles.statsRow}>
      <Data size="bodySm" style={{ color: statsColor }}>{formatMileage(mileage)} km</Data>
      <Data size="bodySm" style={{ color: separatorColor }}>·</Data>
      <Data size="bodySm" style={{ color: statsColor }}>{specs}</Data>
      <Data size="bodySm" style={{ color: separatorColor }}>·</Data>
      <Data size="bodySm" style={{ color: statsColor }} numberOfLines={1}>{emirate}</Data>
    </View>
  );
});

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
        <View style={[styles.avatarRing, { borderColor: colors.blkBorder }]} />
      )}
      <View style={[styles.avatar, { backgroundColor: theme.avatarBg, borderColor: theme.avatarBorder }]}>
        {avatarUri ? (
          <Image
            source={{ uri: avatarUri }}
            style={styles.avatarImage}
            contentFit="cover"
            transition={Timing.avatarTransition}
          />
        ) : (
          <Text variant="heading" style={{ color: theme.meta }}>
            {name.charAt(0).toUpperCase()}
          </Text>
        )}
      </View>
      <View style={styles.sellerMeta}>
        <Supporting size="bodySm" style={[styles.sellerName, { color: theme.sellerText }]} numberOfLines={1}>
          {name}
        </Supporting>
        {!isBlackTierPartner && isVerified && (
          <CheckCircle2 size={Sizes.iconSm} color={colors.primary} />
        )}
        {isBlackTierPartner && (
          <View style={[styles.blkBadge, { backgroundColor: colors.blkBadgeBg, borderColor: colors.blkBadgeBorder }]}>
            <Label size="caption" uppercase={false} style={{ color: colors.blkBadgeFg }}>BLK</Label>
          </View>
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
        <Skeleton width="100%" height={Spacing['5xl'] * 4} borderRadius={0} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.header}>
          <Skeleton width="60%" height={Spacing.lg} />
          <Skeleton width={Sizes.avatarSm} height={Spacing.md} />
        </View>
        <Skeleton width="40%" height={Spacing.xl} style={{ marginVertical: Spacing.xs }} />
        <View style={styles.statsRow}>
          <Skeleton width="20%" height={Spacing.md} />
          <Skeleton width="15%" height={Spacing.md} />
          <Skeleton width="18%" height={Spacing.md} />
        </View>
        <View style={styles.footer}>
          <View style={styles.sellerInfo}>
            <SkeletonCircle size={Sizes.bubble} />
            <Skeleton width="40%" height={Spacing.lg} />
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
    borderWidth: BorderWidths.thin,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  blkAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: BorderWidths.thin,
    zIndex: ZIndex.raised,
  },
  content: {
    padding: Spacing.md,
    gap: Spacing.xs,
  },

  // Image Section
  imageContainer: {
    width: '100%',
    aspectRatio: AspectRatio.cardImage,
    borderTopLeftRadius: Radius['2xl'],
    borderTopRightRadius: Radius['2xl'],
    borderCurve: 'continuous',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    borderTopLeftRadius: Radius['2xl'],
    borderTopRightRadius: Radius['2xl'],
  },
  imagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Header Section
  header: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: Spacing.xs,
  },
  title: {
    flex: 1,
  },


  // Stats Section
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },

  // Footer Section
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Spacing.sm,
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
    width: Sizes.bubble,
    height: Sizes.bubble,
    borderRadius: Sizes.bubble / 2,
    borderWidth: BorderWidths.thin,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarRing: {
    position: 'absolute',
    width: Sizes.bubble + Spacing.sm,
    height: Sizes.bubble + Spacing.sm,
    borderRadius: (Sizes.bubble + Spacing.sm) / 2,
    borderWidth: BorderWidths.medium,
    top: -Spacing.xs,
    left: -Spacing.xs,
  },
  avatarImage: {
    width: Sizes.bubble,
    height: Sizes.bubble,
    borderRadius: Sizes.bubble / 2,
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
  blkBadge: {
    paddingHorizontal: Sizes.badgePaddingH,
    paddingVertical: Sizes.badgePaddingV,
    borderRadius: Radius.none,
    borderWidth: BorderWidths.thin,
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
    borderWidth: BorderWidths.thin,
  },
});
