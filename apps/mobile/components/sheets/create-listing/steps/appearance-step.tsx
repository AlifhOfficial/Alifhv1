/**
 * AppearanceStepContent — Body type and colors
 *
 * Content-only component for the unified flow.
 *
 * @module components/sheets/create-listing/steps/appearance-step
 */

import { Text, HapticPressable } from '@/components/ui';
import React, { useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';

import { Colors, Spacing, Radius, VehicleColorSwatches, type ColorPalette } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { BODY_TYPES, EXTERIOR_COLORS, INTERIOR_COLORS } from '@/lib/filter-constants';

import type { StepContentProps } from '../types';
import { StepContainer } from '../step-container';

// ─────────────────────────────────────────────────────────────────────────────

function ColorChip({
  color,
  isSelected,
  onPress,
  themeColors,
}: {
  color: { value: string; label: string; hex?: string };
  isSelected: boolean;
  onPress: () => void;
  themeColors: ColorPalette;
}) {
  return (
    <HapticPressable
      onPress={onPress}
      style={[
        styles.colorChip,
        {
          backgroundColor: isSelected ? themeColors.label : themeColors.surface,
          borderColor: isSelected ? themeColors.label : themeColors.border,
        },
      ]}
    >
      {color.hex && (
        <View
          style={[
            styles.colorSwatch,
            {
              backgroundColor: color.hex,
              borderColor: color.hex === VehicleColorSwatches.exterior.white ? themeColors.border : 'transparent',
            },
          ]}
        />
      )}
      <Text
        variant={isSelected ? 'subheadEmphasized' : 'subhead'}
        numberOfLines={1}
        style={{ color: isSelected ? themeColors.background : themeColors.label }}
      >
        {color.label}
      </Text>
    </HapticPressable>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export function AppearanceStepContent({ data, onUpdate }: StepContentProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];

  const handleBodyType = useCallback(
    (value: string) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onUpdate({ bodyType: data.bodyType === value ? '' : value });
    },
    [data.bodyType, onUpdate]
  );

  const handleExteriorColor = useCallback(
    (value: string) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onUpdate({ exteriorColor: data.exteriorColor === value ? '' : value });
    },
    [data.exteriorColor, onUpdate]
  );

  const handleInteriorColor = useCallback(
    (value: string) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onUpdate({ interiorColor: data.interiorColor === value ? '' : value });
    },
    [data.interiorColor, onUpdate]
  );

  return (
    <StepContainer>
      {/* Body Type */}
      <View style={styles.section}>
        <Text variant="caption1Emphasized" tone="muted" uppercase>Body Type</Text>
        <View style={styles.chipWrap}>
          {BODY_TYPES.map((type) => {
            const isSelected = data.bodyType === type.value;
            return (
              <HapticPressable
                key={type.value}
                onPress={() => handleBodyType(type.value)}
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
                  {type.label}
                </Text>
              </HapticPressable>
            );
          })}
        </View>
      </View>

      {/* Exterior Color */}
      <View style={styles.section}>
        <Text variant="caption1Emphasized" tone="muted" uppercase>Exterior Color</Text>
        <View style={styles.chipWrap}>
          {EXTERIOR_COLORS.map((color) => (
            <ColorChip
              key={color.value}
              color={color}
              isSelected={data.exteriorColor === color.value}
              onPress={() => handleExteriorColor(color.value)}
              themeColors={colors}
            />
          ))}
        </View>
      </View>

      {/* Interior Color */}
      <View style={styles.section}>
        <Text variant="caption1Emphasized" tone="muted" uppercase>Interior Color</Text>
        <View style={styles.chipWrap}>
          {INTERIOR_COLORS.map((color) => (
            <ColorChip
              key={color.value}
              color={color}
              isSelected={data.interiorColor === color.value}
              onPress={() => handleInteriorColor(color.value)}
              themeColors={colors}
            />
          ))}
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
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  colorChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  colorSwatch: {
    width: Spacing.lg,
    height: Spacing.lg,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
});

export default AppearanceStepContent;
