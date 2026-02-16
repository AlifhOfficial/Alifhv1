/**
 * ReviewSheet — Final review before publishing
 *
 * Shows summary of all entered data with edit shortcuts.
 * Publish or save as draft.
 *
 * @module components/sheets/create-listing/sheets/review-sheet
 */

import React, { useCallback, useState } from 'react';
import { View, StyleSheet, Image, ActivityIndicator } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Check, ChevronRight } from 'lucide-react-native';

import { Colors, Spacing, Radius, Sizes } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { Body, Supporting, Label, Data, Heading } from '@/components/ui';
import { HapticPressable } from '@/components/ui';
import { UAE_EMIRATES } from '@/lib/filter-constants';
import { createListing } from '@/lib/sell-car-user-api';

import { CreateFlowSheet, CreateFlowScrollContent } from '../create-flow-sheet';
import { ResponseSheet, type ResponseType } from '../response-sheet';
import type { SheetStepProps } from '../types';
import { SHEET_STEPS, dataToPayload } from '../types';

// ─────────────────────────────────────────────────────────────────────────────

interface ReviewSheetProps extends SheetStepProps {
  onSubmitSuccess?: (listingId: string) => void;
  onGoToStep?: (stepIndex: number) => void;
}

export function ReviewSheet({
  visible,
  data,
  onBack,
  onClose,
  onSubmitSuccess,
  onGoToStep,
}: ReviewSheetProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  
  const [submitting, setSubmitting] = useState(false);

  // Response sheet state
  const [response, setResponse] = useState<{
    visible: boolean;
    type: ResponseType;
    title: string;
    message?: string;
    onRetry?: () => void;
  }>({ visible: false, type: 'error', title: '' });

  const showResponse = useCallback((opts: Omit<typeof response, 'visible'>) => {
    setResponse({ ...opts, visible: true });
  }, []);

  const hideResponse = useCallback(() => {
    setResponse((prev) => ({ ...prev, visible: false }));
  }, []);

  const handlePublish = useCallback(async () => {
    setSubmitting(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    try {
      const payload = dataToPayload(data, 'published');
      const result = await createListing(payload);

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onSubmitSuccess?.(result.id);
    } catch (err: any) {
      showResponse({
        type: 'error',
        title: 'Publish Failed',
        message: err.message ?? 'Something went wrong. Please try again.',
        onRetry: handlePublish,
      });
    } finally {
      setSubmitting(false);
    }
  }, [data, onSubmitSuccess, showResponse]);

  const handleSaveDraft = useCallback(async () => {
    setSubmitting(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const payload = dataToPayload(data, 'draft');
      const result = await createListing(payload);

      showResponse({
        type: 'success',
        title: 'Draft Saved',
        message: 'Your listing has been saved. You can continue later.',
      });
      // Delay success callback so user sees the message
      setTimeout(() => onSubmitSuccess?.(result.id), 1500);
    } catch (err: any) {
      showResponse({
        type: 'error',
        title: 'Save Failed',
        message: err.message ?? 'Something went wrong.',
        onRetry: handleSaveDraft,
      });
    } finally {
      setSubmitting(false);
    }
  }, [data, onSubmitSuccess, showResponse]);

  const priceNum = parseInt(data.price, 10) || 0;
  const emirateLabel = UAE_EMIRATES.find((e) => e.value === data.emirate)?.label ?? data.emirate;
  const vehicleTitle = `${data.year} ${data.make} ${data.model}${data.trim ? ` ${data.trim}` : ''}`;
  const mileageNum = parseInt(data.mileage, 10) || 0;

  return (
    <CreateFlowSheet
      visible={visible}
      onClose={onClose}
      title="Review"
      showBack
      onBack={onBack}
      primaryLabel={submitting ? 'Publishing...' : 'Publish'}
      primaryDisabled={submitting}
      onPrimary={handlePublish}
      progress={100}
    >
      <CreateFlowScrollContent>
        {/* Cover Image */}
        {data.images.length > 0 && (
          <View style={styles.coverSection}>
            <Image
              source={{ uri: data.images[0] }}
              style={[styles.coverImage, { backgroundColor: colors.fillSecondary }]}
            />
            <View style={[styles.imageCount, { backgroundColor: colors.surface + 'E6' }]}>
              <Supporting size="small">{data.images.length} photos</Supporting>
            </View>
          </View>
        )}

        {/* Title & Price */}
        <View style={styles.titleSection}>
          <Heading size="medium">{vehicleTitle}</Heading>
          <Data size="large" style={{ color: colors.text }}>
            AED {priceNum.toLocaleString()}
            {data.isNegotiable && (
              <Supporting size="small" tone="muted">
                {' '}(Negotiable)
              </Supporting>
            )}
          </Data>
        </View>

        {/* Summary Grid */}
        <View style={styles.summaryGrid}>
          <SummaryRow
            label="Vehicle"
            value={vehicleTitle}
            onEdit={onGoToStep ? () => onGoToStep(0) : undefined}
            colors={colors}
          />
          <SummaryRow
            label="Mileage"
            value={`${mileageNum.toLocaleString()} km`}
            onEdit={onGoToStep ? () => onGoToStep(5) : undefined}
            colors={colors}
          />
          <SummaryRow
            label="Location"
            value={`${emirateLabel}${data.city ? `, ${data.city}` : ''}`}
            onEdit={onGoToStep ? () => onGoToStep(11) : undefined}
            colors={colors}
          />
          {data.extras.length > 0 && (
            <SummaryRow
              label="Extras"
              value={`${data.extras.length} features`}
              onEdit={onGoToStep ? () => onGoToStep(9) : undefined}
              colors={colors}
            />
          )}
          {data.description && (
            <SummaryRow
              label="Description"
              value={data.description.slice(0, 50) + (data.description.length > 50 ? '...' : '')}
              onEdit={onGoToStep ? () => onGoToStep(13) : undefined}
              colors={colors}
            />
          )}
        </View>

        {/* Checklist */}
        <View style={[styles.checklistBox, { backgroundColor: colors.fillSecondary }]}>
          <Label size="small">Ready to publish</Label>
          <View style={styles.checklistItems}>
            <ChecklistItem checked={!!data.vinVerified} label="VIN verified" colors={colors} />
            <ChecklistItem checked={!!data.make && !!data.model} label="Vehicle identified" colors={colors} />
            <ChecklistItem checked={!!data.mileage} label="Mileage entered" colors={colors} />
            <ChecklistItem checked={!!data.price} label="Price set" colors={colors} />
            <ChecklistItem checked={!!data.emirate} label="Location selected" colors={colors} />
            <ChecklistItem checked={data.images.length > 0} label="Photos uploaded" colors={colors} optional />
          </View>
        </View>

        {/* Save Draft */}
        <HapticPressable
          onPress={handleSaveDraft}
          disabled={submitting}
          style={[styles.draftButton, { borderColor: colors.border }]}
        >
          {submitting ? (
            <ActivityIndicator size="small" color={colors.textMuted} />
          ) : (
            <Body size="medium" tone="secondary">
              Save as Draft Instead
            </Body>
          )}
        </HapticPressable>
      </CreateFlowScrollContent>

      {/* Response Sheet for errors/success */}
      <ResponseSheet
        visible={response.visible}
        type={response.type}
        title={response.title}
        message={response.message}
        onDismiss={hideResponse}
        onRetry={response.onRetry}
      />
    </CreateFlowSheet>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

function SummaryRow({
  label,
  value,
  onEdit,
  colors,
}: {
  label: string;
  value: string;
  onEdit?: () => void;
  colors: Record<string, string>;
}) {
  return (
    <HapticPressable
      onPress={onEdit}
      disabled={!onEdit}
      style={[styles.summaryRow, { backgroundColor: colors.surfaceSecondary }]}
    >
      <View style={styles.summaryContent}>
        <Supporting size="small" tone="muted">
          {label}
        </Supporting>
        <Body size="medium" numberOfLines={1}>
          {value}
        </Body>
      </View>
      {onEdit && <ChevronRight size={Sizes.iconSm} color={colors.textMuted} strokeWidth={2} />}
    </HapticPressable>
  );
}

function ChecklistItem({
  checked,
  label,
  optional,
  colors,
}: {
  checked: boolean;
  label: string;
  optional?: boolean;
  colors: Record<string, string>;
}) {
  return (
    <View style={styles.checklistItem}>
      <View
        style={[
          styles.checkCircle,
          {
            backgroundColor: checked ? (colors.success ?? '#10B981') : colors.fillSecondary,
            borderColor: checked ? (colors.success ?? '#10B981') : colors.border,
          },
        ]}
      >
        {checked && <Check size={12} color="#FFF" strokeWidth={2} />}
      </View>
      <Supporting
        size="small"
        style={{ color: checked ? colors.text : colors.textMuted }}
      >
        {label}
        {optional && !checked && ' (optional)'}
      </Supporting>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  coverSection: {
    position: 'relative',
    borderRadius: Radius.lg,
    overflow: 'hidden',
  },
  coverImage: {
    width: '100%',
    height: 180,
    borderRadius: Radius.lg,
  },
  imageCount: {
    position: 'absolute',
    bottom: Spacing.sm,
    right: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
  },
  titleSection: {
    gap: Spacing.xs,
    marginTop: Spacing.md,
  },
  summaryGrid: {
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radius.md,
  },
  summaryContent: {
    flex: 1,
    gap: 2,
  },
  checklistBox: {
    padding: Spacing.md,
    borderRadius: Radius.lg,
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  checklistItems: {
    gap: Spacing.xs,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  checkCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  draftButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    marginTop: Spacing.md,
  },
});

export default ReviewSheet;
