/**
 * PriceStepContent — Set listing price
 *
 * Content-only component for the unified flow.
 *
 * @module components/sheets/create-listing/steps/price-step
 */

import { Text, HapticPressable } from '@/components/ui';
import React, { useCallback } from 'react';
import { View, StyleSheet, Switch, TextInput } from 'react-native';
import * as Haptics from 'expo-haptics';

import { Typography, Colors, Spacing, Radius } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';

import { StepContainer } from '../step-container';
import type { StepContentProps } from '../create-listing-flow';

// ─────────────────────────────────────────────────────────────────────────────

const PRICE_PRESETS = [
  { label: '50K', value: '50000' },
  { label: '100K', value: '100000' },
  { label: '150K', value: '150000' },
  { label: '200K', value: '200000' },
  { label: '300K', value: '300000' },
  { label: '500K', value: '500000' },
];

// ─────────────────────────────────────────────────────────────────────────────

export function PriceStepContent({ data, onUpdate }: StepContentProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];

  const handleChange = useCallback(
    (text: string) => {
      const cleaned = text.replace(/[^0-9]/g, '');
      onUpdate({ price: cleaned });
    },
    [onUpdate]
  );

  const handlePreset = useCallback(
    (value: string) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onUpdate({ price: value });
    },
    [onUpdate]
  );

  const handleNegotiableToggle = useCallback(
    (value: boolean) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onUpdate({ isNegotiable: value });
    },
    [onUpdate]
  );

  const priceNum = parseInt(data.price || '0', 10);

  return (
    <StepContainer>
      {/* Price Input */}
      <View style={styles.section}>
        <View
          style={[
            styles.inputBox,
            { backgroundColor: colors.surfaceSecondary, borderColor: colors.border },
          ]}
        >
          <Text variant="body" tone="muted">
            AED
          </Text>
          <TextInput
            style={[styles.input, { color: colors.label }]}
            placeholder="0"
            placeholderTextColor={colors.placeholder}
            value={data.price || ''}
            onChangeText={handleChange}
            keyboardType="number-pad"
            returnKeyType="done"
          />
        </View>

        {/* Formatted display */}
        {data.price && priceNum > 0 && (
          <Text variant="title3Emphasized" style={{ color: colors.label, textAlign: 'center' }}>
            AED {priceNum.toLocaleString()}
          </Text>
        )}
      </View>

      {/* Quick presets */}
      <View style={styles.section}>
        <Text variant="subhead" tone="muted">
          Quick select
        </Text>
        <View style={styles.presetsRow}>
          {PRICE_PRESETS.map((preset) => {
            const isActive = preset.value === data.price;
            return (
              <HapticPressable
                key={preset.value}
                onPress={() => handlePreset(preset.value)}
                style={[
                  styles.presetChip,
                  {
                    backgroundColor: isActive ? colors.label : colors.surfaceSecondary,
                    borderColor: isActive ? colors.label : colors.border,
                  },
                ]}
              >
                <Text
                  variant="subhead"
                  style={{ color: isActive ? colors.background : colors.label }}
                >
                  {preset.label}
                </Text>
              </HapticPressable>
            );
          })}
        </View>
      </View>

      {/* Negotiable toggle */}
      <View style={[styles.toggleRow, { backgroundColor: colors.surfaceSecondary }]}>
        <View style={styles.toggleText}>
          <Text variant="caption1Emphasized" tone="muted" uppercase>Price Negotiable?</Text>
          <Text variant="subhead" tone="muted">
            Let buyers know you&apos;re open to offers
          </Text>
        </View>
        <Switch
          value={data.isNegotiable || false}
          onValueChange={handleNegotiableToggle}
          trackColor={{ false: colors.fill2, true: colors.label + '80' }}
          thumbColor={data.isNegotiable ? colors.label : colors.labelQuaternary}
        />
      </View>
    </StepContainer>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  section: {
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderWidth: 1,
    borderRadius: Radius.xl,
    height: Spacing["5xl"] + Spacing.lg,
  },
  input: {
    flex: 1,
    ...Typography.title3Emphasized,
    paddingVertical: Spacing.sm,
    textAlign: 'left',
  },
  presetsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  presetChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderRadius: Radius.lg,
    marginTop: Spacing.md,
  },
  toggleText: {
    flex: 1,
    gap: Spacing.xs,
  },
});

export default PriceStepContent;
