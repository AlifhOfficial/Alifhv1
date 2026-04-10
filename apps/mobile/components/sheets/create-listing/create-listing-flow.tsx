/**
 * CreateListingFlow — Native form-sheet orchestration
 *
 * Public API remains `visible/onClose` for existing callers.
 * Internally this opens a native Expo Router `formSheet` route.
 *
 * @module components/sheets/create-listing/create-listing-flow
 */

import { Text, useAlert, HapticPressable } from '@/components/ui';
import React, { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet, BackHandler, Keyboard } from 'react-native';
import { useRouter, useFocusEffect, useSegments } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { ChevronLeft, ChevronRight, X } from 'lucide-react-native';

import { Colors, Spacing, Sizes, SheetChrome, SheetTypography } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';

import {
  EMPTY_DATA,
  SHEET_STEPS,
  validateStep,
  type CreateListingData,
  type SheetStepId,
  type StepContentProps,
} from './types';

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

export interface CreateListingFlowProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: (listingId: string) => void;
  initialData?: Partial<CreateListingData>;
  listingId?: string;
  isPublishedEdit?: boolean;
}

const STEP_CONTENT: Record<SheetStepId, React.ComponentType<StepContentProps>> = {
  vin: VinStepContent,
  make: MakeStepContent,
  model: ModelStepContent,
  year: YearStepContent,
  trim: TrimStepContent,
  mileage: MileageStepContent,
  'specs-region': SpecsRegionStepContent,
  appearance: AppearanceStepContent,
  powertrain: PowertrainStepContent,
  extras: ExtrasStepContent,
  highlights: HighlightsStepContent,
  price: PriceStepContent,
  location: LocationStepContent,
  photos: PhotosStepContent,
  description: DescriptionStepContent,
  notes: NotesStepContent,
  review: ReviewStepContent,
};

export type { StepContentProps } from './types';

export interface CreateListingSheetContentProps {
  onClose: () => void;
  onForceClose?: () => void;
  onSuccess?: (listingId: string) => void;
  initialData?: Partial<CreateListingData>;
  listingId?: string;
  isPublishedEdit?: boolean;
}

export interface CreateListingFlowSession {
  onClose: () => void;
  onSuccess?: (listingId: string) => void;
  initialData?: Partial<CreateListingData>;
  listingId?: string;
  isPublishedEdit?: boolean;
}

const flowSessions = new Map<string, CreateListingFlowSession>();
let flowSessionCounter = 0;

