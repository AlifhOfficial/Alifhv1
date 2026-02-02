/**
 * PresetDropdown Component
 * 
 * Grid of preset options (Price, Year ranges) with manual input.
 */

import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput } from 'react-native';
import { Spacing, Radius, Typography } from '@/constants/theme';
import type { PresetDropdownProps } from '../types';

export function PresetDropdown({
  presets,
  currentMin,
  currentMax,
  onSelect,
  onClear,
  title,
  clearLabel,
  colors,
}: PresetDropdownProps) {
  const hasSelection = currentMin !== undefined || currentMax !== undefined;
  
  // Local state for manual input
  const [minInput, setMinInput] = useState(currentMin?.toString() || '');
  const [maxInput, setMaxInput] = useState(currentMax?.toString() || '');
  
  // Sync local state when props change
  useEffect(() => {
    setMinInput(currentMin?.toString() || '');
    setMaxInput(currentMax?.toString() || '');
  }, [currentMin, currentMax]);
  
  // Apply manual input
  const applyManualInput = () => {
    const min = minInput ? parseInt(minInput, 10) : undefined;
    const max = maxInput ? parseInt(maxInput, 10) : undefined;
    if (min !== currentMin || max !== currentMax) {
      onSelect(min, max);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>

      {/* Manual Input Row */}
      <View style={styles.inputRow}>
        <View style={[styles.inputWrapper, { borderColor: colors.border }]}>
          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder="Min"
            placeholderTextColor={colors.textTertiary}
            keyboardType="numeric"
            value={minInput}
            onChangeText={setMinInput}
            onBlur={applyManualInput}
            onSubmitEditing={applyManualInput}
          />
        </View>
        <Text style={[styles.separator, { color: colors.textTertiary }]}>—</Text>
        <View style={[styles.inputWrapper, { borderColor: colors.border }]}>
          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder="Max"
            placeholderTextColor={colors.textTertiary}
            keyboardType="numeric"
            value={maxInput}
            onChangeText={setMaxInput}
            onBlur={applyManualInput}
            onSubmitEditing={applyManualInput}
          />
        </View>
      </View>

      {/* Presets */}
      <Text style={[styles.presetsLabel, { color: colors.textSecondary }]}>Quick Select</Text>
      <View style={styles.grid}>
        {presets.map((preset) => {
          const isActive = currentMin === preset.min && currentMax === preset.max;
          
          return (
            <TouchableOpacity
              key={preset.label}
              style={[
                styles.chip,
                { backgroundColor: isActive ? `${colors.primary}20` : colors.backgroundSecondary },
              ]}
              onPress={() => onSelect(preset.min, preset.max)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.chipText,
                  { color: isActive ? colors.primary : colors.textSecondary },
                ]}
              >
                {preset.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {hasSelection && (
        <TouchableOpacity
          style={[styles.clearButton, { backgroundColor: colors.errorMuted }]}
          onPress={onClear}
        >
          <Text style={[styles.clearText, { color: colors.error }]}>{clearLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexShrink: 1,
  },
  title: {
    ...Typography.headline,
    fontFamily: 'Inter_600SemiBold',
    marginBottom: Spacing.md,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  inputWrapper: {
    flex: 1,
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  input: {
    ...Typography.callout,
    fontFamily: 'Inter_500Medium',
    textAlign: 'center',
  },
  separator: {
    ...Typography.callout,
    fontFamily: 'Inter_400Regular',
  },
  presetsLabel: {
    ...Typography.footnote,
    fontFamily: 'Inter_500Medium',
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
  },
  chipText: {
    ...Typography.subhead,
    fontFamily: 'Inter_400Regular',
  },
  chipTextActive: {
    fontFamily: 'Inter_500Medium',
  },
  clearButton: {
    marginTop: Spacing.xl,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    alignItems: 'center',
  },
  clearText: {
    ...Typography.subhead,
    fontFamily: 'Inter_500Medium',
  },
});
