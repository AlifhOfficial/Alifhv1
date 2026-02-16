/**
 * LocationSheet — Select emirate and city
 *
 * Chip selector for UAE emirates with optional city input.
 *
 * @module components/sheets/create-listing/sheets/location-sheet
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { View, StyleSheet, TextInput } from 'react-native';
import * as Haptics from 'expo-haptics';

import { Colors, Spacing, Radius } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { Body, Supporting, Label } from '@/components/ui';
import { HapticPressable } from '@/components/ui';
import { UAE_EMIRATES } from '@/lib/filter-constants';

import { CreateFlowSheet, CreateFlowScrollContent } from '../base-sheet';
import type { SheetStepProps } from '../types';
import { getProgress, SHEET_STEPS } from '../types';

// ─────────────────────────────────────────────────────────────────────────────

export function LocationSheet({
  visible,
  data,
  onUpdate,
  onNext,
  onBack,
  onClose,
}: SheetStepProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  
  const cityRef = useRef<TextInput>(null);
  const [localCity, setLocalCity] = useState(data.city || '');

  // Reset when sheet opens
  useEffect(() => {
    if (visible) {
      setLocalCity(data.city || '');
    }
  }, [visible]);

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
      setLocalCity(text);
      onUpdate({ city: text });
    },
    [onUpdate]
  );

  const stepIndex = SHEET_STEPS.findIndex((s) => s.id === 'location');
  const progress = getProgress(stepIndex + 1);

  const isValid = !!data.emirate;

  return (
    <CreateFlowSheet
      visible={visible}
      onClose={onClose}
      title="Location"
      showBack
      onBack={onBack}
      primaryLabel="Next"
      primaryDisabled={!isValid}
      onPrimary={onNext}
      progress={progress}
    >
      <CreateFlowScrollContent>
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
                      backgroundColor: isActive ? colors.text : colors.surfaceSecondary,
                      borderColor: isActive ? colors.text : colors.border,
                    },
                  ]}
                >
                  <Body
                    size="small"
                    style={{ color: isActive ? colors.background : colors.text }}
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
                backgroundColor: colors.fillSecondary,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            placeholder="e.g. Downtown, JBR, Al Ain..."
            placeholderTextColor={colors.textMuted}
            value={localCity}
            onChangeText={handleCityChange}
            autoCapitalize="words"
            returnKeyType="done"
            onSubmitEditing={onNext}
          />
        </View>
      </CreateFlowScrollContent>
    </CreateFlowSheet>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  section: {
    gap: Spacing.sm,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    fontFamily: 'Inter_400Regular',
  },
});

export default LocationSheet;
