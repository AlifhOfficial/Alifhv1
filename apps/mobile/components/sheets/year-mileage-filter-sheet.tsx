/**
 * YearMileageFilterSheet - Bottom Sheet for year and mileage filters
 * Uses @gorhom/bottom-sheet modal for proper iOS gesture handling
 */

import React, { useCallback, useMemo, useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, Platform } from 'react-native';
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';

import { Colors, Spacing, Radius, Typography } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { Heading, Label } from '@/components/ui';

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
      enablePanDownToClose
      onChange={handleSheetChanges}
      backdropComponent={renderBackdrop}
      backgroundStyle={[styles.background, { backgroundColor: colors.surface }]}
      handleIndicatorStyle={[styles.handleIndicator, { backgroundColor: colors.border }]}
      stackBehavior="push"
      detached
      bottomInset={insets.bottom + 20}
      style={styles.sheetContainer}
    >
      <BottomSheetScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Heading size="large" style={{ color: colors.text }}>Year & Mileage</Heading>
          <Pressable 
            onPress={onClose} 
            hitSlop={Spacing.md}
            style={({ pressed }) => [
              styles.closeButton,
              { backgroundColor: pressed ? colors.surfacePressed : colors.surface }
            ]}
          >
            <Ionicons name="close" size={18} color={colors.icon} />
          </Pressable>
        </View>

        {/* Year Section */}
        <View style={styles.section}>
          <Label size="small" style={{ color: colors.textSecondary, marginBottom: Spacing.md }}>
            YEAR
          </Label>
          <View style={styles.rangeRow}>
            <View style={styles.inputWrapper}>
              <TextInput
                style={[
                  styles.input,
                  { 
                    backgroundColor: colors.surfaceSecondary,
                    borderColor: colors.border,
                    color: colors.text,
                  },
                ]}
                placeholder="Min"
                placeholderTextColor={colors.textTertiary}
                keyboardType="number-pad"
                value={localYearMin}
                onChangeText={setLocalYearMin}
                maxLength={4}
              />
            </View>
            <Text style={[styles.rangeDash, { color: colors.textTertiary }]}>–</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={[
                  styles.input,
                  { 
                    backgroundColor: colors.surfaceSecondary,
                    borderColor: colors.border,
                    color: colors.text,
                  },
                ]}
                placeholder="Max"
                placeholderTextColor={colors.textTertiary}
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
          <Label size="small" style={{ color: colors.textSecondary, marginBottom: Spacing.md }}>
            MILEAGE
          </Label>
          
          {/* Presets */}
          <View style={styles.presetsRow}>
            {MILEAGE_PRESETS.map((preset) => {
              const currentMax = localMileageMax ? parseInt(localMileageMax) : undefined;
              const isActive = currentMax === preset.max;

              return (
                <Pressable
                  key={preset.label}
                  onPress={() => handleMileagePresetSelect(preset)}
                  style={[
                    styles.presetChip,
                    { 
                      backgroundColor: isActive ? colors.text : colors.surfaceSecondary,
                      borderColor: isActive ? colors.text : colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.presetLabel,
                      { color: isActive ? colors.background : colors.textSecondary },
                    ]}
                  >
                    {preset.label}
                  </Text>
                </Pressable>
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
                    color: colors.text,
                  },
                ]}
                placeholder="Min"
                placeholderTextColor={colors.textTertiary}
                keyboardType="number-pad"
                value={localMileageMin}
                onChangeText={setLocalMileageMin}
              />
            </View>
            <Text style={[styles.rangeDash, { color: colors.textTertiary }]}>–</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={[
                  styles.input,
                  { 
                    backgroundColor: colors.surfaceSecondary,
                    borderColor: colors.border,
                    color: colors.text,
                  },
                ]}
                placeholder="Max"
                placeholderTextColor={colors.textTertiary}
                keyboardType="number-pad"
                value={localMileageMax}
                onChangeText={setLocalMileageMax}
              />
            </View>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          {hasValue && (
            <Pressable
              onPress={handleClear}
              style={[styles.clearButton, { borderColor: colors.border }]}
            >
              <Text style={[styles.clearButtonText, { color: colors.textSecondary }]}>Clear</Text>
            </Pressable>
          )}
          <Pressable
            onPress={handleApply}
            style={[styles.applyButton, { backgroundColor: colors.text }]}
          >
            <Text style={[styles.applyButtonText, { color: colors.background }]}>Apply</Text>
          </Pressable>
        </View>

        <View style={{ height: insets.bottom + Spacing['3xl'] }} />
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  sheetContainer: {
    marginHorizontal: 16,
  },
  background: {
    borderRadius: 24,
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
  presetLabel: {
    ...Typography.chip,
    fontFamily: 'Inter_500Medium',
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
    height: 48,
    borderRadius: Radius.lg,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    ...Typography.bodyLarge,
    fontFamily: 'Inter_500Medium',
  },
  rangeDash: {
    ...Typography.bodyLarge,
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
  clearButtonText: {
    ...Typography.bodyLarge,
    fontFamily: 'Inter_600SemiBold',
  },
  applyButton: {
    flex: 2,
    height: 48,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyButtonText: {
    ...Typography.bodyLarge,
    fontFamily: 'Inter_600SemiBold',
  },
});
