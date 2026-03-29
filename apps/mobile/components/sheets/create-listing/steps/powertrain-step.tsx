/**
 * PowertrainStepContent — Engine, transmission, and fuel
 *
 * Content-only component for the unified flow.
 *
 * @module components/sheets/create-listing/steps/powertrain-step
 */

import { Text, HapticPressable } from '@/components/ui';
import React, { useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';

import { Colors, Spacing, Radius } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { TRANSMISSION_TYPES, FUEL_TYPES, ENGINE_SIZES } from '@/lib/filter-constants';

import { StepContainer } from '../step-container';
import type { StepContentProps } from '../create-listing-flow';

// ─────────────────────────────────────────────────────────────────────────────

export function PowertrainStepContent({ data, onUpdate }: StepContentProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];

  const handleTransmission = useCallback(
    (value: string) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onUpdate({ transmission: data.transmission === value ? '' : value });
    },
    [data.transmission, onUpdate]
  );

  const handleFuelType = useCallback(
    (value: string) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onUpdate({ fuelType: data.fuelType === value ? '' : value });
    },
    [data.fuelType, onUpdate]
  );

  const handleEngineSize = useCallback(
    (value: string) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onUpdate({ engineSize: data.engineSize === value ? '' : value });
    },
    [data.engineSize, onUpdate]
  );

  return (
    <StepContainer>
      {/* Transmission */}
      <View style={styles.section}>
        <Text variant="caption" uppercase>Transmission</Text>
        <View style={styles.chipWrap}>
          {TRANSMISSION_TYPES.map((type) => {
            const isSelected = data.transmission === type.value;
            return (
              <HapticPressable
                key={type.value}
                onPress={() => handleTransmission(type.value)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: isSelected ? colors.label : colors.surfaceSecondary,
                    borderColor: isSelected ? colors.label : colors.border,
                  },
                ]}
              >
                <Text
                  variant="bodySm"
                  style={{ color: isSelected ? colors.background : colors.label }}
                >
                  {type.label}
                </Text>
              </HapticPressable>
            );
          })}
        </View>
      </View>

      {/* Fuel Type */}
      <View style={styles.section}>
        <Text variant="caption" uppercase>Fuel Type</Text>
        <View style={styles.chipWrap}>
          {FUEL_TYPES.map((fuel) => {
            const isSelected = data.fuelType === fuel.value;
            return (
              <HapticPressable
                key={fuel.value}
                onPress={() => handleFuelType(fuel.value)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: isSelected ? colors.label : colors.surfaceSecondary,
                    borderColor: isSelected ? colors.label : colors.border,
                  },
                ]}
              >
                <Text
                  variant="bodySm"
                  style={{ color: isSelected ? colors.background : colors.label }}
                >
                  {fuel.label}
                </Text>
              </HapticPressable>
            );
          })}
        </View>
      </View>

      {/* Engine Size */}
      <View style={styles.section}>
        <Text variant="caption" uppercase>Engine Size</Text>
        <View style={styles.chipWrap}>
          {ENGINE_SIZES.map((size) => {
            const isSelected = data.engineSize === size.value;
            return (
              <HapticPressable
                key={size.value}
                onPress={() => handleEngineSize(size.value)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: isSelected ? colors.label : colors.surfaceSecondary,
                    borderColor: isSelected ? colors.label : colors.border,
                  },
                ]}
              >
                <Text
                  variant="bodySm"
                  style={{ color: isSelected ? colors.background : colors.label }}
                >
                  {size.label}
                </Text>
              </HapticPressable>
            );
          })}
        </View>
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
});

export default PowertrainStepContent;
