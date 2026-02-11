/**
 * LocationFilterSheet - Bottom Sheet for location/emirate selection
 * Uses @gorhom/bottom-sheet modal for proper iOS gesture handling
 */

import React, { useCallback, useMemo, useRef, useEffect, useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { HapticPressable } from '@/components/ui';
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetView, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';

import { Colors, Spacing, Radius } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { Heading, Body, Supporting, ButtonText } from '@/components/ui';
import { searchApi, type FacetBucket, type SearchParams } from '@/lib/search-api';

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
  filterContext = {},
  onApply,
}: LocationFilterSheetProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const bottomSheetRef = useRef<BottomSheetModal>(null);

  // Local state for selection
  const [localSelected, setLocalSelected] = useState<string[]>(selected);
  
  // Dynamic facets
  const [options, setOptions] = useState<FacetBucket[]>([]);
  const [isLoadingFacets, setIsLoadingFacets] = useState(false);

  // Sync with props when sheet opens
  useEffect(() => {
    if (visible) {
      setLocalSelected(selected);
    }
  }, [visible, selected]);

  // Fetch emirate facets dynamically when sheet opens or filter context changes
  useEffect(() => {
    if (visible) {
      setIsLoadingFacets(true);
      searchApi
        .getFacets(filterContext)
        .then((result) => setOptions(result?.emirate ?? []))
        .catch(console.error)
        .finally(() => setIsLoadingFacets(false));
    }
  }, [visible, filterContext]);

  const snapPoints = useMemo(() => ['60%', '94%'], []);

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
      detached
      bottomInset={insets.bottom + 20}
      style={styles.sheetContainer}
    >
      <BottomSheetScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Heading size="medium">Location</Heading>
          <HapticPressable 
            onPress={onClose} 
            hitSlop={Spacing.md}
            style={[
              styles.closeButton,
              { backgroundColor: colors.fillSecondary }
            ]}
          >
            <Ionicons name="close" size={18} color={colors.textSecondary} />
          </HapticPressable>
        </View>

        {/* Options List */}
        <View style={styles.listContainer}>
          {options.map((option) => {
            const isSelected = localSelected.includes(option.value);

            return (
              <HapticPressable
                key={option.value}
                onPress={() => handleToggle(option.value)}
                style={styles.listItem}
              >
                <View style={styles.labelRow}>
                  <Body
                    size="large"
                    style={{ 
                      color: isSelected ? colors.text : colors.textSecondary,
                      fontFamily: isSelected ? 'Inter_600SemiBold' : 'Inter_400Regular',
                    }}
                  >
                    {option.label}
                  </Body>
                  <Supporting size="small" tone="muted">
                    {option.count.toLocaleString()}
                  </Supporting>
                </View>
                <View style={[
                  styles.radio,
                  { borderColor: isSelected ? colors.text : colors.border },
                ]}>
                  {isSelected && (
                    <View style={[styles.radioInner, { backgroundColor: colors.text }]} />
                  )}
                </View>
              </HapticPressable>
            );
          })}
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          {hasValue && (
            <HapticPressable
              onPress={handleClear}
              style={[styles.clearButton, { borderColor: colors.border }]}
            >
              <ButtonText size="medium" tone="secondary">Clear</ButtonText>
            </HapticPressable>
          )}
          <HapticPressable
            onPress={handleApply}
            style={[styles.applyButton, { backgroundColor: colors.text }]}
          >
            <ButtonText size="medium" style={{ color: colors.background }}>
              Apply{localSelected.length > 0 ? ` (${localSelected.length})` : ''}
            </ButtonText>
          </HapticPressable>
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
    borderRadius: Radius['3xl'],
  },
  handleIndicator: {
    width: 36,
    height: 4,
    borderRadius: Radius.full,
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
    gap: Spacing.xs,
    marginBottom: Spacing.xl,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: Radius.full,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: Radius.full,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  clearButton: {
    flex: 1,
    height: 48,
    borderRadius: Radius.lg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyButton: {
    flex: 2,
    height: 48,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
