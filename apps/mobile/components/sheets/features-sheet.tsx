/**
 * FeaturesSheet - Bottom Sheet for all listing features/extras
 * Uses @gorhom/bottom-sheet modal for proper iOS gesture handling
 */

import React, { useCallback, useMemo, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors, Typography, Spacing, Radius } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';

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
      backgroundStyle={{ backgroundColor: colors.surface }}
      handleIndicatorStyle={{ backgroundColor: colors.border, width: 36 }}
      stackBehavior="push"
    >
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>All Features</Text>
        <Pressable onPress={onClose} hitSlop={12}>
          <Text style={[styles.doneBtn, { color: colors.primary }]}>Done</Text>
        </Pressable>
      </View>

      <BottomSheetScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.badgesContainer}>
          {features.map((feature, idx) => (
            <View 
              key={idx} 
              style={[styles.badge, { backgroundColor: colors.backgroundSecondary }]}
            >
              <Text style={[styles.badgeText, { color: colors.text }]}>
                {formatEnumValue(feature)}
              </Text>
            </View>
          ))}
        </View>
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: Spacing.md,
  },
  headerTitle: {
    ...Typography.headingLarge,
  },
  doneBtn: {
    ...Typography.buttonMedium,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
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
  },
  badgeText: {
    ...Typography.chip,
  },
});
