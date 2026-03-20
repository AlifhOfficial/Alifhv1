/**
 * MoreFiltersSheet - Bottom Sheet for additional filters & display settings
 * Includes: View Mode, Popular toggles, Regional Specs, Negotiable, Body Type, Fuel, Transmission, Seller Type
 * Uses @gorhom/bottom-sheet modal for proper iOS gesture handling
 */

import React, { useCallback, useMemo, useRef, useEffect, useState } from 'react';
import { View, StyleSheet, Platform, Switch } from 'react-native';
import { HapticPressable } from '@/components/ui';
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';

import { Colors, Spacing, Radius, Sizes, Layout } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { Heading, Body, Label, ButtonText, Supporting } from '@/components/ui';
import type { SearchParams } from '@/lib/search-api';
import { 
  BODY_TYPES, 
  FUEL_TYPES, 
  TRANSMISSION_TYPES, 
  EXTERIOR_COLORS,
  INTERIOR_COLORS,
  ENGINE_SIZES,
  SELLER_TYPE_OPTIONS,
  SPECS_TYPES,
} from '@/lib/filter-constants';

export type ViewMode = 'grid' | 'list';

const VIEW_OPTIONS: { value: ViewMode; label: string }[] = [
  { value: 'grid', label: 'Grid' },
  { value: 'list', label: 'List' },
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
  exteriorColor?: string[];
  interiorColor?: string[];
  engineSize?: string[];
  sellerType?: 'dealer' | 'private';
}

interface MoreFiltersSheetProps {
  visible: boolean;
  onClose: () => void;
  filters: MoreFiltersState;
  /** Reserved for compatibility; this sheet uses constants instead of server facets */
  filterContext?: Omit<SearchParams, 'specs' | 'bodyType' | 'fuelType' | 'transmission' | 'exteriorColor' | 'interiorColor' | 'engineSize' | 'sellerType' | 'condition' | 'limit' | 'page'>;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onApply: (filters: MoreFiltersState) => void;
}

