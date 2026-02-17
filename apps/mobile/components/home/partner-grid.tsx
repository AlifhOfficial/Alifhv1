/**
 * Partner Grid - Partner-Specific Inventory
 * Clean dark card with white product thumbnails
 * Vertical layout - partner cards stacked below each other
 */

import React, { memo, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
  Text,
  ImageSourcePropType,
} from 'react-native';
import { Image, ImageSource } from 'expo-image';
import { ArrowRight, Heart } from 'lucide-react-native';
import { useRouter } from 'expo-router';

import { Spacing, Radius, Typography, Fonts, Sizes, Colors } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { HapticPressable, Heading } from '@/components/ui';
import { partners, type Partner, type CarListing } from './mock-data';

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

/** Convert image source to expo-image compatible format */
function toImageSource(source: ImageSourcePropType | string | undefined): ImageSource | undefined {
  if (!source) return undefined;
  return typeof source === 'string' ? { uri: source } : source;
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
  listing: CarListing;
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
    <HapticPressable onPress={handlePress} style={styles.productCard}>
      {/* White background product image */}
      <Image
        source={toImageSource(listing.thumbnail)}
        style={styles.productImage}
        contentFit="cover"
        placeholder={IMAGE_BLURHASH}
        transition={200}
      />
      {/* Price Badge - Top Left */}
      <View style={styles.priceBadge}>
        <Text style={styles.priceText}>{formatCompactPrice(listing.price)}</Text>
      </View>
      {/* Favorite Button - Bottom Right */}
      <HapticPressable onPress={handleFavoritePress} style={[styles.favoriteButton, { borderColor: colors.glassBorderOnDark }]}>
        <Heart size={Sizes.iconSm} color="#FFFFFF" strokeWidth={2} />
      </HapticPressable>
    </HapticPressable>
  );
});

// ============================================================================
// PARTNER SHOWCASE CARD
// ============================================================================

interface PartnerShowcaseCardProps {
  partner: Partner;
  onShopAllPress?: (partnerId: string) => void;
  onCarPress?: (id: string) => void;
  onFavoritePress?: (id: string) => void;
}

const PartnerShowcaseCard = memo(function PartnerShowcaseCard({
  partner,
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
    <View style={[styles.partnerCard, { borderColor: colors.glassBorderOnDark }]}>
      {/* Header - Logo, Name & Rating */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Image
            source={toImageSource(partner.logo)}
            style={styles.logo}
            contentFit="cover"
            placeholder={IMAGE_BLURHASH}
          />
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.partnerName}>{partner.name}</Text>
          <Text style={styles.ratingText}>
            {partner.rating} ★ ({formatReviewCount(partner.reviewCount)})
          </Text>
        </View>
      </View>

      {/* Signature Line */}
      <View style={styles.signatureRow}>
        <Text style={styles.signatureText}>partner inventory</Text>
      </View>

      {/* Product Thumbnails - Horizontal Scroll */}
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

      {/* Browse All Footer */}
      <HapticPressable onPress={handleShopAllPress} style={styles.footer}>
        <Heading size="small" style={styles.browseAllText}>Browse all</Heading>
        <View style={styles.arrowCircle}>
          <ArrowRight size={Sizes.iconSm} color="#000000" strokeWidth={2.5} />
        </View>
      </HapticPressable>
    </View>
  );
});

// ============================================================================
// PARTNER GRID COMPONENT
// ============================================================================

interface PartnerGridProps {
  onPartnerPress?: (partnerId: string) => void;
  onCarPress?: (id: string) => void;
  onFavoritePress?: (id: string) => void;
  limit?: number;
  offset?: number;
}

export const PartnerGrid = memo(function PartnerGrid({
  onPartnerPress,
  onCarPress,
  onFavoritePress,
  limit,
  offset = 0,
}: PartnerGridProps) {
  const start = offset % partners.length;
  const displayPartners = limit ? partners.slice(start, start + limit) : partners;
  return (
    <View style={styles.container}>
      {displayPartners.map((partner) => (
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
    backgroundColor: '#2A2A2A',
    paddingBottom: Spacing['2xl'],
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing['2xl'],
    paddingBottom: Spacing.sm,
  },
  logoContainer: {
    width: 44,
    height: 44,
    borderRadius: Radius.full,
    overflow: 'hidden',
    backgroundColor: '#3A3A3A',
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  headerInfo: {
    flex: 1,
    gap: 2,
  },
  partnerName: {
    fontFamily: Fonts.bold,
    fontSize: 20,
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  ratingText: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
  },
  signatureRow: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
  signatureText: {
    ...Typography.blkSignature,
    color: 'rgba(255,255,255,0.5)',
  },
  productsContainer: {
    paddingHorizontal: Spacing.xl,
    gap: Spacing.md,
  },
  productCard: {
    width: PRODUCT_CARD_WIDTH,
    height: PRODUCT_CARD_HEIGHT,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  priceBadge: {
    position: 'absolute',
    top: Spacing.sm,
    left: Spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.md,
  },
  priceText: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    color: '#FFFFFF',
  },
  favoriteButton: {
    position: 'absolute',
    bottom: Spacing.sm,
    right: Spacing.sm,
    width: Sizes.bubble,
    height: Sizes.bubble,
    borderRadius: Sizes.bubble / 2,
    backgroundColor: 'rgba(0,0,0,0.5)',
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
    color: '#FFFFFF',
  },
  arrowCircle: {
    width: Sizes.bubble,
    height: Sizes.bubble,
    borderRadius: Sizes.bubble / 2,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
