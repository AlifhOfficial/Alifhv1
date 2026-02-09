/**
 * SpecsSheet - Bottom Sheet for all listing specifications
 * Uses @gorhom/bottom-sheet modal for proper iOS gesture handling
 */

import React, { useCallback, useMemo, useRef, useEffect } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { Colors, Spacing, Radius } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { Heading, Supporting, Data } from '@/components/ui';

interface SpecItem {
  label: string;
  value: string | number | null | undefined;
}

interface SpecRowProps extends SpecItem {
  labelColor: string;
  valueColor: string;
}

interface SpecsSheetProps {
  visible: boolean;
  onClose: () => void;
  specs: SpecItem[];
}

function SpecRow({ label, value, labelColor, valueColor }: SpecRowProps) {
  const displayValue = value === null || value === undefined ? '—' : String(value);

  return (
    <View style={styles.specRow}>
      <Supporting size="medium" tone="secondary">{label}</Supporting>
      <Data size="medium">{displayValue}</Data>
    </View>
  );
}

export function SpecsSheet({ visible, onClose, specs }: SpecsSheetProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const bottomSheetRef = useRef<BottomSheetModal>(null);

  const snapPoints = useMemo(() => ['70%', '90%'], []);

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

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      snapPoints={snapPoints}
      enablePanDownToClose
      onChange={handleSheetChanges}
      backdropComponent={renderBackdrop}
      backgroundStyle={[styles.background, { backgroundColor: colors.surface }]}
      handleIndicatorStyle={{ backgroundColor: colors.border, width: 36 }}
      stackBehavior="push"
      detached
      bottomInset={insets.bottom + 20}
      style={styles.sheetContainer}
    >
      <View style={styles.header}>
        <Heading size="medium" style={{ color: colors.text }}>All Specifications</Heading>
        <Pressable
          onPress={onClose}
          hitSlop={Spacing.md}
          style={({ pressed }) => [
            styles.closeButton,
            { backgroundColor: pressed ? colors.surfacePressed : colors.surface },
          ]}
        >
          <Ionicons name="close" size={18} color={colors.icon} />
        </Pressable>
      </View>

      <BottomSheetScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + Spacing['3xl'] }]}
        showsVerticalScrollIndicator={false}
      >
        {specs.map((spec) => (
          <SpecRow
            key={spec.label}
            label={spec.label}
            value={spec.value}
            labelColor={colors.textTertiary}
            valueColor={colors.text}
          />
        ))}
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm + 2,
  },
});
