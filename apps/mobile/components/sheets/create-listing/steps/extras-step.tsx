/**
 * ExtrasStepContent — Vehicle features/extras
 *
 * Content-only component for the unified flow.
 * Only handles vehicle extras - highlight tags are in a separate step.
 *
 * @module components/sheets/create-listing/steps/extras-step
 */

import React, { useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import * as Haptics from 'expo-haptics';
import { Plus, X } from 'lucide-react-native';

import { Colors, Spacing, Radius, Sizes, Layout } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { Body, Supporting, Label } from '@/components/ui';
import { HapticPressable } from '@/components/ui';
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
          <Label size="small">Vehicle Extras</Label>
          {extras.length > 0 && (
            <Supporting size="small" tone="secondary">
              {extras.length} selected
            </Supporting>
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
                    backgroundColor: isSelected ? colors.text : colors.surface2,
                    borderColor: isSelected ? colors.text : colors.border,
                  },
                ]}
              >
                <Body
                  size="small"
                  style={{ color: isSelected ? colors.bg : colors.text }}
                >
                  {extra.label}
                </Body>
              </HapticPressable>
            );
          })}
        </View>
      </View>

      {/* Custom extras input */}
      <View style={styles.section}>
        <Label size="small">Add Custom Extra</Label>
        <View style={[styles.inputRow, { backgroundColor: colors.fill2 }]}>
          <BottomSheetTextInput
            style={[styles.input, { color: colors.text }]}
            placeholder="e.g. Custom exhaust..."
            placeholderTextColor={colors.textMuted}
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
            <Plus size={Sizes.iconSm} color={customExtra.trim() ? colors.primaryFg : colors.textMuted} strokeWidth={2} />
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
                  style={[styles.customChip, { backgroundColor: colors.text }]}
                >
                  <Body size="small" style={{ color: colors.bg }}>
                    {extra}
                  </Body>
                  <HapticPressable onPress={() => toggleExtra(extra)} hitSlop={Layout.hitSlopSmall}>
                    <X size={14} color={colors.bg} strokeWidth={2} />
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
    fontSize: 15,
    fontWeight: '400',
    paddingVertical: Spacing.md,
  },
  addButton: {
    width: 40,
    height: 40,
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
