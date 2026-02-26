/**
 * CreateListingFlow — Sheet-Based Orchestrator
 *
 * Uses a SINGLE BottomSheetModal for the entire flow.
 * Step content renders inside - no sheet switching = no glitches.
 *
 * @module components/sheets/create-listing/create-listing-flow
 */

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { View, StyleSheet, Alert, BackHandler, Keyboard } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import {
  BottomSheetModal,
  BottomSheetBackdrop,
} from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { ChevronLeft } from 'lucide-react-native';

import { Colors, Spacing, Radius, Sizes } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { Heading, Body, ButtonText } from '@/components/ui';
import { HapticPressable } from '@/components/ui';

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
  PriceStepContent,
  LocationStepContent,
  PhotosStepContent,
  DescriptionStepContent,
  ReviewStepContent,
} from './steps';

// ─── Props ───────────────────────────────────────────────────────────────────

interface CreateListingFlowProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: (listingId: string) => void;
  initialData?: Partial<CreateListingData>;
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
  'price': PriceStepContent,
  'location': LocationStepContent,
  'photos': PhotosStepContent,
  'description': DescriptionStepContent,
  'review': ReviewStepContent,
};

export interface StepContentProps {
  data: CreateListingData;
  onUpdate: (updates: Partial<CreateListingData>) => void;
  onSubmitSuccess?: (listingId: string) => void;
  onGoToStep?: (index: number) => void;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function CreateListingFlow({
  visible,
  onClose,
  onSuccess,
  initialData,
}: CreateListingFlowProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const bottomSheetRef = useRef<BottomSheetModal>(null);

  const snapPoints = useMemo(() => ['65%', '93%'], []);

  // ── State ──
  const [data, setData] = useState<CreateListingData>(() => ({
    ...EMPTY_DATA,
    ...initialData,
  }));
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const currentStep = SHEET_STEPS[currentStepIndex];
  const currentStepId = currentStep?.id;
  const progress = getProgress(currentStepIndex + 1);
  const totalSteps = SHEET_STEPS.length;

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
        setCurrentStepIndex(0);
        setData({ ...EMPTY_DATA, ...initialData });
        onClose();
      }
    },
    [onClose, initialData]
  );

  // ── Form updater ──
  const updateData = useCallback((updates: Partial<CreateListingData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  }, []);

  // ── Navigation ──
  const goToNextStep = useCallback(() => {
    const error = validateStep(currentStepId, data);
    if (error && currentStep?.required) {
      Alert.alert('Required', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    if (currentStepIndex < SHEET_STEPS.length - 1) {
      setCurrentStepIndex((i) => i + 1);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  }, [currentStepIndex, currentStepId, currentStep, data]);

  const goToPrevStep = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((i) => i - 1);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [currentStepIndex]);

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
    if (currentStepIndex === 0) {
      bottomSheetRef.current?.dismiss();
      return;
    }

    Alert.alert(
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
  }, [currentStepIndex]);

  // ── Success handler ──
  const handleSuccess = useCallback(
    (listingId: string) => {
      onSuccess?.(listingId);
      bottomSheetRef.current?.dismiss();
      router.replace('/inventory');
    },
    [onSuccess, router]
  );

  // ── Android back button ──
  useFocusEffect(
    useCallback(() => {
      if (!visible) return;

      const onBack = () => {
        if (currentStepIndex > 0) {
          goToPrevStep();
          return true;
        }
        handleClose();
        return true;
      };

      const sub = BackHandler.addEventListener('hardwareBackPress', onBack);
      return () => sub.remove();
    }, [visible, currentStepIndex, goToPrevStep, handleClose])
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
      snapPoints={snapPoints}
      enableDynamicSizing={false}
      enablePanDownToClose={currentStepIndex === 0}
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
        {/* Fixed Header Section */}
        <View style={styles.fixedHeader}>
          {/* Progress Bar */}
          <View style={styles.progressSection}>
            <View style={[styles.progressTrack, { backgroundColor: colors.fillSecondary }]}>
              <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: colors.primary }]} />
            </View>
          </View>

          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <HapticPressable onPress={handleClose} hitSlop={Spacing.md} style={styles.headerLeft}>
              <Body size="medium" tone="secondary">Cancel</Body>
            </HapticPressable>

            <View style={styles.headerCenter}>
              {currentStepIndex > 0 && (
                <HapticPressable onPress={goToPrevStep} hitSlop={Spacing.sm} style={styles.backChevron}>
                  <ChevronLeft size={Sizes.iconMd} color={colors.textSecondary} />
                </HapticPressable>
              )}
              <Heading size="small">{currentStep?.label || 'Create Listing'}</Heading>
            </View>

            {!isReviewStep ? (
              <HapticPressable
                onPress={isOptionalStep && stepError ? skipStep : goToNextStep}
                disabled={!canProceed && !isOptionalStep}
                style={[styles.nextButton, { backgroundColor: canProceed ? colors.primary : colors.fillSecondary }]}
              >
                <ButtonText size="small" style={{ color: canProceed ? colors.primaryForeground : colors.textMuted }}>
                  {primaryLabel}
                </ButtonText>
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
    borderRadius: 1,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerLeft: {
    minWidth: 60,
    alignItems: 'flex-start',
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
    minWidth: 60,
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
