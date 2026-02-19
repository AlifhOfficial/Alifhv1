/**
 * BLK Grid Card - Premium Signature Line
 * Hero-style card showcasing Revvup's BLK premium car collection
 * Features dark luxury aesthetic with Revvup branding and doodle pattern
 */

import React, { memo, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
  ImageSourcePropType,
} from 'react-native';
import { Image, ImageSource } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowRight, Heart } from 'lucide-react-native';
import { useRouter } from 'expo-router';

import { Colors, Spacing, Radius, Sizes } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { getThumbUrl } from '@/lib/config';
import { HapticPressable, Heading, Data, Label, Supporting, Skeleton, SkeletonCircle } from '@/components/ui';
import { RevvupLogo } from '@/components/ui/loaders';
import { BlkTextDoodle } from './blk-text-doodle';

// ============================================================================
// BLK CARD SKELETON
// ============================================================================

const BlkCardSkeleton = memo(function BlkCardSkeleton() {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.cardsContainer}
      style={styles.cardsScroll}
    >
      {[1, 2, 3].map((i) => (
        <View key={i} style={styles.miniCard}>
          <Skeleton 
            width={CARD_WIDTH} 
            height={IMAGE_HEIGHT} 
            borderRadius={Radius.xl}
            style={{ backgroundColor: '#1A1A1A' }}
          />
          <View style={styles.miniCardInfo}>
            <Skeleton width="70%" height={14} style={{ backgroundColor: '#1A1A1A' }} />
            <Skeleton width="30%" height={12} style={{ marginTop: 4, backgroundColor: '#1A1A1A' }} />
          </View>
        </View>
      ))}
    </ScrollView>
  );
});

// ============================================================================
// TYPES
// ============================================================================

