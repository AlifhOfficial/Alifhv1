import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Plus } from 'lucide-react-native';

import { Text, HapticPressable } from '@/components/ui';
import { useTheme } from '@/context/theme-context';
import { useSearch, type BrowseViewMode, type FilterPillType } from '@/context/search-context';
import { BorderWidths, Colors, Radius, Sizes, Spacing } from '@/constants/theme';

type DrawerPillItem = {
  type: FilterPillType;
  label: string;
  activeCount: number;
};

export default function BrowseMenuScreen() {
  const params = useLocalSearchParams<{ viewMode?: string }>();
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const {
    searchParams,
    filterParams,
    triggerBrowseViewMode,
  } = useSearch();
  const currentViewMode: BrowseViewMode = params.viewMode === 'list' ? 'list' : 'grid';

  const settingsCount = useMemo(() => {
    let count = 0;
    if (filterParams.condition) count++;
    if (filterParams.isBlkListing) count++;
    if (filterParams.isBlackTierPartner) count++;
    if (filterParams.isNegotiable) count++;
    count += filterParams.specs?.length ?? 0;
    count += filterParams.bodyType?.length ?? 0;
    count += filterParams.fuelType?.length ?? 0;
    count += filterParams.transmission?.length ?? 0;
    count += filterParams.exteriorColor?.length ?? 0;
    count += filterParams.interiorColor?.length ?? 0;
    count += filterParams.engineSize?.length ?? 0;
    if (filterParams.sellerType) count++;
    count += filterParams.exportStatus?.length ?? 0;
    return count;
  }, [filterParams]);

  const pills = useMemo<DrawerPillItem[]>(() => {
    const makeCount = searchParams?.make?.length ?? 0;
    const modelCount = searchParams?.model?.length ?? 0;
    const priceCount = filterParams.priceMin || filterParams.priceMax ? 1 : 0;
    const yearMileageCount =
      ((filterParams.yearMin || filterParams.yearMax) ? 1 : 0) +
      ((filterParams.mileageMin || filterParams.mileageMax) ? 1 : 0);
    const locationCount = filterParams.emirate?.length ?? 0;

    return [
      { type: 'make', label: 'Make', activeCount: makeCount },
      { type: 'model', label: 'Model', activeCount: modelCount },
      { type: 'price', label: 'Price', activeCount: priceCount },
      { type: 'yearMileage', label: 'Year & Km', activeCount: yearMileageCount },
      { type: 'location', label: 'Location', activeCount: locationCount },
    ];
  }, [filterParams, searchParams]);

  const handleSettingsPress = () => {
    router.replace({ pathname: '/(tabs)/(browse)/more-filters', params: { viewMode: currentViewMode } });
  };

  const handlePillPress = (type: FilterPillType) => {
    const routeByType: Record<FilterPillType, '/(tabs)/(browse)/filter-make' | '/(tabs)/(browse)/filter-model' | '/(tabs)/(browse)/filter-price' | '/(tabs)/(browse)/filter-year-mileage' | '/(tabs)/(browse)/filter-location'> = {
      make: '/(tabs)/(browse)/filter-make',
      model: '/(tabs)/(browse)/filter-model',
      price: '/(tabs)/(browse)/filter-price',
      yearMileage: '/(tabs)/(browse)/filter-year-mileage',
      location: '/(tabs)/(browse)/filter-location',
    };
    router.replace(routeByType[type]);
  };

  const handleViewToggle = () => {
    const mode: BrowseViewMode = currentViewMode === 'grid' ? 'list' : 'grid';
    triggerBrowseViewMode(mode);
    router.back();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.sheet }]}> 
      <View style={[styles.header, { borderBottomColor: colors.sheetBorder }]}> 
        <Text variant="caption1Emphasized" tone="muted" uppercase>
          Browse Menu
        </Text>
      </View>

      <View style={styles.rows}>
        <HapticPressable style={styles.row} onPress={handleSettingsPress}>
          <Text variant="subhead">Filters</Text>
          {settingsCount > 0 ? (
            <View style={[styles.badge, { backgroundColor: colors.label }]}> 
              <Text variant="caption1Emphasized" style={{ color: colors.background }}>
                {settingsCount > 9 ? '9+' : settingsCount}
              </Text>
            </View>
          ) : (
            <View style={[styles.plusWrap, { borderColor: colors.border }]}>
              <Plus size={Sizes.iconSm - Spacing.xs} color={colors.labelSecondary} strokeWidth={2.25} />
            </View>
          )}
        </HapticPressable>

        {pills.map((pill) => (
          <HapticPressable key={pill.type} style={styles.row} onPress={() => handlePillPress(pill.type)}>
            <Text variant="subhead">{pill.label}</Text>
            {pill.activeCount > 0 ? (
              <View style={[styles.badge, { backgroundColor: colors.label }]}> 
                <Text variant="caption1Emphasized" style={{ color: colors.background }}>
                  {pill.activeCount > 9 ? '9+' : pill.activeCount}
                </Text>
              </View>
            ) : (
              <View style={[styles.plusWrap, { borderColor: colors.border }]}>
                <Plus size={Sizes.iconSm - Spacing.xs} color={colors.labelSecondary} strokeWidth={2.25} />
              </View>
            )}
          </HapticPressable>
        ))}

        <HapticPressable style={styles.row} onPress={handleViewToggle}>
          <Text variant="subhead">View</Text>
          <Text variant="subhead" tone="secondary">{currentViewMode === 'grid' ? 'Grid' : 'List'}</Text>
        </HapticPressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  header: {
    alignItems: 'center',
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginBottom: Spacing.md,
  },
  rows: {
    gap: Spacing.xs,
  },
  row: {
    minHeight: Sizes.pillHeight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  badge: {
    minWidth: Sizes.iconSm,
    height: Sizes.iconSm,
    borderRadius: Sizes.iconSm / 2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xs,
  },
  plusWrap: {
    width: Sizes.iconSm,
    height: Sizes.iconSm,
    borderRadius: Sizes.iconSm / 2,
    borderWidth: BorderWidths.thin,
    alignItems: 'center',
    justifyContent: 'center',
  },
});