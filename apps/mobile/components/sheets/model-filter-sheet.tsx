/**
 * ModelFilterSheet - Combobox-style bottom sheet for selecting car models
 * Filtered by currently selected makes
 * Uses @gorhom/bottom-sheet modal with search input
 */

import React, { useCallback, useMemo, useRef, useEffect, useState } from 'react';
import { View, StyleSheet, Pressable, Platform, FlatList, TextInput } from 'react-native';
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { Check, Search, X } from 'lucide-react-native';

import { Colors, Spacing, Radius } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { Heading, Body, Supporting, ButtonText } from '@/components/ui';
import { getModelsForMake } from '@/lib/filter-constants';

interface ModelFilterSheetProps {
  visible: boolean;
  onClose: () => void;
  /** Currently selected makes — models are sourced from these */
  selectedMakes: string[];
  selected: string[];
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
  onApply,
}: ModelFilterSheetProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const bottomSheetRef = useRef<BottomSheetModal>(null);

  // Local state
  const [localSelected, setLocalSelected] = useState<string[]>(selected);
  const [searchQuery, setSearchQuery] = useState('');

  // Sync with props when sheet opens
  useEffect(() => {
    if (visible) {
      setLocalSelected(selected);
      setSearchQuery('');
    }
  }, [visible, selected]);

  const snapPoints = useMemo(() => ['75%'], []);

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
    for (const make of selectedMakes) {
      const models = getModelsForMake(make);
      for (const model of models) {
        result.push({ model, make });
      }
    }
    return result;
  }, [selectedMakes]);

  // Filter by search query — show first 5 by default, all when searching
  const filteredModels = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      // Show selected models first, then fill up to 5
      const selectedSet = new Set(localSelected);
      const selectedModels = allModels.filter(opt => selectedSet.has(opt.model));
      const rest = allModels.filter(opt => !selectedSet.has(opt.model));
      const combined = [...selectedModels, ...rest];
      return combined.slice(0, Math.max(5, selectedModels.length));
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
  const showMakeLabel = selectedMakes.length > 1;

  const renderItem = useCallback(({ item }: { item: ModelOption }) => {
    const isSelected = localSelected.includes(item.model);

    return (
      <Pressable
        onPress={() => handleToggle(item.model)}
        style={[
          styles.listItem,
          {
            backgroundColor: isSelected
              ? colors.surfaceSecondary
              : 'transparent',
          },
        ]}
      >
        <View style={styles.itemRow}>
          <View style={styles.labelColumn}>
            <Body
              size="large"
              style={[
                styles.optionLabel,
                { color: isSelected ? colors.text : colors.textSecondary },
                isSelected && styles.optionLabelSelected,
              ]}
              numberOfLines={1}
            >
              {item.model}
            </Body>
            {showMakeLabel && (
              <Supporting size="small">{item.make}</Supporting>
            )}
          </View>
          <View
            style={[
              styles.checkbox,
              {
                borderColor: isSelected ? colors.text : colors.textMuted,
                backgroundColor: isSelected ? colors.text : 'transparent',
              },
            ]}
          >
            {isSelected && (
              <Check size={14} color={colors.surface} strokeWidth={3} />
            )}
          </View>
        </View>
      </Pressable>
    );
  }, [localSelected, colors, handleToggle, showMakeLabel]);

  const keyExtractor = useCallback((item: ModelOption) => `${item.make}-${item.model}`, []);

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      snapPoints={snapPoints}
      enablePanDownToClose
      onChange={handleSheetChanges}
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: colors.surface, borderRadius: 24 }}
      handleIndicatorStyle={{ backgroundColor: colors.textMuted, width: 36 }}
      detached
      bottomInset={insets.bottom + 20}
      style={styles.sheetContainer}
    >
      <BottomSheetView style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Heading size="medium" style={{ color: colors.text }}>Model</Heading>
          <Pressable
            onPress={onClose}
            hitSlop={Spacing.md}
            style={[
              styles.closeButton,
              { backgroundColor: colors.fillSecondary },
            ]}
          >
            <Ionicons name="close" size={18} color={colors.textSecondary} />
          </Pressable>
        </View>

        {/* No makes selected state */}
        {selectedMakes.length === 0 ? (
          <View style={styles.emptyState}>
            <Body size="large" tone="secondary" style={{ textAlign: 'center' }}>
              Select a make first to see available models
            </Body>
          </View>
        ) : (
          <>
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
                <Pressable onPress={() => setSearchQuery('')} hitSlop={8}>
                  <X size={16} color={colors.textMuted} strokeWidth={2} />
                </Pressable>
              )}
            </View>

            {/* Models List */}
            <FlatList
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
          </>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          {hasValue && (
            <Pressable
              onPress={handleClear}
              style={[styles.clearButton, { borderColor: colors.border }]}
            >
              <ButtonText size="medium" tone="secondary">Clear</ButtonText>
            </Pressable>
          )}
          <Pressable
            onPress={handleApply}
            style={[styles.applyButton, { backgroundColor: colors.text }]}
          >
            <ButtonText size="medium" style={{ color: colors.background }}>
              {hasValue ? `Apply (${localSelected.length})` : 'Done'}
            </ButtonText>
          </Pressable>
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  sheetContainer: {
    marginHorizontal: 16,
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
    marginBottom: Spacing.md,
  },
  closeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
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
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    paddingVertical: 0,
  },
  listContainer: {
    flex: 1,
    marginBottom: Spacing.md,
  },
  listItem: {
    paddingVertical: 14,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.md,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  labelColumn: {
    flex: 1,
    gap: 2,
  },
  optionLabel: {
    fontFamily: 'Inter_400Regular',
  },
  optionLabelSelected: {
    fontFamily: 'Inter_600SemiBold',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
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
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0,0,0,0.1)',
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
