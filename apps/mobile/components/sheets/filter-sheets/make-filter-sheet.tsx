/**
 * MakeFilterSheet - Combobox-style bottom sheet for selecting car makes
 * Uses @gorhom/bottom-sheet modal with search input
 */

import { Text, HapticPressable } from '@/components/ui';
import React, { useCallback, useMemo, useRef, useEffect, useState } from 'react';
import { View, StyleSheet, Platform, TextInput } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetFlatList } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Search, X } from 'lucide-react-native';
import { Ionicons } from '@expo/vector-icons';

import { Fonts, Typography, Colors, Spacing, Radius, Sizes, Layout, SheetSnapPoints } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { CAR_MAKES } from '@/lib/filter-constants';
import { queryKeys } from '@/lib/query-client';
import { searchApi, type FacetBucket, type SearchParams } from '@/lib/search-api';

interface MakeFilterSheetProps {
  visible: boolean;
  onClose: () => void;
  selected: string[];
  /** Reserved for compatibility; make counts are global and ignore extra filters */
  filterContext?: Omit<SearchParams, 'make' | 'limit' | 'page'>;
  onApply: (selected: string[]) => void;
}

export function MakeFilterSheet({
  visible,
  onClose,
  selected,
  filterContext: _filterContext = {},
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

  // Sync with props when sheet opens
  useEffect(() => {
    if (visible) {
      setLocalSelected(selected);
      setSearchQuery('');
    }
  }, [visible, selected]);

  const { data: facets = [], isLoading: isLoadingFacets } = useQuery<FacetBucket[]>({
    queryKey: queryKeys.facets({ surface: 'make-sheet' }),
    queryFn: async () => (await searchApi.getFacets())?.make ?? [],
    enabled: visible,
    staleTime: 60 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    placeholderData: (prev) => prev,
  });

  const snapPoints = useMemo<(string | number)[]>(() => [...SheetSnapPoints.standard], []);

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
          style={[
            styles.listItem,
            {
              backgroundColor: isSelected ? colors.primaryMuted : colors.surfaceSecondary,
              borderColor: isSelected ? colors.primary : colors.border,
            },
          ]}
        >
          <View style={styles.labelRow}>
            <Text
              variant={isSelected ? 'subheadEmphasized' : 'subhead'}
              style={{ 
                color: isSelected ? colors.label : colors.labelSecondary,
              }}
            >
              {make}
            </Text>
          {count > 0 && (
            <Text
              variant="caption1Emphasized"
              style={{ color: isSelected ? colors.primary : colors.labelQuaternary }}
            >
              {count.toLocaleString()}
            </Text>
          )}
        </View>
        <View style={[
          styles.radio,
          { borderColor: isSelected ? colors.primary : colors.outline },
        ]}>
          {isSelected && (
            <View style={[styles.radioInner, { backgroundColor: colors.primary }]} />
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
      backgroundStyle={[styles.background, { backgroundColor: colors.sheet }]}
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
            
            <Text variant="caption1Emphasized" tone="muted" uppercase>Make</Text>
            
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
            ref={searchInputRef}
            style={[styles.searchInput, { color: colors.label }]}
            placeholder="Search makes..."
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
    borderWidth: 1,
    borderRadius: Radius.lg,
    marginBottom: Spacing.xs,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
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
  applyButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.full,
  },
});
