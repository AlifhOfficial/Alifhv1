/**
 * LocationFilterSheet - Bottom Sheet for location/emirate selection
 * Uses @gorhom/bottom-sheet modal for proper iOS gesture handling
 */

import React, { useCallback, useMemo, useRef, useEffect, useState } from 'react';
import { View, StyleSheet, Pressable, Platform } from 'react-native';
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { Check } from 'lucide-react-native';

import { Colors, Spacing, Radius } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { Heading, Body, Supporting, ButtonText } from '@/components/ui';
import type { FacetBucket } from '@/lib/search-api';

interface LocationFilterSheetProps {
  visible: boolean;
  onClose: () => void;
  options: FacetBucket[];
  selected: string[];
  onApply: (selected: string[]) => void;
}

export function LocationFilterSheet({ 
  visible, 
  onClose, 
  options,
  selected,
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

  const snapPoints = useMemo(() => ['70%'], []);

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
          <Heading size="medium" style={{ color: colors.text }}>Location</Heading>
          <Pressable 
            onPress={onClose} 
            hitSlop={Spacing.md}
            style={[
              styles.closeButton,
              { backgroundColor: colors.fillSecondary }
            ]}
          >
            <Ionicons name="close" size={18} color={colors.textSecondary} />
          </Pressable>
        </View>

        {/* Options List */}
        <View style={styles.listContainer}>
          {options.map((option) => {
            const isSelected = localSelected.includes(option.value);

            return (
              <Pressable
                key={option.value}
                onPress={() => handleToggle(option.value)}
                style={[
                  styles.listItem,
                  { 
                    backgroundColor: isSelected 
                      ? colors.surfaceSecondary 
                      : 'transparent',
                  },
                ]}
              >
              <View style={styles.itemRow}>
                  <View style={styles.labelRow}>
                    <Body
                      size="large"
                      style={[
                        styles.optionLabel,
                        { color: isSelected ? colors.text : colors.textSecondary },
                        isSelected && styles.optionLabelSelected
                      ]}
                      numberOfLines={1}
                    >
                      {option.label}
                    </Body>
                    <Supporting size="small">
                      {option.count.toLocaleString()}
                    </Supporting>
                  </View>
                  {/* Checkbox */}
                  <View style={[
                    styles.checkbox,
                    { 
                      borderColor: isSelected ? colors.text : colors.textMuted,
                      backgroundColor: isSelected ? colors.text : 'transparent',
                    },
                  ]}>
                    {isSelected && (
                      <Check size={14} color={colors.surface} strokeWidth={3} />
                    )}
                  </View>
                </View>
              </Pressable>
            );
          })}
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          {hasValue && (
            <Pressable
              onPress={handleClear}
              style={[styles.clearButton, { borderColor: colors.border }]}
            >
              <ButtonText size="medium" tone="secondary">Clear</ButtonText>
            </Pressable>
          )}
          <Pressable
            onPress={handleApply}
            style={[styles.applyButton, { backgroundColor: colors.text }]}
          >
            <ButtonText size="medium" style={{ color: colors.background }}>
              Apply{localSelected.length > 0 ? ` (${localSelected.length})` : ''}
            </ButtonText>
          </Pressable>
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
    marginBottom: Spacing.xl,
  },
  listItem: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.lg,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  optionLabel: {
  },
  optionLabelSelected: {
    fontFamily: 'Inter_500Medium',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.md,
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
