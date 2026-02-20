/**
 * BLK Card - Transparent Glass-styled Car Card for BLK Screen
 * Same layout and typography as CarCardM
 * Transparent background lets the BLK doodle show through
 */

import React, { useCallback, memo } from 'react';
import { StyleSheet, View, Share } from 'react-native';
import { Image } from 'expo-image';
import { Share2, CheckCircle2 } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { Colors, Spacing, Radius, Layout, Sizes } from '@/constants/theme';
import { getThumbUrl } from '@/lib/config';
import { 
  HapticPressable,
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

// Glass colors for BLK screen - using theme's OLED black
const GLASS = {
  background: Colors.dark.oledBlack, // True OLED black (#000000)
  border: Colors.dark.blkBorder, // #262626
  text: Colors.dark.blkText, // #FAFAFA
  textSecondary: Colors.dark.blkTextSecondary, // #A3A3A3
  textTertiary: 'rgba(255,255,255,0.4)',
  separator: 'rgba(255,255,255,0.25)',
  imageBg: Colors.dark.blkBackground, // #0D0D0D
};

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

export interface BlkCardProps {
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
  // Partner/Dealer info
  partnerName?: string | null;
  partnerLogo?: string | null;
  partnerVerified?: boolean;
  isBlackTierPartner?: boolean;
  sellerName?: string | null;
  sellerAvatarUrl?: string | null;
  kycVerified?: boolean;
  // Interaction state
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

export const BlkCard = memo(function BlkCard({
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
}: BlkCardProps) {
  // Derived display values
  const rawImage = thumbnail || images?.[0];
  const displayImage = getThumbUrl(rawImage) || rawImage;
  const displaySpecs = formatSpecs(specs || 'GCC');
  const displayEmirate = formatEmirate(emirate);
  const displaySellerName = partnerName || sellerName || 'Private Seller';
  const isVerified = partnerVerified || kycVerified;
  const carTitle = `${year} ${make} ${model}${trim ? ` ${trim}` : ''}`;
  const rawSellerAvatar = partnerLogo || sellerAvatarUrl;
  const sellerAvatar = getThumbUrl(rawSellerAvatar) || rawSellerAvatar;

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
      style={styles.container}
    >
      {/* === IMAGE SECTION === */}
      <View style={styles.imageContainer}>
        {displayImage ? (
          <Image
            source={{ uri: displayImage }}
            style={styles.image}
            contentFit="cover"
            transition={200}
            placeholder={{ blurhash: IMAGE_BLURHASH }}
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Supporting size="small" style={{ color: GLASS.textTertiary }}>No Image</Supporting>
          </View>
        )}
      </View>

      {/* === CONTENT SECTION === */}
      <View style={styles.content}>
        {/* Header: Title + Year */}
        <View style={styles.header}>
          <Heading size="mini" style={styles.title} numberOfLines={1}>
            {make} {model}
          </Heading>
          <Data size="medium" style={styles.year}>{year}</Data>
        </View>

        {/* Price */}
        <Heading size="small" style={styles.price}>
          {formatPrice(price)}
        </Heading>

        {/* Stats: Mileage · Specs · Location */}
        <View style={styles.statsRow}>
          <Data size="medium" style={styles.stat}>{formatMileage(mileage)} km</Data>
          <Data size="medium" style={styles.separator}>·</Data>
          <Data size="small" style={styles.stat}>{displaySpecs}</Data>
          <Data size="medium" style={styles.separator}>·</Data>
          <Data size="medium" style={styles.stat} numberOfLines={1}>{displayEmirate}</Data>
        </View>

        {/* Footer: Seller + Actions */}
        <View style={styles.footer}>
          {/* Seller Info */}
          <View style={styles.sellerInfo}>
            <View style={styles.avatar}>
              {sellerAvatar ? (
                <Image 
                  source={{ uri: sellerAvatar }} 
                  style={styles.avatarImage} 
                  contentFit="cover" 
                  transition={150} 
                />
              ) : (
                <Text variant="avatarSmall" style={{ color: GLASS.textSecondary }}>
                  {displaySellerName.charAt(0).toUpperCase()}
                </Text>
              )}
            </View>
            
            <View style={styles.sellerMeta}>
              <Data size="small" style={styles.sellerName} numberOfLines={1}>
                {displaySellerName}
              </Data>
              {!isBlackTierPartner && isVerified && (
                <CheckCircle2 size={Sizes.iconSm} color={Colors.dark.primary} />
              )}
              {isBlackTierPartner && (
                <View style={styles.blkBadge}>
                  <Label size="badge" uppercase={false} style={styles.blkBadgeText}>BLK</Label>
                </View>
              )}
            </View>
          </View>
          
          {/* Actions */}
          <View style={styles.actions}>
            <View style={styles.actionBubble}>
              <FavoriteButton
                listingId={id}
                size={Sizes.iconXs}
                onPress={onFavoritePress}
                isFavorite={isFavoriteProp}
                isBlkListing
                hitSlop={Layout.hitSlop}
              />
            </View>
            <View style={styles.actionBubble}>
              <SuperlikeButton
                listingId={id}
                size={Sizes.iconXs}
                onPress={onSuperlikePress}
                isSuperliked={isSuperlikedProp}
                isBlkListing
                hitSlop={Layout.hitSlop}
              />
            </View>
            <HapticPressable
              onPress={handleSharePress}
              hitSlop={Layout.hitSlop}
              style={styles.actionBubble}
            >
              <Share2 size={Sizes.iconXs} color={GLASS.textSecondary} strokeWidth={1.75} />
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

export function BlkCardSkeleton() {
  return (
    <View style={styles.container}>
      {/* Image */}
      <View style={styles.imageContainer}>
        <View style={[styles.skeletonImage, { backgroundColor: GLASS.imageBg }]} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={[styles.skeletonBar, { width: '60%', height: Spacing.lg }]} />
          <View style={[styles.skeletonBar, { width: Sizes.avatarSm, height: Spacing.md }]} />
        </View>
        <View style={[styles.skeletonBar, { width: '40%', height: Spacing.xl, marginVertical: Spacing.xs }]} />
        <View style={styles.statsRow}>
          <View style={[styles.skeletonBar, { width: '20%', height: Spacing.md }]} />
          <View style={[styles.skeletonBar, { width: '15%', height: Spacing.md }]} />
          <View style={[styles.skeletonBar, { width: '18%', height: Spacing.md }]} />
        </View>
        <View style={styles.footer}>
          <View style={styles.sellerInfo}>
            <View style={styles.skeletonCircle} />
            <View style={[styles.skeletonBar, { width: '40%', height: Spacing.lg }]} />
          </View>
          <View style={styles.actions}>
            <View style={styles.skeletonCircleSmall} />
            <View style={styles.skeletonCircleSmall} />
            <View style={styles.skeletonCircleSmall} />
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
  // Layout - Transparent glass container
  container: {
    width: '100%',
    borderRadius: Radius['2xl'],
    borderWidth: 1,
    borderColor: GLASS.border,
    backgroundColor: GLASS.background,
    overflow: 'hidden',
    marginBottom: Spacing.lg,
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
    backgroundColor: GLASS.imageBg,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: GLASS.imageBg,
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
    color: GLASS.text,
  },
  year: {
    color: GLASS.textSecondary,
  },

  // Price
  price: {
    color: GLASS.text,
  },

  // Stats Section
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  stat: {
    color: GLASS.textSecondary,
  },
  separator: {
    color: GLASS.separator,
    opacity: 0.6,
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
    borderColor: GLASS.border,
    backgroundColor: GLASS.background,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
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
    color: GLASS.text,
  },
  blkBadge: {
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: Radius.none,
    borderWidth: 1,
    borderColor: GLASS.border,
    backgroundColor: GLASS.background,
  },
  blkBadgeText: {
    color: GLASS.text,
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
    borderColor: GLASS.border,
    backgroundColor: GLASS.background,
  },

  // Skeleton styles
  skeletonImage: {
    width: '100%',
    height: '100%',
    opacity: 0.3,
  },
  skeletonBar: {
    backgroundColor: GLASS.border,
    borderRadius: Radius.sm,
    opacity: 0.4,
  },
  skeletonCircle: {
    width: Sizes.bubbleXs,
    height: Sizes.bubbleXs,
    borderRadius: Sizes.bubbleXs / 2,
    backgroundColor: GLASS.border,
    opacity: 0.4,
  },
  skeletonCircleSmall: {
    width: Sizes.bubbleXs,
    height: Sizes.bubbleXs,
    borderRadius: Sizes.bubbleXs / 2,
    backgroundColor: GLASS.border,
    opacity: 0.4,
  },
});
