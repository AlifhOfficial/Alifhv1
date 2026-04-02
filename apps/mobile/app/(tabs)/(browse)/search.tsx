import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Keyboard, ScrollView, TextInput } from 'react-native';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';

import { Text, HapticPressable } from '@/components/ui';
import { Colors, Typography, Spacing, Radius, Sizes, Layout, type ColorPalette } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { useSearch } from '@/context/search-context';
import { queryKeys } from '@/lib/query-client';
import {
  searchApi,
  type Suggestion,
  type FacetBucket,
  type SearchFacets,
  type SearchParams as SearchApiParams,
} from '@/lib/search-api';

type SearchParams = Pick<
  SearchApiParams,
  | 'q'
  | 'make'
  | 'model'
  | 'trim'
  | 'tags'
  | 'extras'
  | 'bodyType'
  | 'fuelType'
  | 'transmission'
  | 'specs'
  | 'condition'
  | 'sellerType'
  | 'partnerId'
  | 'partnerName'
>;

const SUGGESTION_CATEGORIES: Record<string, { dotKey: keyof ColorPalette; label: string }> = {
  make: { dotKey: 'info', label: 'Make' },
  model: { dotKey: 'info', label: 'Model' },
  make_model: { dotKey: 'info', label: 'Make & Model' },
  make_model_trim: { dotKey: 'info', label: 'Full Match' },
  partner: { dotKey: 'star', label: 'Dealer' },
  tag: { dotKey: 'success', label: 'Tag' },
  extra: { dotKey: 'amna', label: 'Feature' },
  bodyType: { dotKey: 'warning', label: 'Body Type' },
  fuelType: { dotKey: 'warning', label: 'Fuel' },
  transmission: { dotKey: 'warning', label: 'Transmission' },
  specs: { dotKey: 'warning', label: 'Specs' },
  condition: { dotKey: 'warning', label: 'Condition' },
  sellerType: { dotKey: 'warning', label: 'Seller' },
};

const SEARCH_DEBOUNCE_MS = 300;
const MAX_VISIBLE_CHIPS = 12;

function toggleArrayValue<T>(arr: T[], value: T): T[] {
  if (arr.includes(value)) {
    return arr.filter((v) => v !== value);
  }
  return [...arr, value];
}

function triggerHaptic() {
  if (process.env.EXPO_OS === 'ios') {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }
}

