/**
 * Partners Screen - Browse all founding partners
 * Shows grid of partner cards with navigation to partner listings
 */

import React, { useState, useCallback, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  FlatList, 
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { Colors, Spacing, Layout, Sizes } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { useSearch } from '@/context/search-context';
import { Body } from '@/components/ui';
import { TopSafeAreaGradient } from '@/components/layout';
import { PartnersHeader, PartnerCard, PartnerCardSkeleton } from '@/components/partners';
import { getPartnersList, type PartnerListItem } from '@/lib/partner-api';

// ============================================================================
// CONSTANTS
// ============================================================================

const HEADER_HEIGHT = Sizes.pillHeight + Spacing.md;

// ============================================================================
// PARTNERS SCREEN
// ============================================================================

export default function PartnersScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { applySearch, clearSearch, clearFilterParams, resetSort } = useSearch();

  // State
  const [partners, setPartners] = useState<PartnerListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Content top padding
  const contentTopPadding = insets.top + Layout.headerPadding + HEADER_HEIGHT + Spacing.md;

  // ──────────────────────────────────────────────────────────────────────────
  // API CALLS
  // ──────────────────────────────────────────────────────────────────────────

  const fetchPartners = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getPartnersList();
      setPartners(data);
    } catch (error) {
      console.error('[Partners] Fetch error:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchPartners();
  }, [fetchPartners]);

  // ──────────────────────────────────────────────────────────────────────────
  // HANDLERS
  // ──────────────────────────────────────────────────────────────────────────

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchPartners();
  }, [fetchPartners]);

  const handlePartnerPress = useCallback((partnerId: string, partnerName: string) => {
    // Clear all existing state
    clearSearch();
    clearFilterParams();
    resetSort();
    
    // Apply partner filter
    applySearch({ partnerId, partnerName });
    
    // Navigate to browse with partner filter
    router.push('/browse' as any);
  }, [applySearch, clearSearch, clearFilterParams, resetSort, router]);

  const renderItem = useCallback(({ item }: { item: PartnerListItem }) => (
    <PartnerCard
      partner={item}
      onPress={handlePartnerPress}
    />
  ), [handlePartnerPress]);

  const keyExtractor = useCallback((item: PartnerListItem) => item.id, []);

  const renderEmpty = useCallback(() => {
    if (isLoading && partners.length === 0) {
      return (
        <>
          <PartnerCardSkeleton />
          <PartnerCardSkeleton />
          <PartnerCardSkeleton />
        </>
      );
    }

    return (
      <View style={styles.empty}>
        <Body size="large" tone="secondary">No partners available</Body>
      </View>
    );
  }, [isLoading, partners.length]);

  // ──────────────────────────────────────────────────────────────────────────
  // RENDER
  // ──────────────────────────────────────────────────────────────────────────

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header - Absolute positioned */}
      <PartnersHeader count={partners.length} />

      {/* Safe Area Gradient */}
      <TopSafeAreaGradient />

      <FlatList
        data={partners}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={[
          styles.scrollContent,
          { 
            paddingTop: contentTopPadding,
            paddingBottom: insets.bottom + Layout.tabBarHeight + Spacing.xl,
            flexGrow: partners.length === 0 ? 1 : undefined,
          },
        ]}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.text}
          />
        }
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        updateCellsBatchingPeriod={40}
        windowSize={7}
        removeClippedSubviews
      />
    </View>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.sm,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: Spacing['3xl'],
  },
});
