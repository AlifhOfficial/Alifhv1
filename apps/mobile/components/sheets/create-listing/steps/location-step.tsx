/**
 * LocationStepContent — Select emirate and city
 *
 * Content-only component for the unified flow.
 *
 * @module components/sheets/create-listing/steps/location-step
 */

import { Text, HapticPressable } from '@/components/ui';
import React, { useCallback, useRef } from 'react';
import { View, StyleSheet, TextInput } from 'react-native';
import * as Haptics from 'expo-haptics';

import { Typography, Colors, Spacing, Radius, Sizes} from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
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
        <Text variant="caption1Emphasized" tone="muted" uppercase>Emirate</Text>
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
                    backgroundColor: isActive ? colors.label : colors.surfaceSecondary,
                    borderColor: isActive ? colors.label : colors.border,
                  },
                ]}
              >
                <Text
                  variant="subhead"
                  style={{ color: isActive ? colors.background : colors.label }}
                >
                  {emirate.label}
                </Text>
              </HapticPressable>
            );
          })}
        </View>
      </View>

      {/* City Input (Optional) */}
      <View style={styles.section}>
        <View style={styles.labelRow}>
          <Text variant="caption1Emphasized" tone="muted" uppercase>City / Area</Text>
          <Text variant="subhead" tone="muted">
            Optional
          </Text>
        </View>
        <TextInput
          ref={cityRef}
          style={[
            styles.input,
            {
              backgroundColor: colors.fill2,
              borderColor: colors.border,
              color: colors.label,
            },
          ]}
          placeholder="e.g. Downtown, JBR, Al Ain..."
          placeholderTextColor={colors.labelQuaternary}
          value={data.city || ''}
          onChangeText={handleCityChange}
          autoCapitalize="words"
          returnKeyType="done"
        />
      </View>

      {/* Selected summary */}
      {data.emirate && (
        <View style={[styles.summaryBox, { backgroundColor: colors.fill2 }]}>
          <Text variant="subhead" tone="secondary">
            {data.emirate}{data.city ? `, ${data.city}` : ''}
          </Text>
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
    height: Sizes.actionButtonLg,
    borderWidth: 1,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    ...Typography.body,
  },
  summaryBox: {
    padding: Spacing.md,
    borderRadius: Radius.lg,
    alignItems: 'center',
  },
});

export default LocationStepContent;
