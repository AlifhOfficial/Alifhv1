/**
 * SortSheet - Bottom Sheet for sorting options
 * Uses @gorhom/bottom-sheet modal for proper iOS gesture handling
 */

import React, { useCallback, useMemo, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';

import { Colors, Typography, Spacing, Radius } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import type { SearchSortOption } from '@/lib/api';

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
  const snapPoints = useMemo(() => ['65%'], []);

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
      backgroundStyle={{ backgroundColor: colors.surface }}
      handleIndicatorStyle={{ backgroundColor: colors.border, width: 36 }}
      stackBehavior="push"
    >
      <BottomSheetView style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Sort By</Text>
          <Pressable onPress={onClose} hitSlop={12}>
            <Text style={[styles.doneBtn, { color: colors.primary }]}>Done</Text>
          </Pressable>
        </View>

        {/* Options List */}
        <View style={[styles.listContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {SORT_OPTIONS.map((option, index) => {
            const selected = currentSort === option.value;

            return (
              <Pressable
                key={option.value}
                onPress={() => handleSelect(option.value)}
                style={({ pressed }) => [
                  styles.listItem,
                  { 
                    backgroundColor: pressed ? colors.backgroundTertiary : 'transparent',
                    borderBottomColor: colors.border,
                    borderBottomWidth: index < SORT_OPTIONS.length - 1 ? StyleSheet.hairlineWidth : 0,
                  },
                ]}
              >
                <Text 
                  style={[
                    styles.listItemText, 
                    { color: colors.text },
                    selected && styles.listItemTextSelected
                  ]} 
                  numberOfLines={1}
                >
                  {option.label}
                </Text>
                {selected && (
                  <Ionicons name="checkmark" size={20} color={colors.primary} />
                )}
              </Pressable>
            );
          })}
        </View>

        <View style={{ height: insets.bottom + 40 }} />
      </BottomSheetView>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  headerTitle: {
    ...Typography.title,
  },
  doneBtn: {
    ...Typography.button,
  },
  listContainer: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    overflow: 'hidden',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  listItemText: {
    ...Typography.button,
  },
  listItemTextSelected: {
    fontFamily: 'Inter_700Bold',
  },
});
