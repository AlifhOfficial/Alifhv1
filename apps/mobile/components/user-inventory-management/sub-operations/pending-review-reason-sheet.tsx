/**
 * PendingReviewReasonSheet — AI Moderation Reason Display
 *
 * Shows users why their listing is under review (pending_review).
 * Displays the AI reasoning and any flags that were raised.
 */

import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { View, StyleSheet, Image, ScrollView } from 'react-native';
import { HapticPressable } from '@/components/ui';
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AlertCircle, Clock, Info, ShieldAlert } from 'lucide-react-native';

import { Colors, Spacing, Radius, Sizes, Layout } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { getThumbUrl } from '@/lib/config';
import { Heading, Body, Data, Supporting } from '@/components/ui';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface PendingReviewReasonSheetProps {
  visible: boolean;
  onClose: () => void;
  listingTitle: string;
  listingThumbnail?: string | null;
  /** AI moderation info */
  aiModeration?: {
    reasoning?: string;
    flags?: Array<string | { code: string; severity?: string; message?: string }>;
    confidence?: number;
  } | null;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function PendingReviewReasonSheet({
  visible,
  onClose,
  listingTitle,
  listingThumbnail,
  aiModeration,
}: PendingReviewReasonSheetProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const bottomSheetRef = useRef<BottomSheetModal>(null);

  const snapPoints = useMemo(() => ['55%'], []);

  useEffect(() => {
    if (visible) {
      bottomSheetRef.current?.present();
    } else {
      bottomSheetRef.current?.dismiss();
    }
  }, [visible]);

  const handleSheetChanges = useCallback(
    (index: number) => {
      if (index === -1) onClose();
    },
    [onClose],
  );

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
        pressBehavior="close"
      />
    ),
    [],
  );

  const hasFlags = aiModeration?.flags && aiModeration.flags.length > 0;
  const hasReasoning = !!aiModeration?.reasoning;

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      snapPoints={snapPoints}
      enablePanDownToClose
      onChange={handleSheetChanges}
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: colors.surface, borderRadius: 24 }}
      handleIndicatorStyle={{ backgroundColor: colors.textMuted, width: 36 }}
      detached
      bottomInset={insets.bottom + 20}
      style={styles.sheetContainer}
    >
      <BottomSheetView style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTitleRow}>
            <Clock size={20} color={colors.warning} />
            <Heading size="medium" style={{ marginLeft: Spacing.sm }}>
              Under Review
            </Heading>
          </View>
          <HapticPressable
            onPress={onClose}
            hitSlop={Spacing.md}
            style={[
              styles.closeButton,
              { backgroundColor: colors.fillSecondary },
            ]}
          >
            <Ionicons name="close" size={Sizes.iconSm} color={colors.textSecondary} />
          </HapticPressable>
        </View>

        {/* Listing preview */}
        <View style={[styles.previewRow, { borderBottomColor: colors.border }]}>
          {listingThumbnail ? (
            <Image source={{ uri: getThumbUrl(listingThumbnail) || listingThumbnail }} style={styles.thumbnail} />
          ) : (
            <View style={[styles.thumbnail, { backgroundColor: colors.fill }]}>
              <Ionicons name="image-outline" size={Sizes.iconSm} color={colors.textMuted} />
            </View>
          )}
          <Data size="small" style={{ color: colors.text, flex: 1 }} numberOfLines={1}>
            {listingTitle}
          </Data>
        </View>

        <ScrollView 
          style={styles.scrollContent} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: Spacing.lg }}
        >
          {/* Info Banner */}
          <View style={[styles.infoBanner, { backgroundColor: colors.warning + '15' }]}>
            <Info size={16} color={colors.warning} style={{ marginTop: 2 }} />
            <Body size="small" style={{ color: colors.text, marginLeft: Spacing.sm, flex: 1 }}>
              Your listing requires manual review before it goes live. Our team will check it within 24 hours.
            </Body>
          </View>

          {/* AI Reasoning */}
          {hasReasoning && (
            <View style={[styles.section, { backgroundColor: colors.fill }]}>
              <View style={styles.sectionHeader}>
                <ShieldAlert size={16} color={colors.primary} />
                <Data size="small" style={{ color: colors.textSecondary, marginLeft: Spacing.xs }}>
                  Review Reason
                </Data>
              </View>
              <Body size="small" style={{ color: colors.text, marginTop: Spacing.sm, lineHeight: 20 }}>
                {aiModeration?.reasoning}
              </Body>
            </View>
          )}

          {/* Flags */}
          {hasFlags && (
            <View style={[styles.section, { backgroundColor: colors.fill }]}>
              <View style={styles.sectionHeader}>
                <AlertCircle size={16} color={colors.warning} />
                <Data size="small" style={{ color: colors.textSecondary, marginLeft: Spacing.xs }}>
                  Items Flagged
                </Data>
              </View>
              <View style={styles.flagsContainer}>
                {aiModeration?.flags?.map((flag, index) => {
                  const label = formatFlagLabel(flag);
                  if (!label) return null;
                  return (
                    <View
                      key={index}
                      style={[styles.flagBadge, { backgroundColor: colors.warning + '20' }]}
                    >
                      <Body size="small" style={{ color: colors.warning }}>
                        {label}
                      </Body>
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          {/* No Details Available */}
          {!hasReasoning && !hasFlags && (
            <View style={[styles.section, { backgroundColor: colors.fill }]}>
              <Body size="small" style={{ color: colors.textMuted, textAlign: 'center' }}>
                No specific details available. Our team will review your listing shortly.
              </Body>
            </View>
          )}

          {/* What to Expect */}
          <View style={styles.tipSection}>
            <Data size="small" style={{ color: colors.textSecondary, marginBottom: Spacing.sm }}>
              What happens next?
            </Data>
            <View style={styles.tipRow}>
              <View style={[styles.tipDot, { backgroundColor: colors.success }]} />
              <Supporting style={{ color: colors.textMuted, flex: 1 }}>
                If approved, your listing goes live automatically
              </Supporting>
            </View>
            <View style={styles.tipRow}>
              <View style={[styles.tipDot, { backgroundColor: colors.warning }]} />
              <Supporting style={{ color: colors.textMuted, flex: 1 }}>
                If changes needed, we'll notify you with details
              </Supporting>
            </View>
            <View style={styles.tipRow}>
              <View style={[styles.tipDot, { backgroundColor: colors.primary }]} />
              <Supporting style={{ color: colors.textMuted, flex: 1 }}>
                You can edit and resubmit anytime
              </Supporting>
            </View>
          </View>
        </ScrollView>
      </BottomSheetView>
    </BottomSheetModal>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Convert flag (string or object) to readable label */
function formatFlagLabel(flag: string | { code: string; severity?: string; message?: string } | null | undefined): string {
  if (!flag) return '';
  
  // Handle object flags
  if (typeof flag === 'object') {
    const text = flag.message || flag.code || '';
    return text
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }
  
  // Handle string flags
  if (typeof flag === 'string') {
    return flag
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }
  
  return '';
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  sheetContainer: {
    marginHorizontal: Layout.screenPadding,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: Spacing.md,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  closeButton: {
    padding: Spacing.xs,
    borderRadius: Radius.full,
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingBottom: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginBottom: Spacing.md,
  },
  thumbnail: {
    width: 48,
    height: 36,
    borderRadius: Radius.sm,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    flex: 1,
  },
  infoBanner: {
    flexDirection: 'row',
    padding: Spacing.md,
    borderRadius: Radius.md,
    marginBottom: Spacing.md,
  },
  section: {
    padding: Spacing.md,
    borderRadius: Radius.md,
    marginBottom: Spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flagsContainer: {
    flexDirection: 'column',
    gap: Spacing.xs,
    marginTop: Spacing.sm,
  },
  flagBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.md,
  },
  tipSection: {
    marginTop: Spacing.sm,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  tipDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 6,
  },
});
