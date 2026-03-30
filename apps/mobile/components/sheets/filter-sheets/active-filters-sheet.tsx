/**
 * ActiveFiltersSheet - Bottom Sheet displaying all active search filters
 * Uses @gorhom/bottom-sheet modal for proper gesture handling
 * Shows filter chips grouped by category with remove buttons, clear all functionality
 */

import { Text, HapticPressable } from '@/components/ui';
import React, { useCallback, useMemo, useRef, useEffect } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';

import { Colors, Spacing, Radius, Sizes, Layout } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { useSearch, type SearchChip, type SearchParams, type RemovableFilterKey } from '@/context/search-context';

// Category order and labels for grouping chips
const CATEGORY_CONFIG: { key: string; label: string; keys: string[] }[] = [
  { key: 'search', label: 'Search', keys: ['q'] },
  { key: 'vehicle', label: 'Vehicle', keys: ['make', 'model', 'trim'] },
  { key: 'price', label: 'Price', keys: ['price', 'priceMin', 'priceMax'] },
  { key: 'year', label: 'Year', keys: ['year', 'yearMin', 'yearMax'] },
  { key: 'mileage', label: 'Mileage', keys: ['mileage', 'mileageMin', 'mileageMax'] },
  { key: 'location', label: 'Location', keys: ['emirate'] },
  { key: 'seller', label: 'Seller', keys: ['sellerType', 'partnerId', 'sellerId', 'partnerName'] },
  { key: 'specs', label: 'Specs', keys: ['bodyType', 'fuelType', 'transmission', 'specs', 'engineSize'] },
  { key: 'color', label: 'Color', keys: ['exteriorColor', 'interiorColor'] },
  { key: 'features', label: 'Features', keys: ['tags', 'extras'] },
  { key: 'condition', label: 'Condition', keys: ['condition', 'isBlkListing', 'isBlackTierPartner', 'isNegotiable'] },
  { key: 'sort', label: 'Sort', keys: ['sort'] },
];

interface ActiveFiltersSheetProps {
  visible: boolean;
  onClose: () => void;
}

