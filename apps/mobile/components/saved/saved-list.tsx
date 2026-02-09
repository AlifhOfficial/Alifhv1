/**
 * Saved List - Displays saved listings (favorites or superlikes)
 */

import React from 'react';
import { StyleSheet, View, FlatList, RefreshControl } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Heart, Sparkles } from 'lucide-react-native';

import { Layout } from '@/constants/theme';
import { Heading, Supporting } from '@/components/ui';
import { CarCardM } from '@/components/cards/car-card-m';
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
  isFavorites 
}: { 
  colors: ThemeColors; 
  isFavorites: boolean;
}) {
  return (
    <View style={styles.emptyContainer}>
      <Animated.View entering={FadeIn.duration(300)} style={styles.emptyContent}>
        
        {/* Icon */}
        {isFavorites ? (
          <Heart size={48} color={colors.favorite} strokeWidth={1.5} />
        ) : (
          <Sparkles size={48} color={colors.warning} strokeWidth={1.5} />
        )}

        {/* Title */}
        <Heading size="large" style={styles.emptyTitle}>
          {isFavorites ? 'No favorites yet' : 'No superlikes yet'}
        </Heading>

        {/* Subtitle */}
        <Supporting size="small" style={styles.emptySubtitle}>
          {isFavorites 
            ? 'Tap the heart on any listing to save it here'
            : 'Long press the heart to superlike a listing'}
        </Supporting>

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
  const bottomPadding = insets.bottom + Layout.tabBarHeight;

  // Empty state
  if (listings.length === 0) {
    const isFavorites = activeTab === 'favorites';
    return <EmptyState colors={colors} isFavorites={isFavorites} />;
  }

  return (
    <FlatList
      data={listings}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <CarCardM
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
          isFavorite={activeTab === 'favorites'}
          isSuperliked={activeTab === 'superlikes'}
        />
      )}
      contentContainerStyle={[styles.listContent, { paddingBottom: bottomPadding }]}
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
            <Sparkles size={14} color={colors.primary} strokeWidth={2} />
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
    paddingHorizontal: 40,
  },
  emptyContent: {
    alignItems: 'center',
    gap: 16,
  },
  emptyTitle: {
    textAlign: 'center',
    marginTop: 8,
  },
  emptySubtitle: {
    textAlign: 'center',
  },
  
  // List
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  quotaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
    gap: 6,
    marginBottom: 12,
  },
});
