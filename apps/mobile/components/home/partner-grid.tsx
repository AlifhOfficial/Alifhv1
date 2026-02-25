/**
 * Partner Grid - Partner Showcase
 * Clean container cards with product thumbnails
 */

import React, { memo, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { ChevronRight, Heart, CheckCircle2 } from 'lucide-react-native';
import { useRouter } from 'expo-router';

import { Colors, Spacing, Radius, Sizes, Layout } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { useSearch } from '@/context/search-context';
import { getThumbUrl } from '@/lib/config';
import { HapticPressable, Heading, Data, Supporting, Skeleton, Label } from '@/components/ui';
import { type PartnerListItem } from '@/lib/partner-api';
import { type ListingCard } from '@/lib/search-api';

// ============================================================================
// TYPES
// ============================================================================

export interface PartnerDisplayData {
  id: string;
  name: string;
  logo?: string | null;
  rating?: number | null;
  reviewCount?: number | null;
  isVerified?: boolean;
  isBlk?: boolean;
  listings: PartnerListingItem[];
}

export interface PartnerListingItem {
  id: string;
  price: number;
  thumbnail?: string | null;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PRODUCT_WIDTH = 180;
const PRODUCT_ASPECT = 5 / 4;
const BLURHASH = 'L6PZfSi_.AyE_3t7t7R**0o#DgR4';

// Dark glass for product overlays
const GLASS_BG = '#0D0D0D';
const GLASS_BORDER = 'rgba(255,255,255,0.14)';

// ============================================================================
// UTILITIES
// ============================================================================

const formatPrice = (n: number) => {
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${Math.round(n / 1e3)}K`;
  return n.toString();
};

const formatReviews = (n: number) => n >= 1e3 ? `${(n / 1e3).toFixed(1)}K` : n.toString();

// ============================================================================
// PRODUCT CARD
// ============================================================================

interface ProductCardProps {
  listing: PartnerListingItem;
  colors: typeof Colors.light;
  onPress: (id: string) => void;
  onFavorite?: (id: string) => void;
}

const ProductCard = memo(function ProductCard({ listing, colors, onPress, onFavorite }: ProductCardProps) {
  const imageUri = getThumbUrl(listing.thumbnail) || listing.thumbnail;

  return (
    <HapticPressable onPress={() => onPress(listing.id)} style={[styles.product, { backgroundColor: colors.oledWhite }]}>
      <Image
        source={imageUri ? { uri: imageUri } : undefined}
        style={styles.productImage}
        contentFit="cover"
        placeholder={{ blurhash: BLURHASH }}
        transition={150}
      />
      <View style={[styles.priceBadge, { backgroundColor: GLASS_BG, borderColor: GLASS_BORDER }]}>
        <Data size="mini" style={{ color: colors.oledWhite }}>
          AED {formatPrice(listing.price)}
        </Data>
      </View>
      <HapticPressable
        onPress={() => onFavorite?.(listing.id)}
        style={[styles.favBtn, { backgroundColor: GLASS_BG, borderColor: GLASS_BORDER }]}
      >
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
  colors?: typeof Colors.light;
  onPress?: (partnerId: string) => void;
  onCarPress?: (id: string) => void;
  onFavoritePress?: (id: string) => void;
}

export const PartnerShowcaseCard = memo(function PartnerShowcaseCard({
  partner,
  colors: colorsProp,
  onPress,
  onCarPress,
  onFavoritePress,
}: PartnerShowcaseCardProps) {
  const { colorScheme } = useTheme();
  const colors = colorsProp || Colors[colorScheme];
  const router = useRouter();
  const { applySearch, clearSearch, clearFilterParams, resetSort } = useSearch();

  const handleCarPress = useCallback(
    (id: string) => {
      onCarPress?.(id);
      router.push(`/listing/${id}` as any);
    },
    [onCarPress, router]
  );

  const handlePress = useCallback(() => {
    onPress?.(partner.id);
    clearSearch();
    clearFilterParams();
    resetSort();
    applySearch({ partnerId: partner.id, partnerName: partner.name });
    router.push('/browse' as any);
  }, [onPress, partner.id, partner.name, applySearch, clearSearch, clearFilterParams, resetSort, router]);

  const cardBg = partner.isBlk ? colors.oledBlack : colors.surfaceSecondary;
  const cardBorder = partner.isBlk ? colors.glassBorderOnDark : colors.border;
  const textColor = partner.isBlk ? colors.oledWhite : colors.text;
  const textSecondary = partner.isBlk ? 'rgba(255,255,255,0.6)' : colors.textTertiary;

  return (
    <View style={[styles.card, { backgroundColor: cardBg, borderColor: cardBorder }]}>
      {/* Header */}
      <View style={styles.header}>
        {partner.logo ? (
          <View style={[styles.avatar, { backgroundColor: colors.surface }]}>
            <Image
              source={{ uri: getThumbUrl(partner.logo) || partner.logo }}
              style={styles.avatarImage}
              contentFit="cover"
              transition={150}
            />
          </View>
        ) : (
          <View style={[styles.avatar, { backgroundColor: colors.surface }]}>
            <Heading size="mini" style={{ color: textColor }}>
              {partner.name.charAt(0).toUpperCase()}
            </Heading>
          </View>
        )}
        <View style={styles.headerInfo}>
          <View style={styles.nameRow}>
            <Heading size="mini" style={{ color: textColor }}>{partner.name}</Heading>
            {!partner.isBlk && partner.isVerified && (
              <CheckCircle2 size={Sizes.iconSm} color={colors.primary} />
            )}
            {partner.isBlk && (
              <View style={[styles.blkBadge, { backgroundColor: colors.blkBadgeBackground, borderColor: colors.blkBadgeBorder }]}>
                <Label size="badge" uppercase={false} style={{ color: colors.blkBadgeText }}>BLK</Label>
              </View>
            )}
          </View>
          {partner.rating && partner.reviewCount && (
            <Data size="small" style={{ color: textSecondary }}>
              {partner.rating} ★ ({formatReviews(partner.reviewCount)})
            </Data>
          )}
        </View>
      </View>

      {/* Products */}
      {partner.listings.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.productsScroll}>
          {partner.listings.slice(0, 4).map((listing) => (
            <ProductCard
              key={listing.id}
              listing={listing}
              colors={colors}
              onPress={handleCarPress}
              onFavorite={onFavoritePress}
            />
          ))}
        </ScrollView>
      ) : (
        <View style={styles.emptyProducts}>
          <Supporting size="small" style={{ color: colors.textMuted }}>No listings</Supporting>
        </View>
      )}

      {/* Footer */}
      <HapticPressable onPress={handlePress} style={styles.footer}>
        <Heading size="mini" style={{ color: textColor }}>Browse all</Heading>
        <View style={[styles.arrowBtn, { 
          backgroundColor: partner.isBlk ? GLASS_BG : colors.fill,
          ...(partner.isBlk && { borderColor: GLASS_BORDER, borderWidth: 1 })
        }]}>
          <ChevronRight size={Sizes.iconSm} color={partner.isBlk ? colors.oledWhite : colors.icon} strokeWidth={2} />
        </View>
      </HapticPressable>
    </View>
  );
});

// ============================================================================
// PARTNER GRID
// ============================================================================

interface PartnerGridProps {
  partners: PartnerDisplayData[];
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
  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.skeletonWrapper}>
          <Skeleton width={SCREEN_WIDTH - (Layout.screenPadding * 2)} height={280} borderRadius={Radius['2xl']} />
        </View>
      </View>
    );
  }

  if (!partners?.length) return null;

  return (
    <View style={styles.container}>
      {partners.map((partner) => (
        <PartnerShowcaseCard
          key={partner.id}
          partner={partner}
          onPress={onPartnerPress}
          onCarPress={onCarPress}
          onFavoritePress={onFavoritePress}
        />
      ))}
    </View>
  );
});

// ============================================================================
// HELPER: Convert API data to display format
// ============================================================================

export function partnerToDisplayData(partner: PartnerListItem, listings: ListingCard[]): PartnerDisplayData {
  return {
    id: partner.id,
    name: partner.brandName,
    logo: partner.logoUrl || partner.logo,
    rating: partner.googleRating || partner.platformRating,
    reviewCount: partner.googleReviewCount || partner.platformReviewCount,
    isVerified: partner.isVerified,
    isBlk: partner.badges?.includes('blk') || partner.tier === 'black',
    listings: listings.map(l => ({ id: l.id, price: l.price, thumbnail: l.thumbnail })),
  };
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    gap: Spacing.lg,
  },
  skeletonWrapper: {
    marginHorizontal: Layout.screenPadding,
  },
  card: {
    marginHorizontal: Layout.screenPadding,
    borderRadius: Radius['2xl'],
    borderWidth: 1,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.lg,
  },
  avatar: {
    width: Sizes.avatarMd,
    height: Sizes.avatarMd,
    borderRadius: Sizes.avatarMd / 2,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  headerInfo: {
    flex: 1,
    gap: Spacing.xs / 2,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  blkBadge: {
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: Radius.none,
    borderWidth: 1,
  },
  productsScroll: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
    gap: Spacing.md,
  },
  emptyProducts: {
    height: PRODUCT_WIDTH * PRODUCT_ASPECT,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: Spacing.lg,
  },
  product: {
    width: PRODUCT_WIDTH,
    aspectRatio: PRODUCT_ASPECT,
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
  favBtn: {
    position: 'absolute',
    bottom: Spacing.sm,
    right: Spacing.sm,
    width: Sizes.bubble,
    height: Sizes.bubble,
    borderRadius: Sizes.bubble / 2,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    paddingTop: Spacing.md,
  },
  arrowBtn: {
    width: Sizes.bubble,
    height: Sizes.bubble,
    borderRadius: Sizes.bubble / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
