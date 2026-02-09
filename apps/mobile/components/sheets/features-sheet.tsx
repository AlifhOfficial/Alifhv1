/**
 * FeaturesSheet - Bottom Sheet for all listing features/extras
 * Uses @gorhom/bottom-sheet modal for proper iOS gesture handling
 */

import React, { useCallback, useMemo, useRef, useEffect } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { Colors, Spacing, Radius } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { Heading, Label } from '@/components/ui';

interface FeaturesSheetProps {
  visible: boolean;
  onClose: () => void;
  features: string[];
}

function formatEnumValue(value: string): string {
  return value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function FeaturesSheet({ visible, onClose, features }: FeaturesSheetProps) {
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
        <Heading size="medium" style={{ color: colors.text }}>All Features</Heading>
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
        <View style={styles.badgesContainer}>
          {features.map((feature, idx) => (
            <View 
              key={idx} 
              style={[
                styles.badge,
                { backgroundColor: colors.surfaceSecondary, borderColor: colors.border },
              ]}
            >
              <Label size="badge" uppercase={false} tone="secondary">
                {formatEnumValue(feature)}
              </Label>
            </View>
          ))}
        </View>
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
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  badge: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
});
