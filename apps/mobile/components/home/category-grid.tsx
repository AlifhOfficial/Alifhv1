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
import { useSearch } from '@/context/search-context';
import { HapticPressable, Heading, Supporting, Skeleton, SkeletonCircle } from '@/components/ui';
import { CarCardList } from '@/components/cards/car-card-list';
import type { SearchParams as GridSearchParams } from '@/lib/search-api';

// ============================================================================
// CATEGORY CARD SKELETON
// ============================================================================

const CategoryCardSkeleton = memo(function CategoryCardSkeleton() {
  const { colors } = useTheme();
  
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.cardsContainer}
    >
      {[1, 2].map((i) => (
        <View key={i} style={styles.cardWrapper}>
          <View style={[styles.skeletonCard, { borderColor: colors.border, backgroundColor: colors.surfaceSecondary }]}>
            <Skeleton width={120} height={90} borderRadius={Radius.lg} />
            <View style={styles.skeletonCardContent}>
              <Skeleton width="80%" height={14} />
              <Skeleton width="40%" height={12} />
              <Skeleton width="60%" height={12} />
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
  /** Search params from grid config for "Browse all" navigation */
  searchParams?: GridSearchParams;
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
  searchParams,
  listings,
  isLoading = false,
  onCategoryPress,
  onCarPress,
}: CategoryCardProps) {
  const { colors } = useTheme();
  const router = useRouter();
  const { applySearch, clearSearch, clearFilterParams, updateFilterParams, resetSort } = useSearch();

  const handleCategoryPress = useCallback(() => {
    onCategoryPress?.(id);
    
    // Clear ALL existing state first (search, filters, sort)
    clearSearch();
    clearFilterParams();
    resetSort();
    
    // Apply search params from grid config
    if (searchParams) {
      // Extract filter params vs search params
      // Note: sortBy, limit, page are internal params not used for browse navigation
      const { make, model, sortBy, limit, page, ...filterParams } = searchParams;
      
      // Apply make/model to search context
      if (make) {
        const makeArray = Array.isArray(make) ? make : [make];
        applySearch({ make: makeArray });
      }
      if (model) {
        const modelArray = Array.isArray(model) ? model : [model];
        applySearch({ model: modelArray });
      }
      
      // Apply filter params (bodyType, fuelType, priceMin, priceMax, specs, etc.)
      const mappedFilters: Record<string, unknown> = {};
      
      if (filterParams.bodyType) {
        mappedFilters.bodyType = Array.isArray(filterParams.bodyType) 
          ? filterParams.bodyType 
          : [filterParams.bodyType];
      }
      if (filterParams.fuelType) {
        mappedFilters.fuelType = Array.isArray(filterParams.fuelType)
          ? filterParams.fuelType
          : [filterParams.fuelType];
      }
      if (filterParams.specs) {
        mappedFilters.specs = Array.isArray(filterParams.specs)
          ? filterParams.specs
          : [filterParams.specs];
      }
      if (filterParams.priceMin !== undefined) {
        mappedFilters.priceMin = filterParams.priceMin;
      }
      if (filterParams.priceMax !== undefined) {
        mappedFilters.priceMax = filterParams.priceMax;
      }
      if (filterParams.condition) {
        mappedFilters.condition = filterParams.condition;
      }
      if (filterParams.isBlkListing !== undefined) {
        mappedFilters.isBlkListing = filterParams.isBlkListing;
      }
      if (filterParams.isBlackTierPartner !== undefined) {
        mappedFilters.isBlackTierPartner = filterParams.isBlackTierPartner;
      }
      
      if (Object.keys(mappedFilters).length > 0) {
        updateFilterParams(mappedFilters);
      }
    }
    
    // Navigate to browse screen
    router.push('/browse' as any);
  }, [id, searchParams, onCategoryPress, applySearch, clearSearch, clearFilterParams, updateFilterParams, resetSort, router]);

  const handleCarPress = useCallback((listingId: string) => {
    onCarPress?.(listingId);
    router.push(`/listing/${listingId}` as any);
  }, [onCarPress, router]);

  // Don't render if no listings and not loading
  if (!isLoading && listings.length === 0) {
    return null;
  }

  return (
    <View style={[styles.categoryCard, { borderColor: colors.border, backgroundColor: colors.surface }]}>
      {/* Header - Category Name & Subtitle */}
      <View style={styles.header}>
        <Heading size="small" style={[styles.categoryTitle, { color: colors.text }]}>{name}</Heading>
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
        <Heading size="small" style={[styles.browseText, { color: colors.text }]}>Browse all</Heading>
        <View style={[styles.arrowCircle, { backgroundColor: colors.glassBackground, borderColor: colors.glassBorder }]}>
          <ArrowRight size={Sizes.iconSm} color={colors.icon} strokeWidth={2.5} />
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
        <View style={[styles.categoryCard, { borderColor: colors.border, backgroundColor: colors.surface }]}>
          <View style={styles.header}>
            <Skeleton width="50%" height={20} />
            <Skeleton width="70%" height={14} style={{ marginTop: Spacing.xs }} />
          </View>
          <CategoryCardSkeleton />
          <View style={styles.footer}>
            <Skeleton width="30%" height={16} />
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
