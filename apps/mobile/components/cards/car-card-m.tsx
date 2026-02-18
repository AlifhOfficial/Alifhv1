/**
 * Car Card Mobile (CarCardM) - Revvup Design System
 * Mobile-optimized car listing card following web car-card patterns
 * All data points preserved, theme-driven styling
 * 
 * Uses semantic Text components for cross-platform consistency
 */

import React, { useCallback, memo, useMemo } from 'react';
import { StyleSheet, View, Share } from 'react-native';
import { Image } from 'expo-image';
import { Share2, CheckCircle2 } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { Colors, Spacing, Radius, Layout, Sizes } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { 
  HapticPressable,
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
// CONSTANTS
// ============================================================================

const IMAGE_ASPECT_RATIO = 16 / 9;
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
  background: string;
  border: string;
  title: string;
  price: string;
  stats: string;
  meta: string;
  separator: string;
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
        background: colors.blkBackground,
        border: colors.blkBorder,
        title: colors.blkText,
        price: colors.blkText,
        stats: colors.blkTextSecondary,
        meta: colors.blkTextSecondary,
        separator: colors.blkBorder,
        sellerText: colors.blkTextSecondary,
        actionIcon: colors.blkTextSecondary,
        imageBg: colors.blkBackground,
        avatarBg: colors.blkBackground,
        avatarBorder: isBlackTierPartner ? colors.blkBackground : colors.blkBorder,
      };
    }
    // Surface aesthetic - standard card styling for normal listings
    return {
      background: colors.surface,
      border: colors.border,
      title: colors.text,
      price: colors.primary,
      stats: colors.textSecondary,
      meta: colors.textSecondary,
      separator: colors.textTertiary,
      sellerText: colors.text,
      actionIcon: colors.icon,
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
  onLongPress,
  onFavoritePress,
  onSuperlikePress,
  onSharePress,
}: CarCardMProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const theme = useCardTheme(colors, isBlkListing, isBlackTierPartner);

  // Derived display values
  const displayImage = thumbnail || images?.[0];
  const displaySpecs = formatSpecs(specs || 'GCC');
  const displayEmirate = formatEmirate(emirate);
  const displaySellerName = partnerName || sellerName || 'Private Seller';
  const isVerified = partnerVerified || kycVerified;
  const carTitle = `${year} ${make} ${model}${trim ? ` ${trim}` : ''}`;
  const sellerAvatar = partnerLogo || sellerAvatarUrl;

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
    try {
      await Share.share({ message: `Check out this ${carTitle}`, title: carTitle });
    } catch {
      // Share cancelled or failed
    }
  }, [id, carTitle, onSharePress]);

  return (
    <HapticPressable
      onPress={handlePress}
      onLongPress={onLongPress ? handleLongPress : undefined}
      delayLongPress={400}
      style={[styles.container, { backgroundColor: theme.background, borderColor: theme.border }]}
    >
      {/* BLK Accent Line */}
      {isBlkListing && <View style={[styles.blkAccent, { backgroundColor: theme.border }]} />}

      {/* === IMAGE SECTION === */}
      <CardImage 
        uri={displayImage} 
        backgroundColor={theme.imageBg}
        placeholderColor={colors.textTertiary}
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
        <Heading size="small" style={{ color: theme.price }}>
          {formatPrice(price)}
        </Heading>

        {/* Stats: Mileage · Specs · Location */}
        <CardStats
          mileage={mileage}
          specs={displaySpecs}
          emirate={displayEmirate}
          statsColor={theme.stats}
          separatorColor={theme.separator}
        />

        {/* Footer: Seller + Actions */}
        <View style={styles.footer}>
          <SellerInfo
            name={displaySellerName}
            avatarUri={sellerAvatar}
            isVerified={isVerified}
            isBlackTierPartner={isBlackTierPartner}
            theme={theme}
            colors={colors}
          />
          <CardActions
            listingId={id}
            isFavorite={isFavoriteProp}
            isSuperliked={isSuperlikedProp}
            isBlkListing={isBlkListing}
            actionIconColor={theme.actionIcon}
            glassBackground={colors.glassBackground}
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
          transition={200}
          placeholder={{ blurhash: IMAGE_BLURHASH }}
        />
      ) : (
        <View style={[styles.imagePlaceholder, { backgroundColor: skeletonColor }]}>
          <Supporting size="small" style={{ color: placeholderColor }}>No Image</Supporting>
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
      <Heading size="mini" style={[styles.title, { color: titleColor }]} numberOfLines={1}>
        {make} {model}
      </Heading>
      <Data size="medium" style={{ color: metaColor }}>{year}</Data>
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
  const StatSeparator = <Data size="medium" style={[styles.separator, { color: separatorColor }]}>·</Data>;
  
  return (
    <View style={styles.statsRow}>
      <Data size="medium" style={{ color: statsColor }}>{formatMileage(mileage)} km</Data>
      {StatSeparator}
      <Data size="small" style={{ color: statsColor }}>{specs}</Data>
      {StatSeparator}
      <Data size="medium" style={{ color: statsColor }} numberOfLines={1}>{emirate}</Data>
    </View>
  );
});