/** Unified listing type that works with both mock and API data */
export interface BlkListingItem {
  id: string;
  make: string;
  model: string;
  year: number;
  trim?: string | null;
  price: number;
  mileage?: number;
  emirate?: string;
  specs?: string | null;
  thumbnail?: ImageSourcePropType | string | null;
  isBlkListing?: boolean;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.5;
const IMAGE_HEIGHT = CARD_WIDTH * (4 / 5); // 5:4 cinematic aspect ratio
const IMAGE_BLURHASH = 'L6PZfSi_.AyE_3t7t7R**0o#DgR4';

// ============================================================================
// FORMAT UTILITIES
// ============================================================================

/**
 * Format price with compact notation (1M, 500K, 50K)
 */
function formatCompactPrice(amount: number): string {
  if (amount >= 1000000) {
    const millions = amount / 1000000;
    return millions % 1 === 0 ? `AED ${millions}M` : `AED ${millions.toFixed(1)}M`;
  }
  if (amount >= 1000) {
    const thousands = amount / 1000;
    return thousands % 1 === 0 ? `AED ${thousands}K` : `AED ${thousands.toFixed(0)}K`;
  }
  return `AED ${amount}`;
}

// ============================================================================
// UTILITIES
// ============================================================================

/** Convert image source to expo-image compatible format with thumb optimization */
function toImageSource(source: ImageSourcePropType | string | undefined | null): ImageSource | undefined {
  if (!source) return undefined;
  if (typeof source === 'string') {
    // Apply thumb URL conversion for string URLs
    const thumbUrl = getThumbUrl(source) || source;
    return { uri: thumbUrl };
  }
  // Handle number (require() assets) and other ImageSourcePropType values
  return source as ImageSource;
}

// ============================================================================
// MINI CAR CARD
// ============================================================================

interface MiniCarCardProps {
  listing: BlkListingItem;
  onPress?: (id: string) => void;
  onFavoritePress?: (id: string) => void;
}

const MiniCarCard = memo(function MiniCarCard({
  listing,
  onPress,
  onFavoritePress,
}: MiniCarCardProps) {
  const handlePress = useCallback(() => {
    onPress?.(listing.id);
  }, [listing.id, onPress]);

  const handleFavoritePress = useCallback(() => {
    onFavoritePress?.(listing.id);
  }, [listing.id, onFavoritePress]);

  return (
    <HapticPressable onPress={handlePress} style={styles.miniCard}>
      {/* Image Container */}
      <View style={styles.miniImageContainer}>
        <Image
          source={toImageSource(listing.thumbnail)}
          style={styles.miniImage}
          contentFit="cover"
          placeholder={IMAGE_BLURHASH}
          transition={200}
        />
        {/* Cinematic gradient overlay */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.6)']}
          style={styles.imageGradient}
        />
        {/* Price Badge - Bottom left */}
        <View style={[styles.priceBadge, { backgroundColor: Colors.dark.glassBackground, borderColor: Colors.dark.glassBorderOnDark }]}>
          <Supporting size="mini" style={styles.priceText}>
            {formatCompactPrice(listing.price)}
          </Supporting>
        </View>
        {/* Favorite Button - Glass bubble */}
        <HapticPressable
          onPress={handleFavoritePress}
          style={[styles.favoriteButton, { backgroundColor: Colors.dark.glassBackground, borderColor: Colors.dark.glassBorderOnDark }]}
        >
          <Heart size={Sizes.iconSm} color="#FAFAFA" strokeWidth={2} />
        </HapticPressable>
      </View>
      {/* Car Title Below Image */}
      <View style={styles.miniCardInfo}>
        <Supporting size="medium" style={styles.carModel} numberOfLines={1}>
          {listing.make} {listing.model}
        </Supporting>
        <Supporting size="small" style={styles.carYear} numberOfLines={1}>
          {listing.year}
        </Supporting>
      </View>
    </HapticPressable>
  );
});

// ============================================================================
// BLK GRID CARD COMPONENT
// ============================================================================

interface BlkGridCardProps {
  /** Listings to display - from API or mock data */
  listings?: BlkListingItem[];
  /** Loading state */
  isLoading?: boolean;
  onShopAllPress?: () => void;
  onCarPress?: (id: string) => void;
  onFavoritePress?: (id: string) => void;
}

export const BlkGridCard = memo(function BlkGridCard({
  listings = [],
  isLoading = false,
  onShopAllPress,
  onCarPress,
  onFavoritePress,
}: BlkGridCardProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const router = useRouter();

  const handleShopAllPress = useCallback(() => {
    onShopAllPress?.();
    // Navigate to BLK collection
  }, [onShopAllPress]);

  const handleCarPress = useCallback((id: string) => {
    onCarPress?.(id);
    router.push(`/listing/${id}` as any);
  }, [onCarPress, router]);

  // Don't render if no listings and not loading
  if (!isLoading && listings.length === 0) {
    return null;
  }

  return (
    <View style={[styles.container, { borderColor: colors.border }]}>
      {/* Dark Background - Pure black like category-grid */}
      <LinearGradient
        colors={['#000000', '#0A0A0A', '#000000']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* BLK Doodle Pattern - Subtle "black" text pattern */}
      <BlkTextDoodle />

      {/* Header with Revvup Logo & BLK Badge */}
      <View style={styles.header}>
        <View style={styles.brandRow}>
          {/* Revvup Logo */}
          <View style={styles.logoContainer}>
            <RevvupLogo size={32} color="#FAFAFA" />
          </View>
          {/* BLK Badge - Bold & Unapologetic */}
          <Label size="badge" style={styles.blkText}>BLK</Label>
        </View>
      </View>

      {/* Signature Line */}
      <View style={styles.signatureRow}>
        <Supporting size="medium" style={styles.signatureText}>Signature Line</Supporting>
      </View>

      {/* Car Cards Scroll with negative space */}
      {isLoading ? (
        <BlkCardSkeleton />
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.cardsContainer}
          style={styles.cardsScroll}
        >
          {listings.map((listing) => (
            <MiniCarCard
              key={listing.id}
              listing={listing}
              onPress={handleCarPress}
              onFavoritePress={onFavoritePress}
            />
          ))}
        </ScrollView>
      )}

      {/* Shop All Footer */}
      <HapticPressable onPress={handleShopAllPress} style={styles.footer}>
        <Heading size="small" style={styles.shopAllText}>
          Shop all
        </Heading>
        <View style={[styles.arrowCircle, { backgroundColor: Colors.dark.glassBackground, borderColor: Colors.dark.glassBorderOnDark }]}>
          <ArrowRight size={Sizes.iconSm} color="#FAFAFA" strokeWidth={2.5} />
        </View>
      </HapticPressable>
    </View>
  );
});

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    marginHorizontal: Spacing.sm,
    borderRadius: Radius['2xl'],
    overflow: 'hidden',
    paddingBottom: Spacing['2xl'],
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
    zIndex: 10,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  logoContainer: {
    opacity: 1,
  },
  blkText: {
    color: '#FAFAFA',
  },
  signatureRow: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
    zIndex: 10,
  },
  signatureText: {
    color: 'rgba(255,255,255,0.6)',
  },
  cardsScroll: {
    zIndex: 10,
  },
  cardsContainer: {
    paddingHorizontal: Spacing.xl,
    gap: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  miniCard: {
    width: CARD_WIDTH,
  },
  miniImageContainer: {
    width: '100%',
    height: IMAGE_HEIGHT,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    backgroundColor: '#141414',
  },
  miniImage: {
    width: '100%',
    height: '100%',
  },
  imageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
  },
  priceBadge: {
    position: 'absolute',
    bottom: Spacing.sm,
    left: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  priceText: {
    color: '#FAFAFA',
  },
  favoriteButton: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    width: Sizes.bubble,
    height: Sizes.bubble,
    borderRadius: Sizes.bubble / 2,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  miniCardInfo: {
    paddingTop: Spacing.md,
    paddingHorizontal: 2,
  },
  carModel: {
    color: '#FAFAFA',
    fontWeight: '600',
  },
  carYear: {
    color: 'rgba(255,255,255,0.5)',
    marginTop: 2,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    zIndex: 10,
  },
  shopAllText: {
    color: '#FAFAFA',
  },
  arrowCircle: {
    width: Sizes.bubble,
    height: Sizes.bubble,
    borderRadius: Sizes.bubble / 2,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
