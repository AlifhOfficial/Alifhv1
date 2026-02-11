/**
 * FeaturesSheet - Bottom Sheet for all listing features/extras
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
import { Heading, Body, ButtonText } from '@/components/ui';

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

  const [copied, setCopied] = useState(false);

  const snapPoints = useMemo(() => ['60%', '94%'], []);

  const handleCopy = useCallback(async () => {
    const text = features.map(f => formatEnumValue(f)).join(', ');
    await Clipboard.setStringAsync(text);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [features]);

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
        <View style={styles.header}>
          <Heading size="medium">All Features</Heading>
          <HapticPressable
            onPress={onClose}
            hitSlop={Spacing.md}
            style={[
              styles.closeButton,
              { backgroundColor: colors.fillSecondary },
            ]}
          >
            <Ionicons name="close" size={18} color={colors.textSecondary} />
          </HapticPressable>
        </View>

        <BottomSheetScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
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
                <Body size="small" tone="secondary">
                  {formatEnumValue(feature)}
                </Body>
              </View>
            ))}
          </View>
        </BottomSheetScrollView>

        {/* Copy Button */}
        <HapticPressable
          onPress={handleCopy}
          style={[
            styles.copyButton,
            { 
              backgroundColor: copied ? colors.surfaceSecondary : colors.text,
            },
          ]}
        >
          <Ionicons 
            name={copied ? 'checkmark' : 'copy-outline'} 
            size={18} 
            color={copied ? colors.textSecondary : colors.surface} 
          />
          <ButtonText size="medium" style={{ color: copied ? colors.textSecondary : colors.surface }}>
            {copied ? 'Copied' : 'Copy Features'}
          </ButtonText>
        </HapticPressable>

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
    paddingBottom: Spacing.md,
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
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: 14,
    borderRadius: Radius.lg,
    marginTop: Spacing.sm,
  },
});
