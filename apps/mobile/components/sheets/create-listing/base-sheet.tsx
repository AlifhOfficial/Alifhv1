/**
 * BaseSheet — Reusable detached bottom sheet wrapper
 *
 * Provides consistent layout, animations, and keyboard handling
 * for all micro-step sheets in the create listing flow.
 *
 * CONTROLS PROVIDED:
 * - Terminate: X button with confirmation dialog to exit flow
 * - Progression: Back/Next buttons + step indicator + progress bar
 *
 * All child sheets inherit these controls from BaseSheet alone.
 *
 * @module components/sheets/create-listing/base-sheet
 */

import React, { useCallback, useRef, useEffect, useMemo } from 'react';
import { View, StyleSheet, Keyboard, Alert } from 'react-native';
import {
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetView,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { X } from 'lucide-react-native';

import { Colors, Spacing, Radius, Sizes, Layout } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { Heading, Body, Supporting, ButtonText } from '@/components/ui';
import { HapticPressable } from '@/components/ui';

// ─── Props ───────────────────────────────────────────────────────────────────

interface BaseSheetProps {
  visible: boolean;
  /** Called when user confirms exit - terminates the entire flow */
  onClose: () => void;
  /** Header title */
  title: string;
  /** Subtitle/helper text */
  subtitle?: string;
  /** Show skip button */
  canSkip?: boolean;
  onSkip?: () => void;
  /** Primary action */
  primaryLabel?: string;
  primaryDisabled?: boolean;
  onPrimary?: () => void;
  /** Secondary action (back) */
  showBack?: boolean;
  onBack?: () => void;
  /** Current step number (1-indexed) */
  currentStep?: number;
  /** Total number of steps */
  totalSteps?: number;
  /** Manual progress override (0-100). If not provided, calculated from steps */
  progress?: number;
  /** Content can scroll */
  scrollable?: boolean;
  /** Custom snap points */
  snapPoints?: (string | number)[];
  /** Skip terminate confirmation (for first step or review) */
  skipExitConfirmation?: boolean;
  /** Content */
  children: React.ReactNode;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function BaseSheet({
  visible,
  onClose,
  title,
  subtitle,
  canSkip = false,
  onSkip,
  primaryLabel = 'Next',
  primaryDisabled = false,
  onPrimary,
  showBack = false,
  onBack,
  currentStep,
  totalSteps,
  progress: manualProgress,
  scrollable = false,
  snapPoints: customSnapPoints,
  skipExitConfirmation = false,
  children,
}: BaseSheetProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const bottomSheetRef = useRef<BottomSheetModal>(null);

  // Calculate progress from steps if not manually provided
  const progress = useMemo(() => {
    if (typeof manualProgress === 'number') return manualProgress;
    if (currentStep && totalSteps) {
      return Math.round((currentStep / totalSteps) * 100);
    }
    return undefined;
  }, [manualProgress, currentStep, totalSteps]);

  const snapPoints = useMemo(
    () => customSnapPoints ?? ['60%', '93%'],
    [customSnapPoints]
  );

  // Present/dismiss based on visible prop
  useEffect(() => {
    if (visible) {
      bottomSheetRef.current?.present();
    } else {
      bottomSheetRef.current?.dismiss();
    }
  }, [visible]);

  const handleSheetChanges = useCallback(
    (index: number) => {
      if (index === -1) {
        Keyboard.dismiss();
        // Don't call onClose here - it's handled by the X button
        // Calling it here would cause double-close issues
      }
    },
    []
  );

  const handlePrimary = useCallback(() => {
    if (primaryDisabled) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPrimary?.();
  }, [primaryDisabled, onPrimary]);

  const handleSkip = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSkip?.();
  }, [onSkip]);

  const handleBack = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onBack?.();
  }, [onBack]);

  // Terminate flow with confirmation
  const handleTerminate = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Keyboard.dismiss();

    // Skip confirmation if on first step or explicitly requested
    if (skipExitConfirmation || currentStep === 1) {
      onClose();
      return;
    }

    Alert.alert(
      'Exit Listing',
      'Your progress will be saved as a draft. You can continue later.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Exit',
          style: 'destructive',
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            onClose();
          },
        },
      ]
    );
  }, [onClose, skipExitConfirmation, currentStep]);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
        pressBehavior="none"
      />
    ),
    []
  );

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      snapPoints={snapPoints}
      enableDynamicSizing={false}
      enablePanDownToClose={false}
      onChange={handleSheetChanges}
      backdropComponent={renderBackdrop}
      backgroundStyle={[styles.background, { backgroundColor: colors.surface }]}
      handleIndicatorStyle={[styles.handleIndicator, { backgroundColor: colors.border }]}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustResize"
      detached
      bottomInset={insets.bottom + Spacing.xl}
      style={styles.sheetContainer}
    >
      <BottomSheetView style={styles.container}>
        {/* Progress Section - Bar + Step Indicator */}
        {typeof progress === 'number' && (
          <View style={styles.progressSection}>
            <View style={[styles.progressTrack, { backgroundColor: colors.fillSecondary }]}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${progress}%`, backgroundColor: colors.primary },
                ]}
              />
            </View>
            {currentStep && totalSteps && (
              <Supporting size="small" tone="secondary" style={styles.stepIndicator}>
                Step {currentStep} of {totalSteps}
              </Supporting>
            )}
          </View>
        )}

        {/* Header - Fixed at top */}
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Heading size="medium">{title}</Heading>
            {subtitle && (
              <Supporting size="small" tone="secondary">
                {subtitle}
              </Supporting>
            )}
          </View>
          <View style={styles.headerActions}>
            {canSkip && (
              <HapticPressable onPress={handleSkip} hitSlop={Layout.hitSlopSmall}>
                <Body size="medium" style={{ color: colors.textMuted }}>
                  Skip
                </Body>
              </HapticPressable>
            )}
            <HapticPressable
              onPress={handleTerminate}
              hitSlop={Layout.hitSlopSmall}
              style={[styles.closeButton, { backgroundColor: colors.fillSecondary }]}
            >
              <X size={Sizes.iconSm} color={colors.textMuted} />
            </HapticPressable>
          </View>
        </View>

        {/* Content - Scrollable or fixed based on prop */}
        {scrollable ? (
          <BottomSheetScrollView 
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {children}
          </BottomSheetScrollView>
        ) : (
          <View style={styles.content}>{children}</View>
        )}

        {/* Footer Actions - Fixed at bottom */}
        <View style={[styles.footer, { borderTopColor: colors.border }]}>
          {showBack ? (
            <HapticPressable
              onPress={handleBack}
              style={[styles.backButton, { backgroundColor: colors.fillSecondary }]}
            >
              <ButtonText size="medium" style={{ color: colors.text }}>
                Back
              </ButtonText>
            </HapticPressable>
          ) : (
            <View style={{ flex: 1 }} />
          )}

          <HapticPressable
            onPress={handlePrimary}
            style={[
              styles.primaryButton,
              {
                backgroundColor: primaryDisabled ? colors.fillSecondary : colors.primary,
                flex: showBack ? 2 : 1,
              },
            ]}
          >
            <ButtonText
              size="medium"
              style={{ color: primaryDisabled ? colors.textMuted : colors.primaryForeground }}
            >
              {primaryLabel}
            </ButtonText>
          </HapticPressable>
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  sheetContainer: {
    marginHorizontal: Spacing.md,
  },
  background: {
    borderRadius: Radius.xl,
  },
  handleIndicator: {
    width: 36,
    height: 4,
    marginTop: Spacing.sm,
  },
  container: {
    flex: 1,
  },
  progressSection: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xs,
    gap: Spacing.xs,
  },
  progressTrack: {
    height: 3,
    borderRadius: 1.5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 1.5,
  },
  stepIndicator: {
    textAlign: 'right',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  headerText: {
    flex: 1,
    gap: Spacing.xs,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  footer: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  backButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    paddingVertical: Spacing.md,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default BaseSheet;
