/**
 * DescriptionSheet - Bottom Sheet for full listing description
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

import { Colors, Spacing, Radius, Sizes } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { Heading, Body } from '@/components/ui';
import { Copy } from 'lucide-react-native';

interface DescriptionSheetProps {
  visible: boolean;
  onClose: () => void;
  description: string;
}

export function DescriptionSheet({ visible, onClose, description }: DescriptionSheetProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const bottomSheetRef = useRef<BottomSheetModal>(null);

  const [copied, setCopied] = useState(false);

  const snapPoints = useMemo(() => ['60%', '94%'], []);

  const handleCopy = useCallback(async () => {
    await Clipboard.setStringAsync(description);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [description]);

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
      backgroundStyle={{ backgroundColor: colors.surface, borderRadius: Radius['3xl'] }}
      handleIndicatorStyle={{ backgroundColor: colors.textMuted, width: Sizes.bubble }}
    >
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Heading size="medium">Description</Heading>
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
                <Ionicons name="checkmark" size={Sizes.iconSm} color={colors.primary} />
              ) : (
                <Copy size={Sizes.iconSm} color={colors.textSecondary} />
              )}
            </HapticPressable>
            <HapticPressable 
              onPress={onClose} 
              hitSlop={Spacing.md}
              style={[
                styles.iconButton,
                { backgroundColor: colors.error }
              ]}
            >
              <Ionicons name="close" size={Sizes.iconSm} color="#FFFFFF" />
            </HapticPressable>
          </View>
        </View>

        <BottomSheetScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Body size="medium">
            {description}
          </Body>
        </BottomSheetScrollView>

        <View style={{ height: insets.bottom + Spacing.md }} />
      </View>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  sheetContainer: {
    marginHorizontal: Spacing.lg,
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
    width: Spacing['3xl'],
    height: Spacing['3xl'],
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.md,
  },
});
