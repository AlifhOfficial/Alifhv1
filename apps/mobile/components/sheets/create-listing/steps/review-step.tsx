/**
 * ReviewStepContent — Final review before publishing
 *
 * Content-only component for the unified flow.
 *
 * @module components/sheets/create-listing/steps/review-step
 */

import React, { useState, useCallback } from 'react';
import { View, StyleSheet, Image, ActivityIndicator } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Check, ChevronRight, AlertCircle, Save } from 'lucide-react-native';

import { Colors, Spacing, Radius, Sizes } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { Body, Supporting, Label, Data, Heading } from '@/components/ui';
import { HapticPressable } from '@/components/ui';
import { UAE_EMIRATES } from '@/lib/filter-constants';
import { createListing } from '@/lib/sell-car-user-api';
import { CDN_BASE } from '@/lib/config';

import type { StepContentProps } from '../create-listing-flow';
import { StepContainer } from '../step-container';
import { dataToPayload } from '../types';

// ─────────────────────────────────────────────────────────────────────────────

/** Ensure URL is absolute for Image component */
function toAbsoluteUrl(url: string): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${CDN_BASE}/${url.startsWith('/') ? url.slice(1) : url}`;
}

interface ReviewStepContentProps extends StepContentProps {
  onSubmitSuccess?: (listingId: string) => void;
  onGoToStep?: (stepIndex: number) => void;
}

export function ReviewStepContent({
  data,
  onSubmitSuccess,
  onGoToStep,
}: ReviewStepContentProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePublish = useCallback(async () => {
    setSubmitting(true);
    setError(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    try {
      const payload = dataToPayload(data, 'published');
      const result = await createListing(payload);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onSubmitSuccess?.(result.id);
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }, [data, onSubmitSuccess]);

  const handleSaveDraft = useCallback(async () => {
    setSubmitting(true);
    setError(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const payload = dataToPayload(data, 'draft');
      const result = await createListing(payload);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onSubmitSuccess?.(result.id);
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  }, [data, onSubmitSuccess]);

  const priceNum = parseInt(data.price || '0', 10);
  const emirateLabel = UAE_EMIRATES.find((e) => e.value === data.emirate)?.label ?? data.emirate;
  const vehicleTitle = `${data.year} ${data.make} ${data.model}${data.trim ? ` ${data.trim}` : ''}`;
  const mileageNum = parseInt(data.mileage || '0', 10);

  // Check if all required fields are present for publishing
  const canPublish =
    data.vinVerified &&
    data.make &&
    data.model &&
    data.mileage &&
    data.price &&
    data.emirate &&
    data.images.length > 0;

  return (
    <StepContainer>
      {/* Cover Image */}
      {data.images.length > 0 && (
        <View style={styles.coverSection}>
          <Image
            source={{ uri: toAbsoluteUrl(data.images[0]) }}
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
          <ChecklistItem checked={data.images.length > 0} label="At least 1 photo" colors={colors} />
        </View>
      </View>

      {/* Error message */}
      {error && (
        <View style={[styles.errorBox, { backgroundColor: (colors.error ?? '#EF4444') + '15' }]}>
          <AlertCircle size={Sizes.iconSm} color={colors.error ?? '#EF4444'} strokeWidth={2} />
          <Supporting size="small" style={{ color: colors.error ?? '#EF4444', flex: 1 }}>
            {error}
          </Supporting>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actionsSection}>
        {/* Publish Button */}
        <HapticPressable
          onPress={handlePublish}
          disabled={submitting || !canPublish}
          style={[
            styles.publishButton,
            {
              backgroundColor: canPublish ? colors.text : colors.fillSecondary,
              opacity: submitting ? 0.7 : 1,
            },
          ]}
        >
          {submitting ? (
            <ActivityIndicator size="small" color={colors.background} />
          ) : (
            <>
              <Check size={Sizes.iconSm} color={colors.background} strokeWidth={2} />
              <Body size="medium" style={{ color: colors.background, fontFamily: 'Inter_600SemiBold' }}>
                Publish Listing
              </Body>
            </>
          )}
        </HapticPressable>

        {/* Save Draft */}
        <HapticPressable
          onPress={handleSaveDraft}
          disabled={submitting}
          style={[styles.draftButton, { borderColor: colors.border }]}
        >
          <Save size={Sizes.iconSm} color={colors.textSecondary} strokeWidth={2} />
          <Body size="medium" tone="secondary">
            Save as Draft
          </Body>
        </HapticPressable>
      </View>
    </StepContainer>
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
  colors,
}: {
  checked: boolean;
  label: string;
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
        {checked && <Check size={12} color="#FFF" strokeWidth={3} />}
      </View>
      <Body size="small" style={{ color: checked ? colors.text : colors.textMuted }}>
        {label}
      </Body>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  coverSection: {
    position: 'relative',
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
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.sm,
  },
  titleSection: {
    gap: Spacing.xs,
  },
  summaryGrid: {
    gap: Spacing.xs,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radius.md,
  },
  actionsSection: {
    gap: Spacing.sm,
  },
  publishButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    height: 52,
    borderRadius: Radius.lg,
  },
  draftButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    height: 48,
    borderRadius: Radius.lg,
    borderWidth: 1,
  },
});

export default ReviewStepContent;
