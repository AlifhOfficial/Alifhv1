/**
 * SearchSheet - Unified search with hierarchical make/model/trim selection
 * 
 * Features:
 * - Text search with autocomplete suggestions
 * - Hierarchical selection: Makes → Models → Trims (unified flow)
 * - Suggestions populate hierarchy (not immediate apply)
 * - Apply button at top for instant access
 * - Clean, native UI using theme semantics
 */

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  
  Platform, 
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { HapticPressable } from '@/components/ui';
import {
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetTextInput,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';

import { Colors, Spacing, Radius, Sizes, Layout } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { Heading, Body, Label, ButtonText, Supporting } from '@/components/ui';
import {
  searchApi,
  type Suggestion,
  type FacetBucket,
  type SearchFacets,
} from '@/lib/search-api';

// ============================================================================
// TYPES
// ============================================================================

interface SearchSheetProps {
  visible: boolean;
  onClose: () => void;
  onSearch?: (params: SearchParams) => void;
  forceDark?: boolean;
}

interface SearchParams {
  q?: string;
  make?: string[];
  model?: string[];
  trim?: string[];
  tags?: string[];
  extras?: string[];
  bodyType?: string[];
  fuelType?: string[];
  transmission?: string[];
  specs?: string[];
  exteriorColor?: string[];
  interiorColor?: string[];
  engineSize?: string[];
  emirate?: string[];
  priceMin?: number;
  priceMax?: number;
  yearMin?: number;
  yearMax?: number;
  mileageMax?: number;
  condition?: 'new' | 'used';
  sellerType?: 'dealer' | 'private';
  sortBy?: string;
  partnerId?: string;
  partnerName?: string;
}

// Suggestion category colors (dot indicators)
const SUGGESTION_CATEGORIES: Record<string, { dot: string; label: string }> = {
  make: { dot: '#3B82F6', label: 'Make' },
  model: { dot: '#3B82F6', label: 'Model' },
  make_model: { dot: '#3B82F6', label: 'Make & Model' },
  make_model_trim: { dot: '#3B82F6', label: 'Full Match' },
  partner: { dot: '#EAB308', label: 'Dealer' },
  tag: { dot: '#22C55E', label: 'Tag' },
  extra: { dot: '#A855F7', label: 'Feature' },
  bodyType: { dot: '#F97316', label: 'Body Type' },
  fuelType: { dot: '#F97316', label: 'Fuel' },
  transmission: { dot: '#F97316', label: 'Transmission' },
  specs: { dot: '#F97316', label: 'Specs' },
  condition: { dot: '#F97316', label: 'Condition' },
  sellerType: { dot: '#F97316', label: 'Seller' },
};

// ============================================================================
// CONSTANTS
// ============================================================================

const SNAP_POINTS = ['60%', '94%'];
const SEARCH_DEBOUNCE_MS = 300;
const MAX_VISIBLE_CHIPS = 12;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function toggleArrayValue<T>(arr: T[], value: T): T[] {
  if (arr.includes(value)) {
    return arr.filter((v) => v !== value);
  }
  return [...arr, value];
}

function triggerHaptic() {
  if (Platform.OS === 'ios') {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function SearchSheet({ visible, onClose, onSearch, forceDark }: SearchSheetProps) {
  const { colorScheme } = useTheme();
  // Force dark colors when on BLK tab
  const colors = Colors[forceDark ? 'dark' : colorScheme];
  const insets = useSafeAreaInsets();
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // State - Search
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  // State - Selections
  const [selectedMakes, setSelectedMakes] = useState<string[]>([]);
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [selectedTrims, setSelectedTrims] = useState<string[]>([]);
  const [showAllModels, setShowAllModels] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
  const [selectedPartner, setSelectedPartner] = useState<{ id: string; name: string } | null>(null);
  // Filter-type selections (single value each)
  const [selectedBodyTypes, setSelectedBodyTypes] = useState<string[]>([]);
  const [selectedFuelTypes, setSelectedFuelTypes] = useState<string[]>([]);
  const [selectedTransmission, setSelectedTransmission] = useState<string[]>([]);
  const [selectedSpecs, setSelectedSpecs] = useState<string[]>([]);
  const [selectedCondition, setSelectedCondition] = useState<'new' | 'used' | null>(null);
  const [selectedSellerType, setSelectedSellerType] = useState<'dealer' | 'private' | null>(null);

  // State - Facets
  const [facets, setFacets] = useState<SearchFacets | null>(null);
  const [modelFacets, setModelFacets] = useState<FacetBucket[]>([]);
  const [trimFacets, setTrimFacets] = useState<FacetBucket[]>([]);
  const [isLoadingFacets, setIsLoadingFacets] = useState(false);

  // Snap points
  const snapPoints = useMemo(() => SNAP_POINTS, []);

  // ============================================================================
  // SHEET LIFECYCLE
  // ============================================================================

  useEffect(() => {
    if (visible) {
      bottomSheetRef.current?.present();
    } else {
      bottomSheetRef.current?.dismiss();
    }
  }, [visible]);

  const handleSheetChanges = useCallback((index: number) => {
    if (index === -1) {
      // Reset state on close
      setQuery('');
      setSuggestions([]);
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
      onClose();
    }
  }, [onClose]);

  // ============================================================================
  // DATA FETCHING
  // ============================================================================

  // Facet counts are now hierarchical only:
  // - make: global
  // - model: scoped by selected make
  // - trim: scoped by selected make + model
  useEffect(() => {
    if (visible) {
      setIsLoadingFacets(true);
      searchApi
        .getFacets()
        .then((f) => setFacets(f))
        .catch(console.error)
        .finally(() => setIsLoadingFacets(false));
    }
  }, [visible]);

  // Fetch model counts for the selected makes only
  useEffect(() => {
    if (selectedMakes.length > 0) {
      searchApi
        .getModelsForMakes(selectedMakes)
        .then((models) => setModelFacets(models))
        .catch(console.error);
    } else {
      setModelFacets([]);
      setSelectedModels([]);
      setSelectedTrims([]);
    }
  }, [selectedMakes]);

  // Fetch trim counts for the selected make + model combination
  useEffect(() => {
    if (selectedMakes.length > 0 && selectedModels.length > 0) {
      searchApi
        .getTrimsForModels(selectedMakes, selectedModels)
        .then((trims) => setTrimFacets(trims))
        .catch(console.error);
    } else {
      setTrimFacets([]);
      setSelectedTrims([]);
    }
  }, [selectedMakes, selectedModels]);

  // Debounced search suggestions
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!query.trim()) {
      setSuggestions([]);
      setIsLoadingSuggestions(false);
      return;
    }

    setIsLoadingSuggestions(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await searchApi.suggest(query.trim(), {
          make: selectedMakes.length > 0 ? selectedMakes : undefined,
          model: selectedModels.length > 0 ? selectedModels : undefined,
        });
        setSuggestions(res.suggestions);
      } catch (error) {
        console.error('Suggest error:', error);
      } finally {
        setIsLoadingSuggestions(false);
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [query, selectedMakes, selectedModels]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const toggleMake = useCallback((value: string) => {
    triggerHaptic();
    setSelectedMakes((prev) => {
      const updated = toggleArrayValue(prev, value);
      // Clear downstream selections when removing a make
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
      // Clear trims when removing a model
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

  // Handle suggestion - populate hierarchy instead of immediate search
  const handleSuggestionSelect = useCallback((suggestion: Suggestion) => {
    triggerHaptic();
    Keyboard.dismiss();

    // Handle tag suggestions
    if (suggestion.type === 'tag' && suggestion.tag) {
      setSelectedTags(prev => 
        prev.includes(suggestion.tag!) ? prev : [...prev, suggestion.tag!]
      );
      setQuery('');
      return;
    }

    // Handle extras/features suggestions
    if (suggestion.type === 'extra' && suggestion.extra) {
      setSelectedExtras(prev => 
        prev.includes(suggestion.extra!) ? prev : [...prev, suggestion.extra!]
      );
      setQuery('');
      return;
    }

    // Handle filter suggestions (body type, fuel, transmission, specs, condition, seller)
    if (suggestion.type === 'bodyType' && suggestion.bodyType) {
      setSelectedBodyTypes(prev => 
        prev.includes(suggestion.bodyType!) ? prev : [...prev, suggestion.bodyType!]
      );
      setQuery('');
      return;
    }
    if (suggestion.type === 'fuelType' && suggestion.fuelType) {
      setSelectedFuelTypes(prev => 
        prev.includes(suggestion.fuelType!) ? prev : [...prev, suggestion.fuelType!]
      );
      setQuery('');
      return;
    }
    if (suggestion.type === 'transmission' && suggestion.transmission) {
      setSelectedTransmission(prev => 
        prev.includes(suggestion.transmission!) ? prev : [...prev, suggestion.transmission!]
      );
      setQuery('');
      return;
    }
    if (suggestion.type === 'specs' && suggestion.specs) {
      setSelectedSpecs(prev => 
        prev.includes(suggestion.specs!) ? prev : [...prev, suggestion.specs!]
      );
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

    // Handle partner suggestions
    if (suggestion.type === 'partner' && suggestion.partnerId) {
      setSelectedPartner({ id: suggestion.partnerId, name: suggestion.text });
      setQuery('');
      return;
    }

    // Handle make/model/trim suggestions (don't clear other filters - they stack)
    if (suggestion.type === 'make') {
      const makeValue = suggestion.make || suggestion.text;
      setSelectedMakes([makeValue]);
      setQuery('');
    } else if (suggestion.type === 'make_model' || suggestion.type === 'model') {
      if (suggestion.make) setSelectedMakes([suggestion.make]);
      if (suggestion.model) {
        setTimeout(() => setSelectedModels([suggestion.model!]), 100);
      }
      setQuery('');
    } else if (suggestion.type === 'make_model_trim') {
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
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    Keyboard.dismiss();

    const params: SearchParams = {};
    
    // Keyword search
    if (query.trim()) params.q = query.trim();
    
    // Partner
    if (selectedPartner) {
      params.partnerId = selectedPartner.id;
      params.partnerName = selectedPartner.name;
    }
    
    // Make/model/trim
    if (selectedMakes.length > 0) params.make = selectedMakes;
    if (selectedModels.length > 0) params.model = selectedModels;
    if (selectedTrims.length > 0) params.trim = selectedTrims;
    
    // Tags & Extras
    if (selectedTags.length > 0) params.tags = selectedTags;
    if (selectedExtras.length > 0) params.extras = selectedExtras;
    
    // Filter categories
    if (selectedBodyTypes.length > 0) params.bodyType = selectedBodyTypes;
    if (selectedFuelTypes.length > 0) params.fuelType = selectedFuelTypes;
    if (selectedTransmission.length > 0) params.transmission = selectedTransmission;
    if (selectedSpecs.length > 0) params.specs = selectedSpecs;
    if (selectedCondition) params.condition = selectedCondition;
    if (selectedSellerType) params.sellerType = selectedSellerType;

    if (Object.keys(params).length > 0) {
      onSearch?.(params);
      bottomSheetRef.current?.dismiss();
    }
  }, [query, selectedMakes, selectedModels, selectedTrims, selectedTags, selectedExtras, selectedPartner, selectedBodyTypes, selectedFuelTypes, selectedTransmission, selectedSpecs, selectedCondition, selectedSellerType, onSearch]);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const hasSelections = selectedMakes.length > 0 || selectedModels.length > 0 || selectedTrims.length > 0 || selectedTags.length > 0 || selectedExtras.length > 0 || selectedPartner !== null || selectedBodyTypes.length > 0 || selectedFuelTypes.length > 0 || selectedTransmission.length > 0 || selectedSpecs.length > 0 || selectedCondition !== null || selectedSellerType !== null;
  const canApply = !!(query.trim() || hasSelections);
  const makes = facets?.make ?? [];

  // Build selection summary text
  const selectionSummary = useMemo(() => {
    const parts: string[] = [];
    
    // Partner selection
    if (selectedPartner) {
      parts.push(`Dealer: ${selectedPartner.name}`);
    }
    
    // Make/model/trim hierarchy
    if (selectedMakes.length > 0) {
      parts.push(selectedMakes.length === 1 ? selectedMakes[0] : `${selectedMakes.length} makes`);
    }
    if (selectedModels.length > 0) {
      parts.push(selectedModels.length === 1 ? selectedModels[0] : `${selectedModels.length} models`);
    }
    if (selectedTrims.length > 0) {
      parts.push(selectedTrims.length === 1 ? selectedTrims[0] : `${selectedTrims.length} trims`);
    }
    
    // Tags & Extras
    if (selectedTags.length > 0) {
      parts.push(selectedTags.length === 1 ? selectedTags[0] : `${selectedTags.length} tags`);
    }
    if (selectedExtras.length > 0) {
      parts.push(selectedExtras.length === 1 ? selectedExtras[0] : `${selectedExtras.length} features`);
    }
    
    // Filters
    if (selectedBodyTypes.length > 0) {
      parts.push(selectedBodyTypes.length === 1 ? selectedBodyTypes[0] : `${selectedBodyTypes.length} body types`);
    }
    if (selectedFuelTypes.length > 0) {
      parts.push(selectedFuelTypes.length === 1 ? selectedFuelTypes[0] : `${selectedFuelTypes.length} fuel types`);
    }
    if (selectedTransmission.length > 0) {
      parts.push(selectedTransmission.join(', '));
    }
    if (selectedSpecs.length > 0) {
      parts.push(selectedSpecs.join(', '));
    }
    if (selectedCondition) {
      parts.push(selectedCondition);
    }
    if (selectedSellerType) {
      parts.push(selectedSellerType);
    }
    
    return parts.join(' › ');
  }, [selectedMakes, selectedModels, selectedTrims, selectedTags, selectedExtras, selectedPartner, selectedBodyTypes, selectedFuelTypes, selectedTransmission, selectedSpecs, selectedCondition, selectedSellerType]);

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

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

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
          backgroundColor: isSelected ? colors.text : colors.fill2,
          borderColor: isSelected ? colors.text : colors.border,
        },
      ]}
      onPress={onPress}
    >
      <Supporting
        size="small"
        style={{ color: isSelected ? colors.bg : colors.text }}
      >
        {label}
      </Supporting>
      {!isSelected && count !== undefined && (
        <Supporting size="mini" tone="muted">
          {count}
        </Supporting>
      )}
      {isSelected && (
        <Ionicons name="close" size={Spacing.md} color={colors.bg} />
      )}
    </HapticPressable>
  );

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      snapPoints={snapPoints}
      enableDynamicSizing={false}
      enablePanDownToClose
      onChange={handleSheetChanges}
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: colors.surface, borderRadius: Radius['3xl'] }}
      handleIndicatorStyle={{ backgroundColor: colors.textMuted, width: Sizes.bubble }}
      keyboardBehavior="extend"
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustResize"
    >
      <View style={styles.container}>
        {/* Fixed Header with Search + Apply */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          {/* Top Row: Title + Apply Button */}
          <View style={styles.headerTopRow}>
            <HapticPressable
              onPress={() => bottomSheetRef.current?.dismiss()}
              hitSlop={Spacing.md}
              style={styles.cancelButton}
            >
              <Body size="medium" tone="secondary">Cancel</Body>
            </HapticPressable>
            
            <Heading size="small">Search</Heading>
            
            <HapticPressable
              style={[
                styles.applyButton,
                { backgroundColor: canApply ? colors.primary : colors.fill2 },
              ]}
              onPress={handleApply}
              disabled={!canApply}
            >
              <ButtonText
                size="small"
                style={{ color: canApply ? colors.primaryFg : colors.textMuted }}
              >
                Apply
              </ButtonText>
            </HapticPressable>
          </View>

          {/* Search Input */}
          <View style={[styles.searchInputContainer, { backgroundColor: colors.input, borderColor: colors.border }]}>
            <Ionicons name="search" size={Spacing.xl} color={colors.textMuted} style={{ marginTop: 2 }} />
            <BottomSheetTextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder={'Search by keyword, make, model, dealer...\ne.g. "Audi RS5", "accident free", "sunroof"'}
              placeholderTextColor={colorScheme === 'dark' ? 'rgba(255,255,255,0.28)' : 'rgba(0,0,0,0.25)'}
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
                <Ionicons name="close-circle" size={Sizes.iconSm} color={colors.textMuted} />
              </HapticPressable>
            )}
          </View>

          {/* Selection Summary (breadcrumb style) */}
          {hasSelections && (
            <View style={styles.selectionSummary}>
              <Body size="small" numberOfLines={1} style={{ flex: 1 }}>
                {selectionSummary}
              </Body>
              <HapticPressable onPress={clearAllSelections} hitSlop={Layout.hitSlopSmall}>
                <Supporting size="small" style={{ color: colors.error }}>
                  Clear
                </Supporting>
              </HapticPressable>
            </View>
          )}
        </View>

        {/* Scrollable Content */}
        <BottomSheetScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Suggestions */}
          {query.trim().length > 0 && (
            <View style={styles.section}>
              <Label size="small" tone="muted" style={styles.sectionLabel}>
                SUGGESTIONS
              </Label>

              {isLoadingSuggestions ? (
                <View style={styles.loadingRow}>
                  <ActivityIndicator size="small" color={colors.textMuted} />
                </View>
              ) : suggestions.length > 0 ? (
                <View style={[styles.suggestionsContainer, { backgroundColor: colors.bg, borderColor: colors.border }]}>
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
                        }
                      ]}
                    >
                      <View style={styles.suggestionLeft}>
                        {category && (
                          <View style={[styles.categoryDot, { backgroundColor: category.dot }]} />
                        )}
                        <Body size="medium" numberOfLines={1} style={{ flex: 1 }}>
                          {suggestion.text}
                        </Body>
                      </View>
                      <Supporting size="small" tone="muted">
                        {category?.label ?? 'Search'}
                        {suggestion.count !== undefined && suggestion.count > 0 && ` · ${suggestion.count.toLocaleString()}`}
                      </Supporting>
                    </HapticPressable>
                    );
                  })}
                </View>
              ) : query.trim().length >= 2 ? (
                <Body size="small" tone="muted" style={styles.emptyText}>
                  No suggestions found
                </Body>
              ) : null}
            </View>
          )}

          {/* Hierarchical Selection */}
          <View style={styles.section}>
            {/* Makes */}
            <View style={styles.hierarchyLevel}>
              <Label size="small" tone="muted" style={styles.sectionLabel}>
                MAKE
              </Label>
              {isLoadingFacets ? (
                <View style={styles.loadingRow}>
                  <ActivityIndicator size="small" color={colors.textMuted} />
                </View>
              ) : (
                <View style={styles.chipGrid}>
                  {/* Selected makes first */}
                  {selectedMakes.map((makeValue) => {
                    const makeData = makes.find((m: FacetBucket) => m.value === makeValue);
                    return renderChip(
                      makeData?.label ?? makeValue,
                      undefined,
                      true,
                      () => toggleMake(makeValue),
                      `make-${makeValue}`,
                    );
                  })}
                  {/* Unselected makes */}
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

            {/* Models - show when makes selected */}
            {selectedMakes.length > 0 && (
              <View style={styles.hierarchyLevel}>
                <View style={[styles.hierarchyConnector, { backgroundColor: colors.border }]} />
                <Label size="small" tone="muted" style={styles.sectionLabel}>
                  MODEL
                </Label>
                {modelFacets.length === 0 ? (
                  <Body size="small" tone="muted" style={styles.emptyText}>
                    No models available
                  </Body>
                ) : (
                  <View style={styles.chipGrid}>
                    {/* Selected models first */}
                    {selectedModels.map((modelValue) => {
                      const modelData = modelFacets.find((m: FacetBucket) => m.value === modelValue);
                      return renderChip(
                        modelData?.label ?? modelValue,
                        undefined,
                        true,
                        () => toggleModel(modelValue),
                        `model-${modelValue}`,
                      );
                    })}
                    {/* Unselected models */}
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
                    {/* View All / Show Less toggle */}
                    {modelFacets.filter((m: FacetBucket) => !selectedModels.includes(m.value)).length > MAX_VISIBLE_CHIPS - selectedModels.length && (
                      <HapticPressable
                        style={[
                          styles.chip,
                          {
                            backgroundColor: colors.fill2,
                            borderColor: colors.border,
                          },
                        ]}
                        onPress={() => {
                          triggerHaptic();
                          setShowAllModels((prev) => !prev);
                        }}
                      >
                        <Supporting
                          size="small"
                          style={{ color: colors.primary }}
                        >
                          {showAllModels ? 'Show Less' : `View All (${modelFacets.length})`}
                        </Supporting>
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

            {/* Trims - show when models selected */}
            {selectedMakes.length > 0 && selectedModels.length > 0 && (
              <View style={styles.hierarchyLevel}>
                <View style={[styles.hierarchyConnector, { backgroundColor: colors.border }]} />
                <Label size="small" tone="muted" style={styles.sectionLabel}>
                  TRIM
                </Label>
                {trimFacets.length === 0 ? (
                  <Body size="small" tone="muted" style={styles.emptyText}>
                    No trims available
                  </Body>
                ) : (
                  <View style={styles.chipGrid}>
                    {/* Selected trims first */}
                    {selectedTrims.map((trimValue) => {
                      const trimData = trimFacets.find((t: FacetBucket) => t.value === trimValue);
                      return renderChip(
                        trimData?.label ?? trimValue,
                        undefined,
                        true,
                        () => toggleTrim(trimValue),
                        `trim-${trimValue}`,
                      );
                    })}
                    {/* Unselected trims */}
                    {trimFacets
                      .filter((t: FacetBucket) => !selectedTrims.includes(t.value))
                      .slice(0, MAX_VISIBLE_CHIPS - selectedTrims.length)
                      .map((trim: FacetBucket) =>
                        renderChip(
                          trim.label ?? trim.value,
                          trim.count,
                          false,
                          () => toggleTrim(trim.value),
                          `trim-${trim.value}`,
                        ),
                      )}
                  </View>
                )}
              </View>
            )}
          </View>

          {/* Bottom padding */}
          <View style={{ height: insets.bottom + Spacing['3xl'] }} />
        </BottomSheetScrollView>
      </View>
    </BottomSheetModal>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  sheetContainer: {
    marginHorizontal: Spacing.lg,
  },
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  header: {
    flexShrink: 0,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xs,
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
    fontSize: 15,
    lineHeight: 22,
    fontFamily: 'Inter_500Medium',
    paddingTop: 0,
    paddingBottom: 0,
    minHeight: 66,
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
    borderRadius: 1,
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

export type { SearchSheetProps };
