/**
 * PriceFilterSheet - Bottom Sheet for price range filter
 * Uses @gorhom/bottom-sheet modal for proper iOS gesture handling
 */

import React, { useCallback, useMemo, useRef, useEffect, useState } from 'react';
import { View, StyleSheet, Pressable, TextInput, Platform } from 'react-native';
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { Check } from 'lucide-react-native';

import { Colors, Spacing, Radius } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { Heading, Label, Body, ButtonText } from '@/components/ui';

const PRICE_PRESETS = [
  { label: 'Under 50K', min: undefined, max: 50000 },
  { label: '50K-100K', min: 50000, max: 100000 },
  { label: '100K-200K', min: 100000, max: 200000 },
  { label: '200K+', min: 200000, max: undefined },
];

interface PriceFilterSheetProps {
  visible: boolean;
  onClose: () => void;
  priceMin?: number;
  priceMax?: number;
  onApply: (priceMin?: number, priceMax?: number) => void;
}

export function PriceFilterSheet({ 
  visible, 
  onClose, 
  priceMin,
  priceMax,
  onApply,
}: PriceFilterSheetProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const bottomSheetRef = useRef<BottomSheetModal>(null);

  // Local state for inputs
  const [localMin, setLocalMin] = useState<string>(priceMin?.toString() ?? '');
  const [localMax, setLocalMax] = useState<string>(priceMax?.toString() ?? '');

  // Sync with props when sheet opens
  useEffect(() => {
    if (visible) {
      setLocalMin(priceMin?.toString() ?? '');
      setLocalMax(priceMax?.toString() ?? '');
    }
  }, [visible, priceMin, priceMax]);

  const snapPoints = useMemo(() => ['55%'], []);

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

  const handlePresetSelect = useCallback((preset: typeof PRICE_PRESETS[0]) => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    // Toggle off if already selected
    const isActive = 
      (preset.min === (localMin ? parseInt(localMin) : undefined)) &&
      (preset.max === (localMax ? parseInt(localMax) : undefined));
    
    if (isActive) {
      setLocalMin('');
      setLocalMax('');
    } else {
      setLocalMin(preset.min?.toString() ?? '');
      setLocalMax(preset.max?.toString() ?? '');
    }
  }, [localMin, localMax]);

  const handleApply = useCallback(() => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    const min = localMin ? parseInt(localMin) : undefined;
    const max = localMax ? parseInt(localMax) : undefined;
    onApply(min, max);
    bottomSheetRef.current?.dismiss();
  }, [localMin, localMax, onApply]);

  const handleClear = useCallback(() => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setLocalMin('');
    setLocalMax('');
    onApply(undefined, undefined);
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

  const hasValue = localMin || localMax;

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      snapPoints={snapPoints}
      enablePanDownToClose
      onChange={handleSheetChanges}
      backdropComponent={renderBackdrop}
      backgroundStyle={[styles.background, { backgroundColor: colors.surface }]}
      handleIndicatorStyle={[styles.handleIndicator, { backgroundColor: colors.border }]}
      stackBehavior="push"
      detached
      bottomInset={insets.bottom + 20}
      style={styles.sheetContainer}
    >
      <BottomSheetView style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Heading size="large" style={{ color: colors.text }}>Price</Heading>
          <Pressable 
            onPress={onClose} 
            hitSlop={Spacing.md}
            style={({ pressed }) => [
              styles.closeButton,
              { backgroundColor: pressed ? colors.surfacePressed : colors.surface }
            ]}
          >
            <Ionicons name="close" size={18} color={colors.icon} />
          </Pressable>
        </View>

        {/* Presets */}
        <View style={styles.presetsRow}>
          {PRICE_PRESETS.map((preset) => {
            const isActive = 
              (preset.min === (localMin ? parseInt(localMin) : undefined)) &&
              (preset.max === (localMax ? parseInt(localMax) : undefined));

            return (
              <Pressable
                key={preset.label}
                onPress={() => handlePresetSelect(preset)}
                style={[
                  styles.presetChip,
                  { 
                    backgroundColor: isActive ? colors.text : colors.surfaceSecondary,
                    borderColor: isActive ? colors.text : colors.border,
                  },
                ]}
              >
                <Body
                  size="small"
                  style={[
                    styles.presetLabel,
                    { color: isActive ? colors.background : colors.textSecondary },
                  ]}
                >
                  {preset.label}
                </Body>
              </Pressable>
            );
          })}
        </View>

        {/* Range Inputs */}
        <View style={styles.rangeRow}>
          <View style={styles.inputWrapper}>
            <Label size="small" style={{ color: colors.textSecondary, marginBottom: Spacing.xs }}>
              MIN
            </Label>
            <TextInput
              style={[
                styles.input,
                { 
                  backgroundColor: colors.surfaceSecondary,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              placeholder="0"
              placeholderTextColor={colors.textTertiary}
              keyboardType="number-pad"
              value={localMin}
              onChangeText={setLocalMin}
            />
          </View>
          <Body size="large" tone="muted" style={styles.rangeDash}>–</Body>
          <View style={styles.inputWrapper}>
            <Label size="small" style={{ color: colors.textSecondary, marginBottom: Spacing.xs }}>
              MAX
            </Label>
            <TextInput
              style={[
                styles.input,
                { 
                  backgroundColor: colors.surfaceSecondary,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              placeholder="Any"
              placeholderTextColor={colors.textTertiary}
              keyboardType="number-pad"
              value={localMax}
              onChangeText={setLocalMax}
            />
          </View>
        </View>

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
            <ButtonText size="medium" style={{ color: colors.background }}>Apply</ButtonText>
          </Pressable>
        </View>

        <View style={{ height: insets.bottom + Spacing.xl }} />
      </BottomSheetView>
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
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.xs,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  presetsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  presetChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  presetLabel: {
    fontFamily: 'Inter_500Medium',
  },
  rangeRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  inputWrapper: {
    flex: 1,
  },
  input: {
    height: 48,
    borderRadius: Radius.lg,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    fontFamily: 'Inter_500Medium',
  },
  rangeDash: {
    marginBottom: Spacing.md,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.md,
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
