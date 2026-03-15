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
import { Clock } from 'lucide-react-native';

import { Colors, Spacing, Radius, Sizes, Layout } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { getAppThumbUrl } from '@/lib/config';
import { Heading, Body, Supporting } from '@/components/ui';

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

  const snapPoints = useMemo(() => ['42%'], []);

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
              { backgroundColor: colors.error },
            ]}
          >
            <Ionicons name="close" size={Sizes.iconSm} color="#FFFFFF" />
          </HapticPressable>
        </View>

        {/* Listing preview */}
        <View style={[styles.previewRow, { borderBottomColor: colors.border }]}>
          {listingThumbnail ? (
            <Image source={{ uri: getAppThumbUrl(listingThumbnail) || listingThumbnail }} style={styles.thumbnail} />
          ) : (
            <View style={[styles.thumbnail, { backgroundColor: colors.fill }]}>
              <Ionicons name="image-outline" size={Sizes.iconSm} color={colors.textMuted} />
            </View>
          )}
          <Body size="small" style={{ color: colors.text, flex: 1 }} numberOfLines={1}>
            {listingTitle}
          </Body>
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
                <Body size="small" style={{ color: colors.text, lineHeight: 20 }}>
                  {aiModeration?.reasoning}
                </Body>
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
                        <Body size="small" style={{ color: colors.warning }}>
                          {label}
                        </Body>
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          ) : (
            <View style={[styles.section, { backgroundColor: colors.fill }]}>
              <Body size="small" style={{ color: colors.textMuted, textAlign: 'center' }}>
                No specific details available.
              </Body>
            </View>
          )}

          {/* Footer Note */}
          <View style={styles.footerNote}>
            <Supporting style={{ color: colors.textMuted, textAlign: 'center', lineHeight: 18 }}>
              Our team will review within 24 hours. This assessment is automated — your listing will be reviewed by a human.
            </Supporting>
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
