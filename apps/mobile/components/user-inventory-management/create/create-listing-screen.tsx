/**
 * Create Listing Screen — Orchestrator
 *
 * 3-step wizard: Vehicle ID → Specifications → Price & Photos
 * Manages shared form state, step navigation with progress bar,
 * validation gating, and final submission (draft / publish).
 *
 * Designed as a standalone screen component that can be rendered
 * in a Stack.Screen or presented modally via Expo Router.
 */

import React, { useState, useCallback, useMemo, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  ActivityIndicator,
  Animated as RNAnimated,
  KeyboardAvoidingView,
  Platform,
  BackHandler,
} from 'react-native';
import { HapticPressable } from '@/components/ui';
import { useRouter, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { ChevronLeft, X } from 'lucide-react-native';

import { Colors, Spacing, Radius, Layout } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { Heading, Body, Supporting, ButtonText } from '@/components/ui';

import { StepVehicleId } from './step-vehicle-id';
import { StepDetails } from './step-details';
import { StepMedia } from './step-media';
import {
  EMPTY_FORM,
  isStepValid,
  validateStep1,
  validateStep2,
  validateStep3,
  formToPayload,
  type CreateListingFormData,
} from './types';
import { createListing } from '@/lib/sell-car-user-api';

const STEPS = [
  { key: 1, title: 'Vehicle', subtitle: 'VIN & Identity' },
  { key: 2, title: 'Specs', subtitle: 'Details & Features' },
  { key: 3, title: 'Price & Photos', subtitle: 'Publish' },
] as const;

// ─── Progress Bar ────────────────────────────────────────────────────────────

function ProgressBar({
  step,
  total,
  colors,
}: {
  step: number;
  total: number;
  colors: Record<string, string>;
}) {
  return (
    <View style={styles.progressContainer}>
      {Array.from({ length: total }, (_, i) => {
        const isComplete = i + 1 < step;
        const isCurrent = i + 1 === step;
        return (
          <View
            key={i}
            style={[
              styles.progressSegment,
              {
                backgroundColor: isComplete
                  ? colors.primary
                  : isCurrent
                    ? colors.primary
                    : colors.fillSecondary,
                opacity: isCurrent ? 0.5 : 1,
              },
            ]}
          />
        );
      })}
    </View>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function CreateListingScreen() {
  const router = useRouter();
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);

  // ── State ──
  const [form, setForm] = useState<CreateListingFormData>({ ...EMPTY_FORM });
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // ── Form updater (merges partial) ──
  const updateForm = useCallback(
    (updates: Partial<CreateListingFormData>) => {
      setForm((prev) => ({ ...prev, ...updates }));
    },
    [],
  );

  // ── Validation ──
  const currentStepValid = useMemo(
    () => isStepValid(step as 1 | 2 | 3, form),
    [step, form],
  );

  const currentErrors = useMemo(() => {
    if (step === 1) return validateStep1(form);
    if (step === 2) return validateStep2(form);
    return validateStep3(form);
  }, [step, form]);

  // ── Navigation ──
  const goNext = useCallback(() => {
    if (!currentStepValid) {
      const firstError = Object.values(currentErrors)[0];
      if (firstError) {
        Alert.alert('Missing Information', firstError);
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    if (step < 3) {
      setStep((s) => s + 1);
      scrollRef.current?.scrollTo({ y: 0, animated: true });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  }, [step, currentStepValid, currentErrors]);

  const goBack = useCallback(() => {
    if (step > 1) {
      setStep((s) => s - 1);
      scrollRef.current?.scrollTo({ y: 0, animated: true });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [step]);

  // ── Android back button ──
  useFocusEffect(
    useCallback(() => {
      const onBack = () => {
        if (step > 1) {
          goBack();
          return true;
        }
        confirmDiscard();
        return true;
      };
      const sub = BackHandler.addEventListener('hardwareBackPress', onBack);
      return () => sub.remove();
    }, [step, goBack]),
  );

  // ── Discard confirmation ──
  const confirmDiscard = useCallback(() => {
    const hasData =
      form.make || form.model || form.price || form.images.length > 0;

    if (!hasData) {
      router.back();
      return;
    }

    Alert.alert(
      'Discard Listing?',
      'Your progress will be lost. Are you sure?',
      [
        { text: 'Keep Editing', style: 'cancel' },
        {
          text: 'Discard',
          style: 'destructive',
          onPress: () => router.back(),
        },
      ],
    );
  }, [form, router]);

  // ── Submit ──
  const handleSubmit = useCallback(
    async (status: 'draft' | 'published') => {
      // Validate all steps
      const e1 = validateStep1(form);
      const e2 = validateStep2(form);
      const e3 = validateStep3(form);
      const allErrors = { ...e1, ...e2, ...e3 };
      const errorCount = Object.keys(allErrors).length;

      if (errorCount > 0 && status === 'published') {
        const firstError = Object.values(allErrors)[0];
        Alert.alert(
          'Missing Information',
          `Please fix ${errorCount} issue${errorCount > 1 ? 's' : ''} before publishing.\n\n${firstError}`,
        );
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        return;
      }

      setSubmitting(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

      try {
        const payload = formToPayload(form, status);
        const result = await createListing(payload);

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert(
          status === 'published' ? 'Listing Submitted!' : 'Draft Saved!',
          status === 'published'
            ? 'Your listing is now under review and will be live shortly.'
            : 'Your draft has been saved. You can finish it later.',
          [
            {
              text: 'OK',
              onPress: () => router.back(),
            },
          ],
        );
      } catch (err: any) {
        Alert.alert(
          'Submission Failed',
          err.message ?? 'Something went wrong. Please try again.',
        );
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } finally {
        setSubmitting(false);
      }
    },
    [form, router],
  );

  // ── Step renderer ──
  const stepProps = { form, updateForm, colors };

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
    >
      {/* ══════════ Header ══════════ */}
      <View
        style={[
          styles.header,
          { paddingTop: insets.top + Spacing.sm, borderColor: colors.border },
        ]}
      >
        {/* Back / Close */}
        <HapticPressable
          onPress={step > 1 ? goBack : confirmDiscard}
          style={styles.headerBtn}
          hitSlop={8}
        >
          {step > 1 ? (
            <ChevronLeft size={24} color={colors.text} />
          ) : (
            <X size={22} color={colors.text} />
          )}
        </HapticPressable>

        {/* Title */}
        <View style={styles.headerCenter}>
          <Heading size="small">
            Step {step} of {STEPS.length}
          </Heading>
          <Supporting size="mini" tone="secondary">
            {STEPS[step - 1].subtitle}
          </Supporting>
        </View>

        {/* Save Draft (step 3 only) */}
        {step === 3 && !submitting ? (
          <HapticPressable
            onPress={() => handleSubmit('draft')}
            style={styles.headerBtn}
            hitSlop={8}
          >
            <Body size="small" style={{ color: colors.primary }}>
              Save Draft
            </Body>
          </HapticPressable>
        ) : (
          <View style={styles.headerBtn} />
        )}
      </View>

      {/* ══════════ Progress ══════════ */}
      <ProgressBar step={step} total={STEPS.length} colors={colors} />

      {/* ══════════ Scrollable Step Content ══════════ */}
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Spacing['2xl'] },
        ]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        showsVerticalScrollIndicator={false}
      >
        {step === 1 && <StepVehicleId {...stepProps} />}
        {step === 2 && <StepDetails {...stepProps} />}
        {step === 3 && <StepMedia {...stepProps} />}
      </ScrollView>

      {/* ══════════ Bottom Action Bar ══════════ */}
      <View
        style={[
          styles.bottomBar,
          {
            backgroundColor: colors.background,
            borderColor: colors.border,
            paddingBottom: Math.max(insets.bottom, Spacing.lg),
          },
        ]}
      >
        {step < 3 ? (
          /* ── Next Step ── */
          <HapticPressable
            onPress={goNext}
            disabled={submitting}
            style={[
              styles.primaryBtn,
              {
                backgroundColor: currentStepValid ? colors.text : colors.fillSecondary,
              },
            ]}
          >
            <ButtonText
              size="medium"
              style={{
                color: currentStepValid ? colors.background : colors.textMuted,
              }}
            >
              Continue
            </ButtonText>
          </HapticPressable>
        ) : (
          /* ── Publish ── */
          <HapticPressable
            onPress={() => handleSubmit('published')}
            disabled={submitting}
            style={[
              styles.primaryBtn,
              {
                backgroundColor: submitting ? colors.fillSecondary : colors.primary,
              },
            ]}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <ButtonText size="medium" style={{ color: '#FFF' }}>
                Publish Listing
              </ButtonText>
            )}
          </HapticPressable>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerBtn: {
    width: 72,
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  // Progress
  progressContainer: {
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  progressSegment: {
    flex: 1,
    height: 3,
    borderRadius: 1.5,
  },
  // Content
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Layout.screenPadding,
    paddingTop: Spacing['2xl'],
  },
  // Bottom bar
  bottomBar: {
    paddingHorizontal: Layout.screenPadding,
    paddingTop: Spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  primaryBtn: {
    height: 52,
    borderRadius: Radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
