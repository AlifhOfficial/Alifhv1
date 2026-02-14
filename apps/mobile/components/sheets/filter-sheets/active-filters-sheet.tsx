/**
 * ActiveFiltersSheet - Bottom Sheet displaying all active search filters
 * Uses @gorhom/bottom-sheet modal for proper gesture handling
 * Shows filter chips with remove buttons, clear all functionality
 */

import React, { useCallback, useMemo, useRef, useEffect } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { HapticPressable } from '@/components/ui';
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';

import { Colors, Spacing, Radius, Sizes } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { useSearch, type SearchChip, type SearchParams, type RemovableFilterKey } from '@/context/search-context';
import { Heading, Body } from '@/components/ui';

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

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      snapPoints={snapPoints}
      enableDynamicSizing={false}
      enablePanDownToClose
      onChange={handleSheetChanges}
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: colors.surface, borderRadius: Radius['3xl'] }}
      handleIndicatorStyle={{ backgroundColor: colors.textMuted, width: Sizes.bubble }}
      detached
      bottomInset={insets.bottom + Spacing.xl}
      style={styles.sheetContainer}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Heading size="medium">Active Filters</Heading>
          <View style={styles.headerActions}>
            {chips.length > 1 && (
              <HapticPressable 
                onPress={handleClearAll} 
                hitSlop={Spacing.md}
              >
                <Body size="small" style={{ color: colors.error }}>
                  Clear all
                </Body>
              </HapticPressable>
            )}
            <HapticPressable
              onPress={onClose}
              hitSlop={Spacing.md}
              style={[
                styles.iconButton,
                { backgroundColor: colors.fillSecondary },
              ]}
            >
              <Ionicons name="close" size={Sizes.iconSm} color={colors.textSecondary} />
            </HapticPressable>
          </View>
        </View>

        <BottomSheetScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {chips.length === 0 ? (
            <View style={styles.emptyState}>
              <Body tone="tertiary">No active filters</Body>
            </View>
          ) : (
            <View style={styles.chipGrid}>
              {chips.map((chip, idx) => (
                <HapticPressable 
                  key={`${chip.key}-${chip.value}-${chip.index ?? idx}`}
                  onPress={() => handleRemoveChip(chip)}
                  style={[
                    styles.chip,
                    { backgroundColor: colors.fillSecondary, borderColor: colors.border },
                  ]}
                >
                  <Body size="small" numberOfLines={1} style={styles.chipText}>
                    {chip.label}
                  </Body>
                  <Ionicons name="close" size={Spacing.md} color={colors.textTertiary} />
                </HapticPressable>
              ))}
            </View>
          )}
        </BottomSheetScrollView>

        <View style={{ height: insets.bottom + Spacing.md }} />
      </View>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  sheetContainer: {
    marginHorizontal: Spacing.lg,
  },
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  iconButton: {
    width: Spacing['3xl'],
    height: Spacing['3xl'],
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
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
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  chipText: {
    maxWidth: Sizes.cardThumbnailWidth,
  },
});
