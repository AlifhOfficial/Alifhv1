/**
 * PriceStepContent — Set listing price
 *
 * Content-only component for the unified flow.
 *
 * @module components/sheets/create-listing/steps/price-step
 */

import React, { useCallback } from 'react';
import { View, StyleSheet, Switch } from 'react-native';
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import * as Haptics from 'expo-haptics';

import { Colors, Spacing, Radius } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { Body, Supporting, Data, Label } from '@/components/ui';
import { HapticPressable } from '@/components/ui';

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
            { backgroundColor: colors.fill2, borderColor: colors.border },
          ]}
        >
          <Body size="large" tone="secondary">
            AED
          </Body>
          <BottomSheetTextInput
            style={[styles.input, { color: colors.text }]}
            placeholder="0"
            placeholderTextColor={colors.textMuted}
            value={data.price || ''}
            onChangeText={handleChange}
            keyboardType="number-pad"
            returnKeyType="done"
          />
        </View>

        {/* Formatted display */}
        {data.price && priceNum > 0 && (
          <Data size="large" style={{ color: colors.text, textAlign: 'center' }}>
            AED {priceNum.toLocaleString()}
          </Data>
        )}
      </View>

      {/* Quick presets */}
      <View style={styles.section}>
        <Supporting size="small" tone="muted">
          Quick select
        </Supporting>
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
                    backgroundColor: isActive ? colors.text : colors.surface2,
                    borderColor: isActive ? colors.text : colors.border,
                  },
                ]}
              >
                <Body
                  size="small"
                  style={{ color: isActive ? colors.bg : colors.text }}
                >
                  {preset.label}
                </Body>
              </HapticPressable>
            );
          })}
        </View>
      </View>

      {/* Negotiable toggle */}
      <View style={[styles.toggleRow, { backgroundColor: colors.surface2 }]}>
        <View style={styles.toggleText}>
          <Label size="small">Price Negotiable?</Label>
          <Supporting size="small" tone="muted">
            Let buyers know you're open to offers
          </Supporting>
        </View>
        <Switch
          value={data.isNegotiable || false}
          onValueChange={handleNegotiableToggle}
          trackColor={{ false: colors.fill2, true: colors.text + '80' }}
          thumbColor={data.isNegotiable ? colors.text : colors.textMuted}
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
    height: 64,
  },
  input: {
    flex: 1,
    fontSize: 28,
    fontFamily: 'Inter_700Bold',
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
    gap: 2,
  },
});

export default PriceStepContent;
