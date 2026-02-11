/**
 * ListingStatsSheet — Engagement statistics view
 *
 * Read-only bottom sheet showing views, saves, and superlikes
 * for a single listing. Opened via the "View Stats" action in
 * EditStatusSheet.
 */

import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { View, StyleSheet, Pressable, Image } from 'react-native';
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Eye, Heart, Sparkles } from 'lucide-react-native';

import { Colors, Spacing, Radius } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { Heading, Body, Data, Supporting } from '@/components/ui';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ListingStatsSheetProps {
  visible: boolean;
  onClose: () => void;
  listingTitle: string;
  listingThumbnail?: string | null;
  viewCount: number;
  favouriteCount: number;
  superlikeCount: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
  return String(n);
}

// ─── Component ───────────────────────────────────────────────────────────────

export function ListingStatsSheet({
  visible,
  onClose,
  listingTitle,
  listingThumbnail,
  viewCount,
  favouriteCount,
  superlikeCount,
}: ListingStatsSheetProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const bottomSheetRef = useRef<BottomSheetModal>(null);

  const snapPoints = useMemo(() => ['48%'], []);

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

  const totalEngagement = viewCount + favouriteCount + superlikeCount;

  const stats = [
    {
      label: 'Views',
      value: viewCount,
      icon: Eye,
      color: colors.primary,
      bgColor: colors.primaryMuted ?? colors.primary + '1A',
      description: 'Total times your listing was viewed',
    },
    {
      label: 'Saves',
      value: favouriteCount,
      icon: Heart,
      color: colors.error,
      bgColor: colors.errorMuted ?? colors.error + '1A',
      description: 'People who saved your listing',
    },
    {
      label: 'Superlikes',
      value: superlikeCount,
      icon: Sparkles,
      color: colors.warning,
      bgColor: colors.warningMuted ?? colors.warning + '1A',
      description: 'People who superliked your listing',
    },
  ];

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
          <Heading size="medium">Listing Stats</Heading>
          <Pressable
            onPress={onClose}
            hitSlop={Spacing.md}
            style={[
              styles.closeButton,
              { backgroundColor: colors.fillSecondary },
            ]}
          >
            <Ionicons name="close" size={18} color={colors.textSecondary} />
          </Pressable>
        </View>

        {/* Listing preview */}
        <View style={[styles.previewCard, { backgroundColor: colors.surfaceSecondary }]}>
          {listingThumbnail ? (
            <Image source={{ uri: listingThumbnail }} style={styles.thumbnail} />
          ) : (
            <View style={[styles.thumbnail, { backgroundColor: colors.fill }]}>
              <Ionicons name="image-outline" size={24} color={colors.textMuted} />
            </View>
          )}
          <View style={styles.previewInfo}>
            <Body size="medium" numberOfLines={1}>{listingTitle}</Body>
            <Supporting size="small" tone="secondary">
              {totalEngagement} total engagements
            </Supporting>
          </View>
        </View>

        {/* Stats grid */}
        <View style={styles.statsGrid}>
          {stats.map((stat) => {
            const IconComponent = stat.icon;
            return (
              <View
                key={stat.label}
                style={[styles.statCard, { backgroundColor: colors.surfaceSecondary }]}
              >
                <View style={[styles.statIconWrap, { backgroundColor: stat.bgColor }]}>
                  <IconComponent size={20} color={stat.color} />
                </View>
                <Data size="large" style={{ color: colors.text, fontWeight: '700', marginTop: Spacing.sm }}>
                  {formatCount(stat.value)}
                </Data>
                <Body size="small" style={{ color: colors.text, fontFamily: 'Inter_600SemiBold' }}>
                  {stat.label}
                </Body>
                <Supporting size="small" tone="secondary" style={{ textAlign: 'center' }}>
                  {stat.description}
                </Supporting>
              </View>
            );
          })}
        </View>

        <View style={{ height: insets.bottom + Spacing.md }} />
      </BottomSheetView>
    </BottomSheetModal>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  sheetContainer: {
    marginHorizontal: 16,
  },
  content: {
    paddingHorizontal: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.xs,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    marginBottom: Spacing.lg,
  },
  thumbnail: {
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewInfo: {
    flex: 1,
    gap: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radius.lg,
    gap: 2,
  },
  statIconWrap: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
