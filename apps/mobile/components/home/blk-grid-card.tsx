/**
 * BLK Grid Card - Premium Collection
 * Large container card with small product images inside
 */

import React, { memo, useCallback } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Image } from 'expo-image';
import { ChevronRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';

import { Colors, Spacing, Radius, Sizes, Layout } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { useSearch } from '@/context/search-context';
import { getThumbUrl } from '@/lib/config';
import { HapticPressable, Heading, Supporting, Skeleton, Data, FavoriteButton } from '@/components/ui';

// ============================================================================
// TYPES
// ============================================================================

export interface BlkListingItem {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  thumbnail?: string | null;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const PRODUCT_WIDTH = 220;
const IMAGE_ASPECT = 5 / 4;
const BLURHASH = 'L6PZfSi_.AyE_3t7t7R**0o#DgR4';

// Dark glass constants (forced dark mode for visibility on white backgrounds)
const BLK_GLASS_BACKGROUND = '#0D0D0D';
const BLK_GLASS_BORDER = 'rgba(255,255,255,0.14)';

const formatPrice = (n: number) => {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${Math.round(n / 1000)}K`;
  return n.toString();
};

// ============================================================================
// PRODUCT ITEM
// ============================================================================

interface ProductItemProps {
  listing: BlkListingItem;
  colors: typeof Colors.light;
  onPress: (id: string) => void;
  onFavorite?: (id: string) => void;
}

const ProductItem = memo(function ProductItem({ listing, colors, onPress, onFavorite }: ProductItemProps) {
  const imageUri = getThumbUrl(listing.thumbnail) || listing.thumbnail;

  return (
    <HapticPressable onPress={() => onPress(listing.id)} style={[styles.product, { backgroundColor: colors.oledWhite }]}>
      <Image
        source={imageUri ? { uri: imageUri } : undefined}
        style={styles.image}
        contentFit="cover"
        placeholder={{ blurhash: BLURHASH }}
        transition={150}
      />
      {/* Price Badge - Top Left */}
      <View style={[styles.priceBadge, { backgroundColor: BLK_GLASS_BACKGROUND, borderColor: BLK_GLASS_BORDER }]}>
        <Data size="mini" style={{ color: colors.oledWhite }}>
          AED {formatPrice(listing.price)}
        </Data>
      </View>
      {/* Favorite Button - Bottom Right (connected to API) */}
      <View style={[styles.favBtn, { backgroundColor: BLK_GLASS_BACKGROUND, borderColor: BLK_GLASS_BORDER }]}>
        <FavoriteButton
          listingId={listing.id}
          size={Sizes.iconSm}
          onPress={onFavorite}
          isBlkListing={true}
          inactiveColor={colors.oledWhite}
        />
      </View>
    </HapticPressable>
  );
});

// ============================================================================
// SKELETON
// ============================================================================

const LoadingSkeleton = memo(function LoadingSkeleton({ colors }: { colors: typeof Colors.light }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.productScroll}>
      {[1, 2, 3].map((i) => (
        <Skeleton 
          key={i} 
          width={PRODUCT_WIDTH} 
          height={PRODUCT_WIDTH / IMAGE_ASPECT} 
          borderRadius={Radius.xl} 
        />
      ))}
    </ScrollView>
  );
});

// ============================================================================
// MAIN COMPONENT
// ============================================================================

interface BlkGridCardProps {
  listings?: BlkListingItem[];
  isLoading?: boolean;
  onCarPress?: (id: string) => void;
  onFavoritePress?: (id: string) => void;
  onShopAllPress?: () => void;
}

export const BlkGridCard = memo(function BlkGridCard({
  listings = [],
  isLoading = false,
  onCarPress,
  onFavoritePress,
  onShopAllPress,
}: BlkGridCardProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const router = useRouter();
  const { clearSearch, clearFilterParams, updateFilterParams, resetSort } = useSearch();

  const handleCarPress = useCallback(
    (id: string) => {
      onCarPress?.(id);
      router.push(`/listing/${id}` as any);
    },
    [onCarPress, router]
  );

  const handleShopAll = useCallback(() => {
    onShopAllPress?.();
    clearSearch();
    clearFilterParams();
    resetSort();
    updateFilterParams({ isBlkListing: true });
    router.push('/browse' as any);
  }, [onShopAllPress, clearSearch, clearFilterParams, updateFilterParams, resetSort, router]);

  if (!isLoading && !listings.length) return null;

  // BLK collection always uses dark theme
  const cardBg = colors.oledBlack;
  const cardBorder = colors.glassBorderOnDark;
  const textColor = colors.oledWhite;
  const textSecondary = 'rgba(255,255,255,0.6)';

  return (
    <View style={[styles.container, { backgroundColor: cardBg, borderColor: cardBorder }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.avatar, { backgroundColor: BLK_GLASS_BACKGROUND, borderColor: BLK_GLASS_BORDER, borderWidth: 1 }]}>
          <Heading size="mini" style={{ color: colors.oledWhite }}>BLK</Heading>
        </View>
        <View style={styles.headerText}>
          <Heading size="mini" style={{ color: textColor }}>BLK Collection</Heading>
          <Supporting size="small" style={{ color: textSecondary }}>Premium Cars</Supporting>
        </View>
      </View>

      {/* Products */}
      {isLoading ? (
        <LoadingSkeleton colors={colors} />
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.productScroll}>
          {listings.map((listing) => (
            <ProductItem
              key={listing.id}
              listing={listing}
              colors={colors}
              onPress={handleCarPress}
              onFavorite={onFavoritePress}
            />
          ))}
        </ScrollView>
      )}

      {/* Footer */}
      <HapticPressable onPress={handleShopAll} style={styles.footer}>
        <Heading size="mini" style={{ color: textColor }}>Shop all</Heading>
        <View style={[styles.arrowBtn, { backgroundColor: BLK_GLASS_BACKGROUND, borderColor: BLK_GLASS_BORDER, borderWidth: 1 }]}>
          <ChevronRight size={Sizes.iconSm} color={colors.oledWhite} strokeWidth={2} />
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
  },
  headerText: {
    flex: 1,
  },
  productScroll: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
    gap: Spacing.lg,
  },
  product: {
    width: PRODUCT_WIDTH,
    aspectRatio: IMAGE_ASPECT,
    borderRadius: Radius.xl,
    overflow: 'hidden',
  },
  image: {
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
    alignItems: 'center',
    justifyContent: 'space-between',
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
