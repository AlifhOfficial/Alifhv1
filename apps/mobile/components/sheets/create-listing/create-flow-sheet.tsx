/**
 * CreateFlowSheet — Clean base sheet for create listing flow
 *
 * CONTROLS PROVIDED (from BaseSheet pattern):
 * - Terminate: Cancel button with confirmation dialog to exit flow
 * - Progression: Step indicator + progress bar (auto-calculated from steps)
 *
 * All child sheets inherit these controls from CreateFlowSheet alone.
 *
 * @module components/sheets/create-listing/create-flow-sheet
 */

import React, { useCallback, useRef, useEffect, useMemo } from 'react';
import { View, StyleSheet, Keyboard, Platform, Alert } from 'react-native';
import {
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetScrollView,
  BottomSheetFlatList,
} from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { ChevronLeft } from 'lucide-react-native';

import { Colors, Spacing, Radius, Sizes, Layout } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { Heading, Body, Supporting, ButtonText } from '@/components/ui';
import { HapticPressable } from '@/components/ui';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface CreateFlowSheetProps {
  visible: boolean;
  /** Called when user confirms exit - terminates the entire flow */
  onClose: () => void;

  /** Sheet title (centered) */
  title: string;

  /** Show back arrow (left) - for steps > 1 */
  showBack?: boolean;
  onBack?: () => void;

  /** Primary action (right) */
  primaryLabel?: string;
  primaryDisabled?: boolean;
  onPrimary?: () => void;

  /** Skip option (shows in header if canSkip) */
  canSkip?: boolean;
  onSkip?: () => void;

  /** Current step number (1-indexed) */
  currentStep?: number;
  /** Total number of steps */
  totalSteps?: number;
  /** Manual progress override (0-100). If not provided, calculated from steps */
  progress?: number;

  /** Skip terminate confirmation (for first step) */
  skipExitConfirmation?: boolean;

  /** Snap points - default ['55%', '92%'] */
  snapPoints?: (string | number)[];

  /** Content */
  children: React.ReactNode;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function CreateFlowSheet({
  visible,
  onClose,
  title,
  showBack = false,
  onBack,
  primaryLabel = 'Next',
  primaryDisabled = false,
  onPrimary,
  canSkip = false,
  onSkip,
  currentStep,
  totalSteps,
  progress: manualProgress,
  skipExitConfirmation = false,
  snapPoints: customSnapPoints,
  children,
}: CreateFlowSheetProps) {
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
    () => customSnapPoints ?? ['55%', '92%'],
    [customSnapPoints]
  );

  // ── Lifecycle ──
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
      }
    },
    []
  );

  // ── Handlers ──
  const handleBack = useCallback(() => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onBack?.();
  }, [onBack]);

  const handlePrimary = useCallback(() => {
    if (primaryDisabled) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onPrimary?.();
  }, [primaryDisabled, onPrimary]);

  const handleSkip = useCallback(() => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onSkip?.();
  }, [onSkip]);

  const handleCancel = useCallback(() => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    Keyboard.dismiss();

    // Skip confirmation if on first step or explicitly requested
    if (skipExitConfirmation || currentStep === 1) {
      bottomSheetRef.current?.dismiss();
      onClose();
      return;
    }

    // Show confirmation dialog
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
            bottomSheetRef.current?.dismiss();
            onClose();
          },
        },
      ]
    );
  }, [skipExitConfirmation, currentStep, onClose]);

  // ── Backdrop ──
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

  const hasPrimary = !!onPrimary;

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      snapPoints={snapPoints}
      enableDynamicSizing={false}
      enablePanDownToClose={false}
      onChange={handleSheetChanges}
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: colors.surface, borderRadius: Radius['3xl'] }}
      handleIndicatorStyle={{ backgroundColor: colors.textMuted, width: Sizes.bubble }}
      keyboardBehavior="extend"
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustResize"
      detached
      bottomInset={insets.bottom + Spacing.xl}
      style={styles.sheetContainer}
    >
      <View style={styles.container}>
        {/* Progress Section - Bar + Step Indicator */}
        {typeof progress === 'number' && (
          <View style={styles.progressSection}>
            <View style={[styles.progressTrack, { backgroundColor: colors.fillSecondary }]}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${Math.min(100, Math.max(0, progress))}%`, backgroundColor: colors.primary },
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

        {/* Header: Back/Cancel | Title | Skip/Next */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <View style={styles.headerRow}>
            {/* Left: Back or Cancel */}
            {showBack ? (
              <HapticPressable
                onPress={handleBack}
                hitSlop={Spacing.md}
                style={styles.headerLeft}
              >
                <ChevronLeft size={Sizes.iconMd} color={colors.textSecondary} />
              </HapticPressable>
            ) : (
              <HapticPressable
                onPress={handleCancel}
                hitSlop={Spacing.md}
                style={styles.headerLeft}
              >
                <Body size="medium" tone="secondary">Cancel</Body>
              </HapticPressable>
            )}

            {/* Center: Title */}
            <Heading size="small">{title}</Heading>

            {/* Right: Skip or Primary action */}
            {canSkip && !hasPrimary ? (
              <HapticPressable
                onPress={handleSkip}
                hitSlop={Spacing.md}
                style={styles.headerRight}
              >
                <Body size="medium" tone="secondary">Skip</Body>
              </HapticPressable>
            ) : hasPrimary ? (
              <HapticPressable
                onPress={handlePrimary}
                disabled={primaryDisabled}
                style={[
                  styles.primaryButton,
                  { backgroundColor: primaryDisabled ? colors.fillSecondary : colors.primary },
                ]}
              >
                <ButtonText
                  size="small"
                  style={{ color: primaryDisabled ? colors.textMuted : colors.primaryForeground }}
                >
                  {primaryLabel}
                </ButtonText>
              </HapticPressable>
            ) : (
              <View style={styles.headerRight} />
            )}
          </View>

          {/* Optional: Skip under title when primary exists */}
          {canSkip && hasPrimary && (
            <HapticPressable onPress={handleSkip} style={styles.skipUnder}>
              <Supporting size="small" style={{ color: colors.textMuted }}>
                Skip this step
              </Supporting>
            </HapticPressable>
          )}
        </View>

        {/* Content */}
        {children}

        {/* Bottom safe padding - content should add this if needed */}
      </View>
    </BottomSheetModal>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Subcomponents for convenience
// ─────────────────────────────────────────────────────────────────────────────

/** Scrollable content wrapper - use for forms/mixed content */
export function CreateFlowScrollContent({ children }: { children: React.ReactNode }) {
  const insets = useSafeAreaInsets();

  return (
    <BottomSheetScrollView
      style={styles.scrollView}
      contentContainerStyle={[
        styles.scrollContent,
        { paddingBottom: insets.bottom + Spacing['3xl'] },
      ]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {children}
    </BottomSheetScrollView>
  );
}

/** FlatList content wrapper - use for selectable lists */
interface CreateFlowListContentProps<T> {
  data: T[];
  keyExtractor: (item: T, index: number) => string;
  renderItem: (info: { item: T; index: number }) => React.ReactElement | null;
  ListHeaderComponent?: React.ReactElement | null;
  ListEmptyComponent?: React.ReactElement | null;
  ItemSeparatorComponent?: React.ComponentType<any> | null;
  getItemLayout?: (data: T[] | null | undefined, index: number) => { length: number; offset: number; index: number };
  onScrollToIndexFailed?: (info: { index: number; highestMeasuredFrameIndex: number; averageItemLength: number }) => void;
  initialScrollIndex?: number;
  listRef?: React.RefObject<any>;
}

export function CreateFlowListContent<T>({
  data,
  keyExtractor,
  renderItem,
  ListHeaderComponent,
  ListEmptyComponent,
  ItemSeparatorComponent,
  getItemLayout,
  onScrollToIndexFailed,
  initialScrollIndex,
  listRef,
}: CreateFlowListContentProps<T>) {
  const insets = useSafeAreaInsets();

  return (
    <BottomSheetFlatList
      ref={listRef}
      data={data}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      style={styles.listView}
      contentContainerStyle={[
        styles.listContent,
        { paddingBottom: insets.bottom + Spacing['3xl'] },
      ]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={ListHeaderComponent}
      ListEmptyComponent={ListEmptyComponent}
      ItemSeparatorComponent={ItemSeparatorComponent}
      getItemLayout={getItemLayout}
      onScrollToIndexFailed={onScrollToIndexFailed}
      initialScrollIndex={initialScrollIndex}
    />
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
    overflow: 'hidden',
  },
  progressSection: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xs,
    gap: Spacing.xs,
  },
  progressTrack: {
    height: 2,
    borderRadius: 1,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 1,
  },
  stepIndicator: {
    textAlign: 'right',
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    minWidth: 60,
    alignItems: 'flex-start',
  },
  headerRight: {
    minWidth: 60,
    alignItems: 'flex-end',
  },
  primaryButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.full,
  },
  skipUnder: {
    alignSelf: 'center',
    marginTop: Spacing.xs,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  listView: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
});

export default CreateFlowSheet;
