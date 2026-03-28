/**
 * BLK Grid Card — archived home section
 */

import React, { memo, useCallback } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { Colors, Spacing, Radius, Sizes, Layout } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { useSearch } from '@/context/search-context';
import { getAppListingImageUrls } from '@/lib/config';
import { HapticPressable, Heading, Supporting, Skeleton, FavoriteButton, Label, Price } from '@/components/ui';

export interface BlkListingItem {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  thumbnail?: string | null;
}

const PRODUCT_WIDTH = Sizes.cardThumbnailWidth + Sizes.bubble + Spacing['3xl'] + Spacing.md;
const PRODUCT_IMAGE_HEIGHT = Sizes.cardThumbnailHeight;
const BLURHASH = 'L6PZfSi_.AyE_3t7t7R**0o#DgR4';

const formatPrice = (n: number) => {
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${Math.round(n / 1e3)}K`;
  return n.toString();
};

interface ProductItemProps {
  listing: BlkListingItem;
  colors: typeof Colors.light;
  onPress: (id: string) => void;
  onFavorite?: (id: string) => void;
}

const ProductItem = memo(function ProductItem({ listing, colors, onPress, onFavorite }: ProductItemProps) {
  const { thumb, full } = getAppListingImageUrls(listing.thumbnail);
  const title = `${listing.make} ${listing.model}`.trim();

  return (
    <HapticPressable
      onPress={() => onPress(listing.id)}
      style={[styles.product, { backgroundColor: colors.backgroundSecondary }]}
    >
      <View style={[styles.productImageShell, { backgroundColor: colors.surface }]}> 
        <Image
          source={thumb ? [{ uri: thumb }, ...(full && full !== thumb ? [{ uri: full }] : [])] : full ? { uri: full } : undefined}
          style={styles.productImage}
          contentFit="cover"
          placeholder={{ blurhash: BLURHASH }}
          transition={150}
        />
        <View style={[styles.badge, { backgroundColor: colors.blkBadgeBg, borderColor: colors.blkBadgeBorder }]}>
          <Label size="caption" uppercase={false} style={{ color: colors.blkBadgeFg }}>BLK</Label>
        </View>
      </View>

      <View style={styles.productInfo}>
        <Heading size="subheading" numberOfLines={1}>{title}</Heading>
        {listing.year ? <Supporting size="caption" numberOfLines={1}>{listing.year}</Supporting> : null}

        <View style={styles.productFooter}>
          <Price>AED {formatPrice(listing.price)}</Price>
          <FavoriteButton
            listingId={listing.id}
            size={Sizes.iconSm}
            onPress={onFavorite}
            isBlkListing={true}
          />
        </View>
      </View>
    </HapticPressable>
  );
});

const LoadingSkeleton = memo(function LoadingSkeleton() {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} width={PRODUCT_WIDTH} height={PRODUCT_IMAGE_HEIGHT + Spacing['5xl']} borderRadius={Radius.xl} />
      ))}
    </ScrollView>
  );
});

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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.blkDot, { backgroundColor: colors.label }]} />
          <Heading size="subheading">BLK Collection</Heading>
        </View>
        <HapticPressable onPress={handleShopAll} style={styles.viewAll}>
          <Supporting size="bodySm" style={{ color: colors.primary }}>View all</Supporting>
          <Ionicons name="chevron-forward" size={Sizes.iconXs} color={colors.primary} />
        </HapticPressable>
      </View>

      {isLoading ? (
        <LoadingSkeleton />
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
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
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    gap: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Layout.screenPadding,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  blkDot: {
    width: Spacing.sm,
    height: Spacing.sm,
    borderRadius: Radius.full,
  },
  viewAll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  scroll: {
    paddingHorizontal: Layout.screenPadding,
    gap: Spacing.md,
  },
  product: {
    width: PRODUCT_WIDTH,
    borderRadius: Radius.xl,
    borderCurve: 'continuous',
    overflow: 'hidden',
  },
  productImageShell: {
    height: PRODUCT_IMAGE_HEIGHT,
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  badge: {
    position: 'absolute',
    top: Spacing.sm,
    left: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs / 2,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  productInfo: {
    padding: Spacing.md,
    paddingTop: Spacing.sm,
    gap: Spacing.sm,
  },
  productFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
  },
});
