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
import { Check, AlertCircle, Save } from 'lucide-react-native';

import { Colors, Spacing, Radius, Sizes } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { Body, Supporting, Data, Heading } from '@/components/ui';
import { HapticPressable } from '@/components/ui';
import { UAE_EMIRATES } from '@/lib/filter-constants';
import { createListing, updateListing } from '@/lib/sell-car-user-api';
import { CDN_BASE } from '@/lib/config';

import type { StepContentProps } from '../create-listing-flow';
import { StepContainer } from '../step-container';
import { dataToPayload } from '../types';

// ─────────────────────────────────────────────────────────────────────────────

function toAbsoluteUrl(url: string): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${CDN_BASE}/${url.startsWith('/') ? url.slice(1) : url}`;
}

interface ReviewStepContentProps extends StepContentProps {
  onSubmitSuccess?: (listingId: string, approved: boolean, isDraft?: boolean) => void;
  onGoToStep?: (stepIndex: number) => void;
  editingListingId?: string;
}

export function ReviewStepContent({
  data,
  onSubmitSuccess,
  editingListingId,
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
      
      if (editingListingId) {
        // Update existing listing
        const result = await updateListing(editingListingId, payload);
        // For edits: use moderationStatus from response (AI moderation may run async).
        // moderation.approved is only populated synchronously for draft→first-publish.
        const approved = result.moderation?.approved ?? (result.moderationStatus === 'approved');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        onSubmitSuccess?.(result.id, approved);
      } else {
        // Create new listing - wait for AI moderation result
        const result = await createListing(payload);
        const approved = result.moderation?.approved ?? false;
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        onSubmitSuccess?.(result.id, approved);
      }
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }, [data, onSubmitSuccess, editingListingId]);

  const handleSaveDraft = useCallback(async () => {
    setSubmitting(true);
    setError(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const payload = dataToPayload(data, 'draft');
      
      if (editingListingId) {
        // Update existing draft
        const result = await updateListing(editingListingId, payload);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        // Drafts go to inventory drafts tab
        onSubmitSuccess?.(result.id, false, true);
      } else {
        // Create new draft
        const result = await createListing(payload);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        // Drafts go to inventory drafts tab
        onSubmitSuccess?.(result.id, false, true);
      }
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  }, [data, onSubmitSuccess, editingListingId]);

  const priceNum = parseInt(data.price || '0', 10);
  const emirateLabel = UAE_EMIRATES.find((e) => e.value === data.emirate)?.label ?? data.emirate;
  const vehicleTitle = `${data.year} ${data.make} ${data.model}`;
  const mileageNum = parseInt(data.mileage || '0', 10);

  const canPublish =
    data.vinVerified &&
    data.make &&
    data.model &&
    data.mileage &&
    data.price &&
    data.emirate &&
    data.images.length > 0;

  const missingItems: string[] = [];
  if (!data.vinVerified) missingItems.push('VIN verification');
  if (!data.make || !data.model) missingItems.push('Vehicle details');
  if (!data.mileage) missingItems.push('Mileage');
  if (!data.price) missingItems.push('Price');
  if (!data.emirate) missingItems.push('Location');
  if (data.images.length === 0) missingItems.push('Photos');

  return (
    <StepContainer>
      {/* Hero Card */}
      <View style={[styles.heroCard, { backgroundColor: colors.surface2 }]}>
        {data.images.length > 0 ? (
          <Image
            source={{ uri: toAbsoluteUrl(data.images[0]) }}
            style={styles.heroImage}
          />
        ) : (
          <View style={[styles.heroImage, { backgroundColor: colors.fill2 }]} />
        )}
        
        <View style={styles.heroInfo}>
          <Heading size="small" numberOfLines={2}>{vehicleTitle}</Heading>
          {data.trim && <Supporting size="small" tone="muted">{data.trim}</Supporting>}
          <Data size="large" style={{ color: colors.primary, marginTop: Spacing.xs }}>
            AED {priceNum.toLocaleString()}
          </Data>
        </View>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsRow}>
        <View style={[styles.statItem, { backgroundColor: colors.surface2 }]}>
          <Supporting size="small" tone="muted">Mileage</Supporting>
          <Body size="medium">{mileageNum.toLocaleString()} km</Body>
        </View>
        <View style={[styles.statItem, { backgroundColor: colors.surface2 }]}>
          <Supporting size="small" tone="muted">Location</Supporting>
          <Body size="medium" numberOfLines={1}>{emirateLabel}</Body>
        </View>
        <View style={[styles.statItem, { backgroundColor: colors.surface2 }]}>
          <Supporting size="small" tone="muted">Photos</Supporting>
          <Body size="medium">{data.images.length}</Body>
        </View>
      </View>

      {/* Missing Items Warning */}
      {!canPublish && missingItems.length > 0 && (
        <View style={[styles.warningBox, { backgroundColor: (colors.warning ?? '#F59E0B') + '15' }]}>
          <AlertCircle size={Sizes.iconSm} color={colors.warning ?? '#F59E0B'} strokeWidth={2} />
          <Body size="small" style={{ color: colors.warning ?? '#F59E0B', flex: 1 }}>
            Missing: {missingItems.join(', ')}
          </Body>
        </View>
      )}

      {/* Error */}
      {error && (
        <View style={[styles.warningBox, { backgroundColor: (colors.error ?? '#EF4444') + '15' }]}>
          <AlertCircle size={Sizes.iconSm} color={colors.error ?? '#EF4444'} strokeWidth={2} />
          <Body size="small" style={{ color: colors.error ?? '#EF4444', flex: 1 }}>
            {error}
          </Body>
        </View>
      )}

      {/* Actions */}
      <View style={styles.actions}>
        <HapticPressable
          onPress={handlePublish}
          disabled={submitting || !canPublish}
          style={[
            styles.publishBtn,
            { backgroundColor: canPublish ? colors.text : colors.fill2 },
          ]}
        >
          {submitting ? (
            <ActivityIndicator size="small" color={colors.bg} />
          ) : (
            <>
              <Check size={Sizes.iconSm} color={canPublish ? colors.bg : colors.textMuted} strokeWidth={2} />
              <Body size="medium" style={{ color: canPublish ? colors.bg : colors.textMuted, fontFamily: 'Inter_600SemiBold' }}>
                Publish
              </Body>
            </>
          )}
        </HapticPressable>

        <HapticPressable
          onPress={handleSaveDraft}
          disabled={submitting}
          style={[styles.draftBtn, { borderColor: colors.border }]}
        >
          <Save size={Sizes.iconSm} color={colors.text2} strokeWidth={2} />
          <Body size="medium" tone="secondary">Draft</Body>
        </HapticPressable>
      </View>
    </StepContainer>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  heroCard: {
    flexDirection: 'row',
    borderRadius: Radius.lg,
    overflow: 'hidden',
  },
  heroImage: {
    width: 120,
    height: 100,
  },
  heroInfo: {
    flex: 1,
    padding: Spacing.md,
    justifyContent: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.lg,
  },
  statItem: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: Radius.md,
    gap: 2,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radius.md,
    marginTop: Spacing.lg,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.xl,
  },
  publishBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    height: 52,
    borderRadius: Radius.lg,
  },
  draftBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    height: 52,
    borderRadius: Radius.lg,
    borderWidth: 1,
  },
});

export default ReviewStepContent;
