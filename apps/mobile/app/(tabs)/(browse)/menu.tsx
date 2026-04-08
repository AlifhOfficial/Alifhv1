import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Check, Plus } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { HapticPressable, SheetHeader, Text } from '@/components/ui';
import { useTheme } from '@/context/theme-context';
import { useSearch } from '@/context/search-context';
import {
  BODY_TYPES,
  ENGINE_SIZES,
  EXTERIOR_COLORS,
  EXPORT_STATUSES,
  FUEL_TYPES,
  INTERIOR_COLORS,
  SPECS_TYPES,
  TRANSMISSION_TYPES,
  UAE_EMIRATES,
  SELLER_TYPE_OPTIONS,
  type BodyType,
  type FuelType,
  type TransmissionType,
  type SpecsType,
  type ExteriorColor,
  type InteriorColor,
  type EngineSize,
  type SellerType,
} from '@/lib/filter-constants';
import type { ExportStatus } from '@/lib/listing-constants';
import { Colors, Radius, SheetChrome, Sizes, Spacing } from '@/constants/theme';

const PRICE_PRESETS = [
  { label: 'Under 50K', min: undefined, max: 50000 },
  { label: '50K-100K', min: 50000, max: 100000 },
  { label: '100K-200K', min: 100000, max: 200000 },
  { label: '200K+', min: 200000, max: undefined },
];

const MILEAGE_PRESETS = [
  { label: 'Under 20K', max: 20000 },
  { label: 'Under 50K', max: 50000 },
  { label: 'Under 100K', max: 100000 },
];

const YEAR_PRESETS = [
  { label: '2023+', min: 2023, max: undefined },
  { label: '2019-2022', min: 2019, max: 2022 },
  { label: '2015-2018', min: 2015, max: 2018 },
  { label: '2014 & older', min: undefined, max: 2014 },
];

type FilterSectionKey =
  | 'quick'
  | 'price'
  | 'year'
  | 'mileage'
  | 'location'
  | 'specs'
  | 'sellerType'
  | 'exportStatus'
  | 'bodyType'
  | 'fuelType'
  | 'transmission'
  | 'engineSize'
  | 'exteriorColor'
  | 'interiorColor';

const filterSectionOpenState: Partial<Record<FilterSectionKey, boolean>> = {};

// ── FilterSection ──────────────────────────────────────────────────────────────

