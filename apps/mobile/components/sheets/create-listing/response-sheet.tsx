/**
 * ResponseSheet — Lightweight feedback sheet for create listing flow
 *
 * Replaces Alert.alert() with a consistent sheet-based UX.
 * Shows errors, success messages, and validation warnings.
 *
 * Usage:
 *   <ResponseSheet
 *     visible={showError}
 *     type="error"
 *     title="Upload Failed"
 *     message="Something went wrong. Please try again."
 *     onDismiss={() => setShowError(false)}
 *     onRetry={() => retryUpload()}
 *   />
 *
 * @module components/sheets/create-listing/response-sheet
 */

import { Text, HapticPressable } from '@/components/ui';
import React, { useCallback, useRef, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import {
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { AlertCircle, CheckCircle, AlertTriangle, Info } from 'lucide-react-native';

import { Colors, Spacing, Radius, Sizes } from '@/constants/theme';
import type { ColorPalette } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type ResponseType = 'error' | 'success' | 'warning' | 'info';

export interface ResponseSheetProps {
  visible: boolean;
  type: ResponseType;
  title: string;
  message?: string;
  onDismiss: () => void;
  /** Optional retry action for errors */
  onRetry?: () => void;
  retryLabel?: string;
  /** Optional primary action */
  primaryLabel?: string;
  onPrimary?: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function getIcon(type: ResponseType, color: string, size: number) {
  const props = { size, color, strokeWidth: 2 };
  switch (type) {
    case 'error':
      return <AlertCircle {...props} />;
    case 'success':
      return <CheckCircle {...props} />;
    case 'warning':
      return <AlertTriangle {...props} />;
    case 'info':
    default:
      return <Info {...props} />;
  }
}

function getIconColor(type: ResponseType, colors: ColorPalette): string {
  switch (type) {
    case 'error':
      return colors.error;
    case 'success':
      return colors.success;
    case 'warning':
      return colors.warning;
    case 'info':
    default:
      return colors.primary;
  }
}

function getHaptic(type: ResponseType) {
  switch (type) {
    case 'error':
      return Haptics.NotificationFeedbackType.Error;
    case 'success':
      return Haptics.NotificationFeedbackType.Success;
    case 'warning':
      return Haptics.NotificationFeedbackType.Warning;
    default:
      return Haptics.NotificationFeedbackType.Success;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function ResponseSheet({
  visible,
  type,
  title,
  message,
  onDismiss,
  onRetry,
  retryLabel = 'Try Again',
  primaryLabel,
  onPrimary,
}: ResponseSheetProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const bottomSheetRef = useRef<BottomSheetModal>(null);

  // Present/dismiss based on visible prop
  useEffect(() => {
    if (visible) {
      bottomSheetRef.current?.present();
      Haptics.notificationAsync(getHaptic(type));
    } else {
      bottomSheetRef.current?.dismiss();
    }
  }, [visible, type]);

  const handleSheetChanges = useCallback(
    (index: number) => {
      if (index === -1) {
        onDismiss();
      }
    },
    [onDismiss]
  );

  const handleDismiss = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    bottomSheetRef.current?.dismiss();
  }, []);

  const handleRetry = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    bottomSheetRef.current?.dismiss();
    onRetry?.();
  }, [onRetry]);

  const handlePrimary = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    bottomSheetRef.current?.dismiss();
    onPrimary?.();
  }, [onPrimary]);

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

  const iconColor = getIconColor(type, colors);
  const hasActions = onRetry || onPrimary;

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      snapPoints={['35%']}
      enableDynamicSizing={false}
      enablePanDownToClose
      onChange={handleSheetChanges}
      backdropComponent={renderBackdrop}
      backgroundStyle={{
        backgroundColor: colors.surface,
        borderTopLeftRadius: Radius.sheet,
        borderTopRightRadius: Radius.sheet,
        borderCurve: 'continuous',
      }}
      handleIndicatorStyle={{ backgroundColor: colors.labelQuaternary, width: Sizes.bubble }}
    >
      <BottomSheetView style={styles.container}>
        {/* Icon */}
        <View style={[styles.iconWrapper, { backgroundColor: iconColor + '15' }]}>
          {getIcon(type, iconColor, 32)}
        </View>

        {/* Title */}
        <Text variant="subheadEmphasized" style={styles.title}>
          {title}
        </Text>

        {/* Message */}
        {message && (
          <Text variant="body" tone="secondary" style={styles.message}>
            {message}
          </Text>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          {hasActions ? (
            <>
              <HapticPressable
                onPress={handleDismiss}
                style={[styles.secondaryButton, { backgroundColor: colors.fill2 }]}
              >
                <Text variant="body" style={{ color: colors.label }}>
                  Dismiss
                </Text>
              </HapticPressable>

              {onRetry && (
                <HapticPressable
                  onPress={handleRetry}
                  style={[styles.primaryButton, { backgroundColor: colors.primary }]}
                >
                  <Text variant="body" style={{ color: colors.primaryForeground }}>
                    {retryLabel}
                  </Text>
                </HapticPressable>
              )}

              {onPrimary && primaryLabel && (
                <HapticPressable
                  onPress={handlePrimary}
                  style={[styles.primaryButton, { backgroundColor: colors.primary }]}
                >
                  <Text variant="body" style={{ color: colors.primaryForeground }}>
                    {primaryLabel}
                  </Text>
                </HapticPressable>
              )}
            </>
          ) : (
            <HapticPressable
              onPress={handleDismiss}
              style={[styles.fullButton, { backgroundColor: colors.fill2 }]}
            >
              <Text variant="body" style={{ color: colors.label }}>
                OK
              </Text>
            </HapticPressable>
          )}
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  sheetContainer: {
    marginHorizontal: Spacing.lg,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  iconWrapper: {
    width: Spacing["5xl"] + Spacing.lg,
    height: Spacing["5xl"] + Spacing.lg,
    borderRadius: (Spacing["5xl"] + Spacing.lg) / 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  message: {
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    width: '100%',
    marginTop: 'auto',
  },
  secondaryButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ResponseSheet;
