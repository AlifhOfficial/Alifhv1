/**
 * Partner Grid - Partner Showcase
 * Clean container cards with product thumbnails
 */

import React, { memo, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { ChevronRight, CheckCircle2 } from 'lucide-react-native';
import { useRouter } from 'expo-router';

import { Colors, Spacing, Radius, Sizes, Layout } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { useSearch } from '@/context/search-context';
import { getAppListingImageUrls, getAppThumbUrl } from '@/lib/config';
import { HapticPressable, Heading, Data, Supporting, Skeleton, Label, FavoriteButton, Price } from '@/components/ui';
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
  make: string;
  model: string;
  year?: number | null;
  price: number;
  thumbnail?: string | null;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PRODUCT_WIDTH = Sizes.cardThumbnailWidth + Sizes.bubble + Spacing['3xl'] + Spacing.md;
const PRODUCT_MIN_HEIGHT = Sizes.cardThumbnailHeight + Sizes.bubble + Spacing.lg;
const PRODUCT_IMAGE_HEIGHT = Sizes.cardThumbnailHeight;
const BLURHASH = 'L6PZfSi_.AyE_3t7t7R**0o#DgR4';

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
  isBlkPartner?: boolean;
}

const ProductCard = memo(function ProductCard({ listing, colors, onPress, onFavorite, isBlkPartner }: ProductCardProps) {
  const { thumb, full } = getAppListingImageUrls(listing.thumbnail);
  const metaBorder = isBlkPartner ? colors.blkBorder : colors.border;
  const actionBackground = isBlkPartner ? colors.blkBadgeBackground : colors.fillSecondary;
  const actionBorder = isBlkPartner ? colors.blkBadgeBorder : colors.border;
  const actionColor = isBlkPartner ? colors.blkBadgeText : colors.icon;
  const metaColor = isBlkPartner ? colors.blkTextSecondary : colors.textSecondary;
  const title = `${listing.make} ${listing.model}`.trim();

  return (
    <HapticPressable
      onPress={() => onPress(listing.id)}
      style={[styles.product, { backgroundColor: colors.surface, borderColor: metaBorder }]}
    >
      <View style={[styles.productImageShell, { backgroundColor: colors.surfaceSecondary, borderColor: metaBorder }]}>
        <Image
          source={thumb ? [{ uri: thumb }, ...(full && full !== thumb ? [{ uri: full }] : [])] : full ? { uri: full } : undefined}
          style={styles.productImage}
          contentFit="cover"
          placeholder={{ blurhash: BLURHASH }}
          transition={150}
        />
        {isBlkPartner && (
          <View style={[styles.priceBadge, { backgroundColor: colors.blkBadgeBackground, borderColor: colors.blkBadgeBorder }]}>
            <Label size="badge" uppercase={false} style={{ color: colors.blkBadgeText }}>BLK</Label>
          </View>
        )}
      </View>

      <View style={styles.productContent}>
        <View style={styles.productText}>
          <Heading size="mini" style={{ color: colors.text }} numberOfLines={2}>
            {title}
          </Heading>
          {listing.year ? (
            <Supporting size="mini" style={{ color: metaColor }} numberOfLines={1}>
              {listing.year}
            </Supporting>
          ) : null}
        </View>

        <View style={styles.productFooter}>
          <Price size="mini">
            AED {formatPrice(listing.price)}
          </Price>
          <View style={[styles.favBtn, { backgroundColor: actionBackground, borderColor: actionBorder }]}>
            <FavoriteButton
              listingId={listing.id}
              size={Sizes.iconSm}
              onPress={onFavorite}
              isBlkListing={isBlkPartner}
              inactiveColor={actionColor}
            />
          </View>
        </View>
      </View>
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

  const cardBg = colors.blkBackground;
  const textColor = colors.blkText;
  const textSecondary = colors.blkTextSecondary;
  const avatarBg = colors.surface;
  const avatarTextColor = textColor;

  return (
    <View style={[styles.card, { backgroundColor: cardBg }]}>
      {/* Header */}
      <View style={styles.header}>
        {partner.logo ? (
          <View style={[styles.avatar, { backgroundColor: avatarBg }]}>
            <Image
              source={{ uri: getAppThumbUrl(partner.logo) || partner.logo }}
              style={styles.avatarImage}
              contentFit="cover"
              transition={150}
            />
          </View>
        ) : (
          <View style={[styles.avatar, { backgroundColor: avatarBg }]}>
            <Heading size="mini" style={{ color: avatarTextColor }}>
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
              isBlkPartner={partner.isBlk}
            />
          ))}
        </ScrollView>
      ) : (
        <View style={styles.emptyProducts}>
          <Supporting size="small" style={{ color: textSecondary }}>No listings</Supporting>
        </View>
      )}

      {/* Footer */}
      <HapticPressable onPress={handlePress} style={styles.footer}>
        <Heading size="mini" style={{ color: textColor }}>Browse all</Heading>
        <View
          style={[
            styles.arrowBtn,
            {
              backgroundColor: colors.blkBadgeBackground,
              borderColor: colors.blkBadgeBorder,
              borderWidth: 1,
            },
          ]}
        >
          <ChevronRight
            size={Sizes.iconSm}
            color={colors.blkBadgeText}
            strokeWidth={2}
          />
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
    listings: listings.map(l => ({
      id: l.id,
      make: l.make,
      model: l.model,
      year: l.year,
      price: l.price,
      thumbnail: l.thumbnail,
    })),
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
    minHeight: PRODUCT_MIN_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: Spacing.lg,
  },
  product: {
    width: PRODUCT_WIDTH,
    minHeight: PRODUCT_MIN_HEIGHT,
    borderRadius: Radius.xl,
    borderWidth: 1,
    overflow: 'hidden',
  },
  productImageShell: {
    height: PRODUCT_IMAGE_HEIGHT,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    borderBottomLeftRadius: Radius.lg,
    borderBottomRightRadius: Radius.lg,
    borderBottomWidth: 1,
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  productContent: {
    flex: 1,
    justifyContent: 'space-between',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
  },
  productText: {
    gap: 2,
  },
  productFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
