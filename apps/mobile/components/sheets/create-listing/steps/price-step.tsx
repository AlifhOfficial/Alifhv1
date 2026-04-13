/**
 * PriceStepContent — Set listing price
 *
 * Content-only component for the unified flow.
 *
 * @module components/sheets/create-listing/steps/price-step
 */

import { Text, HapticPressable, TextInput } from '@/components/ui';
import React, { useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';

import { InputTypography, Colors, Spacing, Radius, Sizes, SheetTypography } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { SheetToggle } from '../sheet-toggle';

import { StepContainer } from '../step-container';
import type { StepContentProps } from '../types';

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
        <View style={styles.sectionHeader}>
          <Text variant={SheetTypography.rowLabel} tone="secondary">
            Asking Price
          </Text>
          <Text variant={SheetTypography.supporting} tone="muted">
            Enter the full amount in AED
          </Text>
        </View>

        <View
          style={[
            styles.inputBox,
            { backgroundColor: colors.surfaceSecondary },
          ]}
        >
          <Text variant={SheetTypography.supporting} tone="muted">
            AED
          </Text>
          <TextInput
            style={[
              styles.input,
              data.price ? styles.inputFilled : styles.inputPlaceholder,
              { color: colors.label },
            ]}
            placeholder="Enter amount"
            placeholderTextColor={colors.labelQuaternary}
            value={data.price || ''}
            onChangeText={handleChange}
            keyboardType="number-pad"
            returnKeyType="done"
          />
        </View>

        {/* Formatted display */}
        {data.price && priceNum > 0 && (
          <Text variant={SheetTypography.rowLabelSelected} style={{ color: colors.label, textAlign: 'center' }}>
            AED {priceNum.toLocaleString()}
          </Text>
        )}
      </View>

      {/* Quick presets */}
      <View style={styles.section}>
        <Text variant={SheetTypography.rowLabel} tone="secondary">
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
                <Text variant={isActive ? SheetTypography.rowLabelSelected : SheetTypography.rowLabel} style={{ color: isActive ? colors.background : colors.label }}>
                  {preset.label}
                </Text>
              </HapticPressable>
            );
          })}
        </View>
      </View>

      {/* Negotiable toggle */}
      <View style={styles.toggleRow}>
        <View style={styles.toggleText}>
          <Text variant={SheetTypography.rowLabel} tone="secondary">Price Negotiable?</Text>
          <Text variant={SheetTypography.supporting} tone="muted">
            Let buyers know you&apos;re open to offers
          </Text>
        </View>
        <SheetToggle
          enabled={data.isNegotiable || false}
          onToggle={() => handleNegotiableToggle(!(data.isNegotiable || false))}
          colors={colors}
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
  sectionHeader: {
    gap: Spacing.xs,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.xl,
    height: Sizes.actionButtonLg,
  },
  input: {
    flex: 1,
    paddingVertical: Spacing.none,
    textAlign: 'left',
  },
  inputPlaceholder: {
    ...InputTypography,
  },
  inputFilled: {
    ...InputTypography,
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
    paddingVertical: Spacing.sm,
    marginTop: Spacing.sm,
  },
  toggleText: {
    flex: 1,
    gap: Spacing.xs,
  },
});

export default PriceStepContent;
