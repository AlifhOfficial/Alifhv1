/**
 * ListingStatsSheet — Engagement statistics view
 *
 * Clean bottom sheet showing views, saves, and superlikes
 * for a single listing. Opened via the "View Stats" action in
 * EditStatusSheet.
 */

import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { HapticPressable } from '@/components/ui';
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Eye, Heart, Zap } from 'lucide-react-native';

import { Colors, Spacing, Radius, Sizes, Layout } from '@/constants/theme';
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

  const snapPoints = useMemo(() => ['38%'], []);

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

  const stats = [
    {
      label: 'Views',
      value: viewCount,
      icon: Eye,
      color: colors.textSecondary,
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
      backgroundStyle={{ backgroundColor: colors.surface, borderRadius: 24 }}
      handleIndicatorStyle={{ backgroundColor: colors.textMuted, width: 36 }}
      detached
      bottomInset={insets.bottom + 20}
      style={styles.sheetContainer}
    >
      <BottomSheetView style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Heading size="medium">Stats</Heading>
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
            <Image source={{ uri: listingThumbnail }} style={styles.thumbnail} />
          ) : (
            <View style={[styles.thumbnail, { backgroundColor: colors.fill }]}>
              <Ionicons name="image-outline" size={Sizes.iconSm} color={colors.textMuted} />
            </View>
          )}
          <Data size="small" style={{ color: colors.text, flex: 1 }} numberOfLines={1}>
            {listingTitle}
          </Data>
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
                  <Data size="small" style={{ color: colors.textSecondary }}>
                    {stat.label}
                  </Data>
                </View>
                <Data size="small" style={{ color: colors.text, fontWeight: '600' }}>
                  {formatCount(stat.value)}
                </Data>
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
    marginHorizontal: Layout.screenPadding,
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
