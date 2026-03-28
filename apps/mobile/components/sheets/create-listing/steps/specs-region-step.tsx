/**
 * SpecsRegionStepContent — Regional specs and steering side
 *
 * Content-only component for the unified flow.
 *
 * @module components/sheets/create-listing/steps/specs-region-step
 */

import React, { useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';

import { Colors, Spacing, Radius } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { Body, Supporting, Label } from '@/components/ui';
import { HapticPressable } from '@/components/ui';
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
        <Label size="caption">Regional Specs</Label>
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
                    backgroundColor: isSelected ? colors.text : colors.surface2,
                    borderColor: isSelected ? colors.text : colors.border,
                  },
                ]}
              >
                <Body
                  size="bodySm"
                  style={{ color: isSelected ? colors.bg : colors.text }}
                >
                  {spec.label}
                </Body>
              </HapticPressable>
            );
          })}
        </View>
      </View>

      {/* Steering Side */}
      <View style={styles.section}>
        <Label size="caption">Steering Side</Label>
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
                    backgroundColor: isSelected ? colors.text : colors.surface2,
                    borderColor: isSelected ? colors.text : colors.border,
                  },
                ]}
              >
                <Body
                  size="bodySm"
                  style={{ color: isSelected ? colors.bg : colors.text }}
                >
                  {side.label}
                </Body>
              </HapticPressable>
            );
          })}
        </View>
      </View>

      {/* Summary */}
      <View style={[styles.summaryBox, { backgroundColor: colors.fill2 }]}>
        <Supporting size="bodySm" tone="muted">
          {SPECS_TYPES.find((s) => s.value === data.specs)?.label ?? 'GCC'} specs
          {' · '}
          {STEERING_SIDES.find((s) => s.value === data.steeringSide)?.label ?? 'Left'}-hand drive
        </Supporting>
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
