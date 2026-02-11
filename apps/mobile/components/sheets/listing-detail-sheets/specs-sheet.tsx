/**
 * SpecsSheet - Bottom Sheet for all listing specifications
 * Uses @gorhom/bottom-sheet modal for proper iOS gesture handling
 */

import React, { useCallback, useMemo, useRef, useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { HapticPressable } from '@/components/ui';
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';

import { Colors, Spacing, Radius } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { Heading, Supporting, Data } from '@/components/ui';
import { Copy } from 'lucide-react-native';

interface SpecItem {
  label: string;
  value: string | number | null | undefined;
}

interface SpecsSheetProps {
  visible: boolean;
  onClose: () => void;
  specs: SpecItem[];
}

function SpecRow({ label, value }: SpecItem) {
  const displayValue = value === null || value === undefined ? '—' : String(value);

  return (
    <View style={styles.specRow}>
      <Supporting size="medium">{label}</Supporting>
      <Data size="medium">{displayValue}</Data>
    </View>
  );
}

export function SpecsSheet({ visible, onClose, specs }: SpecsSheetProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const bottomSheetRef = useRef<BottomSheetModal>(null);

  const [copied, setCopied] = useState(false);

  const snapPoints = useMemo(() => ['60%', '94%'], []);

  const handleCopy = useCallback(async () => {
    const text = specs
      .map(s => `${s.label}: ${s.value ?? '—'}`)
      .join('\n');
    await Clipboard.setStringAsync(text);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [specs]);

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
      enableDynamicSizing={false}
      enablePanDownToClose
      onChange={handleSheetChanges}
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: colors.surface, borderRadius: 24 }}
      handleIndicatorStyle={{ backgroundColor: colors.textMuted, width: 36 }}
      detached
      bottomInset={insets.bottom + 20}
      style={styles.sheetContainer}
    >
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Heading size="medium">All Specifications</Heading>
          <View style={styles.headerActions}>
            <HapticPressable 
              onPress={handleCopy} 
              hitSlop={Spacing.md}
              style={[
                styles.iconButton,
                { backgroundColor: colors.fillSecondary }
              ]}
            >
              {copied ? (
                <Ionicons name="checkmark" size={18} color={colors.primary} />
              ) : (
                <Copy size={18} color={colors.textSecondary} />
              )}
            </HapticPressable>
            <HapticPressable
              onPress={onClose}
              hitSlop={Spacing.md}
              style={[
                styles.iconButton,
                { backgroundColor: colors.fillSecondary }
              ]}
            >
              <Ionicons name="close" size={18} color={colors.textSecondary} />
            </HapticPressable>
          </View>
        </View>

        <BottomSheetScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Specs List */}
          <View style={styles.listContainer}>
            {specs.map((spec) => (
              <SpecRow
                key={spec.label}
                label={spec.label}
                value={spec.value}
              />
            ))}
          </View>
        </BottomSheetScrollView>

        <View style={{ height: insets.bottom + Spacing.md }} />
      </View>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  sheetContainer: {
    marginHorizontal: 16,
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  iconButton: {
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
  listContainer: {
    gap: 0,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
});
