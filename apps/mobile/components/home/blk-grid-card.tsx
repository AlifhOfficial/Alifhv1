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
  Text,
  ImageSourcePropType,
} from 'react-native';
import { Image, ImageSource } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowRight, Heart } from 'lucide-react-native';
import { useRouter } from 'expo-router';

import { Colors, Spacing, Radius, Typography, Sizes } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { HapticPressable, Body, Heading } from '@/components/ui';
import { RevvupLogo } from '@/components/ui/loaders';
import { blkSignatureListings, type CarListing } from './mock-data';
import { BlkDoodle } from './blk-doodle';

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
    return millions % 1 === 0 ? `${millions}M` : `${millions.toFixed(1)}M`;
  }
  if (amount >= 1000) {
    const thousands = amount / 1000;
    return thousands % 1 === 0 ? `${thousands}K` : `${thousands.toFixed(0)}K`;
  }
  return amount.toString();
}

// ============================================================================
// UTILITIES
// ============================================================================

/** Convert image source to expo-image compatible format */
function toImageSource(source: ImageSourcePropType | string | undefined): ImageSource | undefined {
  if (!source) return undefined;
  return typeof source === 'string' ? { uri: source } : source;
}

// ============================================================================
// MINI CAR CARD
// ============================================================================

interface MiniCarCardProps {
  listing: CarListing;
  onPress?: (id: string) => void;
  onFavoritePress?: (id: string) => void;
}

const MiniCarCard = memo(function MiniCarCard({
  listing,
  onPress,
  onFavoritePress,
}: MiniCarCardProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];

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
        <View style={styles.priceBadge}>
          <Text style={styles.priceText}>
            {formatCompactPrice(listing.price)}
          </Text>
        </View>
        {/* Favorite Button - Glass bubble */}
        <HapticPressable
          onPress={handleFavoritePress}
          style={[styles.favoriteButton, { borderColor: colors.glassBorderOnDark }]}
        >
          <Heart size={Sizes.iconSm} color="#FAFAFA" strokeWidth={2} />
        </HapticPressable>
      </View>
      {/* Car Title Below Image */}
      <View style={styles.miniCardInfo}>
        <Body size="medium" style={styles.carModel} numberOfLines={1}>
          {listing.make} {listing.model}
        </Body>
        <Body size="small" style={styles.carYear} numberOfLines={1}>
          {listing.year}
        </Body>
      </View>
    </HapticPressable>
  );
});

// ============================================================================
// BLK GRID CARD COMPONENT
// ============================================================================

interface BlkGridCardProps {
  onShopAllPress?: () => void;
  onCarPress?: (id: string) => void;
  onFavoritePress?: (id: string) => void;
}

export const BlkGridCard = memo(function BlkGridCard({
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

  return (
    <View style={[styles.container, { borderColor: colors.glassBorderOnDark }]}>
      {/* Dark Background - Pure black like category-grid */}
      <LinearGradient
        colors={['#000000', '#0A0A0A', '#000000']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* BLK Doodle Pattern - Luxury monogram style */}
      <BlkDoodle opacity={1} />

      {/* Header with Revvup Logo & BLK Badge */}
      <View style={styles.header}>
        <View style={styles.brandRow}>
          {/* Revvup Logo */}
          <View style={styles.logoContainer}>
            <RevvupLogo size={32} color="#FAFAFA" />
          </View>
          {/* BLK Badge - Bold & Unapologetic */}
          <Text style={styles.blkText}>BLK</Text>
        </View>
      </View>

      {/* Signature Line - Elegant cursive feel */}
      <View style={styles.signatureRow}>
        <Text style={styles.signatureText}>signature line</Text>
      </View>

      {/* Car Cards Scroll with negative space */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.cardsContainer}
        style={styles.cardsScroll}
      >
        {blkSignatureListings.map((listing) => (
          <MiniCarCard
            key={listing.id}
            listing={listing}
            onPress={handleCarPress}
            onFavoritePress={onFavoritePress}
          />
        ))}
      </ScrollView>

      {/* Shop All Footer */}
      <HapticPressable onPress={handleShopAllPress} style={styles.footer}>
        <Heading size="small" style={styles.shopAllText}>
          Shop all
        </Heading>
        <View style={styles.arrowCircle}>
          <ArrowRight size={Sizes.iconSm} color="#0D0D0D" strokeWidth={2.5} />
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
    ...Typography.blkBadge,
    color: '#FAFAFA',
  },
  signatureRow: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
    zIndex: 10,
  },
  signatureText: {
    ...Typography.blkSignature,
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
  },
  priceText: {
    ...Typography.dataMedium,
    color: '#FAFAFA',
  },
  favoriteButton: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    width: Sizes.bubble,
    height: Sizes.bubble,
    borderRadius: Sizes.bubble / 2,
    backgroundColor: 'rgba(0,0,0,0.5)',
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
    backgroundColor: '#FAFAFA',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
