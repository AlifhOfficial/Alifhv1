/**
 * ModelFilterSheet - Combobox-style bottom sheet for selecting car models
 * Filtered by currently selected makes
 * Uses @gorhom/bottom-sheet modal with search input
 */

import React, { useCallback, useMemo, useRef, useEffect, useState } from 'react';
import { View, StyleSheet, Platform, TextInput } from 'react-native';
import { HapticPressable } from '@/components/ui';
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetView, BottomSheetFlatList } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { Search, X } from 'lucide-react-native';

import { Colors, Spacing, Radius } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { Heading, Body, Supporting, ButtonText } from '@/components/ui';
import { CAR_MODELS, getModelsForMake } from '@/lib/filter-constants';
import { searchApi, type FacetBucket, type SearchParams } from '@/lib/search-api';

interface ModelFilterSheetProps {
  visible: boolean;
  onClose: () => void;
  /** Currently selected makes — models are sourced from these */
  selectedMakes: string[];
  selected: string[];
  /** Current filter context - facets will be fetched dynamically based on this */
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
  filterContext = {},
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

  // Fetch model facets dynamically when sheet opens or context changes
  useEffect(() => {
    if (visible && selectedMakes.length > 0) {
      setIsLoadingFacets(true);
      searchApi
        .getModelsForMakes(selectedMakes, filterContext)
        .then((models) => setFacets(models))
        .catch(console.error)
        .finally(() => setIsLoadingFacets(false));
    } else if (visible) {
      // If no makes selected, fetch all models from facets
      setIsLoadingFacets(true);
      searchApi
        .getFacets(filterContext)
        .then((result) => setFacets(result?.model ?? []))
        .catch(console.error)
        .finally(() => setIsLoadingFacets(false));
    }
  }, [visible, selectedMakes, filterContext]);

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
            <Body
              size="large"
              style={{ 
                color: isSelected ? colors.text : colors.textSecondary,
                fontFamily: isSelected ? 'Inter_600SemiBold' : 'Inter_400Regular',
              }}
            >
              {item.model}
            </Body>
            {count > 0 && (
              <Supporting size="small" tone="muted">
                {count.toLocaleString()}
              </Supporting>
            )}
          </View>
          {showMakeLabel && (
            <Supporting size="small" tone="muted">{item.make}</Supporting>
          )}
        </View>
        <View style={[
          styles.radio,
          { borderColor: isSelected ? colors.text : colors.border },
        ]}>
          {isSelected && (
            <View style={[styles.radioInner, { backgroundColor: colors.text }]} />
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
      detached
      bottomInset={insets.bottom + 20}
      style={styles.sheetContainer}
    >
      <BottomSheetView style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Heading size="medium">Model</Heading>
          <HapticPressable
            onPress={onClose}
            hitSlop={Spacing.md}
            style={[
              styles.closeButton,
              { backgroundColor: colors.fillSecondary },
            ]}
          >
            <Ionicons name="close" size={18} color={colors.textSecondary} />
          </HapticPressable>
        </View>

        {/* Search Input */}
        <View style={[styles.searchContainer, { backgroundColor: colors.fillSecondary, borderColor: colors.border }]}>
          <Search size={18} color={colors.textMuted} strokeWidth={2} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search models..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCorrect={false}
            autoCapitalize="none"
          />
          {searchQuery.length > 0 && (
            <HapticPressable onPress={() => setSearchQuery('')} hitSlop={8}>
              <X size={16} color={colors.textMuted} strokeWidth={2} />
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
              <Body size="large" tone="secondary">No models found</Body>
            </View>
          }
        />

        {/* Actions */}
        <View style={styles.actions}>
          {hasValue && (
            <HapticPressable
              onPress={handleClear}
              style={[styles.clearButton, { borderColor: colors.border }]}
            >
              <ButtonText size="medium" tone="secondary">Clear</ButtonText>
            </HapticPressable>
          )}
          <HapticPressable
            onPress={handleApply}
            style={[styles.applyButton, { backgroundColor: colors.text }]}
          >
            <ButtonText size="medium" style={{ color: colors.background }}>
              {hasValue ? `Apply (${localSelected.length})` : 'Done'}
            </ButtonText>
          </HapticPressable>
        </View>
      </BottomSheetView>
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
    width: 36,
    height: 4,
    borderRadius: Radius.full,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    height: 44,
    borderRadius: Radius.lg,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    paddingVertical: 0,
  },
  listContainer: {
    flex: 1,
    marginBottom: Spacing.md,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
  },
  labelColumn: {
    flex: 1,
    gap: 2,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: Radius.full,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: Radius.full,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing['3xl'],
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingTop: Spacing.md,
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
