/**
 * MileageStepContent — Enter vehicle mileage
 *
 * Content-only component for the unified flow.
 *
 * @module components/sheets/create-listing/steps/mileage-step
 */

import React, { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import * as Haptics from 'expo-haptics';

import { Colors, Spacing, Radius, Layout } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { Body, Supporting, Data } from '@/components/ui';
import { HapticPressable } from '@/components/ui';

import { StepContainer } from '../step-container';
import type { StepContentProps } from '../create-listing-flow';

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
  const [localMileage, setLocalMileage] = useState(data.mileage || '');

  useEffect(() => {
    setLocalMileage(data.mileage || '');
  }, [data.mileage]);

  const handleChange = useCallback(
    (text: string) => {
      const cleaned = text.replace(/[^0-9]/g, '');
      setLocalMileage(cleaned);
      onUpdate({ mileage: cleaned });
    },
    [onUpdate]
  );

  const handlePreset = useCallback(
    (value: string) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setLocalMileage(value);
      onUpdate({ mileage: value });
    },
    [onUpdate]
  );

  const mileageNum = parseInt(localMileage, 10) || 0;
  const isLowMileage = mileageNum > 0 && mileageNum < 5000;

  return (
    <StepContainer>
      {/* Input */}
      <View
        style={[
          styles.inputBox,
          { backgroundColor: colors.fill2, borderColor: colors.border },
        ]}
      >
        <BottomSheetTextInput
          style={[styles.input, { color: colors.text }]}
          placeholder="Enter mileage"
          placeholderTextColor={colors.textMuted}
          value={localMileage}
          onChangeText={handleChange}
          keyboardType="number-pad"
          returnKeyType="done"
        />
        <Body size="medium" tone="secondary">km</Body>
      </View>

      {/* Formatted display */}
      {localMileage && (
        <View style={styles.formattedRow}>
          <Data size="large" style={{ color: colors.text }}>
            {mileageNum.toLocaleString()} km
          </Data>
          {isLowMileage && (
            <View style={[styles.badge, { backgroundColor: (colors.success ?? '#10B981') + '20' }]}>
              <Supporting size="small" style={{ color: colors.success ?? '#10B981' }}>
                Low mileage
              </Supporting>
            </View>
          )}
        </View>
      )}

      {/* Quick presets */}
      <View style={styles.section}>
        <Supporting size="small" tone="muted">Quick select</Supporting>
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
                    backgroundColor: isActive ? colors.text : colors.surface2,
                    borderColor: isActive ? colors.text : colors.border,
                  },
                ]}
              >
                <Body size="small" style={{ color: isActive ? colors.bg : colors.text }}>
                  {preset.label}
                </Body>
              </HapticPressable>
            );
          })}
        </View>
      </View>

      {/* Info */}
      <View style={[styles.infoBox, { backgroundColor: colors.fill2 }]}>
        <Supporting size="small" tone="muted">
          Odometer reading in kilometers. Vehicles under 5,000 km are marked as "new condition".
        </Supporting>
      </View>
    </StepContainer>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderRadius: Radius.lg,
    height: Layout.hitTarget,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    paddingVertical: 0,
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
    padding: Spacing.md,
    borderRadius: Radius.lg,
    marginTop: Spacing.xl,
  },
});

export default MileageStepContent;
