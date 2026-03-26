/**
 * AppearanceStepContent — Body type and colors
 *
 * Content-only component for the unified flow.
 *
 * @module components/sheets/create-listing/steps/appearance-step
 */

import React, { useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';

import { Colors, Spacing, Radius } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { Body, Label } from '@/components/ui';
import { HapticPressable } from '@/components/ui';
import { BODY_TYPES, EXTERIOR_COLORS, INTERIOR_COLORS } from '@/lib/filter-constants';

import type { StepContentProps } from '../create-listing-flow';
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
  themeColors: Record<string, string>;
}) {
  return (
    <HapticPressable
      onPress={onPress}
      style={[
        styles.colorChip,
        {
          backgroundColor: isSelected ? themeColors.text : themeColors.surface2,
          borderColor: isSelected ? themeColors.text : themeColors.border,
        },
      ]}
    >
      {color.hex && (
        <View
          style={[
            styles.colorSwatch,
            {
              backgroundColor: color.hex,
              borderColor: color.hex === '#FFFFFF' ? themeColors.border : 'transparent',
            },
          ]}
        />
      )}
      <Body
        size="small"
        numberOfLines={1}
        style={{
          color: isSelected ? themeColors.bg : themeColors.text,
          fontWeight: isSelected ? '600' : '400',
        }}
      >
        {color.label}
      </Body>
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
        <Label size="small">Body Type</Label>
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
                    backgroundColor: isSelected ? colors.text : colors.surface2,
                    borderColor: isSelected ? colors.text : colors.border,
                  },
                ]}
              >
                <Body
                  size="small"
                  style={{ color: isSelected ? colors.bg : colors.text }}
                >
                  {type.label}
                </Body>
              </HapticPressable>
            );
          })}
        </View>
      </View>

      {/* Exterior Color */}
      <View style={styles.section}>
        <Label size="small">Exterior Color</Label>
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
        <Label size="small">Interior Color</Label>
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
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
});

export default AppearanceStepContent;