export function ActiveFiltersSheet({ visible, onClose }: ActiveFiltersSheetProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  
  const { 
    getSearchChips, 
    removeSearchParam, 
    clearSearch, 
    resetSort, 
    sortBy, 
    removeFilterParam, 
    clearFilterParams 
  } = useSearch();

  const chips = getSearchChips();

  // Group chips by category
  const groupedChips = useMemo(() => {
    const groups: { category: string; label: string; chips: SearchChip[] }[] = [];
    const usedChips = new Set<number>();

    for (const config of CATEGORY_CONFIG) {
      const categoryChips: SearchChip[] = [];
      chips.forEach((chip, idx) => {
        if (config.keys.includes(chip.key) && !usedChips.has(idx)) {
          categoryChips.push(chip);
          usedChips.add(idx);
        }
      });
      if (categoryChips.length > 0) {
        groups.push({ category: config.key, label: config.label, chips: categoryChips });
      }
    }

    // Add any remaining chips to "Other"
    const remainingChips = chips.filter((_, idx) => !usedChips.has(idx));
    if (remainingChips.length > 0) {
      groups.push({ category: 'other', label: 'Other', chips: remainingChips });
    }

    return groups;
  }, [chips]);

  const snapPoints = useMemo(() => ['50%', '80%'], []);

  useEffect(() => {
    if (visible) {
      bottomSheetRef.current?.present();
    } else {
      bottomSheetRef.current?.dismiss();
    }
  }, [visible]);

  const handleSheetChanges = useCallback((index: number) => {
    if (index === -1) {
      onClose();
    }
  }, [onClose]);

  const handleRemoveChip = useCallback((chip: SearchChip) => {
    // Skip locked chips
    if (chip.locked) return;
    
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    // Handle sort chip specially
    if (chip.key === 'sort') {
      resetSort();
      return;
    }
    // Handle search params (make, model, trim, q, partnerId, sellerId, tags, extras)
    if (['make', 'model', 'trim', 'q', 'partnerId', 'sellerId', 'tags', 'extras'].includes(chip.key)) {
      removeSearchParam(chip.key as keyof SearchParams, chip.index);
      return;
    }
    // Handle filter params (includes compound keys like 'price', 'year', 'mileage')
    removeFilterParam(chip.key as RemovableFilterKey, chip.index);
  }, [removeSearchParam, resetSort, removeFilterParam]);

  const handleClearAll = useCallback(() => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    clearSearch();
    clearFilterParams();
    if (sortBy !== 'relevance') {
      resetSort();
    }
    onClose();
  }, [clearSearch, clearFilterParams, resetSort, sortBy, onClose]);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
        pressBehavior="close"
      />
    ),
    []
  );

  const hasFilters = chips.length > 0;

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      snapPoints={snapPoints}
      enableDynamicSizing={false}
      enablePanDownToClose
      onChange={handleSheetChanges}
      backdropComponent={renderBackdrop}
      backgroundStyle={[styles.background, { backgroundColor: colors.surface }]}
      handleIndicatorStyle={[styles.handleIndicator, { backgroundColor: colors.border }]}
    >
      {/* Fixed Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View style={styles.headerTopRow}>
          <HapticPressable
            onPress={onClose}
            hitSlop={Spacing.md}
            style={styles.cancelButton}
          >
            <Text variant="body" tone="secondary">Cancel</Text>
          </HapticPressable>
          
          <Text variant="headline">Active Filters</Text>
          
          <View style={styles.placeholder} />
        </View>

        {/* Selection Summary */}
        {hasFilters && (
          <View style={styles.selectionSummary}>
            <Text variant="subhead" numberOfLines={1} style={{ flex: 1 }}>
              {chips.length} filter{chips.length !== 1 ? 's' : ''} active
            </Text>
            <HapticPressable onPress={handleClearAll} hitSlop={Layout.hitSlopSmall}>
              <Text variant="subhead" style={{ color: colors.error }} tone="secondary">
                Clear all
              </Text>
            </HapticPressable>
          </View>
        )}
      </View>

      <BottomSheetScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {!hasFilters ? (
          <View style={styles.emptyState}>
            <Text tone="muted" variant="body">No active filters</Text>
          </View>
        ) : (
          groupedChips.map((group) => (
            <View key={group.category} style={styles.categorySection}>
              <Text variant="caption1Emphasized" tone="muted" style={styles.categoryLabel} uppercase>
                {group.label.toUpperCase()}
              </Text>
              <View style={styles.chipGrid}>
                {group.chips.map((chip, idx) => (
                  <HapticPressable 
                    key={`${chip.key}-${chip.value}-${chip.index ?? idx}`}
                    onPress={chip.locked ? undefined : () => handleRemoveChip(chip)}
                    disabled={chip.locked}
                    style={[
                      styles.chip,
                      { backgroundColor: colors.fill2, borderColor: colors.border },
                      chip.locked && { opacity: 0.7 },
                    ]}
                  >
                    <Text variant="subhead" numberOfLines={1} style={styles.chipText}>
                      {chip.label}
                    </Text>
                    {!chip.locked && (
                      <Ionicons name="close" size={Spacing.md} color={colors.labelTertiary} />
                    )}
                  </HapticPressable>
                ))}
              </View>
            </View>
          ))
        )}

        <View style={{ height: insets.bottom + Spacing['3xl'] }} />
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  sheetContainer: {
    marginHorizontal: Spacing.md,
  },
  background: {
    borderTopLeftRadius: Radius.sheet,
    borderTopRightRadius: Radius.sheet,
    borderCurve: 'continuous',
  },
  handleIndicator: {
    width: Sizes.bubble,
    height: Spacing.xs,
    borderRadius: Radius.full,
  },
  header: {
    flexShrink: 0,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  cancelButton: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.xs,
  },
  placeholder: {
    width: Spacing.xl * 3,
  },
  selectionSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xs,
    gap: Spacing['2xl'],
    marginTop: Spacing.md,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing['3xl'],
  },
  categorySection: {
    marginBottom: Spacing.lg,
  },
  categoryLabel: {
    marginBottom: Spacing.sm,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  chipText: {
    maxWidth: Sizes.cardThumbnailWidth,
  },
});