interface SellerInfoProps {
  name: string;
  avatarUri?: string | null;
  isVerified: boolean;
  isBlackTierPartner: boolean;
  theme: CardTheme;
  colors: typeof Colors.light;
}

const SellerInfo = memo(function SellerInfo({ name, avatarUri, isVerified, isBlackTierPartner, theme, colors }: SellerInfoProps) {
  return (
    <View style={styles.sellerInfo}>
      {/* Avatar */}
      <View style={[
        styles.avatar,
        { backgroundColor: theme.avatarBg, borderColor: theme.avatarBorder },
        isBlackTierPartner && styles.avatarBlackTier,
      ]}>
        {avatarUri ? (
          <Image 
            source={{ uri: avatarUri }} 
            style={styles.avatarImage} 
            contentFit="cover" 
            transition={150} 
          />
        ) : (
          <Text variant="avatarSmall" style={{ color: theme.meta }}>
            {name.charAt(0).toUpperCase()}
          </Text>
        )}
      </View>
      
      {/* Name + Badges */}
      <View style={styles.sellerMeta}>
        <Data size="small" style={[styles.sellerName, { color: theme.sellerText }]} numberOfLines={1}>
          {name}
        </Data>
        {!isBlackTierPartner && isVerified && (
          <CheckCircle2 size={Sizes.iconSm} color={colors.primary} />
        )}
        {isBlackTierPartner && (
          <View style={[styles.blkBadge, { backgroundColor: colors.blkBadgeBackground, borderColor: colors.blkBadgeBorder }]}>
            <Label size="badge" uppercase={false} style={{ color: colors.blkBadgeText }}>BLK</Label>
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
        <Share2 size={Sizes.iconXs} color={actionIconColor} strokeWidth={1.75} />
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
            <SkeletonCircle size={Sizes.bubbleXs} />
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
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: Spacing.lg,
  },
  blkAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    zIndex: 1,
  },
  content: {
    padding: Spacing.lg,
    gap: Spacing.sm,
  },

  // Image Section
  imageContainer: {
    width: '100%',
    aspectRatio: IMAGE_ASPECT_RATIO,
    borderBottomLeftRadius: Radius.md,
    borderBottomRightRadius: Radius.md,
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

  // Header Section
  header: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  title: {
    flex: 1,
  },

  // Stats Section
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  separator: {
    opacity: 0.4,
  },

  // Footer Section
  footer: {
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
    width: Sizes.bubble,
    height: Sizes.bubble,
    borderRadius: Sizes.bubble / 2,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarBlackTier: {
    borderWidth: 2,
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
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: Radius.none,
    borderWidth: 1,
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
    borderWidth: 1,
  },
});
