/**
 * SortSheet - Bottom Sheet for sorting options
 * Uses @gorhom/bottom-sheet modal for proper iOS gesture handling
 */

import React, { useCallback, useMemo, useRef, useEffect } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { HapticPressable } from '@/components/ui';
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';

import { Colors, Spacing, Radius, Sizes, Layout } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { Heading, Body, ButtonText } from '@/components/ui';
import type { SearchSortOption } from '@/lib/search-api';

const SORT_OPTIONS: { value: SearchSortOption; label: string }[] = [
  { value: 'relevance', label: 'Default' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'newest', label: 'Recently Listed' },
  { value: 'oldest', label: 'Oldest Listings' },
  { value: 'price_low', label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' },
  { value: 'mileage_low', label: 'Lowest Mileage' },
  { value: 'mileage_high', label: 'Highest Mileage' },
  { value: 'year_new', label: 'Year: Newest' },
  { value: 'year_old', label: 'Year: Oldest' },
];

interface SortSheetProps {
  visible: boolean;
  onClose: () => void;
  currentSort: SearchSortOption;
  onSortChange: (sort: SearchSortOption) => void;
  forceDark?: boolean;
}

export function SortSheet({ visible, onClose, currentSort, onSortChange, forceDark }: SortSheetProps) {
  const { colorScheme } = useTheme();
  // Force dark colors when on BLK tab
  const colors = Colors[forceDark ? 'dark' : colorScheme];
  const insets = useSafeAreaInsets();
  const bottomSheetRef = useRef<BottomSheetModal>(null);

  // Snap points
  const snapPoints = useMemo(() => ['60%', '94%'], []);

  // Handle open/close based on visible prop
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

  const handleSelect = useCallback((sort: SearchSortOption) => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onSortChange(sort);
    bottomSheetRef.current?.dismiss();
  }, [onSortChange]);

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
      backgroundStyle={[styles.background, { backgroundColor: colors.surface }]}
      handleIndicatorStyle={[styles.handleIndicator, { backgroundColor: colors.border }]}
    >
      <BottomSheetView style={styles.content}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <View style={styles.headerTopRow}>
            <HapticPressable
              onPress={onClose}
              hitSlop={Spacing.md}
              style={styles.cancelButton}
            >
              <Body size="medium" tone="secondary">Cancel</Body>
            </HapticPressable>
            
            <Heading size="small">Sort By</Heading>
            
            <View style={styles.placeholder} />
          </View>
        </View>

        {/* Options List */}
        <View style={styles.listContainer}>
          {SORT_OPTIONS.map((option) => {
            const selected = currentSort === option.value;

            return (
              <HapticPressable
                key={option.value}
                onPress={() => handleSelect(option.value)}
                style={styles.listItem}
              >
                <Body
                  size="medium"
                  style={{ 
                    color: selected ? colors.text : colors.text2,
                    fontWeight: selected ? '700' : '500',
                  }}
                >
                  {option.label}
                </Body>
                <View style={[
                  styles.radio,
                  { borderColor: selected ? colors.textMuted : colors.border },
                ]}>
                  {selected && (
                    <View style={[styles.radioInner, { backgroundColor: colors.textMuted }]} />
                  )}
                </View>
              </HapticPressable>
            );
          })}
        </View>

        <View style={{ height: insets.bottom + Spacing['3xl'] }} />
      </BottomSheetView>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  sheetContainer: {
    marginHorizontal: Spacing.md,
  },
  background: {
    borderRadius: Radius['3xl'],
  },
  handleIndicator: {
    width: Sizes.bubble,
    height: Spacing.xs,
    borderRadius: Radius.full,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  header: {
    flexShrink: 0,
    paddingBottom: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginBottom: Spacing.md,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cancelButton: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.xs,
  },
  placeholder: {
    width: Spacing.xl * 3,
  },
  listContainer: {
    gap: Spacing.xs,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
  },
  radio: {
    width: Sizes.iconMd,
    height: Sizes.iconMd,
    borderRadius: Radius.full,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: Spacing.sm + 2,
    height: Spacing.sm + 2,
    borderRadius: Radius.full,
  },
});
