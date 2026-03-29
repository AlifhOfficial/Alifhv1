/**
 * SpecsRegionStepContent — Regional specs and steering side
 *
 * Content-only component for the unified flow.
 *
 * @module components/sheets/create-listing/steps/specs-region-step
 */

import { Text, HapticPressable } from '@/components/ui';
import React, { useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';

import { Colors, Spacing, Radius } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { SPECS_TYPES, STEERING_SIDES } from '@/lib/filter-constants';

import { StepContainer } from '../step-container';
import type { StepContentProps } from '../create-listing-flow';

// ─────────────────────────────────────────────────────────────────────────────

export function SpecsRegionStepContent({ data, onUpdate }: StepContentProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];

  const handleSpecsChange = useCallback(
    (value: string) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onUpdate({ specs: value });
    },
    [onUpdate]
  );

  const handleSteeringChange = useCallback(
    (value: string) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onUpdate({ steeringSide: value });
    },
    [onUpdate]
  );

  return (
    <StepContainer>
      {/* Regional Specs */}
      <View style={styles.section}>
        <Text variant="caption1Emphasized" uppercase>Regional Specs</Text>
        <View style={styles.chipWrap}>
          {SPECS_TYPES.map((spec) => {
            const isSelected = data.specs === spec.value;
            return (
              <HapticPressable
                key={spec.value}
                onPress={() => handleSpecsChange(spec.value)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: isSelected ? colors.label : colors.surfaceSecondary,
                    borderColor: isSelected ? colors.label : colors.border,
                  },
                ]}
              >
                <Text
                  variant="subhead"
                  style={{ color: isSelected ? colors.background : colors.label }}
                >
                  {spec.label}
                </Text>
              </HapticPressable>
            );
          })}
        </View>
      </View>

      {/* Steering Side */}
      <View style={styles.section}>
        <Text variant="caption1Emphasized" uppercase>Steering Side</Text>
        <View style={styles.chipWrap}>
          {STEERING_SIDES.map((side) => {
            const isSelected = data.steeringSide === side.value;
            return (
              <HapticPressable
                key={side.value}
                onPress={() => handleSteeringChange(side.value)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: isSelected ? colors.label : colors.surfaceSecondary,
                    borderColor: isSelected ? colors.label : colors.border,
                  },
                ]}
              >
                <Text
                  variant="subhead"
                  style={{ color: isSelected ? colors.background : colors.label }}
                >
                  {side.label}
                </Text>
              </HapticPressable>
            );
          })}
        </View>
      </View>

      {/* Summary */}
      <View style={[styles.summaryBox, { backgroundColor: colors.fill2 }]}>
        <Text variant="subhead" tone="muted">
          {SPECS_TYPES.find((s) => s.value === data.specs)?.label ?? 'GCC'} specs
          {' · '}
          {STEERING_SIDES.find((s) => s.value === data.steeringSide)?.label ?? 'Left'}-hand drive
        </Text>
      </View>
    </StepContainer>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  section: {
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  summaryBox: {
    padding: Spacing.md,
    borderRadius: Radius.lg,
    alignItems: 'center',
  },
});

export default SpecsRegionStepContent;
