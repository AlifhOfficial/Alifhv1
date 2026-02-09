/**
 * SortSheet - Bottom Sheet for sorting options
 * Uses @gorhom/bottom-sheet modal for proper iOS gesture handling
 */

import React, { useCallback, useMemo, useRef, useEffect } from 'react';
import { View, StyleSheet, Pressable, Platform } from 'react-native';
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';

import { Colors, Spacing, Radius } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { Heading, Body } from '@/components/ui';
import type { SearchSortOption } from '@/lib/search-api';

const SORT_OPTIONS: { value: SearchSortOption; label: string }[] = [
  { value: 'relevance', label: 'Default' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'newest', label: 'Recently Listed' },
  { value: 'oldest', label: 'Oldest Listings' },
  { value: 'price_low', label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' },
  { value: 'mileage_low', label: 'Lowest Mileage' },
  { value: 'year_new', label: 'Year: Newest' },
  { value: 'year_old', label: 'Year: Oldest' },
];

interface SortSheetProps {
  visible: boolean;
  onClose: () => void;
  currentSort: SearchSortOption;
  onSortChange: (sort: SearchSortOption) => void;
}

export function SortSheet({ visible, onClose, currentSort, onSortChange }: SortSheetProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const bottomSheetRef = useRef<BottomSheetModal>(null);

  // Snap points - enough for all options + padding
  const snapPoints = useMemo(() => ['70%'], []);

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
      enablePanDownToClose
      onChange={handleSheetChanges}
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: colors.surface, borderRadius: 24 }}
      handleIndicatorStyle={{ backgroundColor: colors.textMuted, width: 36 }}
      detached
      bottomInset={insets.bottom + 20}
      style={styles.sheetContainer}
    >
      <BottomSheetView style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Heading size="medium" style={{ color: colors.text }}>Sort By</Heading>
          <Pressable 
            onPress={onClose} 
            hitSlop={Spacing.md}
            style={({ pressed }) => [
              styles.closeButton,
              { backgroundColor: pressed ? colors.fill : colors.fillSecondary }
            ]}
          >
            <Ionicons name="close" size={18} color={colors.textSecondary} />
          </Pressable>
        </View>

        {/* Options List */}
        <View style={styles.listContainer}>
          {SORT_OPTIONS.map((option, index) => {
            const selected = currentSort === option.value;

            return (
              <Pressable
                key={option.value}
                onPress={() => handleSelect(option.value)}
                style={({ pressed }) => [
                  styles.listItem,
                  { 
                    backgroundColor: selected 
                      ? colors.surfaceSecondary 
                      : pressed 
                        ? colors.fill 
                        : 'transparent',
                  },
                ]}
              >
                <View style={styles.radioRow}>
                  <Body
                    size="large"
                    style={[
                      styles.optionLabel, 
                      { color: selected ? colors.text : colors.textSecondary },
                      selected && styles.optionLabelSelected
                    ]}
                    numberOfLines={1}
                  >
                    {option.label}
                  </Body>
                  {/* Radio button */}
                  <View style={[
                    styles.radio,
                    { 
                      borderColor: selected ? colors.text : colors.textMuted,
                    },
                  ]}>
                    {selected && (
                      <View style={[styles.radioInner, { backgroundColor: colors.text }]} />
                    )}
                  </View>
                </View>
              </Pressable>
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
    marginHorizontal: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.xs,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContainer: {
    gap: Spacing.sm,
  },
  listItem: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.lg,
  },
  listItemSpacing: {
    // kept for compatibility
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  optionLabel: {
    flex: 1,
  },
  optionLabelSelected: {
    fontFamily: 'Inter_500Medium',
  },
});
