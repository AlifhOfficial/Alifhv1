/**
 * AppearanceSheet — Body type and colors
 *
 * Visual chip selection for body type, exterior and interior colors.
 *
 * @module components/sheets/create-listing/sheets/appearance-sheet
 */

import React, { useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Car, Palette } from 'lucide-react-native';

import { Colors, Spacing, Radius, Sizes } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { Body, Supporting, Label } from '@/components/ui';
import { HapticPressable } from '@/components/ui';
import { BODY_TYPES, EXTERIOR_COLORS, INTERIOR_COLORS } from '@/lib/filter-constants';

import { CreateFlowSheet, CreateFlowScrollContent } from '../create-flow-sheet';
import type { SheetStepProps } from '../types';
import { getProgress, SHEET_STEPS } from '../types';

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
          backgroundColor: isSelected ? themeColors.text : themeColors.surfaceSecondary,
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
          color: isSelected ? themeColors.background : themeColors.text,
          fontFamily: isSelected ? 'Inter_600SemiBold' : 'Inter_400Regular',
        }}
      >
        {color.label}
      </Body>
    </HapticPressable>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export function AppearanceSheet({
  visible,
  data,
  onUpdate,
  onNext,
  onSkip,
  onBack,
  onClose,
}: SheetStepProps) {
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

  const stepIndex = SHEET_STEPS.findIndex((s) => s.id === 'appearance');
  const progress = getProgress(stepIndex + 1);

  const hasAnySelection = data.bodyType || data.exteriorColor || data.interiorColor;

  return (
    <CreateFlowSheet
      visible={visible}
      onClose={onClose}
      title="Appearance"
      showBack
      onBack={onBack}
      primaryLabel={hasAnySelection ? 'Next' : 'Skip'}
      onPrimary={hasAnySelection ? onNext : onSkip}
      progress={progress}
    >
      <CreateFlowScrollContent>
        {/* Body Type */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Car size={Sizes.iconSm} color={colors.textMuted} strokeWidth={2} />
            <Label size="small">Body Type</Label>
          </View>
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
                      backgroundColor: isSelected ? colors.text : colors.surfaceSecondary,
                      borderColor: isSelected ? colors.text : colors.border,
                    },
                  ]}
                >
                  <Body
                    size="small"
                    style={{ color: isSelected ? colors.background : colors.text }}
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
          <View style={styles.sectionHeader}>
            <Palette size={Sizes.iconSm} color={colors.textMuted} strokeWidth={2} />
            <Label size="small">Exterior Color</Label>
          </View>
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
          <View style={styles.sectionHeader}>
            <Palette size={Sizes.iconSm} color={colors.textMuted} strokeWidth={2} />
            <Label size="small">Interior Color</Label>
          </View>
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
      </CreateFlowScrollContent>
    </CreateFlowSheet>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  section: {
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
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
    paddingVertical: Spacing.xs,
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

export default AppearanceSheet;
