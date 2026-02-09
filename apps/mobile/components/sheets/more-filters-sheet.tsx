/**
 * MoreFiltersSheet - Bottom Sheet for additional filters & display settings
 * Includes: View Mode, Popular toggles, Regional Specs, Negotiable, Body Type, Fuel, Transmission, Seller Type
 * Uses @gorhom/bottom-sheet modal for proper iOS gesture handling
 */

import React, { useCallback, useMemo, useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Platform, Switch } from 'react-native';
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { Check, ChevronDown, ChevronUp, LayoutGrid, List } from 'lucide-react-native';

import { Colors, Spacing, Radius, Typography } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { Heading, Label } from '@/components/ui';
import type { FacetBucket } from '@/lib/api';

export type ViewMode = 'grid' | 'list';

const VIEW_OPTIONS: { value: ViewMode; label: string; icon: typeof LayoutGrid }[] = [
  { value: 'grid', label: 'Grid', icon: LayoutGrid },
  { value: 'list', label: 'List', icon: List },
];

// Static filter options
const BODY_TYPES = [
  { value: 'sedan', label: 'Sedan' },
  { value: 'suv', label: 'SUV' },
  { value: 'coupe', label: 'Coupe' },
  { value: 'hatchback', label: 'Hatchback' },
  { value: 'convertible', label: 'Convertible' },
  { value: 'wagon', label: 'Wagon' },
  { value: 'pickup', label: 'Pickup' },
  { value: 'van', label: 'Van' },
];

const FUEL_TYPES = [
  { value: 'petrol', label: 'Petrol' },
  { value: 'diesel', label: 'Diesel' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'electric', label: 'Electric' },
];

const TRANSMISSION_TYPES = [
  { value: 'automatic', label: 'Automatic' },
  { value: 'manual', label: 'Manual' },
];

const SELLER_TYPES = [
  { value: 'dealer', label: 'Dealer' },
  { value: 'private', label: 'Private' },
];

export interface MoreFiltersState {
  condition?: 'new' | 'used';
  isBlkListing?: boolean;
  isBlackTierPartner?: boolean;
  isNegotiable?: boolean;
  specs?: string[];
  bodyType?: string[];
  fuelType?: string[];
  transmission?: string[];
  sellerType?: 'dealer' | 'private';
}

interface MoreFiltersSheetProps {
  visible: boolean;
  onClose: () => void;
  filters: MoreFiltersState;
  facets?: {
    specs?: FacetBucket[];
    bodyType?: FacetBucket[];
    fuelType?: FacetBucket[];
    transmission?: FacetBucket[];
  };
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onApply: (filters: MoreFiltersState) => void;
}

