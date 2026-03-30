/**
 * LocationFilterSheet - Bottom Sheet for location/emirate selection
 * Uses @gorhom/bottom-sheet modal for proper iOS gesture handling
 */

import { Text, HapticPressable } from '@/components/ui';
import React, { useCallback, useMemo, useRef, useEffect, useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetView, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';

import { Fonts, Typography, Colors, Spacing, Radius, Sizes, Layout, SheetSnapPoints } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import type { SearchParams } from '@/lib/search-api';
import { UAE_EMIRATES } from '@/lib/filter-constants';

interface LocationFilterSheetProps {
  visible: boolean;
  onClose: () => void;
  selected: string[];
  /** Current filter context - facets will be fetched dynamically based on this */
  filterContext?: Omit<SearchParams, 'emirate' | 'limit' | 'page'>;
  onApply: (selected: string[]) => void;
}

export function LocationFilterSheet({ 
  visible, 
  onClose, 
  selected,
  filterContext: _filterContext = {},
  onApply,
}: LocationFilterSheetProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const bottomSheetRef = useRef<BottomSheetModal>(null);

  // Local state for selection
  const [localSelected, setLocalSelected] = useState<string[]>(selected);

  // Sync with props when sheet opens
  useEffect(() => {
    if (visible) {
      setLocalSelected(selected);
    }
  }, [visible, selected]);

  // Sort options: selected first, then by count
  const sortedOptions = useMemo(() => {
    const options = UAE_EMIRATES.map((emirate) => ({
      value: emirate.value,
      label: emirate.label,
      count: 0,
    }));
    const selectedSet = new Set(localSelected);
    const selectedOpts = options.filter(o => selectedSet.has(o.value));
    const rest = options.filter(o => !selectedSet.has(o.value));
    return [...selectedOpts, ...rest];
  }, [localSelected]);

  const snapPoints = useMemo(() => SheetSnapPoints.standard, []);

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

  const handleToggle = useCallback((value: string) => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setLocalSelected(prev => {
      if (prev.includes(value)) {
        return prev.filter(v => v !== value);
      }
      return [...prev, value];
    });
  }, []);

  const handleApply = useCallback(() => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onApply(localSelected);
    bottomSheetRef.current?.dismiss();
  }, [localSelected, onApply]);

  const handleClear = useCallback(() => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setLocalSelected([]);
    onApply([]);
    bottomSheetRef.current?.dismiss();
  }, [onApply]);

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

  const hasValue = localSelected.length > 0;

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
            <Text variant="subhead" tone="muted">Cancel</Text>
          </HapticPressable>
          
          <Text variant="caption1Emphasized" tone="muted" uppercase>Location</Text>
          
          <HapticPressable
            style={[
              styles.applyButton,
              { backgroundColor: hasValue ? colors.primary : colors.fill2 },
            ]}
            onPress={handleApply}
          >
            <Text
              variant="caption1Emphasized"
              style={{ color: hasValue ? colors.primaryForeground : colors.labelQuaternary }}
              uppercase
            >
              Apply
            </Text>
          </HapticPressable>
        </View>

        {/* Selection Summary */}
        {hasValue && (
          <View style={styles.selectionSummary}>
            <Text variant="caption1Emphasized" numberOfLines={1} style={{ flex: 1 }} tone="muted">
              {localSelected.join(', ')}
            </Text>
            <HapticPressable onPress={handleClear} hitSlop={Layout.hitSlopSmall}>
              <Text variant="caption1Emphasized" style={{ color: colors.error }} tone="muted" uppercase>
                Clear
              </Text>
            </HapticPressable>
          </View>
        )}
      </View>

      <BottomSheetScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Options List */}
        <View style={styles.listContainer}>
          {sortedOptions.map((option) => {
            const isSelected = localSelected.includes(option.value);

            return (
              <HapticPressable
                key={option.value}
                onPress={() => handleToggle(option.value)}
                style={styles.listItem}
              >
                <View style={styles.labelRow}>
                  <Text
                    variant={isSelected ? 'subheadEmphasized' : 'subhead'}
                    style={{ 
                      color: isSelected ? colors.label : colors.labelSecondary,
                    }}
                  >
                    {option.label}
                  </Text>
                  <Text variant="caption1Emphasized" tone="muted">
                    {option.count.toLocaleString()}
                  </Text>
                </View>
                <View style={[
                  styles.radio,
                  { borderColor: isSelected ? colors.labelQuaternary : colors.border },
                ]}>
                  {isSelected && (
                    <View style={[styles.radioInner, { backgroundColor: colors.labelQuaternary }]} />
                  )}
                </View>
              </HapticPressable>
            );
          })}
        </View>

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
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
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
    paddingHorizontal: Spacing.sm,
  },
  selectionSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.sm,
    gap: Spacing['2xl'],
    marginTop: Spacing.md,
  },
  listContainer: {
    gap: Spacing.xs,
    marginTop: Spacing.md,
    marginBottom: Spacing.xl,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
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
  applyButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.full,
  },
});