function FilterSection({
  sectionKey,
  title,
  count,
  children,
  defaultOpen = false,
}: {
  sectionKey: FilterSectionKey;
  title: string;
  count: number;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const initialOpen = filterSectionOpenState[sectionKey] ?? defaultOpen;
  const [isOpen, setIsOpen] = useState(initialOpen);
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const rotation = useSharedValue(initialOpen ? 1 : 0);

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${interpolate(rotation.value, [0, 1], [0, 45])}deg` }],
  }));

  const toggle = () => {
    const next = !isOpen;
    rotation.value = withTiming(next ? 1 : 0, { duration: 250 });
    filterSectionOpenState[sectionKey] = next;
    setIsOpen(next);
  };

  return (
    <Animated.View layout={LinearTransition.duration(250)}>
      <HapticPressable onPress={toggle} style={sectionStyles.header}>
        <Text variant="subheadEmphasized">{title}</Text>
        <View style={sectionStyles.right}>
          {count > 0 ? (
            <View style={[sectionStyles.badge, { backgroundColor: colors.label }]}>
              <Text variant="caption1Emphasized" style={{ color: colors.background }}>
                {count > 9 ? '9+' : count}
              </Text>
            </View>
          ) : null}
          <Animated.View style={chevronStyle}>
            <Plus size={16} color={colors.labelTertiary} strokeWidth={1.75} />
          </Animated.View>
        </View>
      </HapticPressable>
      {isOpen ? (
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(150)}
          style={sectionStyles.content}
        >
          {children}
        </Animated.View>
      ) : null}
    </Animated.View>
  );
}

const sectionStyles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  badge: {
    minWidth: Spacing.lg,
    height: Spacing.lg,
    borderRadius: Spacing.lg / 2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xs,
  },
  content: {
    gap: Spacing.sm,
    paddingBottom: Spacing.sm,
  },
});

// ── BrowseMenuScreen ───────────────────────────────────────────────────────────

export default function BrowseMenuScreen() {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const router = useRouter();
  const {
    filterParams,
    updateFilterParams,
    clearFilterParams,
    sortBy,
    applySort,
    resetSort,
  } = useSearch();

  const [popularOnly, setPopularOnly] = useState(sortBy === 'popular');
  const [newCarsOnly, setNewCarsOnly] = useState(filterParams.condition === 'new');
  const [blackListingsOnly, setBlackListingsOnly] = useState(!!filterParams.isBlkListing);
  const [blackMembersOnly, setBlackMembersOnly] = useState(!!filterParams.isBlackTierPartner);
  const [negotiableOnly, setNegotiableOnly] = useState(!!filterParams.isNegotiable);

  const [priceMin, setPriceMin] = useState(filterParams.priceMin?.toString() ?? '');
  const [priceMax, setPriceMax] = useState(filterParams.priceMax?.toString() ?? '');
  const [yearMin, setYearMin] = useState(filterParams.yearMin?.toString() ?? '');
  const [yearMax, setYearMax] = useState(filterParams.yearMax?.toString() ?? '');
  const [mileageMin, setMileageMin] = useState(filterParams.mileageMin?.toString() ?? '');
  const [mileageMax, setMileageMax] = useState(filterParams.mileageMax?.toString() ?? '');

  const [selectedEmirates, setSelectedEmirates] = useState<string[]>(filterParams.emirate ?? []);
  const [selectedSpecs, setSelectedSpecs] = useState<SpecsType[]>((filterParams.specs ?? []) as SpecsType[]);
  const [selectedSellerType, setSelectedSellerType] = useState<SellerType | undefined>(filterParams.sellerType);
  const [selectedExportStatus, setSelectedExportStatus] = useState<ExportStatus[]>((filterParams.exportStatus ?? []) as ExportStatus[]);
  const [selectedBodyTypes, setSelectedBodyTypes] = useState<BodyType[]>((filterParams.bodyType ?? []) as BodyType[]);
  const [selectedFuelTypes, setSelectedFuelTypes] = useState<FuelType[]>((filterParams.fuelType ?? []) as FuelType[]);
  const [selectedTransmissions, setSelectedTransmissions] = useState<TransmissionType[]>((filterParams.transmission ?? []) as TransmissionType[]);
  const [selectedEngineSizes, setSelectedEngineSizes] = useState<EngineSize[]>((filterParams.engineSize ?? []) as EngineSize[]);
  const [selectedExteriorColors, setSelectedExteriorColors] = useState<ExteriorColor[]>((filterParams.exteriorColor ?? []) as ExteriorColor[]);
  const [selectedInteriorColors, setSelectedInteriorColors] = useState<InteriorColor[]>((filterParams.interiorColor ?? []) as InteriorColor[]);

  const [showAllLocations, setShowAllLocations] = useState(false);
  const [showAllSpecs, setShowAllSpecs] = useState(false);

  const displayedLocations = useMemo(() => {
    if (showAllLocations) return UAE_EMIRATES;
    return UAE_EMIRATES.slice(0, 6);
  }, [showAllLocations]);

  const displayedSpecs = useMemo(() => {
    if (showAllSpecs) return SPECS_TYPES;
    return SPECS_TYPES.slice(0, 6);
  }, [showAllSpecs]);

  const toggleArray = <T extends string>(current: T[], value: T): T[] => {
    return current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
  };

  const clearAll = () => {
    setPopularOnly(false);
    setNewCarsOnly(false);
    setBlackListingsOnly(false);
    setBlackMembersOnly(false);
    setNegotiableOnly(false);
    setPriceMin('');
    setPriceMax('');
    setYearMin('');
    setYearMax('');
    setMileageMin('');
    setMileageMax('');
    setSelectedEmirates([]);
    setSelectedSpecs([]);
    setSelectedSellerType(undefined);
    setSelectedExportStatus([]);
    setSelectedBodyTypes([]);
    setSelectedFuelTypes([]);
    setSelectedTransmissions([]);
    setSelectedEngineSizes([]);
    setSelectedExteriorColors([]);
    setSelectedInteriorColors([]);

    clearFilterParams();
    if (sortBy === 'popular') {
      resetSort();
    }
    router.back();
  };

  const applyFilters = () => {
    updateFilterParams({
      condition: newCarsOnly ? 'new' : undefined,
      isBlkListing: blackListingsOnly ? true : undefined,
      isBlackTierPartner: blackMembersOnly ? true : undefined,
      isNegotiable: negotiableOnly ? true : undefined,
      priceMin: priceMin ? parseInt(priceMin, 10) : undefined,
      priceMax: priceMax ? parseInt(priceMax, 10) : undefined,
      yearMin: yearMin ? parseInt(yearMin, 10) : undefined,
      yearMax: yearMax ? parseInt(yearMax, 10) : undefined,
      mileageMin: mileageMin ? parseInt(mileageMin, 10) : undefined,
      mileageMax: mileageMax ? parseInt(mileageMax, 10) : undefined,
      emirate: selectedEmirates.length > 0 ? selectedEmirates : undefined,
      specs: selectedSpecs.length > 0 ? selectedSpecs : undefined,
      sellerType: selectedSellerType ?? undefined,
      exportStatus: selectedExportStatus.length > 0 ? selectedExportStatus : undefined,
      bodyType: selectedBodyTypes.length > 0 ? selectedBodyTypes : undefined,
      fuelType: selectedFuelTypes.length > 0 ? selectedFuelTypes : undefined,
      transmission: selectedTransmissions.length > 0 ? selectedTransmissions : undefined,
      engineSize: selectedEngineSizes.length > 0 ? selectedEngineSizes : undefined,
      exteriorColor: selectedExteriorColors.length > 0 ? selectedExteriorColors : undefined,
      interiorColor: selectedInteriorColors.length > 0 ? selectedInteriorColors : undefined,
    });

    if (popularOnly) {
      applySort('popular');
    } else if (sortBy === 'popular') {
      resetSort();
    }
    router.back();
  };

  const renderChip = (label: string, selected: boolean, onPress: () => void, accentColor?: string) => (
    <HapticPressable
      key={label}
      onPress={onPress}
      style={[styles.chip, { backgroundColor: selected ? colors.label : colors.surfaceSecondary, borderColor: selected ? colors.label : colors.border }]}
    >
      <View style={styles.chipContent}>
        {accentColor ? (
          <View style={[styles.colorDot, { backgroundColor: accentColor, borderColor: colors.border }]} />
        ) : null}
        <Text variant="subhead" style={{ color: selected ? colors.background : colors.label }}>{label}</Text>
      </View>
    </HapticPressable>
  );

  const renderRangeInput = (
    value: string,
    onChangeText: (text: string) => void,
    placeholder: string,
    maxLength?: number
  ) => (
    <View style={styles.inputWrapper}>
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: colors.surfaceSecondary,
            borderColor: colors.border,
            color: colors.label,
          },
        ]}
        placeholder={placeholder}
        placeholderTextColor={colors.labelTertiary}
        keyboardType="number-pad"
        maxLength={maxLength}
        value={value}
        onChangeText={onChangeText}
      />
      {value.length > 0 ? (
        <Animated.View
          entering={FadeIn.duration(120)}
          exiting={FadeOut.duration(90)}
          style={[
            styles.inputCheck,
            { backgroundColor: colors.surfaceSecondary, borderColor: colors.border },
          ]}
        >
          <Check size={12} color={colors.label} strokeWidth={2.25} />
        </Animated.View>
      ) : null}
    </View>
  );

  const quickCount =
    (popularOnly ? 1 : 0) +
    (newCarsOnly ? 1 : 0) +
    (blackListingsOnly ? 1 : 0) +
    (blackMembersOnly ? 1 : 0) +
    (negotiableOnly ? 1 : 0);
  const priceCount = priceMin || priceMax ? 1 : 0;
  const yearCount = yearMin || yearMax ? 1 : 0;
  const mileageCount = mileageMin || mileageMax ? 1 : 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.sheet }]} collapsable={false}>
      <SheetHeader
        title="All Filters"
        left={
          <HapticPressable
            onPress={clearAll}
            hitSlop={Spacing.sm}
            style={[
              styles.headerActionButton,
              { backgroundColor: colors.surfaceSecondary, borderColor: colors.border },
            ]}
          >
            <Ionicons name="close" size={Sizes.iconSm} color={colors.error} />
          </HapticPressable>
        }
        right={
          <HapticPressable
            onPress={applyFilters}
            hitSlop={Spacing.sm}
            style={[styles.headerActionButton, { backgroundColor: colors.primary }]}
          >
            <Ionicons name="checkmark" size={Sizes.iconSm} color={colors.primaryForeground} />
          </HapticPressable>
        }
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >

      <FilterSection sectionKey="quick" title="Quick Filters" count={quickCount} defaultOpen={quickCount > 0}>
        <View style={styles.chipsRow}>
          {renderChip('Popular', popularOnly, () => setPopularOnly((prev) => !prev))}
          {renderChip('New Cars', newCarsOnly, () => setNewCarsOnly((prev) => !prev))}
          {renderChip('Black Listings', blackListingsOnly, () => setBlackListingsOnly((prev) => !prev))}
          {renderChip('Black Members', blackMembersOnly, () => setBlackMembersOnly((prev) => !prev))}
          {renderChip('Negotiable', negotiableOnly, () => setNegotiableOnly((prev) => !prev))}
        </View>
      </FilterSection>

      <FilterSection sectionKey="price" title="Price" count={priceCount} defaultOpen={priceCount > 0}>
        <View style={styles.chipsRow}>
          {PRICE_PRESETS.map((preset) => {
            const currentMin = priceMin ? parseInt(priceMin, 10) : undefined;
            const currentMax = priceMax ? parseInt(priceMax, 10) : undefined;
            const isActive = preset.min === currentMin && preset.max === currentMax;
            return renderChip(
              preset.label,
              isActive,
              () => {
                if (isActive) {
                  setPriceMin('');
                  setPriceMax('');
                } else {
                  setPriceMin(preset.min?.toString() ?? '');
                  setPriceMax(preset.max?.toString() ?? '');
                }
              }
            );
          })}
        </View>
        <View style={styles.rangeRow}>
          {renderRangeInput(priceMin, setPriceMin, 'Min')}
          <Text variant="body" tone="muted">-</Text>
          {renderRangeInput(priceMax, setPriceMax, 'Max')}
        </View>
      </FilterSection>

      <FilterSection sectionKey="year" title="Year" count={yearCount} defaultOpen={yearCount > 0}>
        <View style={styles.chipsRow}>
          {YEAR_PRESETS.map((preset) => {
            const currentMin = yearMin ? parseInt(yearMin, 10) : undefined;
            const currentMax = yearMax ? parseInt(yearMax, 10) : undefined;
            const isActive = preset.min === currentMin && preset.max === currentMax;
            return renderChip(
              preset.label,
              isActive,
              () => {
                if (isActive) {
                  setYearMin('');
                  setYearMax('');
                } else {
                  setYearMin(preset.min?.toString() ?? '');
                  setYearMax(preset.max?.toString() ?? '');
                }
              }
            );
          })}
        </View>
        <View style={styles.rangeRow}>
          {renderRangeInput(yearMin, setYearMin, 'Min', 4)}
          <Text variant="body" tone="muted">-</Text>
          {renderRangeInput(yearMax, setYearMax, 'Max', 4)}
        </View>
      </FilterSection>

      <FilterSection sectionKey="mileage" title="Mileage" count={mileageCount} defaultOpen={mileageCount > 0}>
        <View style={styles.chipsRow}>
          {MILEAGE_PRESETS.map((preset) => {
            const currentMax = mileageMax ? parseInt(mileageMax, 10) : undefined;
            const isActive = currentMax === preset.max;
            return renderChip(
              preset.label,
              isActive,
              () => setMileageMax(isActive ? '' : String(preset.max))
            );
          })}
        </View>
        <View style={styles.rangeRow}>
          {renderRangeInput(mileageMin, setMileageMin, 'Min')}
          <Text variant="body" tone="muted">-</Text>
          {renderRangeInput(mileageMax, setMileageMax, 'Max')}
        </View>
      </FilterSection>

      <FilterSection sectionKey="location" title="Location" count={selectedEmirates.length} defaultOpen={selectedEmirates.length > 0}>
        <View style={styles.chipsRow}>
          {displayedLocations.map((option) => {
            const selected = selectedEmirates.includes(option.value);
            return renderChip(option.label, selected, () => {
              setSelectedEmirates((prev) => toggleArray(prev, option.value));
            });
          })}
        </View>
        {UAE_EMIRATES.length > 6 ? (
          <HapticPressable onPress={() => setShowAllLocations((prev) => !prev)}>
            <Text variant="footnote" tone="muted">{showAllLocations ? 'Show less' : 'Show 1 more'}</Text>
          </HapticPressable>
        ) : null}
      </FilterSection>

      <FilterSection sectionKey="specs" title="Regional Specs" count={selectedSpecs.length} defaultOpen={selectedSpecs.length > 0}>
        <View style={styles.chipsRow}>
          {displayedSpecs.map((option) => {
            const selected = selectedSpecs.includes(option.value);
            return renderChip(option.label, selected, () => {
              setSelectedSpecs((prev) => toggleArray(prev, option.value));
            });
          })}
        </View>
        {SPECS_TYPES.length > 6 ? (
          <HapticPressable onPress={() => setShowAllSpecs((prev) => !prev)}>
            <Text variant="footnote" tone="muted">{showAllSpecs ? 'Show less' : 'Show 2 more'}</Text>
          </HapticPressable>
        ) : null}
      </FilterSection>

      <FilterSection sectionKey="sellerType" title="Seller Type" count={selectedSellerType ? 1 : 0} defaultOpen={!!selectedSellerType}>
        <View style={styles.chipsRow}>
          {SELLER_TYPE_OPTIONS.map((opt) => {
            const selected = selectedSellerType === opt.value;
            return renderChip(opt.label, selected, () => {
              setSelectedSellerType(selected ? undefined : opt.value);
            });
          })}
        </View>
      </FilterSection>

      <FilterSection sectionKey="exportStatus" title="Export Status" count={selectedExportStatus.length} defaultOpen={selectedExportStatus.length > 0}>
        <View style={styles.chipsRow}>
          {EXPORT_STATUSES.map((option) => {
            const selected = selectedExportStatus.includes(option.value);
            return renderChip(option.label, selected, () => {
              setSelectedExportStatus((prev) => toggleArray(prev, option.value));
            });
          })}
        </View>
      </FilterSection>

      <FilterSection sectionKey="bodyType" title="Body Type" count={selectedBodyTypes.length} defaultOpen={selectedBodyTypes.length > 0}>
        <View style={styles.chipsRow}>
          {BODY_TYPES.map((option) => {
            const selected = selectedBodyTypes.includes(option.value);
            return renderChip(option.label, selected, () => {
              setSelectedBodyTypes((prev) => toggleArray(prev, option.value));
            });
          })}
        </View>
      </FilterSection>

      <FilterSection sectionKey="fuelType" title="Fuel Type" count={selectedFuelTypes.length} defaultOpen={selectedFuelTypes.length > 0}>
        <View style={styles.chipsRow}>
          {FUEL_TYPES.map((option) => {
            const selected = selectedFuelTypes.includes(option.value);
            return renderChip(option.label, selected, () => {
              setSelectedFuelTypes((prev) => toggleArray(prev, option.value));
            });
          })}
        </View>
      </FilterSection>

      <FilterSection sectionKey="transmission" title="Transmission" count={selectedTransmissions.length} defaultOpen={selectedTransmissions.length > 0}>
        <View style={styles.chipsRow}>
          {TRANSMISSION_TYPES.map((option) => {
            const selected = selectedTransmissions.includes(option.value);
            return renderChip(option.label, selected, () => {
              setSelectedTransmissions((prev) => toggleArray(prev, option.value));
            });
          })}
        </View>
      </FilterSection>

      <FilterSection sectionKey="engineSize" title="Engine Size" count={selectedEngineSizes.length} defaultOpen={selectedEngineSizes.length > 0}>
        <View style={styles.chipsRow}>
          {ENGINE_SIZES.map((option) => {
            const selected = selectedEngineSizes.includes(option.value);
            return renderChip(option.label, selected, () => {
              setSelectedEngineSizes((prev) => toggleArray(prev, option.value));
            });
          })}
        </View>
      </FilterSection>

      <FilterSection sectionKey="exteriorColor" title="Exterior Color" count={selectedExteriorColors.length} defaultOpen={selectedExteriorColors.length > 0}>
        <View style={styles.chipsRow}>
          {EXTERIOR_COLORS.map((option) => {
            const selected = selectedExteriorColors.includes(option.value);
            return renderChip(option.label, selected, () => {
              setSelectedExteriorColors((prev) => toggleArray(prev, option.value));
            }, option.hex);
          })}
        </View>
      </FilterSection>

      <FilterSection sectionKey="interiorColor" title="Interior Color" count={selectedInteriorColors.length} defaultOpen={selectedInteriorColors.length > 0}>
        <View style={styles.chipsRow}>
          {INTERIOR_COLORS.map((option) => {
            const selected = selectedInteriorColors.includes(option.value);
            return renderChip(option.label, selected, () => {
              setSelectedInteriorColors((prev) => toggleArray(prev, option.value));
            }, option.hex);
          })}
        </View>
      </FilterSection>
      </ScrollView>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: SheetChrome.contentPaddingHorizontal,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: Spacing['3xl'],
    gap: Spacing.lg,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  chipContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  colorDot: {
    width: Spacing.sm,
    height: Spacing.sm,
    borderRadius: Spacing.sm / 2,
    borderWidth: 1,
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
    paddingRight: Spacing['2xl'],
  },
  inputWrapper: {
    flex: 1,
    position: 'relative',
  },
  inputCheck: {
    position: 'absolute',
    right: Spacing.sm,
    top: '50%',
    marginTop: -8,
    width: 16,
    height: 16,
    borderRadius: Radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerActionButton: {
    width: Sizes.actionButtonSm,
    height: Sizes.actionButtonSm,
    borderRadius: Radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