export function MoreFiltersSheet({ 
  visible, 
  onClose, 
  filters,
  filterContext: _filterContext = {},
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

  const snapPoints = useMemo(() => ['60%', '94%'], []);

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
    // Must explicitly pass undefined for each key to clear them in context
    onApply({
      condition: undefined,
      isBlkListing: undefined,
      isBlackTierPartner: undefined,
      isNegotiable: undefined,
      specs: undefined,
      bodyType: undefined,
      fuelType: undefined,
      transmission: undefined,
      exteriorColor: undefined,
      interiorColor: undefined,
      engineSize: undefined,
      sellerType: undefined,
    });
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
    count += localFilters.exteriorColor?.length ?? 0;
    count += localFilters.interiorColor?.length ?? 0;
    count += localFilters.engineSize?.length ?? 0;
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
        <HapticPressable 
          style={styles.sectionHeader}
          onPress={() => toggleSection(key)}
        >
          <View style={styles.sectionTitleRow}>
            <Body 
              size="medium" 
              style={{ 
                color: colors.text,
                fontFamily: 'Inter_600SemiBold',
              }}
            >
              {title}
            </Body>
            {selectedCount > 0 && (
              <View style={[styles.badge, { backgroundColor: colors.text }]}>  
                <Label size="badge" style={{ color: colors.background }}>{selectedCount}</Label>
              </View>
            )}
          </View>
          <Ionicons 
            name={isExpanded ? 'chevron-up' : 'chevron-down'} 
            size={Spacing.xl} 
            color={colors.textSecondary} 
          />
        </HapticPressable>
        {isExpanded && <View style={styles.sectionContent}>{content}</View>}
      </View>
    );
  };

  // Render chip options
  const renderChipOptions = (
    options: readonly { readonly value: string; readonly label: string }[],
    selected: string[] | undefined,
    onToggle: (value: string) => void,
  ) => (
    <View style={styles.chipsRow}>
      {options.map(option => {
        const isSelected = selected?.includes(option.value);

        return (
          <HapticPressable
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
            <Supporting
              size="small"
              style={{ color: isSelected ? colors.background : colors.text }}
            >
              {option.label}
            </Supporting>
          </HapticPressable>
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
    <HapticPressable 
      style={styles.toggleRow}
      onPress={onToggle}
    >
      <Body 
        size="medium" 
        style={{ 
          color: value ? colors.text : colors.textSecondary,
          fontFamily: value ? 'Inter_700Bold' : 'Inter_500Medium',
        }}
      >
        {label}
      </Body>
      <View style={[
        styles.radio,
        { borderColor: value ? colors.textMuted : colors.border },
      ]}>
        {value && (
          <View style={[styles.radioInner, { backgroundColor: colors.textMuted }]} />
        )}
      </View>
    </HapticPressable>
  );

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      snapPoints={snapPoints}
      enableDynamicSizing={false}
      enablePanDownToClose
      onChange={handleSheetChanges}
      backdropComponent={renderBackdrop}
      backgroundStyle={[styles.background, { backgroundColor: colors.surface }]}
      handleIndicatorStyle={[styles.handleIndicator, { backgroundColor: colors.border }]}
      stackBehavior="push"
    >
      {/* Fixed Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View style={styles.headerTopRow}>
          <HapticPressable
            onPress={onClose}
            hitSlop={Spacing.md}
            style={styles.cancelButton}
          >
            <Body size="medium" tone="secondary">Cancel</Body>
          </HapticPressable>
          
          <Heading size="small">Filters</Heading>
          
          <HapticPressable
            style={[
              styles.applyButton,
              { backgroundColor: hasValue ? colors.primary : colors.fillSecondary },
            ]}
            onPress={handleApply}
          >
            <ButtonText
              size="small"
              style={{ color: hasValue ? colors.primaryForeground : colors.textMuted }}
            >
              Apply
            </ButtonText>
          </HapticPressable>
        </View>

        {/* Selection Summary */}
        {hasValue && (
          <View style={styles.selectionSummary}>
            <Body size="small" numberOfLines={1} style={{ flex: 1 }}>
              {activeCount} filter{activeCount !== 1 ? 's' : ''} selected
            </Body>
            <HapticPressable onPress={handleClear} hitSlop={Layout.hitSlopSmall}>
              <Supporting size="small" style={{ color: colors.error }}>
                Clear
              </Supporting>
            </HapticPressable>
          </View>
        )}
      </View>

      <BottomSheetScrollView style={styles.content} showsVerticalScrollIndicator={false}>
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
            SPECS_TYPES,
            localFilters.specs,
            (value) => handleToggleArray('specs', value),
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
          ),
          localFilters.transmission?.length ?? 0
        )}

        {/* Exterior Color Section */}
        {renderSection(
          'Exterior Color',
          'exteriorColor',
          renderChipOptions(
            EXTERIOR_COLORS,
            localFilters.exteriorColor,
            (value) => handleToggleArray('exteriorColor', value),
          ),
          localFilters.exteriorColor?.length ?? 0
        )}

        {/* Interior Color Section */}
        {renderSection(
          'Interior Color',
          'interiorColor',
          renderChipOptions(
            INTERIOR_COLORS,
            localFilters.interiorColor,
            (value) => handleToggleArray('interiorColor', value),
          ),
          localFilters.interiorColor?.length ?? 0
        )}

        {/* Engine Size Section */}
        {renderSection(
          'Engine Size',
          'engineSize',
          renderChipOptions(
            ENGINE_SIZES,
            localFilters.engineSize,
            (value) => handleToggleArray('engineSize', value),
          ),
          localFilters.engineSize?.length ?? 0
        )}

        {/* Seller Type Section */}
        {renderSection(
          'Seller Type',
          'sellerType',
          <View style={styles.chipsRow}>
            {SELLER_TYPE_OPTIONS.map(option => {
              const isSelected = localFilters.sellerType === option.value;
              return (
                <HapticPressable
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
                  <Supporting
                    size="small"
                    style={{ color: isSelected ? colors.background : colors.text }}
                  >
                    {option.label}
                  </Supporting>
                </HapticPressable>
              );
            })}
          </View>,
          localFilters.sellerType ? 1 : 0
        )}

        <View style={{ height: insets.bottom + Spacing['3xl'] }} />
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  sheetContainer: {
    marginHorizontal: Spacing.md,
  },
  background: {
    borderRadius: Radius['3xl'],
  },
  handleIndicator: {
    width: Sizes.bubble,
    height: Spacing.xs,
    borderRadius: Radius.full,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  header: {
    flexShrink: 0,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  cancelButton: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.xs,
  },
  selectionSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xs,
    gap: Spacing['2xl'],
    marginTop: Spacing.md,
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
    fontFamily: 'Inter_600SemiBold',
  },
  badge: {
    width: Spacing['2xl'],
    height: Spacing['2xl'],
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionContent: {
    paddingBottom: Spacing.md,
  },
  togglesContainer: {
    gap: Spacing.xs,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
  },
  radio: {
    width: Sizes.iconMd,
    height: Sizes.iconMd,
    borderRadius: Radius.full,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: Spacing.sm + 2,
    height: Spacing.sm + 2,
    borderRadius: Radius.full,
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
  applyButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.full,
  },
});
