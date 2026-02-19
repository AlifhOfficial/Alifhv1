/**
 * Partner Grid - Partner-Specific Inventory
 * Clean dark card with white product thumbnails
 * Vertical layout - partner cards stacked below each other
 * 
 * Now supports:
 * - API-driven data through props (PartnerListItem from partner-api)
 * - Loading states
 * - Empty state handling
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
import { ArrowRight, Heart } from 'lucide-react-native';
import { useRouter } from 'expo-router';

import { Spacing, Radius, Sizes } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { getThumbUrl } from '@/lib/config';
import { HapticPressable, Heading, Data, Supporting, Skeleton, SkeletonCircle } from '@/components/ui';
import { type PartnerListItem } from '@/lib/partner-api';
import { type ListingCard } from '@/lib/search-api';

// ============================================================================
// PARTNER PRODUCTS SKELETON
// ============================================================================

const PartnerProductsSkeleton = memo(function PartnerProductsSkeleton() {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.productsContainer}
    >
      {[1, 2, 3].map((i) => (
        <Skeleton 
          key={i}
          width={PRODUCT_CARD_WIDTH} 
          height={PRODUCT_CARD_HEIGHT} 
          borderRadius={Radius.xl}
        />
      ))}
    </ScrollView>
  );
});

// ============================================================================
// PARTNER SHOWCASE SKELETON (Full card)
// ============================================================================

export const PartnerShowcaseCardSkeleton = memo(function PartnerShowcaseCardSkeleton() {
  const { colors } = useTheme();
  
  return (
    <View style={[styles.partnerCard, { borderColor: colors.border, backgroundColor: colors.surface }]}>
      {/* Header skeleton */}
      <View style={styles.header}>
        <SkeletonCircle size={Sizes.avatarLg} />
        <View style={styles.headerInfo}>
          <Skeleton width="60%" height={16} />
          <Skeleton width="40%" height={12} />
        </View>
      </View>
      
      {/* Products skeleton */}
      <PartnerProductsSkeleton />
      
      {/* Footer skeleton */}
      <View style={styles.footer}>
        <Skeleton width="30%" height={16} />
        <SkeletonCircle size={Sizes.bubble} />
      </View>
    </View>
  );
});

// ============================================================================
// HELPER: Convert API data to display format
// ============================================================================

/**
 * Convert PartnerListItem + listings to PartnerDisplayData
 * Used by home screen to transform API response for PartnerShowcaseCard
 */
export function partnerToDisplayData(
  partner: PartnerListItem,
  listings: ListingCard[]
): PartnerDisplayData {
  return {
    id: partner.id,
    name: partner.brandName,
    logo: partner.logoUrl || partner.logo,
    rating: partner.googleRating || partner.platformRating,
    reviewCount: partner.googleReviewCount || partner.platformReviewCount,
    listings: listings.map(l => ({
      id: l.id,
      price: l.price,
      thumbnail: l.thumbnail,
    })),
  };
}

// ============================================================================
// TYPES
// ============================================================================

/** Partner data for display - supports both API and mock data */
export interface PartnerDisplayData {
  id: string;
  name: string;
  logo?: ImageSourcePropType | string | null;
  rating?: number | null;
  reviewCount?: number | null;
  listings: PartnerListingItem[];
}

