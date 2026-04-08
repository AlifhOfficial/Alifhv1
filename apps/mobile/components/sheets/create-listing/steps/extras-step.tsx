/**
 * ExtrasStepContent — Vehicle features/extras
 *
 * Content-only component for the unified flow.
 * Only handles vehicle extras - highlight tags are in a separate step.
 *
 * @module components/sheets/create-listing/steps/extras-step
 */

import { Text, HapticPressable } from '@/components/ui';
import React, { useState, useCallback } from 'react';
import { View, StyleSheet, TextInput } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Plus, X } from 'lucide-react-native';

import { InputTypography, Colors, Spacing, Radius, Sizes, Layout, SheetTypography } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { VEHICLE_EXTRAS } from '@/lib/filter-constants';

import { StepContainer } from '../step-container';
import type { StepContentProps } from '../types';

// ─────────────────────────────────────────────────────────────────────────────

export function ExtrasStepContent({ data, onUpdate }: StepContentProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const [customExtra, setCustomExtra] = useState('');

  const toggleExtra = useCallback(
    (value: string) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const current = data.extras || [];
      if (current.includes(value)) {
        onUpdate({ extras: current.filter((v) => v !== value) });
      } else {
        onUpdate({ extras: [...current, value] });
      }
    },
    [data.extras, onUpdate]
  );

  const addCustomExtra = useCallback(() => {
    const trimmed = customExtra.trim();
    if (!trimmed) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const current = data.extras || [];
    if (!current.includes(trimmed)) {
      onUpdate({ extras: [...current, trimmed] });
    }
    setCustomExtra('');
  }, [customExtra, data.extras, onUpdate]);

  const extras = data.extras || [];

  return (
    <StepContainer>
      <View style={styles.section}>
        <Text variant={SheetTypography.rowLabel} tone="secondary">Add custom</Text>
        <View style={[styles.inputRow, { backgroundColor: colors.surfaceSecondary }]}> 
          <TextInput
            style={[styles.input, { color: colors.label }]}
            placeholder="Add a custom feature"
            placeholderTextColor={colors.labelQuaternary}
            value={customExtra}
            onChangeText={setCustomExtra}
            onSubmitEditing={addCustomExtra}
            returnKeyType="done"
          />
          <HapticPressable
            onPress={addCustomExtra}
            disabled={!customExtra.trim()}
            style={[
              styles.addButton,
              { backgroundColor: customExtra.trim() ? colors.label : colors.fill2 },
            ]}
          >
            <Plus size={Sizes.iconSm} color={customExtra.trim() ? colors.background : colors.labelQuaternary} strokeWidth={2} />
          </HapticPressable>
        </View>

        {/* Custom extras list */}
        {extras.filter((e) => !VEHICLE_EXTRAS.some((v) => v.value === e)).length > 0 && (
          <View style={styles.customList}>
            {extras
              .filter((e) => !VEHICLE_EXTRAS.some((v) => v.value === e))
              .map((extra) => (
                <View
                  key={extra}
                  style={[styles.customChip, { backgroundColor: colors.label }]}
                >
                  <Text variant={SheetTypography.rowLabel} style={{ color: colors.background }}>
                    {extra}
                  </Text>
                  <HapticPressable onPress={() => toggleExtra(extra)} hitSlop={Layout.hitSlopSmall}>
                    <X size={14} color={colors.background} strokeWidth={2} />
                  </HapticPressable>
                </View>
              ))}
          </View>
        )}
      </View>

      <View style={styles.section}>
        {extras.length > 0 && (
          <Text variant={SheetTypography.supporting} tone="muted">
            {extras.length} selected
          </Text>
        )}

        <View style={styles.chipWrap}>
          {VEHICLE_EXTRAS.map((extra) => {
            const isSelected = extras.includes(extra.value);
            return (
              <HapticPressable
                key={extra.value}
                onPress={() => toggleExtra(extra.value)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: isSelected ? colors.label : colors.surfaceSecondary,
                    borderColor: isSelected ? colors.label : colors.border,
                  },
                ]}
              >
                <Text
                  variant={isSelected ? SheetTypography.rowLabelSelected : SheetTypography.rowLabel}
                  style={{ color: isSelected ? colors.background : colors.label }}
                >
                  {extra.label}
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.xl,
    paddingLeft: Spacing.md,
    gap: Spacing.sm,
    height: Sizes.actionButtonLg,
  },
  input: {
    flex: 1,
    ...InputTypography,
    paddingVertical: Spacing.none,
  },
  addButton: {
    width: Sizes.actionButtonLg,
    height: Sizes.actionButtonLg,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.xs,
  },
  customList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  customChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingLeft: Spacing.md,
    paddingRight: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
  },
});

export default ExtrasStepContent;
