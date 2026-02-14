/**
 * Category Grid - Clean Category Cards
 * Each category wrapped in dark card with horizontal scrolling
 * RevvupLogo + "evvup X Category Name" signature branding
 */

import React, { memo, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
  Text,
} from 'react-native';
import { ArrowRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';

import { Spacing, Radius, Fonts, Typography } from '@/constants/theme';
import { HapticPressable, Heading } from '@/components/ui';
import { RevvupLogo } from '@/components/ui/loaders';
import { CarCardList } from '@/components/cards/car-card-list';
import { categories, type Category } from './mock-data';

// ============================================================================
// CONSTANTS
// ============================================================================

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const LIST_CARD_WIDTH = SCREEN_WIDTH * 0.85;

// ============================================================================
// CATEGORY CARD (Wrapped Section)
// ============================================================================

interface CategoryCardProps {
  category: Category;
  onCategoryPress?: (categoryId: string) => void;
  onCarPress?: (id: string) => void;
}

const CategoryCard = memo(function CategoryCard({
  category,
  onCategoryPress,
  onCarPress,
}: CategoryCardProps) {
  const router = useRouter();

  const handleCategoryPress = useCallback(() => {
    onCategoryPress?.(category.id);
  }, [category.id, onCategoryPress]);

  const handleCarPress = useCallback((id: string) => {
    onCarPress?.(id);
    router.push(`/listing/${id}` as any);
  }, [onCarPress, router]);

  return (
    <View style={styles.categoryCard}>
      {/* Header - RevvupLogo + evvup */}
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <RevvupLogo size={28} color="#FFFFFF" />
          <Text style={styles.evvupText}>evvup</Text>
        </View>
      </View>

      {/* Category Name */}
      <View style={styles.categoryRow}>
        <Text style={styles.categoryText}>{category.name}</Text>
      </View>

      {/* Horizontal Scrolling Car Cards */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.cardsContainer}
      >
        {category.listings.map((listing) => (
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
              onPress={handleCarPress}
            />
          </View>
        ))}
      </ScrollView>

      {/* CTA Footer */}
      <HapticPressable onPress={handleCategoryPress} style={styles.footer}>
        <Heading size="small" style={styles.browseText}>Browse all</Heading>
        <View style={styles.arrowCircle}>
          <ArrowRight size={14} color="#000000" strokeWidth={2.5} />
        </View>
      </HapticPressable>
    </View>
  );
});

// ============================================================================
// CATEGORY GRID
// ============================================================================

interface CategoryGridProps {
  onCategoryPress?: (categoryId: string) => void;
  onCarPress?: (id: string) => void;
  limit?: number;
  offset?: number;
}

export const CategoryGrid = memo(function CategoryGrid({
  onCategoryPress,
  onCarPress,
  limit,
  offset = 0,
}: CategoryGridProps) {
  const start = offset % categories.length;
  const displayCategories = limit ? categories.slice(start, start + limit) : categories;
  return (
    <View style={styles.container}>
      {displayCategories.map((category) => (
        <CategoryCard
          key={category.id}
          category={category}
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
    backgroundColor: '#000000',
    paddingBottom: Spacing['2xl'],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing['2xl'],
    paddingBottom: Spacing.sm,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 0,
  },
  evvupText: {
    fontFamily: Fonts.bold,
    fontSize: 20,
    color: '#FFFFFF',
    letterSpacing: -0.3,
    marginLeft: -2,
  },
  categoryRow: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
  categoryText: {
    ...Typography.blkSignature,
    color: 'rgba(255,255,255,0.5)',
  },
  cardsContainer: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  cardWrapper: {
    width: LIST_CARD_WIDTH,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
  },
  browseText: {
    color: '#FFFFFF',
  },
  arrowCircle: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
