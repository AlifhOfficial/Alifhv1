/**
 * MakeFilterSheet - Combobox-style bottom sheet for selecting car makes
 * Uses @gorhom/bottom-sheet modal with search input
 */

import React, { useCallback, useMemo, useRef, useEffect, useState } from 'react';
import { View, StyleSheet, Platform, TextInput } from 'react-native';
import { HapticPressable } from '@/components/ui';
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetFlatList } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Search, X } from 'lucide-react-native';

import { Colors, Spacing, Radius } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { Heading, Body, Supporting, ButtonText } from '@/components/ui';
import { CAR_MAKES } from '@/lib/filter-constants';
import { searchApi, type FacetBucket, type SearchParams } from '@/lib/search-api';

interface MakeFilterSheetProps {
  visible: boolean;
  onClose: () => void;
  selected: string[];
  /** Current filter context - facets will be fetched dynamically based on this */
  filterContext?: Omit<SearchParams, 'make' | 'limit' | 'page'>;
  onApply: (selected: string[]) => void;
}

export function MakeFilterSheet({
  visible,
  onClose,
  selected,
  filterContext = {},
  onApply,
}: MakeFilterSheetProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const bottomSheetRef = useRef<BottomSheetModal>(null);

  // Local state
  const [localSelected, setLocalSelected] = useState<string[]>(selected);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<TextInput>(null);
  
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

  // Fetch facets dynamically when sheet opens or filter context changes
  useEffect(() => {
    if (visible) {
      setIsLoadingFacets(true);
      searchApi
        .getFacets(filterContext)
        .then((result) => {
          setFacets(result?.make ?? []);
        })
        .catch(console.error)
        .finally(() => setIsLoadingFacets(false));
    }
  }, [visible, filterContext]);

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

  // Filter makes by search query — show all makes, selected first
  const filteredMakes = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      // Show selected makes first, then rest alphabetically
      const selectedSet = new Set(localSelected);
      const selectedMakes = CAR_MAKES.filter(m => selectedSet.has(m));
      const rest = CAR_MAKES.filter(m => !selectedSet.has(m));
      return [...selectedMakes, ...rest];
    }
    return CAR_MAKES.filter(make => make.toLowerCase().includes(q));
  }, [searchQuery, localSelected]);

  const handleToggle = useCallback((make: string) => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setLocalSelected(prev => {
      if (prev.includes(make)) {
        return prev.filter(m => m !== make);
      }
      return [...prev, make];
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

  const renderItem = useCallback(({ item: make }: { item: string }) => {
    const isSelected = localSelected.includes(make);
    const facet = facets.find(f => f.value === make);
    const count = facet?.count ?? 0;

    return (
      <HapticPressable
        onPress={() => handleToggle(make)}
        style={styles.listItem}
      >
        <View style={styles.labelRow}>
          <Body
            size="medium"
            style={{ 
              color: isSelected ? colors.text : colors.textSecondary,
              fontFamily: isSelected ? 'Inter_600SemiBold' : 'Inter_400Regular',
            }}
          >
            {make}
          </Body>
          {count > 0 && (
            <Supporting size="small" tone="muted">
              {count.toLocaleString()}
            </Supporting>
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
  }, [localSelected, colors, handleToggle, facets]);

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
      <View style={styles.content}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <View style={styles.headerTopRow}>
            <HapticPressable
              onPress={onClose}
              hitSlop={Spacing.md}
              style={styles.cancelButton}
            >
              <Body size="medium" tone="secondary">Cancel</Body>
            </HapticPressable>
            
            <Heading size="small">Make</Heading>
            
            <HapticPressable
              style={[
                styles.applyButton,
                { backgroundColor: hasValue ? colors.primary : colors.fillSecondary },
              ]}
              onPress={handleApply}
              disabled={!hasValue}
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
                {localSelected.join(', ')}
              </Body>
              <HapticPressable onPress={handleClear} hitSlop={8}>
                <Supporting size="small" style={{ color: colors.error }}>
                  Clear
                </Supporting>
              </HapticPressable>
            </View>
          )}
        </View>

        {/* Search Input */}
        <View style={[styles.searchContainer, { backgroundColor: colors.fillSecondary, borderColor: colors.border }]}>
          <Search size={18} color={colors.textMuted} strokeWidth={2} />
          <TextInput
            ref={searchInputRef}
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search makes..."
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

        {/* Makes List */}
        <BottomSheetFlatList
          data={filteredMakes}
          keyExtractor={(item: string) => item}
          renderItem={renderItem}
          style={styles.listContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
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
    borderRadius: Radius['3xl'],
  },
  handleIndicator: {
    width: 36,
    height: 4,
    borderRadius: Radius.full,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
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
    paddingHorizontal: Spacing.xs,
  },
  selectionSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xs,
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
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
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
  applyButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.full,
  },
});
