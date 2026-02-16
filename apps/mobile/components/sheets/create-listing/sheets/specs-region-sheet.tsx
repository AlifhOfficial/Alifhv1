/**
 * SpecsRegionSheet — Regional specs and steering side
 *
 * Quick chip selection for GCC/American/European specs
 * and left/right-hand drive.
 *
 * @module components/sheets/create-listing/sheets/specs-region-sheet
 */

import React, { useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Globe2, Car } from 'lucide-react-native';

import { Colors, Spacing, Radius, Sizes } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { Body, Supporting, Label } from '@/components/ui';
import { HapticPressable } from '@/components/ui';
import { SPECS_TYPES, STEERING_SIDES } from '@/lib/filter-constants';

import { CreateFlowSheet, CreateFlowScrollContent } from '../base-sheet';
import type { SheetStepProps } from '../types';
import { getProgress, SHEET_STEPS } from '../types';

// ─────────────────────────────────────────────────────────────────────────────

export function SpecsRegionSheet({
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

  const stepIndex = SHEET_STEPS.findIndex((s) => s.id === 'specs-region');
  const progress = getProgress(stepIndex + 1);

  return (
    <CreateFlowSheet
      visible={visible}
      onClose={onClose}
      title="Specs"
      showBack
      onBack={onBack}
      primaryLabel="Next"
      onPrimary={onNext}
      progress={progress}
    >
      <CreateFlowScrollContent>
        {/* Regional Specs */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Globe2 size={Sizes.iconSm} color={colors.textMuted} strokeWidth={2} />
            <Label size="small">Regional Specs</Label>
          </View>
          <View style={styles.optionsGrid}>
            {SPECS_TYPES.map((spec) => {
              const isSelected = data.specs === spec.value;
              return (
                <HapticPressable
                  key={spec.value}
                  onPress={() => handleSpecsChange(spec.value)}
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
                    style={{
                      color: isSelected ? colors.background : colors.text,
                      fontFamily: isSelected ? 'Inter_600SemiBold' : 'Inter_400Regular',
                    }}
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
          <View style={styles.sectionHeader}>
            <Car size={Sizes.iconSm} color={colors.textMuted} strokeWidth={2} />
            <Label size="small">Steering Side</Label>
          </View>
          <View style={styles.steeringRow}>
            {STEERING_SIDES.map((side) => {
              const isSelected = data.steeringSide === side.value;
              return (
                <HapticPressable
                  key={side.value}
                  onPress={() => handleSteeringChange(side.value)}
                  style={[
                    styles.steeringCard,
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
                    {side.label}
                  </Body>
                </HapticPressable>
              );
            })}
          </View>
        </View>

        {/* Summary */}
        <View style={[styles.summaryBox, { backgroundColor: colors.fillSecondary }]}>
          <Supporting size="small" tone="muted">
            Selected: {SPECS_TYPES.find((s) => s.value === data.specs)?.label ?? 'GCC'} specs
            {' • '}
            {STEERING_SIDES.find((s) => s.value === data.steeringSide)?.label ?? 'Left'}-hand drive
          </Supporting>
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
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  optionCard: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  steeringRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  steeringCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
  },
  summaryBox: {
    padding: Spacing.md,
    borderRadius: Radius.lg,
    alignItems: 'center',
  },
});

export default SpecsRegionSheet;