export default function SearchScreen() {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const { applySearch, updateFilterParams } = useSearch();

  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  const [selectedMakes, setSelectedMakes] = useState<string[]>([]);
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [selectedTrims, setSelectedTrims] = useState<string[]>([]);
  const [showAllModels, setShowAllModels] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
  const [selectedPartner, setSelectedPartner] = useState<{ id: string; name: string } | null>(null);
  const [selectedBodyTypes, setSelectedBodyTypes] = useState<string[]>([]);
  const [selectedFuelTypes, setSelectedFuelTypes] = useState<string[]>([]);
  const [selectedTransmission, setSelectedTransmission] = useState<string[]>([]);
  const [selectedSpecs, setSelectedSpecs] = useState<string[]>([]);
  const [selectedCondition, setSelectedCondition] = useState<'new' | 'used' | null>(null);
  const [selectedSellerType, setSelectedSellerType] = useState<'dealer' | 'private' | null>(null);

  useEffect(() => {
    if (!query.trim()) {
      setDebouncedQuery('');
      return;
    }

    const timeout = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timeout);
  }, [query]);

  const { data: facets, isLoading: isLoadingFacets } = useQuery<SearchFacets | null>({
    queryKey: queryKeys.facets({ surface: 'search-sheet' }),
    queryFn: () => searchApi.getFacets(),
    staleTime: 60 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    placeholderData: (prev) => prev,
  });

  const { data: modelFacets = [] } = useQuery<FacetBucket[]>({
    queryKey: queryKeys.facets({ surface: 'search-sheet-models', makes: selectedMakes.join(',') }),
    queryFn: () => searchApi.getModelsForMakes(selectedMakes),
    enabled: selectedMakes.length > 0,
    staleTime: 60 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  const { data: trimFacets = [] } = useQuery<FacetBucket[]>({
    queryKey: queryKeys.facets({
      surface: 'search-sheet-trims',
      makes: selectedMakes.join(','),
      models: selectedModels.join(','),
    }),
    queryFn: () => searchApi.getTrimsForModels(selectedMakes, selectedModels),
    enabled: selectedMakes.length > 0 && selectedModels.length > 0,
    staleTime: 60 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  const { data: suggestionResponse, isLoading: isLoadingSuggestions } = useQuery<{ suggestions: Suggestion[] }>({
    queryKey: ['search', 'suggest', debouncedQuery, selectedMakes.join(','), selectedModels.join(',')],
    queryFn: () => searchApi.suggest(debouncedQuery, {
      make: selectedMakes.length > 0 ? selectedMakes : undefined,
      model: selectedModels.length > 0 ? selectedModels : undefined,
    }),
    enabled: debouncedQuery.length > 0,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  const suggestions = suggestionResponse?.suggestions ?? [];

  useEffect(() => {
    if (selectedMakes.length > 0) return;
    setSelectedModels([]);
    setSelectedTrims([]);
  }, [selectedMakes.length]);

  useEffect(() => {
    if (selectedModels.length > 0) return;
    setSelectedTrims([]);
  }, [selectedModels.length]);

  const toggleMake = useCallback((value: string) => {
    triggerHaptic();
    setSelectedMakes((prev) => {
      const updated = toggleArrayValue(prev, value);
      if (!updated.includes(value)) {
        setSelectedModels([]);
        setSelectedTrims([]);
      }
      setShowAllModels(false);
      return updated;
    });
  }, []);

  const toggleModel = useCallback((value: string) => {
    triggerHaptic();
    setSelectedModels((prev) => {
      const updated = toggleArrayValue(prev, value);
      if (!updated.includes(value)) {
        setSelectedTrims([]);
      }
      return updated;
    });
  }, []);

  const toggleTrim = useCallback((value: string) => {
    triggerHaptic();
    setSelectedTrims((prev) => toggleArrayValue(prev, value));
  }, []);

  const clearAllSelections = useCallback(() => {
    triggerHaptic();
    setSelectedMakes([]);
    setSelectedModels([]);
    setSelectedTrims([]);
    setSelectedTags([]);
    setSelectedExtras([]);
    setSelectedPartner(null);
    setSelectedBodyTypes([]);
    setSelectedFuelTypes([]);
    setSelectedTransmission([]);
    setSelectedSpecs([]);
    setSelectedCondition(null);
    setSelectedSellerType(null);
    setQuery('');
  }, []);

  const handleSuggestionSelect = useCallback((suggestion: Suggestion) => {
    triggerHaptic();
    Keyboard.dismiss();

    if (suggestion.type === 'tag' && suggestion.tag) {
      setSelectedTags((prev) => (prev.includes(suggestion.tag!) ? prev : [...prev, suggestion.tag!]));
      setQuery('');
      return;
    }

    if (suggestion.type === 'extra' && suggestion.extra) {
      setSelectedExtras((prev) => (prev.includes(suggestion.extra!) ? prev : [...prev, suggestion.extra!]));
      setQuery('');
      return;
    }

    if (suggestion.type === 'bodyType' && suggestion.bodyType) {
      setSelectedBodyTypes((prev) => (prev.includes(suggestion.bodyType!) ? prev : [...prev, suggestion.bodyType!]));
      setQuery('');
      return;
    }

    if (suggestion.type === 'fuelType' && suggestion.fuelType) {
      setSelectedFuelTypes((prev) => (prev.includes(suggestion.fuelType!) ? prev : [...prev, suggestion.fuelType!]));
      setQuery('');
      return;
    }

    if (suggestion.type === 'transmission' && suggestion.transmission) {
      setSelectedTransmission((prev) => (prev.includes(suggestion.transmission!) ? prev : [...prev, suggestion.transmission!]));
      setQuery('');
      return;
    }

    if (suggestion.type === 'specs' && suggestion.specs) {
      setSelectedSpecs((prev) => (prev.includes(suggestion.specs!) ? prev : [...prev, suggestion.specs!]));
      setQuery('');
      return;
    }

    if (suggestion.type === 'condition' && suggestion.condition) {
      setSelectedCondition(suggestion.condition);
      setQuery('');
      return;
    }

    if (suggestion.type === 'sellerType' && suggestion.sellerType) {
      setSelectedSellerType(suggestion.sellerType);
      setQuery('');
      return;
    }

    if (suggestion.type === 'partner' && suggestion.partnerId) {
      setSelectedPartner({ id: suggestion.partnerId, name: suggestion.text });
      setQuery('');
      return;
    }

    if (suggestion.type === 'make') {
      const makeValue = suggestion.make || suggestion.text;
      setSelectedMakes([makeValue]);
      setQuery('');
      return;
    }

    if (suggestion.type === 'make_model' || suggestion.type === 'model') {
      if (suggestion.make) setSelectedMakes([suggestion.make]);
      if (suggestion.model) {
        setTimeout(() => setSelectedModels([suggestion.model!]), 100);
      }
      setQuery('');
      return;
    }

    if (suggestion.type === 'make_model_trim') {
      if (suggestion.make) setSelectedMakes([suggestion.make]);
      if (suggestion.model) {
        setTimeout(() => setSelectedModels([suggestion.model!]), 100);
      }
      if (suggestion.trim) {
        setTimeout(() => setSelectedTrims([suggestion.trim!]), 200);
      }
      setQuery('');
    }
  }, []);

  const handleApply = useCallback(() => {
    if (process.env.EXPO_OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    Keyboard.dismiss();

    const params: SearchParams = {};

    if (query.trim()) params.q = query.trim();

    if (selectedPartner) {
      params.partnerId = selectedPartner.id;
      params.partnerName = selectedPartner.name;
    }

    if (selectedMakes.length > 0) params.make = selectedMakes;
    if (selectedModels.length > 0) params.model = selectedModels;
    if (selectedTrims.length > 0) params.trim = selectedTrims;
    if (selectedTags.length > 0) params.tags = selectedTags;
    if (selectedExtras.length > 0) params.extras = selectedExtras;
    if (selectedBodyTypes.length > 0) params.bodyType = selectedBodyTypes as SearchParams['bodyType'];
    if (selectedFuelTypes.length > 0) params.fuelType = selectedFuelTypes as SearchParams['fuelType'];
    if (selectedTransmission.length > 0) params.transmission = selectedTransmission as SearchParams['transmission'];
    if (selectedSpecs.length > 0) params.specs = selectedSpecs as SearchParams['specs'];
    if (selectedCondition) params.condition = selectedCondition;
    if (selectedSellerType) params.sellerType = selectedSellerType;

    const { bodyType, fuelType, transmission, specs, condition, sellerType, ...searchLevel } = params;
    applySearch(searchLevel);

    const filterUpdates: Record<string, unknown> = {};
    if (bodyType?.length) filterUpdates.bodyType = bodyType;
    if (fuelType?.length) filterUpdates.fuelType = fuelType;
    if (transmission?.length) filterUpdates.transmission = transmission;
    if (specs?.length) filterUpdates.specs = specs;
    if (condition) filterUpdates.condition = condition;
    if (sellerType) filterUpdates.sellerType = sellerType;

    updateFilterParams(filterUpdates);
    router.back();
  }, [
    applySearch,
    query,
    selectedPartner,
    selectedMakes,
    selectedModels,
    selectedTrims,
    selectedTags,
    selectedExtras,
    selectedBodyTypes,
    selectedFuelTypes,
    selectedTransmission,
    selectedSpecs,
    selectedCondition,
    selectedSellerType,
    updateFilterParams,
  ]);

  const hasSelections =
    selectedMakes.length > 0 ||
    selectedModels.length > 0 ||
    selectedTrims.length > 0 ||
    selectedTags.length > 0 ||
    selectedExtras.length > 0 ||
    selectedPartner !== null ||
    selectedBodyTypes.length > 0 ||
    selectedFuelTypes.length > 0 ||
    selectedTransmission.length > 0 ||
    selectedSpecs.length > 0 ||
    selectedCondition !== null ||
    selectedSellerType !== null;

  const canApply = !!(query.trim() || hasSelections);
  const makes = facets?.make ?? [];

  const selectionSummary = useMemo(() => {
    const parts: string[] = [];

    if (selectedPartner) parts.push(`Dealer: ${selectedPartner.name}`);
    if (selectedMakes.length > 0) parts.push(selectedMakes.length === 1 ? selectedMakes[0] : `${selectedMakes.length} makes`);
    if (selectedModels.length > 0) parts.push(selectedModels.length === 1 ? selectedModels[0] : `${selectedModels.length} models`);
    if (selectedTrims.length > 0) parts.push(selectedTrims.length === 1 ? selectedTrims[0] : `${selectedTrims.length} trims`);
    if (selectedTags.length > 0) parts.push(selectedTags.length === 1 ? selectedTags[0] : `${selectedTags.length} tags`);
    if (selectedExtras.length > 0) parts.push(selectedExtras.length === 1 ? selectedExtras[0] : `${selectedExtras.length} features`);
    if (selectedBodyTypes.length > 0) parts.push(selectedBodyTypes.length === 1 ? selectedBodyTypes[0] : `${selectedBodyTypes.length} body types`);
    if (selectedFuelTypes.length > 0) parts.push(selectedFuelTypes.length === 1 ? selectedFuelTypes[0] : `${selectedFuelTypes.length} fuel types`);
    if (selectedTransmission.length > 0) parts.push(selectedTransmission.join(', '));
    if (selectedSpecs.length > 0) parts.push(selectedSpecs.join(', '));
    if (selectedCondition) parts.push(selectedCondition);
    if (selectedSellerType) parts.push(selectedSellerType);

    return parts.join(' > ');
  }, [
    selectedPartner,
    selectedMakes,
    selectedModels,
    selectedTrims,
    selectedTags,
    selectedExtras,
    selectedBodyTypes,
    selectedFuelTypes,
    selectedTransmission,
    selectedSpecs,
    selectedCondition,
    selectedSellerType,
  ]);

  const renderChip = (
    label: string,
    count: number | undefined,
    isSelected: boolean,
    onPress: () => void,
    key: string,
  ) => (
    <HapticPressable
      key={key}
      style={[
        styles.chip,
        {
          backgroundColor: isSelected ? colors.primaryMuted : colors.surfaceSecondary,
          borderColor: isSelected ? colors.primary : colors.border,
        },
      ]}
      onPress={onPress}
    >
      <Text variant="subhead" style={{ color: isSelected ? colors.primary : colors.label }} tone="secondary">
        {label}
      </Text>
      {!isSelected && count !== undefined && (
        <Text variant="subhead" tone="muted">
          {count}
        </Text>
      )}
      {isSelected && <Ionicons name="close" size={Spacing.md} color={colors.primary} />}
    </HapticPressable>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.sheet }]}> 
      <View style={[styles.header, { borderBottomColor: colors.border }]}> 
        <View style={styles.headerTopRow}>
          <HapticPressable onPress={() => router.back()} hitSlop={Spacing.md} style={styles.cancelButton}>
            <Text variant="subhead" tone="muted">Cancel</Text>
          </HapticPressable>

          <Text variant="caption1Emphasized" tone="muted" uppercase>Search</Text>

          <HapticPressable
            style={[styles.applyButton, { backgroundColor: canApply ? colors.primary : colors.fill2 }]}
            onPress={handleApply}
            disabled={!canApply}
          >
            <Text
              variant="caption1Emphasized"
              style={{ color: canApply ? colors.primaryForeground : colors.labelQuaternary }}
              uppercase
            >
              Apply
            </Text>
          </HapticPressable>
        </View>

        <View style={[styles.searchInputContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
          <Ionicons name="search" size={Spacing.xl} color={colors.labelQuaternary} style={{ marginTop: Spacing.xs }} />
          <TextInput
            style={[styles.searchInput, { color: colors.label }]}
            placeholder={'Search by keyword, make, model, dealer...\ne.g. "Audi RS5", "accident free", "sunroof"'}
            placeholderTextColor={colors.placeholder}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleApply}
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
            multiline
            scrollEnabled={false}
            textAlignVertical="top"
            blurOnSubmit
          />
          {query.length > 0 && (
            <HapticPressable onPress={() => setQuery('')} hitSlop={Spacing.md}>
              <Ionicons name="close-circle" size={Sizes.iconSm} color={colors.labelQuaternary} />
            </HapticPressable>
          )}
        </View>

        {hasSelections && (
          <View style={styles.selectionSummary}>
            <Text variant="caption1Emphasized" numberOfLines={1} style={{ flex: 1 }} tone="muted">
              {selectionSummary}
            </Text>
            <HapticPressable onPress={clearAllSelections} hitSlop={Layout.hitSlopSmall}>
              <Text variant="caption1Emphasized" style={{ color: colors.error }} tone="muted" uppercase>
                Clear
              </Text>
            </HapticPressable>
          </View>
        )}
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {query.trim().length > 0 && (
          <View style={styles.section}>
            <Text variant="caption1Emphasized" tone="muted" style={styles.sectionLabel} uppercase>
              SUGGESTIONS
            </Text>

            {isLoadingSuggestions ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator size="small" color={colors.labelQuaternary} />
              </View>
            ) : suggestions.length > 0 ? (
              <View style={[styles.suggestionsContainer, { backgroundColor: colors.background, borderColor: colors.border }]}>
                {suggestions.slice(0, 8).map((suggestion, index) => {
                  const category = SUGGESTION_CATEGORIES[suggestion.type];
                  return (
                    <HapticPressable
                      key={`${suggestion.type}-${suggestion.text}-${index}`}
                      onPress={() => handleSuggestionSelect(suggestion)}
                      style={[
                        styles.suggestionRow,
                        {
                          backgroundColor: 'transparent',
                          borderBottomWidth: index === Math.min(suggestions.length - 1, 7) ? 0 : StyleSheet.hairlineWidth,
                          borderBottomColor: colors.border,
                        },
                      ]}
                    >
                      <View style={styles.suggestionLeft}>
                        {category && <View style={[styles.categoryDot, { backgroundColor: colors[category.dotKey] }]} />}
                        <Text variant="subhead" numberOfLines={1} style={{ flex: 1 }}>
                          {suggestion.text}
                        </Text>
                      </View>
                      <Text variant="subhead" tone="muted">
                        {category?.label ?? 'Search'}
                        {suggestion.count !== undefined && suggestion.count > 0 && ` · ${suggestion.count.toLocaleString()}`}
                      </Text>
                    </HapticPressable>
                  );
                })}
              </View>
            ) : query.trim().length >= 2 ? (
              <Text variant="subhead" tone="muted" style={styles.emptyText}>
                No suggestions found
              </Text>
            ) : null}
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.hierarchyLevel}>
            <Text variant="caption1Emphasized" tone="muted" style={styles.sectionLabel} uppercase>
              MAKE
            </Text>
            {isLoadingFacets ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator size="small" color={colors.labelQuaternary} />
              </View>
            ) : (
              <View style={styles.chipGrid}>
                {selectedMakes.map((makeValue) => {
                  const makeData = makes.find((m: FacetBucket) => m.value === makeValue);
                  return renderChip(makeData?.label ?? makeValue, undefined, true, () => toggleMake(makeValue), `make-${makeValue}`);
                })}
                {makes
                  .filter((m: FacetBucket) => !selectedMakes.includes(m.value))
                  .slice(0, MAX_VISIBLE_CHIPS - selectedMakes.length)
                  .map((make: FacetBucket) =>
                    renderChip(
                      make.label ?? make.value,
                      make.count,
                      false,
                      () => toggleMake(make.value),
                      `make-${make.value}`,
                    ),
                  )}
              </View>
            )}
          </View>

          {selectedMakes.length > 0 && (
            <View style={styles.hierarchyLevel}>
              <View style={[styles.hierarchyConnector, { backgroundColor: colors.border }]} />
              <Text variant="caption1Emphasized" tone="muted" style={styles.sectionLabel} uppercase>
                MODEL
              </Text>
              {modelFacets.length === 0 ? (
                <Text variant="subhead" tone="muted" style={styles.emptyText}>
                  No models available
                </Text>
              ) : (
                <View style={styles.chipGrid}>
                  {selectedModels.map((modelValue) => {
                    const modelData = modelFacets.find((m: FacetBucket) => m.value === modelValue);
                    return renderChip(modelData?.label ?? modelValue, undefined, true, () => toggleModel(modelValue), `model-${modelValue}`);
                  })}
                  {modelFacets
                    .filter((m: FacetBucket) => !selectedModels.includes(m.value))
                    .slice(0, showAllModels ? undefined : MAX_VISIBLE_CHIPS - selectedModels.length)
                    .map((model: FacetBucket) =>
                      renderChip(
                        model.label ?? model.value,
                        model.count,
                        false,
                        () => toggleModel(model.value),
                        `model-${model.value}`,
                      ),
                    )}
                  {modelFacets.filter((m: FacetBucket) => !selectedModels.includes(m.value)).length > MAX_VISIBLE_CHIPS - selectedModels.length && (
                    <HapticPressable
                      style={[styles.chip, { backgroundColor: colors.fill2, borderColor: colors.border }]}
                      onPress={() => {
                        triggerHaptic();
                        setShowAllModels((prev) => !prev);
                      }}
                    >
                      <Text variant="subhead" style={{ color: colors.primary }} tone="secondary">
                        {showAllModels ? 'Show Less' : `View All (${modelFacets.length})`}
                      </Text>
                      <Ionicons
                        name={showAllModels ? 'chevron-up' : 'chevron-down'}
                        size={Spacing.md}
                        color={colors.primary}
                      />
                    </HapticPressable>
                  )}
                </View>
              )}
            </View>
          )}

          {selectedMakes.length > 0 && selectedModels.length > 0 && (
            <View style={styles.hierarchyLevel}>
              <View style={[styles.hierarchyConnector, { backgroundColor: colors.border }]} />
              <Text variant="caption1Emphasized" tone="muted" style={styles.sectionLabel} uppercase>
                TRIM
              </Text>
              {trimFacets.length === 0 ? (
                <Text variant="subhead" tone="muted" style={styles.emptyText}>
                  No trims available
                </Text>
              ) : (
                <View style={styles.chipGrid}>
                  {selectedTrims.map((trimValue) => {
                    const trimData = trimFacets.find((t: FacetBucket) => t.value === trimValue);
                    return renderChip(trimData?.label ?? trimValue, undefined, true, () => toggleTrim(trimValue), `trim-${trimValue}`);
                  })}
                  {trimFacets
                    .filter((t: FacetBucket) => !selectedTrims.includes(t.value))
                    .slice(0, MAX_VISIBLE_CHIPS - selectedTrims.length)
                    .map((trim: FacetBucket) =>
                      renderChip(trim.label ?? trim.value, trim.count, false, () => toggleTrim(trim.value), `trim-${trim.value}`),
                    )}
                </View>
              )}
            </View>
          )}
        </View>

        <View style={{ height: insets.bottom + Spacing['3xl'] }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  header: {
    flexShrink: 0,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  cancelButton: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.xs,
  },
  applyButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.full,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    minHeight: Spacing['5xl'] * 2,
    borderRadius: Radius.xl,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...Typography.subhead,
    lineHeight: Typography.subhead.lineHeight,
    paddingTop: Spacing.none,
    paddingBottom: Spacing.none,
    minHeight: Spacing['5xl'],
    textAlignVertical: 'top',
  },
  selectionSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.xs,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionLabel: {
    marginBottom: Spacing.sm,
    marginLeft: Spacing.xs,
  },
  loadingRow: {
    paddingVertical: Spacing.xl,
    alignItems: 'center',
  },
  suggestionsContainer: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  suggestionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: Spacing.sm,
    marginRight: Spacing.sm,
  },
  categoryDot: {
    width: Spacing.sm,
    height: Spacing.sm,
    borderRadius: Spacing.xs,
  },
  emptyText: {
    textAlign: 'center',
    paddingVertical: Spacing.lg,
  },
  hierarchyLevel: {
    marginBottom: Spacing.lg,
    position: 'relative',
  },
  hierarchyConnector: {
    position: 'absolute',
    left: Spacing.sm,
    top: -Spacing.md,
    width: 2,
    height: Spacing.md,
    borderRadius: Radius.sm,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
});
