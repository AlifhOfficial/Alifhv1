/**
 * BaseSheet — Reusable detached bottom sheet wrapper
 *
 * Provides consistent layout, animations, and keyboard handling
 * for all micro-step sheets in the create listing flow.
 *
 * VARIANTS:
 * - 'default': X button top-right, footer with Back/Next buttons
 * - 'flow': iOS-style header (Cancel/Back | Title | Skip/Next)
 *
 * CONTROLS PROVIDED:
 * - Terminate: X/Cancel button with confirmation dialog to exit flow
 * - Progression: Back/Next buttons + step indicator + progress bar
 *
 * All child sheets inherit these controls from BaseSheet alone.
 *
 * @module components/sheets/create-listing/base-sheet
 */

import React, { useCallback, useRef, useEffect, useMemo } from 'react';
import { View, StyleSheet, Keyboard, Alert, Platform } from 'react-native';
import {
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetView,
  BottomSheetScrollView,
  BottomSheetFlatList,
} from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { X, ChevronLeft } from 'lucide-react-native';

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
  /** Subtitle/helper text (only for default variant) */
  subtitle?: string;
  /** Layout variant: 'default' = footer buttons, 'flow' = iOS-style header */
  variant?: 'default' | 'flow';
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
  /** Content can scroll (only for default variant) */
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
  variant = 'default',
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

  const isFlowVariant = variant === 'flow';

  // Calculate progress from steps if not manually provided
  const progress = useMemo(() => {
    if (typeof manualProgress === 'number') return manualProgress;
    if (currentStep && totalSteps) {
      return Math.round((currentStep / totalSteps) * 100);
    }
    return undefined;
  }, [manualProgress, currentStep, totalSteps]);

  const snapPoints = useMemo(
    () => customSnapPoints ?? (isFlowVariant ? ['55%', '92%'] : ['60%', '93%']),
    [customSnapPoints, isFlowVariant]
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
        // Sheet was dismissed via gesture - call onClose directly
        // (confirmation is only for explicit cancel button press)
        onClose();
      }
    },
    [onClose]
  );

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

  const handleBack = useCallback(() => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onBack?.();
  }, [onBack]);

  // Terminate flow with confirmation
  const handleTerminate = useCallback(() => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    Keyboard.dismiss();

    // Skip confirmation if on first step or explicitly requested
    if (skipExitConfirmation || currentStep === 1) {
      if (isFlowVariant) {
        bottomSheetRef.current?.dismiss();
      }
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
            if (isFlowVariant) {
              bottomSheetRef.current?.dismiss();
            }
            onClose();
          },
        },
      ]
    );
  }, [onClose, skipExitConfirmation, currentStep, isFlowVariant]);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
        pressBehavior={isFlowVariant ? 'close' : 'none'}
      />
    ),
    [isFlowVariant]
  );

  const hasPrimary = !!onPrimary;

  // ── Flow variant (iOS-style header) ──
  if (isFlowVariant) {
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
        keyboardBehavior="extend"
        keyboardBlurBehavior="restore"
        android_keyboardInputMode="adjustResize"
        detached
        bottomInset={insets.bottom + Spacing.xl}
        style={styles.sheetContainerFlow}
      >
        <BottomSheetView style={styles.containerFlow}>
          {/* Progress Section */}
          {typeof progress === 'number' && (
            <View style={styles.progressSection}>
              <View style={[styles.progressTrackFlow, { backgroundColor: colors.fillSecondary }]}>
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

          {/* Header: Cancel | [Back?] Title | Skip/Next */}
          <View style={[styles.headerFlow, { borderBottomColor: colors.border }]}>
            <View style={styles.headerRow}>
              {/* Left: Cancel (always visible) */}
              <HapticPressable
                onPress={handleTerminate}
                hitSlop={Spacing.md}
                style={styles.headerLeft}
              >
                <Body size="medium" tone="secondary">Cancel</Body>
              </HapticPressable>

              {/* Center: Back chevron + Title */}
              <View style={styles.headerCenter}>
                {showBack && (
                  <HapticPressable
                    onPress={handleBack}
                    hitSlop={Spacing.sm}
                    style={styles.backChevron}
                  >
                    <ChevronLeft size={Sizes.iconMd} color={colors.textSecondary} />
                  </HapticPressable>
                )}
                <Heading size="small">{title}</Heading>
              </View>

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
                    styles.primaryButtonFlow,
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
        </BottomSheetView>
      </BottomSheetModal>
    );
  }

  // ── Default variant (footer buttons) ──
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

// ─── Subcomponents for flow variant ──────────────────────────────────────────

/** Scrollable content wrapper - use for forms/mixed content */
export function FlowScrollContent({ children }: { children: React.ReactNode }) {
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
interface FlowListContentProps<T> {
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

export function FlowListContent<T>({
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
}: FlowListContentProps<T>) {
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

// Aliases for backward compatibility
export const CreateFlowScrollContent = FlowScrollContent;
export const CreateFlowListContent = FlowListContent;

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // Default variant styles
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

  // Flow variant styles
  sheetContainerFlow: {
    marginHorizontal: Spacing.lg,
  },
  containerFlow: {
    flex: 1,
    overflow: 'hidden',
  },
  progressTrackFlow: {
    height: 2,
    borderRadius: 1,
    overflow: 'hidden',
  },
  headerFlow: {
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
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  backChevron: {
    marginLeft: -Spacing.xs,
  },
  primaryButtonFlow: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.full,
  },
  skipUnder: {
    alignSelf: 'center',
    marginTop: Spacing.xs,
  },

  // Shared content styles
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

// Alias for backward compatibility
export const CreateFlowSheet = (props: BaseSheetProps) => <BaseSheet {...props} variant="flow" />;

export default BaseSheet;
