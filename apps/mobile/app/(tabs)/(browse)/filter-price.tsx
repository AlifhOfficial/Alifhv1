import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { router } from 'expo-router';

import { HapticPressable, Text } from '@/components/ui';
import { useTheme } from '@/context/theme-context';
import { useSearch } from '@/context/search-context';
import { Colors, Radius, Spacing } from '@/constants/theme';

const PRICE_PRESETS = [
  { label: 'Under 50K', min: undefined, max: 50000 },
  { label: '50K-100K', min: 50000, max: 100000 },
  { label: '100K-200K', min: 100000, max: 200000 },
  { label: '200K+', min: 200000, max: undefined },
];

export default function FilterPriceScreen() {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const { filterParams, updateFilterParams } = useSearch();

  const [localMin, setLocalMin] = useState(filterParams.priceMin?.toString() ?? '');
  const [localMax, setLocalMax] = useState(filterParams.priceMax?.toString() ?? '');

  const apply = () => {
    updateFilterParams({
      priceMin: localMin ? parseInt(localMin, 10) : undefined,
      priceMax: localMax ? parseInt(localMax, 10) : undefined,
    });
    router.back();
  };

  const clear = () => {
    setLocalMin('');
    setLocalMax('');
    updateFilterParams({ priceMin: undefined, priceMax: undefined });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.sheet }]}> 
      <View style={[styles.header, { borderBottomColor: colors.sheetBorder }]}> 
        <HapticPressable onPress={() => router.back()} hitSlop={Spacing.md} style={styles.headerAction}>
          <Text variant="subhead" tone="muted">Close</Text>
        </HapticPressable>
        <Text variant="caption1Emphasized" tone="muted" uppercase>Price</Text>
        <HapticPressable onPress={apply} hitSlop={Spacing.md} style={styles.headerAction}>
          <Text variant="subheadEmphasized" style={{ color: colors.primary }}>Apply</Text>
        </HapticPressable>
      </View>

      <View style={styles.presetsRow}>
        {PRICE_PRESETS.map((preset) => {
          const currentMin = localMin ? parseInt(localMin, 10) : undefined;
          const currentMax = localMax ? parseInt(localMax, 10) : undefined;
          const isActive = preset.min === currentMin && preset.max === currentMax;
          return (
            <HapticPressable
              key={preset.label}
              onPress={() => {
                if (isActive) {
                  setLocalMin('');
                  setLocalMax('');
                } else {
                  setLocalMin(preset.min?.toString() ?? '');
                  setLocalMax(preset.max?.toString() ?? '');
                }
              }}
              style={[styles.presetChip, { backgroundColor: isActive ? colors.label : colors.surfaceSecondary, borderColor: isActive ? colors.label : colors.border }]}
            >
              <Text variant="subhead" style={{ color: isActive ? colors.background : colors.labelSecondary }}>
                {preset.label}
              </Text>
            </HapticPressable>
          );
        })}
      </View>

      <View style={styles.rangeRow}>
        <View style={styles.inputWrapper}>
          <Text variant="caption1Emphasized" tone="muted" uppercase>MIN</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border, color: colors.label }]}
            placeholder="0"
            placeholderTextColor={colors.labelTertiary}
            keyboardType="number-pad"
            value={localMin}
            onChangeText={setLocalMin}
          />
        </View>
        <Text variant="body" tone="muted" style={styles.rangeDash}>-</Text>
        <View style={styles.inputWrapper}>
          <Text variant="caption1Emphasized" tone="muted" uppercase>MAX</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border, color: colors.label }]}
            placeholder="Any"
            placeholderTextColor={colors.labelTertiary}
            keyboardType="number-pad"
            value={localMax}
            onChangeText={setLocalMax}
          />
        </View>
      </View>

      <HapticPressable onPress={clear} style={styles.clearRow}>
        <Text variant="subheadEmphasized" style={{ color: colors.error }}>Clear price filter</Text>
      </HapticPressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
    gap: Spacing.md,
  },
  header: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerAction: {
    minWidth: 56,
  },
  presetsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  presetChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  rangeRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.md,
  },
  inputWrapper: {
    flex: 1,
    gap: Spacing.xs,
  },
  input: {
    height: Spacing['5xl'],
    borderWidth: 1,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
  },
  rangeDash: {
    marginBottom: Spacing.md,
  },
  clearRow: {
    marginTop: Spacing.md,
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
});
