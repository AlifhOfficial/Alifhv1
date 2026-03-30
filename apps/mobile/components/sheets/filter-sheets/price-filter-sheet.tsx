/**
 * PriceFilterSheet - Bottom Sheet for price range filter
 * Uses @gorhom/bottom-sheet modal for proper iOS gesture handling
 */

import { Text, HapticPressable } from '@/components/ui';
import React, { useCallback, useMemo, useRef, useEffect, useState } from 'react';
import { View, StyleSheet, TextInput, Platform } from 'react-native';
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';

import { Fonts, Typography, Colors, Spacing, Radius, Sizes, Layout } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';

const PRICE_PRESETS = [
  { label: 'Under 50K', min: undefined, max: 50000 },
  { label: '50K-100K', min: 50000, max: 100000 },
  { label: '100K-200K', min: 100000, max: 200000 },
  { label: '200K+', min: 200000, max: undefined },
];

interface PriceFilterSheetProps {
  visible: boolean;
  onClose: () => void;
  priceMin?: number;
  priceMax?: number;
  onApply: (priceMin?: number, priceMax?: number) => void;
}

export function PriceFilterSheet({ 
  visible, 
  onClose, 
  priceMin,
  priceMax,
  onApply,
}: PriceFilterSheetProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const bottomSheetRef = useRef<BottomSheetModal>(null);

  // Local state for inputs
  const [localMin, setLocalMin] = useState<string>(priceMin?.toString() ?? '');
  const [localMax, setLocalMax] = useState<string>(priceMax?.toString() ?? '');

  // Sync with props when sheet opens
  useEffect(() => {
    if (visible) {
      setLocalMin(priceMin?.toString() ?? '');
      setLocalMax(priceMax?.toString() ?? '');
    }
  }, [visible, priceMin, priceMax]);

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

  const handlePresetSelect = useCallback((preset: typeof PRICE_PRESETS[0]) => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    // Toggle off if already selected
    const isActive = 
      (preset.min === (localMin ? parseInt(localMin) : undefined)) &&
      (preset.max === (localMax ? parseInt(localMax) : undefined));
    
    if (isActive) {
      setLocalMin('');
      setLocalMax('');
    } else {
      setLocalMin(preset.min?.toString() ?? '');
      setLocalMax(preset.max?.toString() ?? '');
    }
  }, [localMin, localMax]);

  const handleApply = useCallback(() => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    const min = localMin ? parseInt(localMin) : undefined;
    const max = localMax ? parseInt(localMax) : undefined;
    onApply(min, max);
    bottomSheetRef.current?.dismiss();
  }, [localMin, localMax, onApply]);

  const handleClear = useCallback(() => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setLocalMin('');
    setLocalMax('');
    onApply(undefined, undefined);
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

  const hasValue = localMin || localMax;

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
      stackBehavior="push"
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
              <Text variant="body" tone="secondary">Cancel</Text>
            </HapticPressable>
            
            <Text variant="headline">Price</Text>
            
            <HapticPressable
              style={[
                styles.applyButton,
                { backgroundColor: hasValue ? colors.primary : colors.fill2 },
              ]}
              onPress={handleApply}
            >
              <Text
                variant="subhead"
                style={{ color: hasValue ? colors.primaryForeground : colors.labelQuaternary }}
              >
                Apply
              </Text>
            </HapticPressable>
          </View>

          {/* Selection Summary */}
          {hasValue && (
            <View style={styles.selectionSummary}>
              <Text variant="subhead" numberOfLines={1} style={{ flex: 1 }}>
                {localMin && localMax ? `AED ${parseInt(localMin).toLocaleString()} - ${parseInt(localMax).toLocaleString()}` : localMin ? `From AED ${parseInt(localMin).toLocaleString()}` : `Up to AED ${parseInt(localMax).toLocaleString()}`}
              </Text>
              <HapticPressable onPress={handleClear} hitSlop={Layout.hitSlopSmall}>
                <Text variant="subhead" style={{ color: colors.error }} tone="secondary">
                  Clear
                </Text>
              </HapticPressable>
            </View>
          )}
        </View>

        {/* Presets */}
        <View style={styles.presetsRow}>
          {PRICE_PRESETS.map((preset) => {
            const isActive = 
              (preset.min === (localMin ? parseInt(localMin) : undefined)) &&
              (preset.max === (localMax ? parseInt(localMax) : undefined));

            return (
              <HapticPressable
                key={preset.label}
                onPress={() => handlePresetSelect(preset)}
                style={[
                  styles.presetChip,
                  { 
                    backgroundColor: isActive ? colors.label : colors.surfaceSecondary,
                    borderColor: isActive ? colors.label : colors.border,
                  },
                ]}
              >
                <Text
                  variant="subhead"
                  style={{ color: isActive ? colors.background : colors.labelSecondary }}
                 tone="secondary">
                  {preset.label}
                </Text>
              </HapticPressable>
            );
          })}
        </View>

        {/* Range Inputs */}
        <View style={styles.rangeRow}>
          <View style={styles.inputWrapper}>
            <Text variant="caption1Emphasized" style={{ color: colors.labelSecondary, marginBottom: Spacing.xs }} uppercase>
              MIN
            </Text>
            <TextInput
              style={[
                styles.input,
                { 
                  backgroundColor: colors.surfaceSecondary,
                  borderColor: colors.border,
                  color: colors.label,
                },
              ]}
              placeholder="0"
              placeholderTextColor={colors.labelTertiary}
              keyboardType="number-pad"
              value={localMin}
              onChangeText={setLocalMin}
            />
          </View>
          <Text variant="body" tone="muted" style={styles.rangeDash}>–</Text>
          <View style={styles.inputWrapper}>
            <Text variant="caption1Emphasized" style={{ color: colors.labelSecondary, marginBottom: Spacing.xs }} uppercase>
              MAX
            </Text>
            <TextInput
              style={[
                styles.input,
                { 
                  backgroundColor: colors.surfaceSecondary,
                  borderColor: colors.border,
                  color: colors.label,
                },
              ]}
              placeholder="Any"
              placeholderTextColor={colors.labelTertiary}
              keyboardType="number-pad"
              value={localMax}
              onChangeText={setLocalMax}
            />
          </View>
        </View>

        <View style={{ height: insets.bottom + Spacing.xl }} />
      </BottomSheetView>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  sheetContainer: {
    marginHorizontal: Spacing.lg,
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
    paddingBottom: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginBottom: Spacing.md,
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
  selectionSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xs,
    gap: Spacing['2xl'],
    marginTop: Spacing.md,
  },
  presetsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  presetChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  rangeRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  inputWrapper: {
    flex: 1,
  },
  input: {
    height: Spacing['5xl'],
    borderRadius: Radius.lg,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    ...Typography.body,
  },
  rangeDash: {
    marginBottom: Spacing.md,
  },
  applyButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.full,
  },
});
