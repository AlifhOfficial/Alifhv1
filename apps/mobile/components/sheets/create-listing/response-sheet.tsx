/**
 * ResponseSheet — Lightweight feedback modal for create listing flow
 *
 * Native fallback replacement for the old Gorhom-based response sheet.
 *
 * @module components/sheets/create-listing/response-sheet
 */

import { Text, HapticPressable } from '@/components/ui';
import React, { useEffect, useCallback } from 'react';
import { View, StyleSheet, Modal, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { AlertCircle, CheckCircle, AlertTriangle, Info } from 'lucide-react-native';

import { Colors, Spacing, Radius } from '@/constants/theme';
import type { ColorPalette } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';

export type ResponseType = 'error' | 'success' | 'warning' | 'info';

export interface ResponseSheetProps {
  visible: boolean;
  type: ResponseType;
  title: string;
  message?: string;
  onDismiss: () => void;
  onRetry?: () => void;
  retryLabel?: string;
  primaryLabel?: string;
  onPrimary?: () => void;
}

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

  useEffect(() => {
    if (visible) {
      Haptics.notificationAsync(getHaptic(type));
    }
  }, [visible, type]);

  const handleDismiss = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onDismiss();
  }, [onDismiss]);

  const handleRetry = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onDismiss();
    onRetry?.();
  }, [onDismiss, onRetry]);

  const handlePrimary = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onDismiss();
    onPrimary?.();
  }, [onDismiss, onPrimary]);

  const iconColor = getIconColor(type, colors);
  const hasActions = onRetry || onPrimary;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleDismiss}
      presentationStyle="overFullScreen"
    >
      <View style={styles.backdropContainer}>
        <Pressable style={styles.backdrop} onPress={handleDismiss} />

        <View style={[styles.card, { backgroundColor: colors.sheet, borderColor: colors.sheetBorder }]}> 
          <View style={[styles.iconWrapper, { backgroundColor: `${iconColor}15` }]}> 
            {getIcon(type, iconColor, 32)}
          </View>

          <Text variant="subheadEmphasized" style={styles.title}>
            {title}
          </Text>

          {message ? (
            <Text variant="body" tone="secondary" style={styles.message}>
              {message}
            </Text>
          ) : null}

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

                {onRetry ? (
                  <HapticPressable
                    onPress={handleRetry}
                    style={[styles.primaryButton, { backgroundColor: colors.primary }]}
                  >
                    <Text variant="body" style={{ color: colors.primaryForeground }}>
                      {retryLabel}
                    </Text>
                  </HapticPressable>
                ) : null}

                {onPrimary && primaryLabel ? (
                  <HapticPressable
                    onPress={handlePrimary}
                    style={[styles.primaryButton, { backgroundColor: colors.primary }]}
                  >
                    <Text variant="body" style={{ color: colors.primaryForeground }}>
                      {primaryLabel}
                    </Text>
                  </HapticPressable>
                ) : null}
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
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdropContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  card: {
    borderTopLeftRadius: Radius.sheet,
    borderTopRightRadius: Radius.sheet,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing['2xl'],
  },
  iconWrapper: {
    width: Spacing['5xl'] + Spacing.lg,
    height: Spacing['5xl'] + Spacing.lg,
    borderRadius: (Spacing['5xl'] + Spacing.lg) / 2,
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
