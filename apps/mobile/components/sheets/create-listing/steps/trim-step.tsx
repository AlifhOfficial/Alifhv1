/**
 * TrimStepContent — Enter or select vehicle trim (optional)
 *
 * Content-only component for the unified flow.
 *
 * @module components/sheets/create-listing/steps/trim-step
 */

import { Text, HapticPressable } from '@/components/ui';
import React, { useCallback } from 'react';
import { View, StyleSheet, TextInput } from 'react-native';
import * as Haptics from 'expo-haptics';

import { InputTypography, Colors, Spacing, Radius, Sizes, SheetTypography} from '@/constants/theme';
import { useTheme } from '@/context/theme-context';

import { StepContainer } from '../step-container';
import type { StepContentProps } from '../types';

// ─────────────────────────────────────────────────────────────────────────────

const TRIM_EXAMPLES = ['Sport', 'Luxury', 'Premium', 'Base', 'Limited', 'Platinum', 'SE', 'XLE', 'Other'];

// ─────────────────────────────────────────────────────────────────────────────

export function TrimStepContent({ data, onUpdate }: StepContentProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const localTrim = data.trim || '';

  const handleChange = useCallback(
    (text: string) => {
      onUpdate({ trim: text });
    },
    [onUpdate]
  );

  const handleQuickSelect = useCallback(
    (trim: string) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onUpdate({ trim });
    },
    [onUpdate]
  );

  return (
    <StepContainer>
      <View style={styles.sectionHeader}>
        <Text variant={SheetTypography.rowLabel} tone="secondary">
          Trim
        </Text>
        <Text variant={SheetTypography.supporting} tone="muted">
          Optional
        </Text>
      </View>

      {/* Input */}
      <View style={styles.inputWrapper}>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.surfaceSecondary,
              color: colors.label,
            },
          ]}
          placeholder="Enter trim (optional)"
          placeholderTextColor={colors.labelQuaternary}
          value={localTrim}
          onChangeText={handleChange}
          autoCapitalize="words"
          autoCorrect={false}
          returnKeyType="done"
        />
      </View>

      {/* Quick picks */}
      <View style={styles.section}>
        <Text variant={SheetTypography.rowLabel} tone="secondary">Quick picks</Text>
        <View style={styles.chipWrap}>
          {TRIM_EXAMPLES.map((trim) => {
            const isSelected = trim.toLowerCase() === localTrim.toLowerCase();
            return (
              <HapticPressable
                key={trim}
                onPress={() => handleQuickSelect(trim)}
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
                  {trim}
                </Text>
              </HapticPressable>
            );
          })}
        </View>
      </View>

      {/* Hint */}
      <View style={styles.hintBox}>
        <Text variant={SheetTypography.supporting} tone="muted">
          Leave blank if you don&apos;t know the exact trim.
        </Text>
      </View>
    </StepContainer>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  sectionHeader: {
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  inputWrapper: {
    position: 'relative',
  },
  input: {
    height: Sizes.actionButtonLg,
    borderRadius: Radius.xl,
    paddingHorizontal: Spacing.md,
    ...InputTypography,
  },
  section: {
    gap: Spacing.sm,
    marginTop: Spacing.xl,
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
  hintBox: {
    marginTop: Spacing.md,
  },
});

export default TrimStepContent;
