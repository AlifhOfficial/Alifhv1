/**
 * ModelFilterSheet - Combobox-style bottom sheet for selecting car models
 * Filtered by currently selected makes
 * Uses @gorhom/bottom-sheet modal with search input
 */

import { Text, HapticPressable } from '@/components/ui';
import React, { useCallback, useMemo, useRef, useEffect, useState } from 'react';
import { View, StyleSheet, Platform, TextInput } from 'react-native';
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetFlatList } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Search, X } from 'lucide-react-native';
import { Ionicons } from '@expo/vector-icons';

import { Fonts, Typography, Colors, Spacing, Radius, Sizes, Layout } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { CAR_MODELS, getModelsForMake } from '@/lib/filter-constants';
import { searchApi, type FacetBucket, type SearchParams } from '@/lib/search-api';

interface ModelFilterSheetProps {
  visible: boolean;
  onClose: () => void;
  /** Currently selected makes — models are sourced from these */
  selectedMakes: string[];
  selected: string[];
  /** Reserved for compatibility; model counts only depend on selected makes */
  filterContext?: Omit<SearchParams, 'make' | 'model' | 'limit' | 'page'>;
  onApply: (selected: string[]) => void;
}

interface ModelOption {
  model: string;
  make: string;
}

export function ModelFilterSheet({
  visible,
  onClose,
  selectedMakes,
  selected,
  filterContext: _filterContext = {},
  onApply,
}: ModelFilterSheetProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const bottomSheetRef = useRef<BottomSheetModal>(null);

  // Local state
  const [localSelected, setLocalSelected] = useState<string[]>(selected);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Dynamic facets
  const [facets, setFacets] = useState<FacetBucket[]>([]);
  const [isLoadingFacets, setIsLoadingFacets] = useState(false);

  // Sync with props when sheet opens
  useEffect(() => {
    if (visible) {
      setLocalSelected(selected);
      setSearchQuery('');
    }
  }, [visible, selected]);

  // Fetch model counts for the selected makes only
  useEffect(() => {
    if (visible && selectedMakes.length > 0) {
      setIsLoadingFacets(true);
      searchApi
        .getModelsForMakes(selectedMakes)
        .then((models) => setFacets(models))
        .catch(console.error)
        .finally(() => setIsLoadingFacets(false));
    } else if (visible) {
      // When no make is selected we still show the full model taxonomy from constants.
      setFacets([]);
      setIsLoadingFacets(false);
    }
  }, [visible, selectedMakes]);

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

  // Build models list grouped by make
  const allModels: ModelOption[] = useMemo(() => {
    const result: ModelOption[] = [];
    
    // If no makes selected, show all models from all makes
    if (selectedMakes.length === 0) {
      for (const [make, models] of Object.entries(CAR_MODELS)) {
        for (const model of models) {
          result.push({ model, make });
        }
      }
    } else {
      // Show models only from selected makes
      for (const make of selectedMakes) {
        const models = getModelsForMake(make);
        for (const model of models) {
          result.push({ model, make });
        }
      }
    }
    return result;
  }, [selectedMakes]);

  // Filter by search query — show all models, selected first
  const filteredModels = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      // Show selected models first, then rest
      const selectedSet = new Set(localSelected);
      const selectedModels = allModels.filter(opt => selectedSet.has(opt.model));
      const rest = allModels.filter(opt => !selectedSet.has(opt.model));
      return [...selectedModels, ...rest];
    }
    return allModels.filter(
      opt => opt.model.toLowerCase().includes(q) || opt.make.toLowerCase().includes(q)
    );
  }, [searchQuery, allModels, localSelected]);

  const handleToggle = useCallback((model: string) => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setLocalSelected(prev => {
      if (prev.includes(model)) {
        return prev.filter(m => m !== model);
      }
      return [...prev, model];
    });
  }, []);

  const handleApply = useCallback(() => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onApply(localSelected);
    bottomSheetRef.current?.dismiss();
  }, [localSelected, onApply]);

  const handleClear = useCallback(() => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setLocalSelected([]);
    onApply([]);
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

  const hasValue = localSelected.length > 0;
  const showMakeLabel = selectedMakes.length !== 1; // Show make label when no makes or multiple makes selected

  const renderItem = useCallback(({ item }: { item: ModelOption }) => {
    const isSelected = localSelected.includes(item.model);
    const facet = facets.find(f => f.value === item.model);
    const count = facet?.count ?? 0;

    return (
      <HapticPressable
        onPress={() => handleToggle(item.model)}
        style={styles.listItem}
      >
        <View style={styles.labelColumn}>
          <View style={styles.labelRow}>
            <Text
              variant={isSelected ? 'subheadEmphasized' : 'subhead'}
              style={{ 
                color: isSelected ? colors.label : colors.labelSecondary,
              }}
            >
              {item.model}
            </Text>
            {count > 0 && (
              <Text variant="caption1Emphasized" tone="muted">
                {count.toLocaleString()}
              </Text>
            )}
          </View>
          {showMakeLabel && (
            <Text variant="subhead" tone="muted">{item.make}</Text>
          )}
        </View>
        <View style={[
          styles.radio,
          { borderColor: isSelected ? colors.labelQuaternary : colors.border },
        ]}>
          {isSelected && (
            <View style={[styles.radioInner, { backgroundColor: colors.labelQuaternary }]} />
          )}
        </View>
      </HapticPressable>
    );
  }, [localSelected, colors, handleToggle, showMakeLabel, facets]);

  const keyExtractor = useCallback((item: ModelOption) => `${item.make}-${item.model}`, []);

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
    >
      <View style={styles.content}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <View style={styles.headerTopRow}>
            <HapticPressable
              onPress={onClose}
              hitSlop={Spacing.md}
              style={styles.cancelButton}
            >
              <Text variant="subhead" tone="muted">Cancel</Text>
            </HapticPressable>
            
            <Text variant="caption1Emphasized" tone="muted" uppercase>Model</Text>
            
            <HapticPressable
              style={[
                styles.applyButton,
                { backgroundColor: hasValue ? colors.primary : colors.fill2 },
              ]}
              onPress={handleApply}
              disabled={!hasValue}
            >
              <Text
                variant="caption1Emphasized"
                style={{ color: hasValue ? colors.primaryForeground : colors.labelQuaternary }}
                uppercase
              >
                Apply
              </Text>
            </HapticPressable>
          </View>

          {/* Selection Summary */}
          {hasValue && (
            <View style={styles.selectionSummary}>
              <Text variant="caption1Emphasized" numberOfLines={1} style={{ flex: 1 }} tone="muted">
                {localSelected.join(', ')}
              </Text>
              <HapticPressable onPress={handleClear} hitSlop={Layout.hitSlopSmall}>
                <Text variant="caption1Emphasized" style={{ color: colors.error }} tone="muted" uppercase>
                  Clear
                </Text>
              </HapticPressable>
            </View>
          )}
        </View>

        {/* Search Input */}
        <View style={[styles.searchContainer, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
          <Search size={Sizes.iconSm} color={colors.placeholder} strokeWidth={2} />
          <TextInput
            style={[styles.searchInput, { color: colors.label }]}
            placeholder="Search models..."
            placeholderTextColor={colors.placeholder}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCorrect={false}
            autoCapitalize="none"
          />
          {searchQuery.length > 0 && (
            <HapticPressable onPress={() => setSearchQuery('')} hitSlop={Layout.hitSlopSmall}>
              <X size={Spacing.lg} color={colors.placeholder} strokeWidth={2} />
            </HapticPressable>
          )}
        </View>

        {/* Models List */}
        <BottomSheetFlatList
          data={filteredModels}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          style={styles.listContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text variant="subhead" tone="muted">No models found</Text>
            </View>
          }
        />
      </View>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  sheetContainer: {
    marginHorizontal: Spacing.md,
  },
  background: {
    borderTopLeftRadius: Radius.sheet,
    borderTopRightRadius: Radius.sheet,
    borderCurve: 'continuous',
  },
  handleIndicator: {
    width: Sizes.bubble,
    height: Spacing.xs,
    borderRadius: Radius.full,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
    paddingTop: Spacing.md,
  },
  header: {
    flexShrink: 0,
    paddingBottom: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginBottom: Spacing.md,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  cancelButton: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
  },
  selectionSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.sm,
    gap: Spacing['2xl'],
    marginTop: Spacing.md,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    height: Layout.hitTarget,
    borderRadius: Radius.lg,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  searchInput: {
    flex: 1,
    ...Typography.subhead,
    paddingVertical: Spacing.none,
  },
  listContainer: {
    flex: 1,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
  },
  labelColumn: {
    flex: 1,
    gap: Spacing.xs,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
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
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing['3xl'],
  },
  applyButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.full,
  },
});
