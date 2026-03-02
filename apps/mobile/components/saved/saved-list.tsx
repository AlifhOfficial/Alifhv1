/**
 * Saved List - Displays saved listings (favorites or superlikes)
 */

import React, { useCallback } from 'react';
import { StyleSheet, View, FlatList, RefreshControl } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Heart, Zap, ArrowRight } from 'lucide-react-native';

import { Layout, Sizes, Spacing, Radius } from '@/constants/theme';
import { Heading, Supporting, HapticPressable } from '@/components/ui';
import { CarCardList } from '@/components/cards/car-card-list';
import { SavedListingCard } from '@/lib/saved-api';
import type { ThemeColors, SavedTab } from './types';

interface SavedListProps {
  colors: ThemeColors;
  listings: SavedListingCard[];
  activeTab: SavedTab;
  isRefreshing: boolean;
  onRefresh: () => void;
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
        <Heading size="small" style={styles.emptyTitle}>
          {isFavorites ? 'No favorites yet' : 'No superlikes yet'}
        </Heading>
        <Supporting size="small" tone="secondary" style={styles.emptySubtitle}>
          {isFavorites 
            ? 'Tap the heart on any listing to save it here'
            : 'Long press the heart to superlike a listing'}
        </Supporting>
        <HapticPressable
          haptic="medium"
          onPress={onBrowse}
          style={styles.ctaRow}
        >
          <Heading size="small" style={{ color: colors.text }}>Browse</Heading>
          <View style={[styles.ctaBubble, { backgroundColor: colors.glassBackground, borderColor: colors.border }]}>
            <ArrowRight size={Sizes.iconXs} color={colors.text} strokeWidth={2} />
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
  quota,
}: SavedListProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const bottomPadding = insets.bottom + Layout.tabBarHeight;
  // Account for absolute header: safe area + headerPadding + pill height + bottom padding
  const topPadding = insets.top + Layout.headerPadding + Sizes.pillHeight + Spacing.md;

  const handleCardPress = useCallback((id: string) => {
    router.push(`/listing/${id}`);
  }, [router]);

  const handleBrowse = useCallback(() => {
    router.push('/browse');
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
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={onRefresh}
          tintColor={colors.primary}
        />
      }
      ListHeaderComponent={
        activeTab === 'superlikes' && quota ? (
          <View style={[styles.quotaBadge, { backgroundColor: colors.surface }]}>
            <Zap size={Sizes.iconXs} color={colors.primary} strokeWidth={2} />
            <Supporting size="mini" tone="secondary">
              {quota.remaining}/{quota.maxSuperlikesPerMonth} remaining this month
            </Supporting>
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
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