/** Listing item for partner grid */
export interface PartnerListingItem {
  id: string;
  price: number;
  thumbnail?: ImageSourcePropType | string | null;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - (Spacing.sm * 2);
const PRODUCT_CARD_WIDTH = CARD_WIDTH * 0.42;
const PRODUCT_CARD_HEIGHT = PRODUCT_CARD_WIDTH * (4 / 5);
const IMAGE_BLURHASH = 'L6PZfSi_.AyE_3t7t7R**0o#DgR4';

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
// FORMAT UTILITIES
// ============================================================================

function formatCompactPrice(amount: number): string {
  if (amount >= 1000000) {
    const millions = amount / 1000000;
    return millions % 1 === 0 ? `${millions}M` : `${millions.toFixed(1)}M`;
  }
  if (amount >= 1000) {
    const thousands = amount / 1000;
    return thousands % 1 === 0 ? `${thousands}K` : `${thousands.toFixed(0)}K`;
  }
  return amount.toString();
}

function formatReviewCount(count: number): string {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
}

// ============================================================================
// PRODUCT CARD - White background with price & favorite
// ============================================================================

interface ProductCardProps {
  listing: PartnerListingItem;
  onPress?: (id: string) => void;
  onFavoritePress?: (id: string) => void;
}

const ProductCard = memo(function ProductCard({
  listing,
  onPress,
  onFavoritePress,
}: ProductCardProps) {
  const { colors } = useTheme();

  const handlePress = useCallback(() => {
    onPress?.(listing.id);
  }, [listing.id, onPress]);

  const handleFavoritePress = useCallback(() => {
    onFavoritePress?.(listing.id);
  }, [listing.id, onFavoritePress]);

  return (
    <HapticPressable onPress={handlePress} style={[styles.productCard, { backgroundColor: colors.oledWhite }]}>
      {/* White background product image */}
      <Image
        source={toImageSource(listing.thumbnail)}
        style={styles.productImage}
        contentFit="cover"
        placeholder={IMAGE_BLURHASH}
        transition={200}
      />
      {/* Price Badge - Top Left */}
      <View style={[styles.priceBadge, { backgroundColor: colors.glassBackground, borderColor: colors.glassBorderOnDark }]}>
        <Data size="mini" style={[styles.priceText, { color: colors.oledWhite }]}>{formatCompactPrice(listing.price)}</Data>
      </View>
      {/* Favorite Button - Bottom Right */}
      <HapticPressable onPress={handleFavoritePress} style={[styles.favoriteButton, { backgroundColor: colors.glassBackground, borderColor: colors.glassBorderOnDark }]}>
        <Heart size={Sizes.iconSm} color={colors.oledWhite} strokeWidth={2} />
      </HapticPressable>
    </HapticPressable>
  );
});

// ============================================================================
// PARTNER SHOWCASE CARD
// ============================================================================

interface PartnerShowcaseCardProps {
  partner: PartnerDisplayData;
  /** Loading state */
  isLoading?: boolean;
  onShopAllPress?: (partnerId: string) => void;
  onCarPress?: (id: string) => void;
  onFavoritePress?: (id: string) => void;
}

export const PartnerShowcaseCard = memo(function PartnerShowcaseCard({
  partner,
  isLoading,
  onShopAllPress,
  onCarPress,
  onFavoritePress,
}: PartnerShowcaseCardProps) {
  const { colors } = useTheme();
  const router = useRouter();

  const handleShopAllPress = useCallback(() => {
    onShopAllPress?.(partner.id);
  }, [partner.id, onShopAllPress]);

  const handleCarPress = useCallback((id: string) => {
    onCarPress?.(id);
    router.push(`/listing/${id}` as any);
  }, [onCarPress, router]);

  return (
    <View style={[styles.partnerCard, { borderColor: colors.border, backgroundColor: colors.surface }]}>
      {/* Header - Logo, Name & Rating */}
      <View style={styles.header}>
        <View style={[styles.logoContainer, { backgroundColor: colors.surface }]}>
          <Image
            source={toImageSource(partner.logo)}
            style={styles.logo}
            contentFit="cover"
            placeholder={IMAGE_BLURHASH}
          />
        </View>
        <View style={styles.headerInfo}>
          <Heading size="small" style={[styles.partnerName, { color: colors.text }]}>{partner.name}</Heading>
          {partner.rating && partner.reviewCount && (
            <Data size="small" style={[styles.ratingText, { color: colors.textTertiary }]}>
              {partner.rating} ★ ({formatReviewCount(partner.reviewCount)})
            </Data>
          )}
        </View>
      </View>

      {/* Product Thumbnails - Horizontal Scroll */}
      {isLoading && partner.listings.length === 0 ? (
        <PartnerProductsSkeleton />
      ) : partner.listings.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.productsContainer}
        >
          {partner.listings.slice(0, 4).map((listing) => (
            <ProductCard
              key={listing.id}
              listing={listing}
              onPress={handleCarPress}
              onFavoritePress={onFavoritePress}
            />
          ))}
        </ScrollView>
      ) : (
        <View style={styles.emptyProducts}>
          <Supporting size="small" style={[styles.emptyText, { color: colors.textMuted }]}>No listings available</Supporting>
        </View>
      )}

      {/* Browse All Footer */}
      <HapticPressable onPress={handleShopAllPress} style={styles.footer}>
        <Heading size="small" style={[styles.browseAllText, { color: colors.text }]}>Browse all</Heading>
        <View style={[styles.arrowCircle, { backgroundColor: colors.glassBackground, borderColor: colors.glassBorder }]}>
          <ArrowRight size={Sizes.iconSm} color={colors.icon} strokeWidth={2.5} />
        </View>
      </HapticPressable>
    </View>
  );
});

