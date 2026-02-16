/**
 * PowertrainSheet — Engine, transmission, and fuel
 *
 * Chip selectors for transmission, fuel type, engine size.
 *
 * @module components/sheets/create-listing/sheets/powertrain-sheet
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

import { CreateFlowSheet, CreateFlowScrollContent } from '../create-flow-sheet';
import type { SheetStepProps } from '../types';
import { getProgress, SHEET_STEPS } from '../types';

// ─────────────────────────────────────────────────────────────────────────────

export function PowertrainSheet({
  visible,
  data,
  onUpdate,
  onNext,
  onSkip,
  onBack,
  onClose,
}: SheetStepProps) {
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

  const stepIndex = SHEET_STEPS.findIndex((s) => s.id === 'powertrain');
  const progress = getProgress(stepIndex + 1);

  const hasAnySelection = data.transmission || data.fuelType || data.engineSize;

  return (
    <CreateFlowSheet
      visible={visible}
      onClose={onClose}
      title="Powertrain"
      showBack
      onBack={onBack}
      primaryLabel={hasAnySelection ? 'Next' : 'Skip'}
      onPrimary={hasAnySelection ? onNext : onSkip}
      progress={progress}
    >
      <CreateFlowScrollContent>
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
      </CreateFlowScrollContent>
    </CreateFlowSheet>
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

export default PowertrainSheet;
