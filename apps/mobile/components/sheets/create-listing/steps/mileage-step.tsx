/**
 * MileageStepContent — Enter vehicle mileage
 *
 * Content-only component for the unified flow.
 *
 * @module components/sheets/create-listing/steps/mileage-step
 */

import { Text, HapticPressable, TextInput } from '@/components/ui';
import React, { useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';

import { InputTypography, Colors, Spacing, Radius, Sizes, SheetTypography } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';

import { StepContainer } from '../step-container';
import type { StepContentProps } from '../types';

// ─────────────────────────────────────────────────────────────────────────────

const MILEAGE_PRESETS = [
  { label: 'Under 10K', value: '10000' },
  { label: '~30K', value: '30000' },
  { label: '~50K', value: '50000' },
  { label: '~80K', value: '80000' },
  { label: '~100K', value: '100000' },
  { label: '150K+', value: '150000' },
];

// ─────────────────────────────────────────────────────────────────────────────

export function MileageStepContent({ data, onUpdate }: StepContentProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const localMileage = data.mileage || '';

  const handleChange = useCallback(
    (text: string) => {
      const cleaned = text.replace(/[^0-9]/g, '');
      onUpdate({ mileage: cleaned });
    },
    [onUpdate]
  );

  const handlePreset = useCallback(
    (value: string) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onUpdate({ mileage: value });
    },
    [onUpdate]
  );

  const mileageNum = parseInt(localMileage, 10) || 0;
  const isLowMileage = mileageNum > 0 && mileageNum < 5000;

  return (
    <StepContainer>
      <View style={styles.sectionHeader}>
        <Text variant={SheetTypography.rowLabel} tone="secondary">
          Odometer
        </Text>
        <Text variant={SheetTypography.supporting} tone="muted">
          In kilometers
        </Text>
      </View>

      {/* Input */}
      <View
        style={[
          styles.inputBox,
          { backgroundColor: colors.surfaceSecondary },
        ]}
      >
        <TextInput
          style={[styles.input, { color: colors.label }]}
          placeholder="Enter mileage (km)"
          placeholderTextColor={colors.labelQuaternary}
          value={localMileage}
          onChangeText={handleChange}
          keyboardType="number-pad"
          returnKeyType="done"
        />
        <Text variant={SheetTypography.supporting} tone="muted">km</Text>
      </View>

      {/* Formatted display */}
      {localMileage && (
        <View style={styles.formattedRow}>
          <Text variant={SheetTypography.rowLabelSelected} style={{ color: colors.label }}>
            {mileageNum.toLocaleString()} km
          </Text>
          {isLowMileage && (
            <View style={[styles.badge, { backgroundColor: colors.successMuted }]}>
              <Text variant={SheetTypography.supporting} style={{ color: colors.success }} tone="secondary">
                Low mileage
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Quick presets */}
      <View style={styles.section}>
        <Text variant={SheetTypography.rowLabel} tone="secondary">Quick select</Text>
        <View style={styles.presetsRow}>
          {MILEAGE_PRESETS.map((preset) => {
            const isActive = preset.value === localMileage;
            return (
              <HapticPressable
                key={preset.value}
                onPress={() => handlePreset(preset.value)}
                style={[
                  styles.presetChip,
                  {
                    backgroundColor: isActive ? colors.label : colors.surfaceSecondary,
                    borderColor: isActive ? colors.label : colors.border,
                  },
                ]}
              >
                <Text variant={isActive ? SheetTypography.rowLabelSelected : SheetTypography.rowLabel} style={{ color: isActive ? colors.background : colors.label }}>
                  {preset.label}
                </Text>
              </HapticPressable>
            );
          })}
        </View>
      </View>

      {/* Info */}
      <View style={styles.infoBox}>
        <Text variant={SheetTypography.supporting} tone="muted">
          Enter the current odometer reading.
        </Text>
      </View>
    </StepContainer>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  sectionHeader: {
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.xl,
    height: Sizes.actionButtonLg,
  },
  input: {
    flex: 1,
    ...InputTypography,
    paddingVertical: Spacing.none,
  },
  formattedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
  },
  section: {
    gap: Spacing.sm,
    marginTop: Spacing.lg,
  },
  presetsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  presetChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  infoBox: {
    marginTop: Spacing.md,
  },
});

export default MileageStepContent;
