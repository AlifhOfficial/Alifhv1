/**
 * MoreFiltersSheet - Bottom Sheet for additional filters & display settings
 * Includes: View Mode, Popular toggles, Regional Specs, Negotiable, Body Type, Fuel, Transmission, Seller Type
 * Uses @gorhom/bottom-sheet modal for proper iOS gesture handling
 */

import React, { useCallback, useMemo, useRef, useEffect, useState } from 'react';
import { View, StyleSheet, Pressable, Platform, Switch } from 'react-native';
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { Check, ChevronDown, ChevronUp } from 'lucide-react-native';

import { Colors, Spacing, Radius } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { Heading, Body, Label, ButtonText, Supporting } from '@/components/ui';
import type { FacetBucket } from '@/lib/search-api';
import { 
  BODY_TYPES, 
  FUEL_TYPES, 
  TRANSMISSION_TYPES, 
  EXTERIOR_COLORS,
  INTERIOR_COLORS,
  ENGINE_SIZES,
  SELLER_TYPE_OPTIONS 
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
  facets?: {
    specs?: FacetBucket[];
    bodyType?: FacetBucket[];
    fuelType?: FacetBucket[];
    transmission?: FacetBucket[];
    exteriorColor?: FacetBucket[];
    interiorColor?: FacetBucket[];
    engineSize?: FacetBucket[];
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
        <Pressable 
          style={styles.sectionHeader}
          onPress={() => toggleSection(key)}
        >
          <View style={styles.sectionTitleRow}>
            <Body size="large" style={[styles.sectionTitle, { color: colors.text }]}>{title}</Body>
            {selectedCount > 0 && (
              <View style={[styles.badge, { backgroundColor: colors.text }]}>
                <Label size="badge" style={{ color: colors.background }}>{selectedCount}</Label>
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
    options: readonly { readonly value: string; readonly label: string }[],
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
                borderColor: isSelected ? colors.text : colors.textMuted,
              },
            ]}
          >
            <Body
              size="small"
              style={[
                styles.chipLabel,
                { color: isSelected ? colors.background : colors.text },
              ]}
            >
              {option.label}
            </Body>
            {count > 0 && (
              <Supporting
                size="mini"
                style={{ color: isSelected ? colors.background : colors.textTertiary }}
              >
                {count}
              </Supporting>
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
      <Body size="medium" style={{ color: colors.text }}>{label}</Body>
      <View style={[
        styles.checkbox,
        { 
          borderColor: value ? colors.text : colors.textMuted,
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
      handleIndicatorStyle={[styles.handleIndicator, { backgroundColor: colors.textMuted }]}
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
            style={[
              styles.closeButton,
              { backgroundColor: colors.surfaceSecondary }
            ]}
          >
            <Ionicons name="close" size={18} color={colors.textSecondary} />
          </Pressable>
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

        {/* Exterior Color Section */}
        {renderSection(
          'Exterior Color',
          'exteriorColor',
          renderChipOptions(
            EXTERIOR_COLORS,
            localFilters.exteriorColor,
            (value) => handleToggleArray('exteriorColor', value),
            facets?.exteriorColor
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
            facets?.interiorColor
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
            facets?.engineSize
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
                <Pressable
                  key={option.value}
                  onPress={() => handleSetSellerType(option.value as 'dealer' | 'private')}
                  style={[
                    styles.chip,
                    { 
                      backgroundColor: isSelected ? colors.text : colors.surfaceSecondary,
                      borderColor: isSelected ? colors.text : colors.textMuted,
                    },
                  ]}
                >
                  <Body
                    size="small"
                    style={[
                      styles.chipLabel,
                      { color: isSelected ? colors.background : colors.text },
                    ]}
                  >
                    {option.label}
                  </Body>
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
              style={[styles.clearButton, { borderColor: colors.textMuted }]}
            >
              <ButtonText size="medium" tone="secondary">Clear</ButtonText>
            </Pressable>
          )}
          <Pressable
            onPress={handleApply}
            style={[styles.applyButton, { backgroundColor: colors.text }]}
          >
            <ButtonText size="medium" style={{ color: colors.background }}>
              Apply{activeCount > 0 ? ` (${activeCount})` : ''}
            </ButtonText>
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
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.full,
    minWidth: 24,
    alignItems: 'center',
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
    fontFamily: 'Inter_500Medium',
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
  applyButton: {
    flex: 2,
    height: 48,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
