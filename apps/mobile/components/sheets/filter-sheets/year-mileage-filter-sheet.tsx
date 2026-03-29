/**
 * YearMileageFilterSheet - Bottom Sheet for year and mileage filters
 * Uses @gorhom/bottom-sheet modal for proper iOS gesture handling
 */

import { Text, HapticPressable } from '@/components/ui';
import React, { useCallback, useMemo, useRef, useEffect, useState } from 'react';
import { View, StyleSheet, TextInput, Platform } from 'react-native';
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';

import { Fonts, Typography, Colors, Spacing, Radius, Sizes, Layout } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';

const MILEAGE_PRESETS = [
  { label: 'Under 20K', max: 20000 },
  { label: 'Under 50K', max: 50000 },
  { label: 'Under 100K', max: 100000 },
];

interface YearMileageFilterSheetProps {
  visible: boolean;
  onClose: () => void;
  yearMin?: number;
  yearMax?: number;
  mileageMin?: number;
  mileageMax?: number;
  onApply: (filters: {
    yearMin?: number;
    yearMax?: number;
    mileageMin?: number;
    mileageMax?: number;
  }) => void;
}

export function YearMileageFilterSheet({ 
  visible, 
  onClose, 
  yearMin,
  yearMax,
  mileageMin,
  mileageMax,
  onApply,
}: YearMileageFilterSheetProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const bottomSheetRef = useRef<BottomSheetModal>(null);

  // Local state for inputs
  const [localYearMin, setLocalYearMin] = useState<string>(yearMin?.toString() ?? '');
  const [localYearMax, setLocalYearMax] = useState<string>(yearMax?.toString() ?? '');
  const [localMileageMin, setLocalMileageMin] = useState<string>(mileageMin?.toString() ?? '');
  const [localMileageMax, setLocalMileageMax] = useState<string>(mileageMax?.toString() ?? '');

  // Sync with props when sheet opens
  useEffect(() => {
    if (visible) {
      setLocalYearMin(yearMin?.toString() ?? '');
      setLocalYearMax(yearMax?.toString() ?? '');
      setLocalMileageMin(mileageMin?.toString() ?? '');
      setLocalMileageMax(mileageMax?.toString() ?? '');
    }
  }, [visible, yearMin, yearMax, mileageMin, mileageMax]);

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

  const handleMileagePresetSelect = useCallback((preset: typeof MILEAGE_PRESETS[0]) => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    const currentMax = localMileageMax ? parseInt(localMileageMax) : undefined;
    if (currentMax === preset.max) {
      setLocalMileageMax('');
    } else {
      setLocalMileageMax(preset.max.toString());
    }
  }, [localMileageMax]);

  const handleApply = useCallback(() => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onApply({
      yearMin: localYearMin ? parseInt(localYearMin) : undefined,
      yearMax: localYearMax ? parseInt(localYearMax) : undefined,
      mileageMin: localMileageMin ? parseInt(localMileageMin) : undefined,
      mileageMax: localMileageMax ? parseInt(localMileageMax) : undefined,
    });
    bottomSheetRef.current?.dismiss();
  }, [localYearMin, localYearMax, localMileageMin, localMileageMax, onApply]);

  const handleClear = useCallback(() => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setLocalYearMin('');
    setLocalYearMax('');
    setLocalMileageMin('');
    setLocalMileageMax('');
    onApply({
      yearMin: undefined,
      yearMax: undefined,
      mileageMin: undefined,
      mileageMax: undefined,
    });
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

  const hasValue = localYearMin || localYearMax || localMileageMin || localMileageMax;

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
          
          <Text variant="headline">Year & Mileage</Text>
          
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
              {[localYearMin && `From ${localYearMin}`, localYearMax && `To ${localYearMax}`, localMileageMax && `Under ${parseInt(localMileageMax).toLocaleString()} km`].filter(Boolean).join(' · ')}
            </Text>
            <HapticPressable onPress={handleClear} hitSlop={Layout.hitSlopSmall}>
              <Text variant="subhead" style={{ color: colors.error }} tone="secondary">
                Clear
              </Text>
            </HapticPressable>
          </View>
        )}
      </View>

      <BottomSheetScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Year Section */}
        <View style={styles.section}>
          <Text variant="caption1Emphasized" tone="muted" style={{ marginBottom: Spacing.md }} uppercase>
            YEAR
          </Text>
          <View style={styles.rangeRow}>
            <View style={styles.inputWrapper}>
              <TextInput
                style={[
                  styles.input,
                  { 
                    backgroundColor: colors.surfaceSecondary,
                    borderColor: colors.border,
                    color: colors.label,
                  },
                ]}
                placeholder="Min"
                placeholderTextColor={colors.labelTertiary}
                keyboardType="number-pad"
                value={localYearMin}
                onChangeText={setLocalYearMin}
                maxLength={4}
              />
            </View>
            <Text variant="body" tone="muted" style={styles.rangeDash}>–</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={[
                  styles.input,
                  { 
                    backgroundColor: colors.surfaceSecondary,
                    borderColor: colors.border,
                    color: colors.label,
                  },
                ]}
                placeholder="Max"
                placeholderTextColor={colors.labelTertiary}
                keyboardType="number-pad"
                value={localYearMax}
                onChangeText={setLocalYearMax}
                maxLength={4}
              />
            </View>
          </View>
        </View>

        {/* Mileage Section */}
        <View style={styles.section}>
          <Text variant="caption1Emphasized" tone="muted" style={{ marginBottom: Spacing.md }} uppercase>
            MILEAGE
          </Text>
          
          {/* Presets */}
          <View style={styles.presetsRow}>
            {MILEAGE_PRESETS.map((preset) => {
              const currentMax = localMileageMax ? parseInt(localMileageMax) : undefined;
              const isActive = currentMax === preset.max;

              return (
                <HapticPressable
                  key={preset.label}
                  onPress={() => handleMileagePresetSelect(preset)}
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

          {/* Range inputs */}
          <View style={styles.rangeRow}>
            <View style={styles.inputWrapper}>
              <TextInput
                style={[
                  styles.input,
                  { 
                    backgroundColor: colors.surfaceSecondary,
                    borderColor: colors.border,
                    color: colors.label,
                  },
                ]}
                placeholder="Min"
                placeholderTextColor={colors.labelTertiary}
                keyboardType="number-pad"
                value={localMileageMin}
                onChangeText={setLocalMileageMin}
              />
            </View>
            <Text variant="body" tone="muted" style={styles.rangeDash}>–</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={[
                  styles.input,
                  { 
                    backgroundColor: colors.surfaceSecondary,
                    borderColor: colors.border,
                    color: colors.label,
                  },
                ]}
                placeholder="Max"
                placeholderTextColor={colors.labelTertiary}
                keyboardType="number-pad"
                value={localMileageMax}
                onChangeText={setLocalMileageMax}
              />
            </View>
          </View>
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
  section: {
    marginBottom: Spacing.xl,
  },
  presetsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  presetChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  rangeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
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
  },
  applyButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.full,
  },
});
