/**
 * PowertrainStepContent — Engine, transmission, and fuel
 *
 * Content-only component for the unified flow.
 *
 * @module components/sheets/create-listing/steps/powertrain-step
 */

import React, { useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Cog, Fuel, Zap } from 'lucide-react-native';

import { Colors, Spacing, Radius, Sizes } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { Body, Label } from '@/components/ui';
import { HapticPressable } from '@/components/ui';
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
        <View style={styles.sectionHeader}>
          <Cog size={Sizes.iconSm} color={colors.textMuted} strokeWidth={2} />
          <Label size="small">Transmission</Label>
        </View>
        <View style={styles.optionRow}>
          {TRANSMISSION_TYPES.map((type) => {
            const isSelected = data.transmission === type.value;
            return (
              <HapticPressable
                key={type.value}
                onPress={() => handleTransmission(type.value)}
                style={[
                  styles.optionCard,
                  {
                    backgroundColor: isSelected ? colors.text : colors.surfaceSecondary,
                    borderColor: isSelected ? colors.text : colors.border,
                  },
                ]}
              >
                <Body
                  size="medium"
                  style={{ color: isSelected ? colors.background : colors.text }}
                >
                  {type.label}
                </Body>
              </HapticPressable>
            );
          })}
        </View>
      </View>

      {/* Fuel Type */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Fuel size={Sizes.iconSm} color={colors.textMuted} strokeWidth={2} />
          <Label size="small">Fuel Type</Label>
        </View>
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
                    backgroundColor: isSelected ? colors.text : colors.surfaceSecondary,
                    borderColor: isSelected ? colors.text : colors.border,
                  },
                ]}
              >
                <Body
                  size="small"
                  style={{ color: isSelected ? colors.background : colors.text }}
                >
                  {fuel.label}
                </Body>
              </HapticPressable>
            );
          })}
        </View>
      </View>

      {/* Engine Size */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Zap size={Sizes.iconSm} color={colors.textMuted} strokeWidth={2} />
          <Label size="small">Engine Size</Label>
        </View>
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
                    backgroundColor: isSelected ? colors.text : colors.surfaceSecondary,
                    borderColor: isSelected ? colors.text : colors.border,
                  },
                ]}
              >
                <Body
                  size="small"
                  style={{ color: isSelected ? colors.background : colors.text }}
                >
                  {size.label}
                </Body>
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
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  optionRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  optionCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
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
