/**
 * TrimStepContent — Enter or select vehicle trim (optional)
 *
 * Content-only component for the unified flow.
 *
 * @module components/sheets/create-listing/steps/trim-step
 */

import { Text, HapticPressable } from '@/components/ui';
import React, { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import * as Haptics from 'expo-haptics';

import { Typography, Fonts, Colors, Spacing, Radius, Sizes} from '@/constants/theme';
import { useTheme } from '@/context/theme-context';

import { StepContainer } from '../step-container';
import type { StepContentProps } from '../create-listing-flow';

// ─────────────────────────────────────────────────────────────────────────────

const TRIM_EXAMPLES = ['Sport', 'Luxury', 'Premium', 'Base', 'Limited', 'Platinum', 'SE', 'XLE'];

// ─────────────────────────────────────────────────────────────────────────────

export function TrimStepContent({ data, onUpdate }: StepContentProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const [localTrim, setLocalTrim] = useState(data.trim || '');

  useEffect(() => {
    setLocalTrim(data.trim || '');
  }, [data.trim]);

  const handleChange = useCallback(
    (text: string) => {
      setLocalTrim(text);
      onUpdate({ trim: text });
    },
    [onUpdate]
  );

  const handleQuickSelect = useCallback(
    (trim: string) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setLocalTrim(trim);
      onUpdate({ trim });
    },
    [onUpdate]
  );

  return (
    <StepContainer>
      {/* Input */}
      <BottomSheetTextInput
        style={[
          styles.input,
          {
            backgroundColor: colors.surfaceSecondary,
            color: colors.label,
            borderColor: colors.border,
          },
        ]}
        placeholder="e.g. Sport, AMG, M-Sport..."
        placeholderTextColor={colors.placeholder}
        value={localTrim}
        onChangeText={handleChange}
        autoCapitalize="words"
        autoCorrect={false}
        returnKeyType="done"
      />

      {/* Quick picks */}
      <View style={styles.section}>
        <Text variant="subhead" tone="muted">Quick picks</Text>
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
                  variant="subhead"
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
      <View style={[styles.hintBox, { backgroundColor: colors.fill2 }]}>
        <Text variant="subhead" tone="muted">
          Trim is optional but helps buyers identify your exact variant.
        </Text>
      </View>
    </StepContainer>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  input: {
    height: Sizes.actionButtonLg,
    borderWidth: 1,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    ...Typography.body,
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
    padding: Spacing.md,
    borderRadius: Radius.lg,
    marginTop: Spacing.xl,
  },
});

export default TrimStepContent;
