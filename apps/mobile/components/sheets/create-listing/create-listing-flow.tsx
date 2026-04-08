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
import { useRouter, useFocusEffect } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { ChevronLeft, X } from 'lucide-react-native';

import { Colors, Spacing, Radius, Sizes, SheetChrome, SheetTypography } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';

import {
  EMPTY_DATA,
  SHEET_STEPS,
  validateStep,
  getProgress,
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

function newFlowSessionId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
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
  const progress = getProgress(currentStepIndex + 1);

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
    if (currentStepIndex === initialStepIndex) {
      onClose();
      return;
    }

    showAlert('Exit Listing?', 'Are you sure? You will lose all progress.', [
      { text: 'Keep Editing', style: 'cancel' },
      {
        text: 'Exit',
        style: 'destructive',
        onPress: () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          onClose();
        },
      },
    ]);
  }, [currentStepIndex, initialStepIndex, onClose, showAlert]);

  const handleSuccess = useCallback(
    (createdListingId: string, approved: boolean, isDraft?: boolean) => {
      onSuccess?.(createdListingId);
      onClose();

      if (approved) {
        router.replace('/inventory');
      } else if (isDraft) {
        router.replace('/inventory?tab=draft');
      } else {
        router.replace('/inventory?tab=in_review');
      }
    },
    [onSuccess, onClose, router],
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
  const primaryLabel = isOptionalStep && stepError ? 'Skip' : 'Next';
  const isReviewStep = currentStepId === 'review';
  const StepContent = currentStep ? STEP_CONTENT[currentStepId] : null;

  return (
    <View style={[styles.container, { backgroundColor: colors.sheet }]}> 
      <View style={styles.fixedHeader}>
        <View style={styles.progressSection}>
          <View style={[styles.progressTrack, { backgroundColor: colors.fill2 }]}> 
            <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: colors.primary }]} />
          </View>
        </View>

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
            <Text variant={SheetTypography.headerTitle} tone="muted" uppercase>
              {currentStep?.label || 'Create Listing'}
            </Text>
          </View>

          <View style={styles.headerRight}>
            {!isReviewStep ? (
              <HapticPressable
                onPress={isOptionalStep && stepError ? skipStep : goToNextStep}
                disabled={!canProceed && !isOptionalStep}
                style={[styles.nextButton, { backgroundColor: canProceed ? colors.primary : colors.fill2 }]}
              >
                <Text
                  variant={SheetTypography.rowLabelSelected}
                  style={{ color: canProceed ? colors.primaryForeground : colors.labelQuaternary }}
                  uppercase
                >
                  {primaryLabel}
                </Text>
              </HapticPressable>
            ) : (
              <HapticPressable
                onPress={handleClose}
                hitSlop={Spacing.md}
                style={[styles.circleButton, { backgroundColor: colors.fill2 }]}
              >
                <X size={Sizes.iconSm} color={colors.labelSecondary} strokeWidth={2} />
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
  const [flowId, setFlowId] = useState<string | null>(null);

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
  }, [visible, onClose, onSuccess, initialData, listingId, isPublishedEdit, flowId, router]);

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
  fixedHeader: {},
  progressSection: {
    paddingHorizontal: SheetChrome.contentPaddingHorizontal,
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
    paddingHorizontal: SheetChrome.contentPaddingHorizontal,
    paddingTop: Spacing.sm,
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
  },
  circleButton: {
    width: Sizes.avatarSm,
    height: Sizes.avatarSm,
    borderRadius: Sizes.avatarSm / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButton: {
    paddingVertical: SheetChrome.headerActionPaddingVertical,
    paddingHorizontal: SheetChrome.headerActionPaddingHorizontal,
    borderRadius: Radius.full,
  },
  contentArea: {
    flex: 1,
    overflow: 'hidden',
  },
});

export default CreateListingFlow;
