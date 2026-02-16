/**
 * CreateListingFlow — Sheet-Based Orchestrator
 *
 * Manages the micro-step wizard flow, form state,
 * and navigation between sheets.
 *
 * Tinder-style: Each sheet is one micro-action.
 * Fast, frictionless, "oh that's it" feeling.
 *
 * @module components/sheets/create-listing/create-listing-flow
 */

import React, { useState, useCallback, useMemo } from 'react';
import { Alert, BackHandler } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import * as Haptics from 'expo-haptics';

import {
  EMPTY_DATA,
  SHEET_STEPS,
  validateStep,
  type CreateListingData,
  type SheetStepId,
} from './types';

import {
  VinSheet,
  MakeSheet,
  ModelSheet,
  YearSheet,
  TrimSheet,
  MileageSheet,
  SpecsRegionSheet,
  AppearanceSheet,
  PowertrainSheet,
  ExtrasSheet,
  PriceSheet,
  LocationSheet,
  PhotosSheet,
  DescriptionSheet,
  ReviewSheet,
} from './sheets';

// ─── Props ───────────────────────────────────────────────────────────────────

interface CreateListingFlowProps {
  /** Whether the flow is active */
  visible: boolean;
  /** Called when flow is closed/cancelled */
  onClose: () => void;
  /** Called on successful publish with listing ID */
  onSuccess?: (listingId: string) => void;
  /** Initial data (for editing or resuming) */
  initialData?: Partial<CreateListingData>;
}

// ─── Sheet Component Map ─────────────────────────────────────────────────────

const SHEET_COMPONENTS: Record<SheetStepId, React.ComponentType<any>> = {
  'vin': VinSheet,
  'make': MakeSheet,
  'model': ModelSheet,
  'year': YearSheet,
  'trim': TrimSheet,
  'mileage': MileageSheet,
  'specs-region': SpecsRegionSheet,
  'appearance': AppearanceSheet,
  'powertrain': PowertrainSheet,
  'extras': ExtrasSheet,
  'price': PriceSheet,
  'location': LocationSheet,
  'photos': PhotosSheet,
  'description': DescriptionSheet,
  'review': ReviewSheet,
};

// ─── Component ───────────────────────────────────────────────────────────────

export function CreateListingFlow({
  visible,
  onClose,
  onSuccess,
  initialData,
}: CreateListingFlowProps) {
  const router = useRouter();

  // ── State ──
  const [data, setData] = useState<CreateListingData>(() => ({
    ...EMPTY_DATA,
    ...initialData,
  }));
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const currentStep = SHEET_STEPS[currentStepIndex];
  const currentStepId = currentStep?.id;

  // ── Form updater ──
  const updateData = useCallback((updates: Partial<CreateListingData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  }, []);

  // ── Navigation ──
  const goToNextStep = useCallback(() => {
    // Validate current step
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

  // ── Close handler ──
  // Note: Confirmation is handled by BaseSheet internally
  // This just propagates the close to parent
  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  // ── Success handler ──
  const handleSuccess = useCallback(
    (listingId: string) => {
      onSuccess?.(listingId);
      onClose();
      // Navigate to inventory or listing detail
      router.replace('/inventory');
    },
    [onSuccess, onClose, router]
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

  // ── Shared sheet props ──
  const sheetProps = useMemo(
    () => ({
      visible: visible,
      data,
      onUpdate: updateData,
      onNext: goToNextStep,
      onSkip: skipStep,
      onBack: currentStepIndex > 0 ? goToPrevStep : undefined,
      onClose: handleClose,
    }),
    [visible, data, updateData, goToNextStep, skipStep, goToPrevStep, handleClose, currentStepIndex]
  );

  // ── Render current sheet ──
  if (!visible || !currentStep) return null;

  const SheetComponent = SHEET_COMPONENTS[currentStepId];

  // Special props for review sheet
  if (currentStepId === 'review') {
    return (
      <ReviewSheet
        {...sheetProps}
        onSubmitSuccess={handleSuccess}
        onGoToStep={goToStep}
      />
    );
  }

  return <SheetComponent {...sheetProps} />;
}

export default CreateListingFlow;
