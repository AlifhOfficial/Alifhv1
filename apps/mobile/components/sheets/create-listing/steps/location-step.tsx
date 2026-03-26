/**
 * LocationStepContent — Select emirate and city
 *
 * Content-only component for the unified flow.
 *
 * @module components/sheets/create-listing/steps/location-step
 */

import React, { useCallback, useRef } from 'react';
import { View, StyleSheet, TextInput } from 'react-native';
import * as Haptics from 'expo-haptics';

import { Colors, Spacing, Radius } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { Body, Supporting, Label } from '@/components/ui';
import { HapticPressable } from '@/components/ui';
import { UAE_EMIRATES } from '@/lib/filter-constants';

import { StepContainer } from '../step-container';
import type { StepContentProps } from '../create-listing-flow';

// ─────────────────────────────────────────────────────────────────────────────

export function LocationStepContent({ data, onUpdate }: StepContentProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const cityRef = useRef<TextInput>(null);

  const handleEmirateSelect = useCallback(
    (value: string) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onUpdate({ emirate: value });
      setTimeout(() => cityRef.current?.focus(), 200);
    },
    [onUpdate]
  );

  const handleCityChange = useCallback(
    (text: string) => {
      onUpdate({ city: text });
    },
    [onUpdate]
  );

  return (
    <StepContainer>
      {/* Emirate Selection */}
      <View style={styles.section}>
        <Label size="small">Emirate</Label>
        <View style={styles.chipsWrap}>
          {UAE_EMIRATES.map((emirate) => {
            const isActive = data.emirate === emirate.value;
            return (
              <HapticPressable
                key={emirate.value}
                onPress={() => handleEmirateSelect(emirate.value)}
                style={[
                  styles.chip,
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
                  {emirate.label}
                </Body>
              </HapticPressable>
            );
          })}
        </View>
      </View>

      {/* City Input (Optional) */}
      <View style={styles.section}>
        <View style={styles.labelRow}>
          <Label size="small">City / Area</Label>
          <Supporting size="small" tone="muted">
            Optional
          </Supporting>
        </View>
        <TextInput
          ref={cityRef}
          style={[
            styles.input,
            {
              backgroundColor: colors.fill2,
              borderColor: colors.border,
              color: colors.text,
            },
          ]}
          placeholder="e.g. Downtown, JBR, Al Ain..."
          placeholderTextColor={colors.textMuted}
          value={data.city || ''}
          onChangeText={handleCityChange}
          autoCapitalize="words"
          returnKeyType="done"
        />
      </View>

      {/* Selected summary */}
      {data.emirate && (
        <View style={[styles.summaryBox, { backgroundColor: colors.fill2 }]}>
          <Supporting size="small" tone="secondary">
            {data.emirate}{data.city ? `, ${data.city}` : ''}
          </Supporting>
        </View>
      )}
    </StepContainer>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  section: {
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  chipsWrap: {
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
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    fontSize: 16,
    fontWeight: '400',
  },
  summaryBox: {
    padding: Spacing.md,
    borderRadius: Radius.lg,
    alignItems: 'center',
  },
});

export default LocationStepContent;
