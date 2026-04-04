/**
 * CreateListingFlow — Sheet-Based Orchestrator
 *
 * Uses a SINGLE BottomSheetModal for the entire flow.
 * Step content renders inside - no sheet switching = no glitches.
 *
 * @module components/sheets/create-listing/create-listing-flow
 */

import { Text, useAlert, HapticPressable, SheetFloatingCloseHandle } from '@/components/ui';
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { View, StyleSheet, BackHandler, Keyboard } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import {
  BottomSheetModal,
  BottomSheetBackdrop,
  type BottomSheetHandleProps,
} from '@gorhom/bottom-sheet';
import * as Haptics from 'expo-haptics';
import { ChevronLeft } from 'lucide-react-native';

import { Colors, Spacing, Radius, Sizes, SheetSnapPoints } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';

import {
  EMPTY_DATA,
  SHEET_STEPS,
  validateStep,
  getProgress,
  type CreateListingData,
  type SheetStepId,
} from './types';

// Step content components (rendered inside the single modal)
import {
  VinStepContent,
  MakeStepContent,
  ModelStepContent,
  YearStepContent,
  TrimStepContent,
  MileageStepContent,
  SpecsRegionStepContent,
  AppearanceStepContent,
  PowertrainStepContent,
  ExtrasStepContent,
  HighlightsStepContent,
  PriceStepContent,
  LocationStepContent,
  PhotosStepContent,
  DescriptionStepContent,
  NotesStepContent,
  ReviewStepContent,
} from './steps';

// ─── Props ───────────────────────────────────────────────────────────────────

interface CreateListingFlowProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: (listingId: string) => void;
  initialData?: Partial<CreateListingData>;
  /** If provided, the flow will UPDATE instead of CREATE */
  listingId?: string;
  /** If true, editing a published listing (lock VIN/make/model/year) */
  isPublishedEdit?: boolean;
}

// ─── Step Content Map ────────────────────────────────────────────────────────

const STEP_CONTENT: Record<SheetStepId, React.ComponentType<StepContentProps>> = {
  'vin': VinStepContent,
  'make': MakeStepContent,
  'model': ModelStepContent,
  'year': YearStepContent,
  'trim': TrimStepContent,
  'mileage': MileageStepContent,
  'specs-region': SpecsRegionStepContent,
  'appearance': AppearanceStepContent,
  'powertrain': PowertrainStepContent,
  'extras': ExtrasStepContent,
  'highlights': HighlightsStepContent,
  'price': PriceStepContent,
  'location': LocationStepContent,
  'photos': PhotosStepContent,
  'description': DescriptionStepContent,
  'notes': NotesStepContent,
  'review': ReviewStepContent,
};

