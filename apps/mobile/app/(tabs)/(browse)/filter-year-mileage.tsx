import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { router } from 'expo-router';

import { HapticPressable, SheetHeader, Text } from '@/components/ui';
import { useTheme } from '@/context/theme-context';
import { useSearch } from '@/context/search-context';
import { Colors, Radius, Spacing } from '@/constants/theme';

const MILEAGE_PRESETS = [
  { label: 'Under 20K', max: 20000 },
  { label: 'Under 50K', max: 50000 },
  { label: 'Under 100K', max: 100000 },
];

export default function FilterYearMileageScreen() {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const { filterParams, updateFilterParams } = useSearch();

  const [localYearMin, setLocalYearMin] = useState(filterParams.yearMin?.toString() ?? '');
  const [localYearMax, setLocalYearMax] = useState(filterParams.yearMax?.toString() ?? '');
  const [localMileageMin, setLocalMileageMin] = useState(filterParams.mileageMin?.toString() ?? '');
  const [localMileageMax, setLocalMileageMax] = useState(filterParams.mileageMax?.toString() ?? '');

  const apply = () => {
    updateFilterParams({
      yearMin: localYearMin ? parseInt(localYearMin, 10) : undefined,
      yearMax: localYearMax ? parseInt(localYearMax, 10) : undefined,
      mileageMin: localMileageMin ? parseInt(localMileageMin, 10) : undefined,
      mileageMax: localMileageMax ? parseInt(localMileageMax, 10) : undefined,
    });
    router.back();
  };

  const clear = () => {
    setLocalYearMin('');
    setLocalYearMax('');
    setLocalMileageMin('');
    setLocalMileageMax('');
    updateFilterParams({ yearMin: undefined, yearMax: undefined, mileageMin: undefined, mileageMax: undefined });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.sheet }]}> 
      <SheetHeader title="Year & Mileage" />

      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.md }}>
        <HapticPressable onPress={clear} hitSlop={Spacing.md}>
          <Text variant="subheadEmphasized" style={{ color: colors.error }}>Clear</Text>
        </HapticPressable>
        <HapticPressable
          onPress={apply}
          hitSlop={Spacing.md}
          style={{
            backgroundColor: colors.primary,
            borderRadius: Radius.full,
            paddingHorizontal: Spacing.md,
            paddingVertical: Spacing.sm,
          }}
        >
          <Text variant="subheadEmphasized" style={{ color: colors.primaryForeground }}>Apply</Text>
        </HapticPressable>
      </View>

      <View style={styles.section}>
        <Text variant="caption1Emphasized" tone="muted" uppercase>YEAR</Text>
        <View style={styles.rangeRow}>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border, color: colors.label }]}
            placeholder="Min"
            placeholderTextColor={colors.labelTertiary}
            keyboardType="number-pad"
            maxLength={4}
            value={localYearMin}
            onChangeText={setLocalYearMin}
          />
          <Text variant="body" tone="muted">-</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border, color: colors.label }]}
            placeholder="Max"
            placeholderTextColor={colors.labelTertiary}
            keyboardType="number-pad"
            maxLength={4}
            value={localYearMax}
            onChangeText={setLocalYearMax}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text variant="caption1Emphasized" tone="muted" uppercase>MILEAGE</Text>
        <View style={styles.presetsRow}>
          {MILEAGE_PRESETS.map((preset) => {
            const currentMax = localMileageMax ? parseInt(localMileageMax, 10) : undefined;
            const isActive = currentMax === preset.max;
            return (
              <HapticPressable
                key={preset.label}
                onPress={() => setLocalMileageMax(isActive ? '' : String(preset.max))}
                style={[styles.presetChip, { backgroundColor: isActive ? colors.label : colors.surfaceSecondary, borderColor: isActive ? colors.label : colors.border }]}
              >
                <Text variant="subhead" style={{ color: isActive ? colors.background : colors.labelSecondary }}>{preset.label}</Text>
              </HapticPressable>
            );
          })}
        </View>
        <View style={styles.rangeRow}>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border, color: colors.label }]}
            placeholder="Min"
            placeholderTextColor={colors.labelTertiary}
            keyboardType="number-pad"
            value={localMileageMin}
            onChangeText={setLocalMileageMin}
          />
          <Text variant="body" tone="muted">-</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border, color: colors.label }]}
            placeholder="Max"
            placeholderTextColor={colors.labelTertiary}
            keyboardType="number-pad"
            value={localMileageMax}
            onChangeText={setLocalMileageMax}
          />
        </View>
      </View>

      <HapticPressable onPress={clear} style={styles.clearRow}>
        <Text variant="subheadEmphasized" style={{ color: colors.error }}>Clear year/mileage filter</Text>
      </HapticPressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
    gap: Spacing.lg,
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
  section: {
    gap: Spacing.sm,
  },
  rangeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  input: {
    flex: 1,
    height: Spacing['5xl'],
    borderWidth: 1,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
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
  clearRow: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
});
