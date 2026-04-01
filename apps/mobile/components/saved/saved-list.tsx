/**
 * Saved List - Displays saved listings (favorites or superlikes)
 */

import { Text, HapticRefreshControl, EmptyState } from '@/components/ui';
import React, { useCallback } from 'react';
import { StyleSheet, View, FlatList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { useRouter } from 'expo-router';
import { Heart, Zap } from 'lucide-react-native';

import { Sizes, Spacing, Radius } from '@/constants/theme';
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
// SAVED LIST
// ============================================================================

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
    return (
      <EmptyState
        icon={isFavorites ? Heart : Zap}
        title={isFavorites ? 'Your favorites is empty.' : 'No superlikes yet.'}
        subtitle={
          isFavorites
            ? 'Tap the heart on any listing to save it here.'
            : 'Tap the lightning bolt on any listing to superlike it.'
        }
      />
    );
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
