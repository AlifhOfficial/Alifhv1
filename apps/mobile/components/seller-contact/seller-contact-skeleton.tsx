/**
 * Seller Contact Screen Skeleton
 */

import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Spacing, Radius, Sizes, Layout } from '@/constants/theme';
import { Skeleton } from '@/components/ui';
import { ScreenContainer } from '@/components/layout/ScreenContainer';

import type { SellerContactColors } from './types';

export const SellerContactSkeleton = memo(function SellerContactSkeleton({ colors }: SellerContactColors) {
  const insets = useSafeAreaInsets();

  return (
    <ScreenContainer
      horizontalPadding="lg"
      verticalPadding={0}
      tabBarClearance={false}
      extraBottomPadding={Layout.bottomGradientExtension}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + Spacing.lg }]}
    >
      {/* Hero Section - Avatar right, info left */}
      <View style={styles.heroSection}>
        <View style={styles.heroInfo}>
          {/* Name + badge */}
          <View style={styles.nameRow}>
            <Skeleton width="55%" height={22} />
            <Skeleton width={32} height={14} borderRadius={Radius.none} />
          </View>
          {/* Seller type */}
          <Skeleton width="35%" height={14} />
          {/* Member since */}
          <View style={styles.metaRow}>
            <Skeleton width={Sizes.iconXs} height={Sizes.iconXs} borderRadius={Radius.full} />
            <Skeleton width="45%" height={12} />
          </View>
          {/* Rating */}
          <View style={styles.metaRow}>
            <Skeleton width={Sizes.iconXs} height={Sizes.iconXs} borderRadius={Radius.full} />
            <Skeleton width={30} height={14} />
            <Skeleton width={25} height={12} />
          </View>
        </View>
        {/* Avatar */}
        <Skeleton 
          width={Sizes.avatarLg + Spacing.lg} 
          height={Sizes.avatarLg + Spacing.lg} 
          borderRadius={Radius.sm} 
        />
      </View>

      {/* About Section */}
      <View style={styles.section}>
        <Skeleton width={60} height={12} />
        <Skeleton width="100%" height={16} />
        <Skeleton width="85%" height={16} />
        <Skeleton width="30%" height={14} />
      </View>

      {/* Actions: Chat + Book buttons */}
      <View style={styles.ctaSection}>
        <View style={styles.ctaRow}>
          <Skeleton width="48%" height={Sizes.actionButtonLg} style={{ borderRadius: Radius.lg }} />
          <Skeleton width="48%" height={Sizes.actionButtonLg} style={{ borderRadius: Radius.lg }} />
        </View>
        <Skeleton width={120} height={14} style={{ alignSelf: 'center' }} />
      </View>

      {/* Stats Grid - 4 columns with border */}
      <View style={[styles.statsGrid, { borderTopColor: colors.border, borderBottomColor: colors.border }]}>
        {[1, 2, 3, 4].map((i) => (
          <View key={i} style={styles.statItem}>
            <Skeleton width={40} height={10} />
            <Skeleton width={50} height={14} />
          </View>
        ))}
      </View>

      {/* Tags Section */}
      <View style={styles.section}>
        <Skeleton width={80} height={12} />
        <View style={styles.tagsRow}>
          <Skeleton width={70} height={Spacing['2xl'] + Spacing.xs} style={{ borderRadius: Radius.md }} />
          <Skeleton width={90} height={Spacing['2xl'] + Spacing.xs} style={{ borderRadius: Radius.md }} />
          <Skeleton width={60} height={Spacing['2xl'] + Spacing.xs} style={{ borderRadius: Radius.md }} />
        </View>
      </View>

      {/* Listings Section */}
      <View style={styles.section}>
        <Skeleton width={150} height={12} />
        <Skeleton width="100%" height={80} style={{ borderRadius: Radius.md }} />
        <Skeleton width="100%" height={80} style={{ borderRadius: Radius.md }} />
      </View>

      {/* Financing Calculator */}
      <View style={styles.section}>
        <View style={styles.headerRow}>
          <Skeleton width={130} height={12} />
          <Skeleton width={70} height={12} />
        </View>
        {/* EMI */}
        <View style={styles.emiRow}>
          <Skeleton width={120} height={18} />
          <Skeleton width="60%" height={12} />
        </View>
        {/* Down payment chips */}
        <View style={styles.optionRow}>
          <Skeleton width={45} height={12} />
          <View style={styles.chipsRow}>
            <Skeleton width={55} height={Spacing['2xl'] + Spacing.sm} style={{ borderRadius: Radius.full }} />
            <Skeleton width={55} height={Spacing['2xl'] + Spacing.sm} style={{ borderRadius: Radius.full }} />
            <Skeleton width={55} height={Spacing['2xl'] + Spacing.sm} style={{ borderRadius: Radius.full }} />
          </View>
        </View>
        {/* Term chips */}
        <View style={styles.optionRow}>
          <Skeleton width={35} height={12} />
          <View style={styles.chipsRow}>
            <Skeleton width={60} height={Spacing['2xl'] + Spacing.sm} style={{ borderRadius: Radius.full }} />
            <Skeleton width={60} height={Spacing['2xl'] + Spacing.sm} style={{ borderRadius: Radius.full }} />
            <Skeleton width={60} height={Spacing['2xl'] + Spacing.sm} style={{ borderRadius: Radius.full }} />
          </View>
        </View>
        <Skeleton width="80%" height={10} />
      </View>

      {/* Location Section */}
      <View style={styles.section}>
        <Skeleton width={70} height={12} />
        <View style={styles.locationRow}>
          <Skeleton width={Sizes.iconMd} height={Sizes.iconMd} borderRadius={Radius.full} />
          <Skeleton width="70%" height={16} />
        </View>
        <View style={styles.pillsRow}>
          <Skeleton width={95} height={Spacing['2xl'] + Spacing.sm} style={{ borderRadius: Radius.full }} />
          <Skeleton width={95} height={Spacing['2xl'] + Spacing.sm} style={{ borderRadius: Radius.full }} />
          <Skeleton width={80} height={Spacing['2xl'] + Spacing.sm} style={{ borderRadius: Radius.full }} />
        </View>
      </View>
    </ScreenContainer>
  );
});

const styles = StyleSheet.create({
  content: {
    gap: Spacing.xl,
  },
  heroSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  heroInfo: {
    flex: 1,
    gap: Spacing.xs,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  section: {
    gap: Spacing.sm,
  },
  ctaSection: {
    gap: Spacing.md,
  },
  ctaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  statItem: {
    alignItems: 'center',
    gap: Spacing.xs,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  emiRow: {
    gap: Spacing.xs / 2,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  pillsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
});