export function MoreFiltersSheet({ 
  visible, 
  onClose, 
  filters,
  facets,
  viewMode,
  onViewModeChange,
  onApply,
}: MoreFiltersSheetProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const bottomSheetRef = useRef<BottomSheetModal>(null);

  // Local state
  const [localFilters, setLocalFilters] = useState<MoreFiltersState>(filters);
  
  // Collapsible sections
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['popular']));

  // Sync with props when sheet opens
  useEffect(() => {
    if (visible) {
      setLocalFilters(filters);
    }
  }, [visible, filters]);

  const snapPoints = useMemo(() => ['85%'], []);

  useEffect(() => {
    if (visible) {
      bottomSheetRef.current?.present();
    } else {
      bottomSheetRef.current?.dismiss();
    }
  }, [visible]);

  const handleSheetChanges = useCallback((index: number) => {
    if (index === -1) {
      onClose();
    }
  }, [onClose]);

  const toggleSection = useCallback((section: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  }, []);

  const handleToggleArray = useCallback((key: keyof MoreFiltersState, value: string) => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setLocalFilters(prev => {
      const current = (prev[key] as string[] | undefined) || [];
      if (current.includes(value)) {
        const updated = current.filter(v => v !== value);
        return { ...prev, [key]: updated.length > 0 ? updated : undefined };
      }
      return { ...prev, [key]: [...current, value] };
    });
  }, []);

  const handleToggleBoolean = useCallback((key: keyof MoreFiltersState) => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setLocalFilters(prev => ({
      ...prev,
      [key]: prev[key] ? undefined : true,
    }));
  }, []);

  const handleSetSellerType = useCallback((value: 'dealer' | 'private') => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setLocalFilters(prev => ({
      ...prev,
      sellerType: prev.sellerType === value ? undefined : value,
    }));
  }, []);

  const handleViewModeSelect = useCallback((mode: ViewMode) => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onViewModeChange(mode);
  }, [onViewModeChange]);

  const handleApply = useCallback(() => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onApply(localFilters);
    bottomSheetRef.current?.dismiss();
  }, [localFilters, onApply]);

  const handleClear = useCallback(() => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setLocalFilters({});
    onApply({});
    bottomSheetRef.current?.dismiss();
  }, [onApply]);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
        pressBehavior="close"
      />
    ),
    []
  );

  // Count active filters
  const activeCount = useMemo(() => {
    let count = 0;
    if (localFilters.condition === 'new') count++;
    if (localFilters.isBlkListing) count++;
    if (localFilters.isBlackTierPartner) count++;
    if (localFilters.isNegotiable) count++;
    count += localFilters.specs?.length ?? 0;
    count += localFilters.bodyType?.length ?? 0;
    count += localFilters.fuelType?.length ?? 0;
    count += localFilters.transmission?.length ?? 0;
    if (localFilters.sellerType) count++;
    return count;
  }, [localFilters]);

  const hasValue = activeCount > 0;

  // Render a collapsible section
  const renderSection = (
    title: string, 
    key: string, 
    content: React.ReactNode,
    selectedCount: number = 0
  ) => {
    const isExpanded = expandedSections.has(key);
    return (
      <View style={styles.section}>
        <Pressable 
          style={styles.sectionHeader}
          onPress={() => toggleSection(key)}
        >
          <View style={styles.sectionTitleRow}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
            {selectedCount > 0 && (
              <View style={[styles.badge, { backgroundColor: colors.text }]}>
                <Text style={[styles.badgeText, { color: colors.background }]}>{selectedCount}</Text>
              </View>
            )}
          </View>
          {isExpanded ? (
            <ChevronUp size={20} color={colors.textSecondary} />
          ) : (
            <ChevronDown size={20} color={colors.textSecondary} />
          )}
        </Pressable>
        {isExpanded && <View style={styles.sectionContent}>{content}</View>}
      </View>
    );
  };

  // Render chip options
  const renderChipOptions = (
    options: { value: string; label: string }[],
    selected: string[] | undefined,
    onToggle: (value: string) => void,
    facetData?: FacetBucket[]
  ) => (
    <View style={styles.chipsRow}>
      {options.map(option => {
        const isSelected = selected?.includes(option.value);
        const facet = facetData?.find(f => f.value === option.value);
        const count = facet?.count ?? 0;

        return (
          <Pressable
            key={option.value}
            onPress={() => onToggle(option.value)}
            style={[
              styles.chip,
              { 
                backgroundColor: isSelected ? colors.text : colors.surfaceSecondary,
                borderColor: isSelected ? colors.text : colors.border,
              },
            ]}
          >
            <Text
              style={[
                styles.chipLabel,
                { color: isSelected ? colors.background : colors.textSecondary },
              ]}
            >
              {option.label}
            </Text>
            {count > 0 && (
              <Text
                style={[
                  styles.chipCount,
                  { color: isSelected ? colors.background : colors.textTertiary },
                ]}
              >
                {count}
              </Text>
            )}
          </Pressable>
        );
      })}
    </View>
  );

  // Render toggle row
  const renderToggleRow = (
    label: string,
    value: boolean | undefined,
    onToggle: () => void
  ) => (
    <Pressable 
      style={styles.toggleRow}
      onPress={onToggle}
    >
      <Text style={[styles.toggleLabel, { color: colors.text }]}>{label}</Text>
      <View style={[
        styles.checkbox,
        { 
          borderColor: value ? colors.text : colors.border,
          backgroundColor: value ? colors.text : 'transparent',
        },
      ]}>
        {value && <Check size={14} color={colors.background} strokeWidth={3} />}
      </View>
    </Pressable>
  );

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      snapPoints={snapPoints}
      enablePanDownToClose
      onChange={handleSheetChanges}
      backdropComponent={renderBackdrop}
      backgroundStyle={[styles.background, { backgroundColor: colors.surface }]}
      handleIndicatorStyle={[styles.handleIndicator, { backgroundColor: colors.border }]}
      stackBehavior="push"
      detached
      bottomInset={insets.bottom + 20}
      style={styles.sheetContainer}
    >
      <BottomSheetScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Heading size="large" style={{ color: colors.text }}>Settings</Heading>
          <Pressable 
            onPress={onClose} 
            hitSlop={Spacing.md}
            style={({ pressed }) => [
              styles.closeButton,
              { backgroundColor: pressed ? colors.surfacePressed : colors.surface }
            ]}
          >
            <Ionicons name="close" size={18} color={colors.icon} />
          </Pressable>
        </View>

        {/* View Mode Section */}
        <View style={styles.viewModeSection}>
          <Label size="small" style={{ color: colors.textSecondary, marginBottom: Spacing.md }}>
            VIEW
          </Label>
          <View style={styles.viewModeRow}>
            {VIEW_OPTIONS.map((option) => {
              const selected = viewMode === option.value;
              const Icon = option.icon;

              return (
                <Pressable
                  key={option.value}
                  onPress={() => handleViewModeSelect(option.value)}
                  style={({ pressed }) => [
                    styles.viewModeButton,
                    { 
                      backgroundColor: selected 
                        ? colors.text 
                        : pressed 
                          ? colors.surface 
                          : colors.surfaceSecondary,
                      borderColor: selected ? colors.text : colors.border,
                    },
                  ]}
                >
                  <Icon 
                    size={20} 
                    color={selected ? colors.background : colors.textSecondary} 
                    strokeWidth={2}
                  />
                  <Text
                    style={[
                      styles.viewModeLabel,
                      { color: selected ? colors.background : colors.textSecondary },
                    ]}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Popular Section */}
        {renderSection(
          'Popular',
          'popular',
          <View style={styles.togglesContainer}>
            {renderToggleRow('New Cars Only', localFilters.condition === 'new', () => {
              setLocalFilters(prev => ({
                ...prev,
                condition: prev.condition === 'new' ? undefined : 'new',
              }));
            })}
            {renderToggleRow('Black Listings', localFilters.isBlkListing, () => handleToggleBoolean('isBlkListing'))}
            {renderToggleRow('Black Members', localFilters.isBlackTierPartner, () => handleToggleBoolean('isBlackTierPartner'))}
          </View>,
          (localFilters.condition === 'new' ? 1 : 0) + 
          (localFilters.isBlkListing ? 1 : 0) + 
          (localFilters.isBlackTierPartner ? 1 : 0)
        )}

        {/* Negotiable Section */}
        {renderSection(
          'Negotiable',
          'negotiable',
          renderToggleRow('Negotiable prices only', localFilters.isNegotiable, () => handleToggleBoolean('isNegotiable')),
          localFilters.isNegotiable ? 1 : 0
        )}

        {/* Regional Specs Section */}
        {renderSection(
          'Regional Specs',
          'specs',
          renderChipOptions(
            facets?.specs?.map(s => ({ value: s.value, label: s.label })) || [
              { value: 'gcc', label: 'GCC Specs' },
              { value: 'american', label: 'American Specs' },
              { value: 'european', label: 'European Specs' },
              { value: 'japanese', label: 'Japanese Specs' },
              { value: 'canadian', label: 'Canadian Specs' },
              { value: 'other', label: 'Other' },
            ],
            localFilters.specs,
            (value) => handleToggleArray('specs', value),
            facets?.specs
          ),
          localFilters.specs?.length ?? 0
        )}

        {/* Body Type Section */}
        {renderSection(
          'Body Type',
          'bodyType',
          renderChipOptions(
            BODY_TYPES,
            localFilters.bodyType,
            (value) => handleToggleArray('bodyType', value),
            facets?.bodyType
          ),
          localFilters.bodyType?.length ?? 0
        )}

        {/* Fuel Type Section */}
        {renderSection(
          'Fuel Type',
          'fuelType',
          renderChipOptions(
            FUEL_TYPES,
            localFilters.fuelType,
            (value) => handleToggleArray('fuelType', value),
            facets?.fuelType
          ),
          localFilters.fuelType?.length ?? 0
        )}

        {/* Transmission Section */}
        {renderSection(
          'Transmission',
          'transmission',
          renderChipOptions(
            TRANSMISSION_TYPES,
            localFilters.transmission,
            (value) => handleToggleArray('transmission', value),
            facets?.transmission
          ),
          localFilters.transmission?.length ?? 0
        )}

        {/* Seller Type Section */}
        {renderSection(
          'Seller Type',
          'sellerType',
          <View style={styles.chipsRow}>
            {SELLER_TYPES.map(option => {
              const isSelected = localFilters.sellerType === option.value;
              return (
                <Pressable
                  key={option.value}
                  onPress={() => handleSetSellerType(option.value as 'dealer' | 'private')}
                  style={[
                    styles.chip,
                    { 
                      backgroundColor: isSelected ? colors.text : colors.surfaceSecondary,
                      borderColor: isSelected ? colors.text : colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.chipLabel,
                      { color: isSelected ? colors.background : colors.textSecondary },
                    ]}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>,
          localFilters.sellerType ? 1 : 0
        )}

        {/* Actions */}
        <View style={styles.actions}>
          {hasValue && (
            <Pressable
              onPress={handleClear}
              style={[styles.clearButton, { borderColor: colors.border }]}
            >
              <Text style={[styles.clearButtonText, { color: colors.textSecondary }]}>Clear</Text>
            </Pressable>
          )}
          <Pressable
            onPress={handleApply}
            style={[styles.applyButton, { backgroundColor: colors.text }]}
          >
            <Text style={[styles.applyButtonText, { color: colors.background }]}>
              Apply{activeCount > 0 ? ` (${activeCount})` : ''}
            </Text>
          </Pressable>
        </View>

        <View style={{ height: insets.bottom + Spacing['3xl'] }} />
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  sheetContainer: {
    marginHorizontal: 16,
  },
  background: {
    borderRadius: 24,
  },
  handleIndicator: {
    width: 36,
    height: 4,
    borderRadius: Radius.full,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.xs,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewModeSection: {
    marginBottom: Spacing.xl,
  },
  viewModeRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  viewModeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
  },
  viewModeLabel: {
    ...Typography.bodyMedium,
    fontFamily: 'Inter_500Medium',
  },
  section: {
    marginBottom: Spacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  sectionTitle: {
    ...Typography.bodyLarge,
    fontFamily: 'Inter_600SemiBold',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.full,
    minWidth: 24,
    alignItems: 'center',
  },
  badgeText: {
    ...Typography.labelBadge,
    fontFamily: 'Inter_600SemiBold',
  },
  sectionContent: {
    paddingBottom: Spacing.md,
  },
  togglesContainer: {
    gap: 4,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xs,
  },
  toggleLabel: {
    ...Typography.bodyMedium,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  chipLabel: {
    ...Typography.chip,
    fontFamily: 'Inter_500Medium',
  },
  chipCount: {
    ...Typography.supportingMini,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  clearButton: {
    flex: 1,
    height: 48,
    borderRadius: Radius.lg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearButtonText: {
    ...Typography.bodyLarge,
    fontFamily: 'Inter_600SemiBold',
  },
  applyButton: {
    flex: 2,
    height: 48,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyButtonText: {
    ...Typography.bodyLarge,
    fontFamily: 'Inter_600SemiBold',
  },
});
