/**
 * Saved List - Displays saved listings (favorites or superlikes)
 */

import React from 'react';
import { StyleSheet, View, Text, FlatList, RefreshControl } from 'react-native';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Heart, Sparkles } from 'lucide-react-native';

import { Typography, Layout } from '@/constants/theme';
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
    
    return (
      <View style={styles.emptyContainer}>
        <Animated.View entering={FadeIn.duration(300)} style={styles.emptyContent}>
          {/* Icon */}
          <Animated.View
            entering={FadeInUp.delay(100).duration(400)}
            style={[styles.iconPlaceholder, { backgroundColor: colors.surface }]}
          >
            {isFavorites ? (
              <Heart size={48} color={colors.textTertiary} strokeWidth={1.25} />
            ) : (
              <Sparkles size={48} color={colors.textTertiary} strokeWidth={1.25} />
            )}
          </Animated.View>

          {/* Text */}
          <Animated.View
            entering={FadeInUp.delay(200).duration(400)}
            style={styles.textContainer}
          >
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              {isFavorites ? 'No Favorites Yet' : 'No Superlikes Yet'}
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              {isFavorites 
                ? 'Tap the heart on listings to save them here'
                : 'Use superlikes to show extra interest'}
            </Text>
          </Animated.View>
        </Animated.View>
      </View>
    );
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
            <Text style={[styles.quotaText, { color: colors.textSecondary }]}>
              {quota.remaining}/{quota.maxSuperlikesPerMonth} remaining this month
            </Text>
          </View>
        ) : null
      }
    />
  );
}

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyContent: {
    alignItems: 'center',
    gap: 24,
  },
  iconPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    alignItems: 'center',
    gap: 8,
  },
  emptyTitle: {
    fontSize: Typography.h2.fontSize,
    fontFamily: 'Inter_700Bold',
    fontWeight: '700',
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: Typography.body.fontSize,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 16,
  },
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
  quotaText: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    fontWeight: '500',
  },
});
