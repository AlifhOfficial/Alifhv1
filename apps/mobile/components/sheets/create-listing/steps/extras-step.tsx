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
import { View, StyleSheet } from 'react-native';
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import * as Haptics from 'expo-haptics';
import { Plus, X } from 'lucide-react-native';

import { Typography, Fonts, Colors, Spacing, Radius, Sizes, Layout } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { VEHICLE_EXTRAS } from '@/lib/filter-constants';

import { StepContainer } from '../step-container';
import type { StepContentProps } from '../create-listing-flow';

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
        <View style={styles.headerRow}>
          <Text variant="caption" uppercase>Vehicle Extras</Text>
          {extras.length > 0 && (
            <Text variant="bodySm" tone="secondary">
              {extras.length} selected
            </Text>
          )}
        </View>

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
                  variant="bodySm"
                  style={{ color: isSelected ? colors.background : colors.label }}
                >
                  {extra.label}
                </Text>
              </HapticPressable>
            );
          })}
        </View>
      </View>

      {/* Custom extras input */}
      <View style={styles.section}>
        <Text variant="caption" uppercase>Add Custom Extra</Text>
        <View style={[styles.inputRow, { backgroundColor: colors.fill2 }]}>
          <BottomSheetTextInput
            style={[styles.input, { color: colors.label }]}
            placeholder="e.g. Custom exhaust..."
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
              { backgroundColor: customExtra.trim() ? colors.primary : colors.fill2 },
            ]}
          >
            <Plus size={Sizes.iconSm} color={customExtra.trim() ? colors.primaryForeground : colors.labelQuaternary} strokeWidth={2} />
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
                  <Text variant="bodySm" style={{ color: colors.background }}>
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
    </StepContainer>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  section: {
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    borderRadius: Radius.lg,
    paddingLeft: Spacing.md,
    gap: Spacing.sm,
  },
  input: {
    flex: 1,
    ...Typography.bodySm,
    paddingVertical: Spacing.md,
  },
  addButton: {
    width: Spacing["4xl"],
    height: Spacing["4xl"],
    borderRadius: Radius.md,
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
