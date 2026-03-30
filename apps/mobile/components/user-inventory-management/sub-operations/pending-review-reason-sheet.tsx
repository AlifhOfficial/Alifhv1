/**
 * PendingReviewReasonSheet — AI Moderation Reason Display
 *
 * Shows users why their listing is under review (pending_review).
 * Displays the AI reasoning and any flags that were raised.
 */

import { Text, HapticPressable } from '@/components/ui';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { View, StyleSheet, Image, ScrollView } from 'react-native';
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Clock } from 'lucide-react-native';

import { Colors, Spacing, Radius, Sizes, Layout, Typography, SheetSnapPoints } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { getAppThumbUrl } from '@/lib/config';

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

  const snapPoints = useMemo(() => SheetSnapPoints.singleSm, []);

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
      backgroundStyle={{ backgroundColor: colors.surface, borderRadius: Radius['3xl'] }}
      handleIndicatorStyle={{ backgroundColor: colors.labelQuaternary, width: Sizes.bubble }}
    >
      <BottomSheetView style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTitleRow}>
            <Clock size={20} color={colors.warning} />
            <Text variant="title3Emphasized" style={{ marginLeft: Spacing.sm }}>
              Under Review
            </Text>
          </View>
          <HapticPressable
            onPress={onClose}
            hitSlop={Spacing.md}
            style={[
              styles.closeButton,
              { backgroundColor: colors.error },
            ]}
          >
            <Ionicons name="close" size={Sizes.iconSm} color={colors.primaryForeground} />
          </HapticPressable>
        </View>

        {/* Listing preview */}
        <View style={[styles.previewRow, { borderBottomColor: colors.border }]}>
          {listingThumbnail ? (
            <Image source={{ uri: getAppThumbUrl(listingThumbnail)! }} style={styles.thumbnail} />
          ) : (
            <View style={[styles.thumbnail, { backgroundColor: colors.fill }]}>
              <Ionicons name="image-outline" size={Sizes.iconSm} color={colors.labelQuaternary} />
            </View>
          )}
          <Text variant="subhead" style={{ color: colors.label, flex: 1 }} numberOfLines={1}>
            {listingTitle}
          </Text>
        </View>

        <ScrollView 
          style={styles.scrollContent} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: Spacing.lg }}
        >
          {/* Main Content */}
          {(hasReasoning || hasFlags) ? (
            <View style={[styles.section, { backgroundColor: colors.fill }]}>
              {/* Reasoning */}
              {hasReasoning && (
                <Text
                  variant="subhead"
                  style={{ color: colors.label, lineHeight: Typography.subhead.lineHeight }}
                >
                  {aiModeration?.reasoning}
                </Text>
              )}
              
              {/* Flags */}
              {hasFlags && (
                <View style={[styles.flagsContainer, hasReasoning && { marginTop: Spacing.md }]}>
                  {aiModeration?.flags?.map((flag, index) => {
                    const label = formatFlagLabel(flag);
                    if (!label) return null;
                    return (
                      <View
                        key={index}
                        style={[styles.flagBadge, { backgroundColor: colors.warning + '20' }]}
                      >
                        <Text variant="subhead" style={{ color: colors.warning }}>
                          {label}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          ) : (
            <View style={[styles.section, { backgroundColor: colors.fill }]}>
              <Text variant="subhead" style={{ color: colors.labelQuaternary, textAlign: 'center' }}>
                No specific details available.
              </Text>
            </View>
          )}

          {/* Footer Note */}
          <View style={styles.footerNote}>
            <Text
              style={{
                color: colors.labelQuaternary,
                textAlign: 'center',
                lineHeight: Typography.caption1Emphasized.lineHeight,
              }}
              variant="subhead"
              tone="secondary"
            >
              Our team will review within 24 hours. This assessment is automated — your listing will be reviewed by a human.
            </Text>
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
    width: Spacing["5xl"],
    height: Spacing["3xl"],
    borderRadius: Radius.sm,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    flex: 1,
  },
  section: {
    padding: Spacing.md,
    borderRadius: Radius.md,
    marginBottom: Spacing.md,
  },
  flagsContainer: {
    flexDirection: 'column',
    gap: Spacing.xs,
  },
  flagBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.md,
  },
  footerNote: {
    paddingHorizontal: Spacing.sm,
    marginTop: Spacing.sm,
  },
});
