import { useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { Copy } from 'lucide-react-native';

import { HapticPressable, SheetHeader, Text } from '@/components/ui';
import { Colors, Radius, Sizes, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { useListingDetail } from '@/hooks/use-listing-query';
import {
  getEnumLabel,
  VEHICLE_CONDITIONS,
  BODY_TYPES,
  TRANSMISSION_TYPES,
  FUEL_TYPES,
  EXTERIOR_COLORS,
  INTERIOR_COLORS,
  STEERING_SIDES,
  DOORS_OPTIONS,
  SEATING_OPTIONS,
  POWER_RANGES,
  ENGINE_SIZES,
} from '@/lib/listing-constants';

type SpecItem = {
  label: string;
  value: string | number | null | undefined;
};

function SpecRow({ label, value }: SpecItem) {
  const displayValue = value === null || value === undefined ? '-' : String(value);

  return (
    <View style={styles.specRow}>
      <Text variant="subhead" tone="secondary">{label}</Text>
      <Text variant="subhead">{displayValue}</Text>
    </View>
  );
}

export default function ListingSpecsSheetScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const [copied, setCopied] = useState(false);

  const { listing, isLoading } = useListingDetail({
    listingId: id,
    trackView: false,
  });

  const specs = useMemo<SpecItem[]>(() => {
    const l = listing?.listing;
    if (!l) return [];

    return [
      { label: 'Condition', value: l.condition ? getEnumLabel(VEHICLE_CONDITIONS, l.condition) : null },
      { label: 'Body Type', value: l.bodyType ? getEnumLabel(BODY_TYPES, l.bodyType) : null },
      { label: 'Transmission', value: l.transmission ? getEnumLabel(TRANSMISSION_TYPES, l.transmission) : null },
      { label: 'Fuel Type', value: l.fuelType ? getEnumLabel(FUEL_TYPES, l.fuelType) : null },
      { label: 'Engine', value: l.engineSize ? getEnumLabel(ENGINE_SIZES, l.engineSize) : null },
      { label: 'Cylinders', value: l.cylinders },
      { label: 'Power', value: l.powerRange ? getEnumLabel(POWER_RANGES, l.powerRange) : null },
      { label: 'Exterior Color', value: l.exteriorColor ? getEnumLabel(EXTERIOR_COLORS, l.exteriorColor) : null },
      { label: 'Interior Color', value: l.interiorColor ? getEnumLabel(INTERIOR_COLORS, l.interiorColor) : null },
      { label: 'Doors', value: l.doors ? getEnumLabel(DOORS_OPTIONS, l.doors) : null },
      { label: 'Seats', value: l.seatingCapacity ? getEnumLabel(SEATING_OPTIONS, l.seatingCapacity) : null },
      { label: 'Steering', value: l.steeringSide ? getEnumLabel(STEERING_SIDES, l.steeringSide) : null },
    ].filter((s) => s.value != null);
  }, [listing]);

  const handleCopy = async () => {
    if (specs.length === 0) return;
    const text = specs.map((s) => `${s.label}: ${s.value ?? '-'}`).join('\n');
    await Clipboard.setStringAsync(text);
    if (process.env.EXPO_OS === 'ios') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const body = useMemo(() => {
    if (isLoading) {
      return <ActivityIndicator size="small" color={colors.labelTertiary} />;
    }
    if (specs.length === 0) {
      return <Text variant="subhead" tone="secondary">No specifications available.</Text>;
    }

    return (
      <View style={styles.listContainer}>
        {specs.map((spec) => (
          <SpecRow key={spec.label} label={spec.label} value={spec.value} />
        ))}
      </View>
    );
  }, [isLoading, colors.labelTertiary, specs]);

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={[styles.container, { backgroundColor: colors.sheet }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <SheetHeader
        title="Specifications"
        right={
          <HapticPressable
            onPress={handleCopy}
            hitSlop={Spacing.md}
            style={[styles.iconButton, { backgroundColor: colors.fill2 }]}
            disabled={specs.length === 0}
          >
            {copied ? (
              <Ionicons name="checkmark" size={Sizes.iconSm} color={colors.primary} />
            ) : (
              <Copy size={Sizes.iconSm} color={colors.labelSecondary} />
            )}
          </HapticPressable>
        }
      />

      <View style={styles.body}>{body}</View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing['3xl'],
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
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.xs,
  },
  iconButton: {
    width: Spacing['3xl'],
    height: Spacing['3xl'],
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    minHeight: Sizes.iconLg,
  },
  listContainer: {
    gap: Spacing.none,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
});
