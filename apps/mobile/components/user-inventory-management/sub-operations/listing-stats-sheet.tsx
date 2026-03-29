/**
 * ListingStatsSheet — Listing insights view
 *
 * Clean bottom sheet showing views, impressions, CTR,
 * saves, and superlikes for a single listing. Opened via
 * the "View Insights" action in
 * EditStatusSheet.
 */

import { Text, HapticPressable } from '@/components/ui';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Eye, Heart, Zap, MousePointerClick, Flame } from 'lucide-react-native';

import { Colors, Spacing, Radius, Sizes, type ColorPalette } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { getAppThumbUrl } from '@/lib/config';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ListingStatsSheetProps {
  visible: boolean;
  onClose: () => void;
  listingTitle: string;
  listingThumbnail?: string | null;
  viewCount: number;
  impressionCount: number;
  favouriteCount: number;
  superlikeCount: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
  return String(n);
}

function calculateHotScore({
  viewCount,
  impressionCount,
  favouriteCount,
  superlikeCount,
}: {
  viewCount: number;
  impressionCount: number;
  favouriteCount: number;
  superlikeCount: number;
}): number {
  const ctr = impressionCount > 0 ? viewCount / impressionCount : 0;
  const engagement = viewCount > 0 ? (favouriteCount + superlikeCount * 2) / viewCount : 0;

  const ctrScore = Math.min(ctr * 1000, 50);
  const engagementScore = Math.min(engagement * 1000, 40);
  const volumeBonus = Math.min(Math.log10(viewCount + 1) * 5, 10);

  return Math.round(ctrScore + engagementScore + volumeBonus);
}

function getHotLevel(score: number): { label: string; colorKey: keyof ColorPalette } {
  if (score >= 70) return { label: 'Hot', colorKey: 'warning' };
  if (score >= 40) return { label: 'Warm', colorKey: 'warning' };
  if (score >= 20) return { label: 'Active', colorKey: 'success' };
  return { label: 'New', colorKey: 'labelQuaternary' };
}

// ─── Component ───────────────────────────────────────────────────────────────

export function ListingStatsSheet({
  visible,
  onClose,
  listingTitle,
  listingThumbnail,
  viewCount,
  impressionCount,
  favouriteCount,
  superlikeCount,
}: ListingStatsSheetProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const bottomSheetRef = useRef<BottomSheetModal>(null);

  const snapPoints = useMemo(() => ['52%'], []);

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

  const ctr = useMemo(
    () => (impressionCount > 0 ? ((viewCount / impressionCount) * 100).toFixed(1) : '0.0'),
    [impressionCount, viewCount]
  );

  const hotScore = useMemo(
    () => calculateHotScore({ viewCount, impressionCount, favouriteCount, superlikeCount }),
    [viewCount, impressionCount, favouriteCount, superlikeCount]
  );

  const hotLevel = useMemo(() => getHotLevel(hotScore), [hotScore]);

  const stats = [
    {
      label: 'Views',
      value: viewCount,
      icon: Eye,
      color: colors.labelSecondary,
    },
    {
      label: 'Impressions',
      value: impressionCount,
      icon: MousePointerClick,
      color: colors.labelSecondary,
    },
    {
      label: 'Saves',
      value: favouriteCount,
      icon: Heart,
      color: colors.favorite,
    },
    {
      label: 'Superlikes',
      value: superlikeCount,
      icon: Zap,
      color: colors.warning,
    },
  ];

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
          <Text variant="heading">Insights</Text>
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
          <Text variant="bodySm" style={{ color: colors.label, flex: 1 }} numberOfLines={1}>
            {listingTitle}
          </Text>
        </View>

        <View style={styles.metricsGrid}>
          <View style={[styles.metricCard, { backgroundColor: colors.fill2 }]}>
            <Text variant="bodySm" tone="secondary">Click Rate</Text>
            <View style={styles.metricValueRow}>
              <Text variant="title">{ctr}%</Text>
            </View>
          </View>

          <View style={[styles.metricCard, { backgroundColor: colors.fill2 }]}>
            <Text variant="bodySm" tone="secondary">Engagement</Text>
            <View style={styles.metricValueRow}>
              <Flame size={Sizes.iconSm} color={colors[hotLevel.colorKey]} />
              <Text variant="title" style={{ color: colors[hotLevel.colorKey] }}>
                {hotLevel.label}
              </Text>
            </View>
          </View>
        </View>

        {/* Stat rows */}
        <View style={styles.statsList}>
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            const isLast = index === stats.length - 1;
            return (
              <View
                key={stat.label}
                style={[
                  styles.statRow,
                  !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
                ]}
              >
                <View style={styles.statLeft}>
                  <IconComponent
                    size={Sizes.iconSm}
                    color={stat.color}
                    fill={stat.label === 'Saves' ? stat.color : 'none'}
                    strokeWidth={1.75}
                  />
                  <Text variant="bodySm" style={{ color: colors.labelSecondary }}>
                    {stat.label}
                  </Text>
                </View>
                <Text variant="bodySm" style={{ color: colors.label, }}>
                  {formatCount(stat.value)}
                </Text>
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
    width: Sizes.avatarSm,
    height: Sizes.avatarSm,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingBottom: Spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginBottom: Spacing.sm,
  },
  thumbnail: {
    width: Sizes.avatarMd,
    height: Sizes.avatarMd,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsList: {
    gap: 0,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  metricCard: {
    flex: 1,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.lg,
    gap: Spacing.xs,
  },
  metricValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
  },
  statLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
});
