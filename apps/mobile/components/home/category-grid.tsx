/**
 * Category Grid - Clean Category Cards
 * Each category wrapped in dark card with horizontal scrolling
 * RevvupLogo + "evvup X Category Name" signature branding
 * 
 * Now supports:
 * - API-driven data through props
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
import { ArrowRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';

import { Spacing, Radius, Sizes } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { HapticPressable, Heading, Supporting, Skeleton, SkeletonCircle } from '@/components/ui';
import { CarCardList } from '@/components/cards/car-card-list';

// ============================================================================
// CATEGORY CARD SKELETON
// ============================================================================

const CategoryCardSkeleton = memo(function CategoryCardSkeleton() {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.cardsContainer}
    >
      {[1, 2].map((i) => (
        <View key={i} style={styles.cardWrapper}>
          <View style={styles.skeletonCard}>
            <Skeleton width={120} height={90} borderRadius={Radius.lg} style={{ backgroundColor: '#1A1A1A' }} />
            <View style={styles.skeletonCardContent}>
              <Skeleton width="80%" height={14} style={{ backgroundColor: '#1A1A1A' }} />
              <Skeleton width="40%" height={12} style={{ backgroundColor: '#1A1A1A' }} />
              <Skeleton width="60%" height={12} style={{ backgroundColor: '#1A1A1A' }} />
            </View>
          </View>
        </View>
      ))}
    </ScrollView>
  );
});

// ============================================================================
// TYPES
// ============================================================================

/** Unified listing type compatible with both mock data and API */
export interface CategoryListingItem {
  id: string;
  make: string;
  model: string;
  year: number;
  trim?: string | null;
  price: number;
  mileage: number;
  emirate: string;
  specs?: string | null;
  thumbnail?: ImageSourcePropType | string | null;
  isBlkListing?: boolean;
}

/** Category data for a single card */
export interface CategoryData {
  id: string;
  name: string;
  slug?: string;
  listings: CategoryListingItem[];
}

// ============================================================================
// CONSTANTS
// ============================================================================

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const LIST_CARD_WIDTH = SCREEN_WIDTH * 0.85;

// ============================================================================
// CATEGORY CARD (Wrapped Section)
// ============================================================================

interface CategoryCardProps {
  /** Category ID for navigation */
  id: string;
  /** Category display name */
  name: string;
  /** Subtitle explaining the category */
  subtitle?: string;
  /** Listings to display */
  listings: CategoryListingItem[];
  /** Loading state */
  isLoading?: boolean;
  onCategoryPress?: (categoryId: string) => void;
  onCarPress?: (id: string) => void;
}

export const CategoryCard = memo(function CategoryCard({
  id,
  name,
  subtitle,
  listings,
  isLoading = false,
  onCategoryPress,
  onCarPress,
}: CategoryCardProps) {
  const { colors } = useTheme();
  const router = useRouter();

  const handleCategoryPress = useCallback(() => {
    onCategoryPress?.(id);
  }, [id, onCategoryPress]);

  const handleCarPress = useCallback((listingId: string) => {
    onCarPress?.(listingId);
    router.push(`/listing/${listingId}` as any);
  }, [onCarPress, router]);

  // Don't render if no listings and not loading
  if (!isLoading && listings.length === 0) {
    return null;
  }

  return (
    <View style={[styles.categoryCard, { borderColor: colors.glassBorderOnDark, backgroundColor: colors.oledBlack }]}>
      {/* Header - Category Name & Subtitle */}
      <View style={styles.header}>
        <Heading size="small" style={[styles.categoryTitle, { color: colors.oledWhite }]}>{name}</Heading>
        {subtitle && (
          <Supporting size="small" style={[styles.categorySubtitle, { color: colors.textTertiary }]}>{subtitle}</Supporting>
        )}
      </View>

      {/* Horizontal Scrolling Car Cards */}
      {isLoading ? (
        <CategoryCardSkeleton />
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.cardsContainer}
        >
          {listings.map((listing) => (
            <View key={listing.id} style={styles.cardWrapper}>
              <CarCardList
                id={listing.id}
                make={listing.make}
                model={listing.model}
                year={listing.year}
                trim={listing.trim}
                price={listing.price}
                mileage={listing.mileage}
                emirate={listing.emirate}
                specs={listing.specs}
                thumbnail={listing.thumbnail}
                isBlkListing={listing.isBlkListing}
                showSuperlike={false}
                showShare={false}
                onPress={handleCarPress}
              />
            </View>
          ))}
        </ScrollView>
      )}

      {/* CTA Footer */}
      <HapticPressable onPress={handleCategoryPress} style={styles.footer}>
        <Heading size="small" style={[styles.browseText, { color: colors.oledWhite }]}>Browse all</Heading>
        <View style={[styles.arrowCircle, { backgroundColor: colors.glassBackground, borderColor: colors.glassBorderOnDark }]}>
          <ArrowRight size={Sizes.iconSm} color={colors.oledWhite} strokeWidth={2.5} />
        </View>
      </HapticPressable>
    </View>
  );
});

// ============================================================================
// CATEGORY GRID - Multiple Categories
// ============================================================================

interface CategoryGridProps {
  /** Categories to display - from API */
  categories?: CategoryData[];
  /** Loading state */
  isLoading?: boolean;
  onCategoryPress?: (categoryId: string) => void;
  onCarPress?: (id: string) => void;
}

export const CategoryGrid = memo(function CategoryGrid({
  categories = [],
  isLoading = false,
  onCategoryPress,
  onCarPress,
}: CategoryGridProps) {
  const { colors } = useTheme();
  
  // Loading state with no data
  if (isLoading && categories.length === 0) {
    return (
      <View style={styles.container}>
        <View style={[styles.categoryCard, { borderColor: colors.glassBorderOnDark, backgroundColor: colors.oledBlack }]}>
          <View style={styles.header}>
            <Skeleton width="50%" height={20} style={{ backgroundColor: '#1A1A1A' }} />
            <Skeleton width="70%" height={14} style={{ marginTop: Spacing.xs, backgroundColor: '#1A1A1A' }} />
          </View>
          <CategoryCardSkeleton />
          <View style={styles.footer}>
            <Skeleton width="30%" height={16} style={{ backgroundColor: '#1A1A1A' }} />
            <SkeletonCircle size={Sizes.bubble} />
          </View>
        </View>
      </View>
    );
  }

  // No categories
  if (categories.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {categories.map((category) => (
        <CategoryCard
          key={category.id}
          id={category.id}
          name={category.name}
          listings={category.listings}
          onCategoryPress={onCategoryPress}
          onCarPress={onCarPress}
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
    gap: Spacing.lg,
  },
  categoryCard: {
    marginHorizontal: Spacing.sm,
    borderRadius: Radius['2xl'],
    overflow: 'hidden',
    paddingBottom: Spacing['2xl'],
    borderWidth: 1,
  },
  header: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing['2xl'],
    paddingBottom: Spacing.xl,
  },
  categoryTitle: {
    letterSpacing: -0.3,
  },
  categorySubtitle: {
    marginTop: Spacing.xs,
  },
  cardsContainer: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  cardWrapper: {
    width: LIST_CARD_WIDTH,
  },
  skeletonCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: Radius['2xl'],
    borderWidth: 1,
    borderColor: '#1A1A1A',
    backgroundColor: '#0A0A0A',
    padding: Spacing.lg,
    gap: Spacing.xl,
  },
  skeletonCardContent: {
    flex: 1,
    gap: Spacing.sm,
    paddingTop: Spacing.xs,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
  },
  browseText: {
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
