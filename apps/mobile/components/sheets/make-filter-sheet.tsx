/**
 * MakeFilterSheet - Combobox-style bottom sheet for selecting car makes
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
import { Heading, Body, ButtonText } from '@/components/ui';
import { CAR_MAKES } from '@/lib/filter-constants';

interface MakeFilterSheetProps {
  visible: boolean;
  onClose: () => void;
  selected: string[];
  onApply: (selected: string[]) => void;
}

export function MakeFilterSheet({
  visible,
  onClose,
  selected,
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

  // Popular makes shown by default (top 5 UAE market)
  const popularMakes = useMemo(() => 
    ['Toyota', 'Mercedes-Benz', 'BMW', 'Nissan', 'Land Rover'] as const,
  []);

  // Filter makes by search query — show popular 5 by default, all when searching
  const filteredMakes = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      // Show selected makes first, then popular ones (deduped), capped at 5 if nothing selected
      const selected = localSelected.filter(m => CAR_MAKES.includes(m as any));
      const popular = popularMakes.filter(m => !selected.includes(m));
      return selected.length > 0 
        ? [...new Set([...selected, ...popular])] 
        : [...popularMakes];
    }
    return CAR_MAKES.filter(make => make.toLowerCase().includes(q));
  }, [searchQuery, localSelected, popularMakes]);

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

    return (
      <Pressable
        onPress={() => handleToggle(make)}
        style={({ pressed }) => [
          styles.listItem,
          {
            backgroundColor: isSelected
              ? colors.surfaceSecondary
              : pressed
                ? colors.fill
                : 'transparent',
          },
        ]}
      >
        <View style={styles.itemRow}>
          <Body
            size="large"
            style={[
              styles.optionLabel,
              { color: isSelected ? colors.text : colors.textSecondary },
              isSelected && styles.optionLabelSelected,
            ]}
            numberOfLines={1}
          >
            {make}
          </Body>
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
  }, [localSelected, colors, handleToggle]);

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
          <Heading size="medium" style={{ color: colors.text }}>Make</Heading>
          <Pressable
            onPress={onClose}
            hitSlop={Spacing.md}
            style={({ pressed }) => [
              styles.closeButton,
              { backgroundColor: pressed ? colors.fill : colors.fillSecondary },
            ]}
          >
            <Ionicons name="close" size={18} color={colors.textSecondary} />
          </Pressable>
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
            <Pressable onPress={() => setSearchQuery('')} hitSlop={8}>
              <X size={16} color={colors.textMuted} strokeWidth={2} />
            </Pressable>
          )}
        </View>

        {/* Makes List */}
        <FlatList
          data={filteredMakes}
          keyExtractor={(item) => item}
          renderItem={renderItem}
          style={styles.listContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        />

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
  optionLabel: {
    flex: 1,
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