function newFlowSessionId(): string {
  const cryptoObj = (globalThis as {
    crypto?: {
      randomUUID?: () => string;
      getRandomValues?: (array: Uint8Array) => Uint8Array;
    };
  }).crypto;

  if (cryptoObj?.randomUUID) {
    return cryptoObj.randomUUID();
  }

  if (cryptoObj?.getRandomValues) {
    const bytes = new Uint8Array(16);
    cryptoObj.getRandomValues(bytes);

    // RFC 4122 version 4 UUID bits.
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;

    const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }

  // Session IDs are only used as in-memory map keys, so a non-crypto fallback is acceptable.
  flowSessionCounter += 1;
  return `flow-${Date.now().toString(36)}-${flowSessionCounter.toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function createCreateListingFlowSession(session: CreateListingFlowSession): string {
  const id = newFlowSessionId();
  flowSessions.set(id, session);
  return id;
}

export function updateCreateListingFlowSession(id: string, session: CreateListingFlowSession): void {
  flowSessions.set(id, session);
}

export function getCreateListingFlowSession(id: string): CreateListingFlowSession | undefined {
  return flowSessions.get(id);
}

export function deleteCreateListingFlowSession(id: string): void {
  flowSessions.delete(id);
}

export function CreateListingSheetContent({
  onClose,
  onForceClose,
  onSuccess,
  initialData,
  listingId,
  isPublishedEdit = false,
}: CreateListingSheetContentProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const router = useRouter();
  const { showAlert } = useAlert();

  const initialStepIndex = isPublishedEdit ? 5 : 0;
  const [data, setData] = useState<CreateListingData>(() => ({
    ...EMPTY_DATA,
    ...initialData,
  }));
  const [currentStepIndex, setCurrentStepIndex] = useState(initialStepIndex);

  useEffect(() => {
    setData({ ...EMPTY_DATA, ...initialData });
    setCurrentStepIndex(isPublishedEdit ? 5 : 0);
  }, [initialData, isPublishedEdit]);

  const currentStep = SHEET_STEPS[currentStepIndex];
  const currentStepId = currentStep?.id;

  const updateData = useCallback((updates: Partial<CreateListingData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  }, []);

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

  const handleClose = useCallback(() => {
    Keyboard.dismiss();
    onClose();
  }, [onClose]);

  const handleSuccess = useCallback(
    (createdListingId: string, approved: boolean, isDraft?: boolean) => {
      onSuccess?.(createdListingId);
      (onForceClose ?? onClose)();

      if (approved) {
        router.replace('/inventory');
      } else if (isDraft) {
        router.replace('/inventory?tab=draft');
      } else {
        router.replace('/inventory?tab=in_review');
      }
    },
    [onSuccess, onForceClose, onClose, router],
  );

  useFocusEffect(
    useCallback(() => {
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
    }, [currentStepIndex, initialStepIndex, goToPrevStep, handleClose]),
  );

  const isOptionalStep = currentStep && !currentStep.required;
  const stepError = validateStep(currentStepId, data);
  const canProceed = !stepError || isOptionalStep;
  const isReviewStep = currentStepId === 'review';
  const StepContent = currentStep ? STEP_CONTENT[currentStepId] : null;

  return (
    <View style={[styles.container, { backgroundColor: colors.sheet }]}> 
      <View style={styles.fixedHeader}>
        <View style={styles.header}> 
          <View style={styles.headerLeft}>
            {currentStepIndex > initialStepIndex ? (
              <HapticPressable
                onPress={goToPrevStep}
                hitSlop={Spacing.md}
                style={[styles.circleButton, { backgroundColor: colors.surfaceSecondary }]}
              >
                <ChevronLeft size={Sizes.iconSm} color={colors.labelSecondary} strokeWidth={2} />
              </HapticPressable>
            ) : (
              <View style={styles.circlePlaceholder} />
            )}
          </View>

          <View style={styles.headerCenter}>
            <Text variant={SheetTypography.rowLabel} tone="secondary">
              {currentStep?.label || 'Create Listing'}
            </Text>
          </View>

          <View style={styles.headerRight}>
            <HapticPressable
              onPress={handleClose}
              hitSlop={Spacing.md}
              style={[styles.circleButton, { backgroundColor: colors.surfaceSecondary }]}
            >
              <X size={Sizes.iconSm} color={colors.labelSecondary} strokeWidth={2} />
            </HapticPressable>
            {!isReviewStep && (
              <HapticPressable
                onPress={isOptionalStep && stepError ? skipStep : goToNextStep}
                disabled={!canProceed && !isOptionalStep}
                style={[
                  styles.circleButton,
                  { backgroundColor: canProceed ? colors.primary : colors.surfaceSecondary },
                ]}
              >
                <ChevronRight
                  size={Sizes.iconSm}
                  color={canProceed ? colors.primaryForeground : colors.labelQuaternary}
                  strokeWidth={2}
                />
              </HapticPressable>
            )}
          </View>
        </View>
      </View>

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

      <View style={styles.footerProgressSection}>
        <View style={styles.progressDotsRow}>
          {SHEET_STEPS.map((step, index) => {
            const isActive = index === currentStepIndex;
            const isCompleted = index < currentStepIndex;
            const dotColor = isActive || isCompleted ? colors.label : colors.fill2;
            const dotSize = isActive ? 7 : 5;

            return (
              <View
                key={step.id}
                style={[
                  styles.progressDot,
                  {
                    width: dotSize,
                    height: dotSize,
                    borderRadius: dotSize / 2,
                    backgroundColor: dotColor,
                    opacity: isActive ? 1 : isCompleted ? 0.9 : 0.7,
                  },
                ]}
              />
            );
          })}
        </View>
      </View>
    </View>
  );
}

export function CreateListingFlow({
  visible,
  onClose,
  onSuccess,
  initialData,
  listingId,
  isPublishedEdit = false,
}: CreateListingFlowProps) {
  const router = useRouter();
  const segments = useSegments();
  const [flowId, setFlowId] = useState<string | null>(null);
  const isOnCreateListingSheet = segments[segments.length - 1] === 'create-listing-sheet';

  useEffect(() => {
    if (!visible) {
      if (flowId) {
        deleteCreateListingFlowSession(flowId);
        setFlowId(null);
      }
      return;
    }

    if (!flowId) {
      const sessionId = createCreateListingFlowSession({
        onClose,
        onSuccess,
        initialData,
        listingId,
        isPublishedEdit,
      });
      setFlowId(sessionId);
      router.push({ pathname: '/create-listing-sheet', params: { flowId: sessionId } });
      return;
    }

    updateCreateListingFlowSession(flowId, {
      onClose,
      onSuccess,
      initialData,
      listingId,
      isPublishedEdit,
    });

    if (!isOnCreateListingSheet) {
      router.push({ pathname: '/create-listing-sheet', params: { flowId } });
    }
  }, [
    visible,
    onClose,
    onSuccess,
    initialData,
    listingId,
    isPublishedEdit,
    flowId,
    router,
    isOnCreateListingSheet,
  ]);

  useEffect(
    () => () => {
      if (flowId) {
        deleteCreateListingFlowSession(flowId);
      }
    },
    [flowId],
  );

  return null;
}

export function toSheetContentProps(session: CreateListingFlowSession): CreateListingSheetContentProps {
  return {
    onClose: session.onClose,
    onSuccess: session.onSuccess,
    initialData: session.initialData,
    listingId: session.listingId,
    isPublishedEdit: session.isPublishedEdit,
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fixedHeader: {
    paddingTop: Spacing.xs,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SheetChrome.contentPaddingHorizontal,
    paddingTop: Spacing.xs,
    paddingBottom: SheetChrome.headerPaddingBottom,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    minWidth: SheetChrome.headerPlaceholderWidth,
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  headerRight: {
    minWidth: SheetChrome.headerPlaceholderWidth,
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  circleButton: {
    width: Sizes.avatarSm,
    height: Sizes.avatarSm,
    borderRadius: Sizes.avatarSm / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circlePlaceholder: {
    width: Sizes.avatarSm,
    height: Sizes.avatarSm,
  },
  contentArea: {
    flex: 1,
    overflow: 'hidden',
  },
  footerProgressSection: {
    paddingHorizontal: SheetChrome.contentPaddingHorizontal,
    alignItems: 'center',
    paddingBottom: Spacing.sm,
  },
  progressDotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  progressDot: {},
});

export default CreateListingFlow;