// ============================================================================
// PARTNER GRID COMPONENT
// ============================================================================

interface PartnerGridProps {
  /** Partners to display - from API */
  partners: PartnerDisplayData[];
  /** Loading state */
  isLoading?: boolean;
  onPartnerPress?: (partnerId: string) => void;
  onCarPress?: (id: string) => void;
  onFavoritePress?: (id: string) => void;
}

export const PartnerGrid = memo(function PartnerGrid({
  partners,
  isLoading,
  onPartnerPress,
  onCarPress,
  onFavoritePress,
}: PartnerGridProps) {
  const { colors } = useTheme();
  
  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={[styles.partnerCard, styles.loadingCard, { backgroundColor: colors.surface }]}>
          <View style={[styles.loadingContent, { backgroundColor: colors.surface }]} />
        </View>
      </View>
    );
  }

  if (!partners || partners.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {partners.map((partner) => (
        <PartnerShowcaseCard
          key={partner.id}
          partner={partner}
          onShopAllPress={onPartnerPress}
          onCarPress={onCarPress}
          onFavoritePress={onFavoritePress}
        />
      ))}
    </View>
  );
});

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.sm,
    gap: Spacing.lg,
  },
  partnerCard: {
    width: CARD_WIDTH,
    borderRadius: Radius['2xl'],
    overflow: 'hidden',
    paddingBottom: Spacing['2xl'],
    borderWidth: 1,
  },
  loadingCard: {
    height: 280,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    width: '80%',
    height: 20,
    borderRadius: Radius.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing['2xl'],
    paddingBottom: Spacing.xl,
  },
  logoContainer: {
    width: Sizes.avatarLg,
    height: Sizes.avatarLg,
    borderRadius: Sizes.avatarLg / 2,
    overflow: 'hidden',
  },
  logo: {
    width: Sizes.avatarLg,
    height: Sizes.avatarLg,
    borderRadius: Sizes.avatarLg / 2,
  },
  headerInfo: {
    flex: 1,
    gap: Spacing.xs / 2,
  },
  partnerName: {
    letterSpacing: -0.3,
  },
  ratingText: {
  },
  productsContainer: {
    paddingHorizontal: Spacing.xl,
    gap: Spacing.md,
  },
  emptyProducts: {
    height: PRODUCT_CARD_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  emptyText: {
  },
  productCard: {
    width: PRODUCT_CARD_WIDTH,
    height: PRODUCT_CARD_HEIGHT,
    borderRadius: Radius.xl,
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  priceBadge: {
    position: 'absolute',
    top: Spacing.sm,
    left: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs / 2,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  priceText: {
  },
  favoriteButton: {
    position: 'absolute',
    bottom: Spacing.sm,
    right: Spacing.sm,
    width: Sizes.bubble,
    height: Sizes.bubble,
    borderRadius: Sizes.bubble / 2,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
  },
  browseAllText: {
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
