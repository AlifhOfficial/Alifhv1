/**
 * Saved List - Displays saved listings (favorites or superlikes)
 */

import { Text, HapticPressable, HapticRefreshControl } from '@/components/ui';
import React, { useCallback } from 'react';
import { StyleSheet, View, FlatList } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { useRouter } from 'expo-router';
import { Heart, Zap, ArrowRight } from 'lucide-react-native';

import { Shadows, Sizes, Spacing, Radius } from '@/constants/theme';
import { getMobileHeaderContentInset, getTabBarContentInset } from '@/components/layout';
import { CarCardList } from '@/components/cards/car-card-list';
import { SavedListingCard } from '@/lib/saved-api';
import type { ThemeColors, SavedTab } from './types';

interface SavedListProps {
  colors: ThemeColors;
  listings: SavedListingCard[];
  activeTab: SavedTab;
  isRefreshing: boolean;
  onRefresh: () => void;
  onScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  quota?: {
    remaining: number;
    maxSuperlikesPerMonth: number;
  } | null;
}

// ============================================================================
// EMPTY STATE COMPONENT
// ============================================================================

function EmptyState({ 
  colors,
  isFavorites,
  onBrowse,
}: { 
  colors: ThemeColors;
  isFavorites: boolean;
  onBrowse: () => void;
}) {
  const IconComponent = isFavorites ? Heart : Zap;
  const iconColor = isFavorites ? colors.favorite : colors.warning;
  
  return (
    <View style={styles.emptyContainer}>
      <Animated.View 
        entering={FadeIn.duration(300)} 
        style={[styles.emptyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
      >
        <IconComponent size={Sizes.iconXl} color={iconColor} fill={iconColor} strokeWidth={1.5} />
        <Text variant="headline" style={styles.emptyTitle}>
          {isFavorites ? 'No favorites yet' : 'No superlikes yet'}
        </Text>
        <Text variant="subhead" tone="secondary" style={styles.emptySubtitle}>
          {isFavorites 
            ? 'Tap the heart on any listing to save it here'
            : 'Long press the heart to superlike a listing'}
        </Text>
        <HapticPressable
          haptic="medium"
          onPress={onBrowse}
          style={styles.ctaRow}
        >
          <Text variant="headline" style={{ color: colors.label }}>Browse</Text>
          <View style={[styles.ctaBubble, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <ArrowRight size={Sizes.iconXs} color={colors.label} strokeWidth={2} />
          </View>
        </HapticPressable>
      </Animated.View>
    </View>
  );
}

export function SavedList({ 
  colors,
  listings, 
  activeTab, 
  isRefreshing,
  onRefresh,
  onScroll,
  quota,
}: SavedListProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const bottomPadding = getTabBarContentInset(insets.bottom);
  const topPadding = getMobileHeaderContentInset(insets.top);

  const handleCardPress = useCallback((id: string) => {
    router.push(`/listing/${id}`);
  }, [router]);

  const handleBrowse = useCallback(() => {
    router.push('/(tabs)/(browse)');
  }, [router]);

  // Empty state
  if (listings.length === 0) {
    const isFavorites = activeTab === 'favorites';
    return <EmptyState colors={colors} isFavorites={isFavorites} onBrowse={handleBrowse} />;
  }

  return (
    <FlatList
      data={listings}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <CarCardList
          id={item.id}
          make={item.make || ''}
          model={item.model || ''}
          year={item.year || 0}
          trim={item.trim}
          price={item.price || 0}
          mileage={item.mileage || 0}
          emirate={item.emirate || ''}
          specs={item.specs}
          thumbnail={item.thumbnail}
          isBlkListing={item.isBlkListing || false}
          partnerName={item.partnerName}
          partnerLogo={item.partnerLogo}
          partnerVerified={item.partnerVerified || false}
          sellerName={item.sellerName}
          sellerAvatarUrl={item.sellerAvatarUrl}
          kycVerified={item.sellerKycVerified || false}
          onPress={handleCardPress}
        />
      )}
      contentContainerStyle={[styles.listContent, { paddingTop: topPadding, paddingBottom: bottomPadding }]}
      contentInsetAdjustmentBehavior="never"
      showsVerticalScrollIndicator={false}
      onScroll={onScroll}
      scrollEventThrottle={16}
      refreshControl={
        <HapticRefreshControl
          refreshing={isRefreshing}
          onRefresh={onRefresh}
          tintColor={colors.primary}
        />
      }
      ListHeaderComponent={
        activeTab === 'superlikes' && quota ? (
          <View style={[styles.quotaBadge, { backgroundColor: colors.surface }]}>
            <Zap size={Sizes.iconXs} color={colors.primary} strokeWidth={2} />
            <Text variant="subhead" tone="secondary">
              {quota.remaining}/{quota.maxSuperlikesPerMonth} remaining this month
            </Text>
          </View>
        ) : null
      }
    />
  );
}

const styles = StyleSheet.create({
  // Empty State
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing['2xl'],
  },
  emptyCard: {
    alignItems: 'center',
    padding: Spacing.xl,
    borderRadius: Radius['2xl'],
    borderWidth: 1,
    gap: Spacing.sm,
    ...Shadows.md,
  },
  emptyTitle: {
    textAlign: 'center',
  },
  emptySubtitle: {
    textAlign: 'center',
  },
  ctaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  ctaBubble: {
    width: Sizes.bubbleXs,
    height: Sizes.bubbleXs,
    borderRadius: Radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // List
  listContent: {
    paddingHorizontal: Spacing.lg,
  },
  quotaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radius.xl,
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
});
