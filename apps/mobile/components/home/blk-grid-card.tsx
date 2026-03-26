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
import { getAppThumbUrl } from '@/lib/config';
import { HapticPressable, Heading, Supporting, Skeleton, FavoriteButton } from '@/components/ui';

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

const PRODUCT_WIDTH = 280;
const PRODUCT_HEIGHT = 320;
const IMAGE_WIDTH = 220;
const IMAGE_HEIGHT = 160;
const BLURHASH = 'L6PZfSi_.AyE_3t7t7R**0o#DgR4';

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
  const imageUri = getAppThumbUrl(listing.thumbnail);

  return (
    <HapticPressable onPress={() => onPress(listing.id)} style={[styles.product, { backgroundColor: colors.surface }]}>
      {/* Car Name & Price - Top Left */}
      <View style={styles.textContainer}>
        <Heading size="card" style={{ color: colors.text }}>
          {listing.make} {listing.model}
        </Heading>
        <Heading size="large" style={{ color: colors.primary }}>
          AED {formatPrice(listing.price)}
        </Heading>
      </View>
      
      {/* Car Image */}
      <View style={styles.imageContainer}>
        <Image
          source={imageUri ? { uri: imageUri } : undefined}
          style={styles.image}
          contentFit="cover"
          placeholder={{ blurhash: BLURHASH }}
          transition={150}
        />
        {/* Heart - Overlapping thumbnail */}
        <View style={[styles.favBtn, { backgroundColor: colors.glassBg, borderColor: colors.glassBorder }]}>
          <FavoriteButton
            listingId={listing.id}
            size={Sizes.iconSm}
            onPress={onFavorite}
            isBlkListing={true}
            inactiveColor={colors.icon}
          />
        </View>
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
          height={PRODUCT_HEIGHT} 
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
  const { clearSearch, clearFilterParams, updateFilterParams, applySort } = useSearch();

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
    applySort('relevance');
    updateFilterParams({ isBlkListing: true });
    router.push('/browse' as any);
  }, [onShopAllPress, clearSearch, clearFilterParams, updateFilterParams, applySort, router]);

  if (!isLoading && !listings.length) return null;

  // BLK collection uses theme-aware colors
  const cardBg = colors.blkBg;
  const textColor = colors.blkText;
  const textSecondary = colors.blkText2;

  return (
    <View style={[styles.container, { backgroundColor: cardBg }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.avatar, { backgroundColor: colors.blkBadgeBg, borderColor: colors.blkBadgeBorder, borderWidth: 1 }]}>
          <Heading size="mini" style={{ color: colors.blkBadgeFg }}>BLK</Heading>
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
        <Heading size="mini" style={{ color: textColor }}>View collection</Heading>
        <View style={[styles.arrowBtn, { backgroundColor: colors.blkBadgeBg, borderColor: colors.blkBadgeBorder, borderWidth: 1 }]}>
          <ChevronRight size={Sizes.iconSm} color={colors.blkBadgeFg} strokeWidth={2} />
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
    height: PRODUCT_HEIGHT,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  textContainer: {
    alignItems: 'flex-start',
    gap: Spacing.xs,
  },
  imageContainer: {
    flex: 1,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Spacing.xl,
  },
  image: {
    width: IMAGE_WIDTH,
    height: IMAGE_HEIGHT,
    borderRadius: Radius.lg,
  },
  favBtn: {
    position: 'absolute',
    top: Spacing.xl + Spacing.sm,
    right: Spacing.lg,
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