export interface StepContentProps {
  data: CreateListingData;
  onUpdate: (updates: Partial<CreateListingData>) => void;
  /** Called when listing is successfully submitted. `approved` indicates if AI moderation passed. `isDraft` if saved as draft. */
  onSubmitSuccess?: (listingId: string, approved: boolean, isDraft?: boolean) => void;
  onGoToStep?: (index: number) => void;
  /** If editing existing listing, this is the ID */
  editingListingId?: string;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function CreateListingFlow({
  visible,
  onClose,
  onSuccess,
  initialData,
  listingId,
  isPublishedEdit = false,
}: CreateListingFlowProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const router = useRouter();
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const { showAlert } = useAlert();


  // For published edits, skip VIN step (can't change VIN/make/model/year)
  // Start at 'mileage' step (index 5) which is after the locked fields
  const initialStepIndex = isPublishedEdit ? 5 : 0;

  // ── State ──
  const [data, setData] = useState<CreateListingData>(() => ({
    ...EMPTY_DATA,
    ...initialData,
  }));
  const [currentStepIndex, setCurrentStepIndex] = useState(initialStepIndex);

  // Sync data when initialData changes and sheet opens
  // This is critical for editing - initialData is set AFTER visible becomes true
  useEffect(() => {
    if (visible && initialData) {
      let cancelled = false;
      queueMicrotask(() => {
        if (cancelled) return;
        setData({ ...EMPTY_DATA, ...initialData });
        setCurrentStepIndex(isPublishedEdit ? 5 : 0);
      });

      return () => {
        cancelled = true;
      };
    }
  }, [visible, initialData, isPublishedEdit]);

  const currentStep = SHEET_STEPS[currentStepIndex];
  const currentStepId = currentStep?.id;
  const progress = getProgress(currentStepIndex + 1);

  // ── Present/dismiss modal based on visible ──
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
        // Reset state when closed
        setCurrentStepIndex(isPublishedEdit ? 5 : 0);
        setData({ ...EMPTY_DATA, ...initialData });
        onClose();
      }
    },
    [onClose, initialData, isPublishedEdit]
  );

  // ── Form updater ──
  const updateData = useCallback((updates: Partial<CreateListingData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  }, []);

  // ── Navigation ──
  const goToNextStep = useCallback(() => {
    const error = validateStep(currentStepId, data);
    if (error && currentStep?.required) {
      showAlert('Required', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    if (currentStepIndex < SHEET_STEPS.length - 1) {
      setCurrentStepIndex((i) => i + 1);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  }, [currentStepIndex, currentStepId, currentStep, data, showAlert]);

  const goToPrevStep = useCallback(() => {
    // Don't go back past the initial step (important for published edits)
    if (currentStepIndex > initialStepIndex) {
      setCurrentStepIndex((i) => i - 1);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [currentStepIndex, initialStepIndex]);

  const skipStep = useCallback(() => {
    if (!currentStep?.required && currentStepIndex < SHEET_STEPS.length - 1) {
      setCurrentStepIndex((i) => i + 1);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [currentStepIndex, currentStep]);

  const goToStep = useCallback((stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < SHEET_STEPS.length) {
      setCurrentStepIndex(stepIndex);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  }, []);

  // ── Close handler with confirmation ──
  const handleClose = useCallback(() => {
    Keyboard.dismiss();
    // If at initial step, just close
    if (currentStepIndex === initialStepIndex) {
      bottomSheetRef.current?.dismiss();
      return;
    }

    showAlert(
      'Exit Listing?',
      'Are you sure? You will lose all progress.',
      [
        { text: 'Keep Editing', style: 'cancel' },
        {
          text: 'Exit',
          style: 'destructive',
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            bottomSheetRef.current?.dismiss();
          },
        },
      ]
    );
  }, [currentStepIndex, initialStepIndex, showAlert]);

  // ── Success handler ──
  const handleSuccess = useCallback(
    (listingId: string, approved: boolean, isDraft?: boolean) => {
      onSuccess?.(listingId);
      bottomSheetRef.current?.dismiss();
      
      if (approved) {
        // AI moderation passed - match web and return to inventory
        router.replace('/inventory');
      } else if (isDraft) {
        // Saved as draft - go to inventory drafts tab
        router.replace('/inventory?tab=draft');
      } else {
        // Flagged for review - go to inventory (In Review tab)
        router.replace('/inventory?tab=in_review');
      }
    },
    [onSuccess, router]
  );

  // ── Android back button ──
  useFocusEffect(
    useCallback(() => {
      if (!visible) return;

      const onBack = () => {
        if (currentStepIndex > initialStepIndex) {
          goToPrevStep();
          return true;
        }
        handleClose();
        return true;
      };

      const sub = BackHandler.addEventListener('hardwareBackPress', onBack);
      return () => sub.remove();
    }, [visible, currentStepIndex, initialStepIndex, goToPrevStep, handleClose])
  );

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
        pressBehavior="none"
        onPress={handleClose}
      />
    ),
    [handleClose]
  );

  const renderHandle = useCallback(
    (props: BottomSheetHandleProps) => <SheetFloatingCloseHandle {...props} onPress={handleClose} />,
    [handleClose]
  );

  // ── Determine primary button state ──
  const isOptionalStep = currentStep && !currentStep.required;
  const stepError = validateStep(currentStepId, data);
  const canProceed = !stepError || isOptionalStep;
  const primaryLabel = isOptionalStep && stepError ? 'Skip' : 'Next';
  const isReviewStep = currentStepId === 'review';

  // ── Get step content component ──
  const StepContent = currentStep ? STEP_CONTENT[currentStepId] : null;

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      snapPoints={SheetSnapPoints.roomy}
      enableDynamicSizing={false}
      enablePanDownToClose={currentStepIndex === initialStepIndex}
      onChange={handleSheetChanges}
      backdropComponent={renderBackdrop}
      backgroundStyle={{
        backgroundColor: colors.sheet,
        borderTopLeftRadius: Radius.sheet,
        borderTopRightRadius: Radius.sheet,
        borderCurve: 'continuous',
      }}
      handleComponent={renderHandle}
      keyboardBehavior="extend"
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustResize"
    >
      <View style={styles.container}>
        {/* Fixed Header Section */}
        <View style={styles.fixedHeader}>
          {/* Progress Bar */}
          <View style={styles.progressSection}>
            <View style={[styles.progressTrack, { backgroundColor: colors.fill2 }]}>
              <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: colors.primary }]} />
            </View>
          </View>

          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <View style={styles.headerLeft}>
              {currentStepIndex > initialStepIndex && (
                <HapticPressable
                  onPress={goToPrevStep}
                  hitSlop={Spacing.md}
                  style={[styles.circleButton, { backgroundColor: colors.fill2 }]}
                >
                  <ChevronLeft size={Sizes.iconSm} color={colors.labelSecondary} strokeWidth={2} />
                </HapticPressable>
              )}
            </View>

            <View style={styles.headerCenter}>
              <Text variant="caption1Emphasized" tone="muted" uppercase>
                {currentStep?.label || 'Create Listing'}
              </Text>
            </View>

            {!isReviewStep ? (
              <HapticPressable
                onPress={isOptionalStep && stepError ? skipStep : goToNextStep}
                disabled={!canProceed && !isOptionalStep}
                style={[styles.nextButton, { backgroundColor: canProceed ? colors.primary : colors.fill2 }]}
              >
                <Text variant="caption1Emphasized" style={{ color: canProceed ? colors.primaryForeground : colors.labelQuaternary }} uppercase>
                  {primaryLabel}
                </Text>
              </HapticPressable>
            ) : (
              <View style={styles.headerRight} />
            )}
          </View>
        </View>

        {/* Scrollable Step Content */}
        <View style={styles.contentArea}>
          {StepContent && (
            <StepContent
              data={data}
              onUpdate={updateData}
              onSubmitSuccess={handleSuccess}
              onGoToStep={goToStep}
              editingListingId={listingId}
            />
          )}
        </View>
      </View>
    </BottomSheetModal>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  sheetContainer: {
    marginHorizontal: Spacing.lg,
  },
  container: {
    flex: 1,
  },
  fixedHeader: {
    // Fixed at top, doesn't scroll
  },
  progressSection: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xs,
  },
  progressTrack: {
    height: 2,
    borderRadius: Radius.sm,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: Radius.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    minWidth: Spacing["5xl"],
  },
  circleButton: {
    width: Sizes.avatarSm,
    height: Sizes.avatarSm,
    borderRadius: Sizes.avatarSm / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  backChevron: {
    marginLeft: -Spacing.xs,
  },
  headerRight: {
    minWidth: Spacing["5xl"],
    alignItems: 'flex-end',
  },
  nextButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.full,
  },
  contentArea: {
    flex: 1,
    overflow: 'hidden',
  },
});

export default CreateListingFlow;
