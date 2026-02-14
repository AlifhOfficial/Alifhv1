/**
 * Seller Contact Screen Skeleton
 */

import React, { memo } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';

import { Spacing, Radius, Sizes } from '@/constants/theme';
import { Skeleton } from '@/components/ui';

import type { SellerContactColors } from './types';

export const SellerContactSkeleton = memo(function SellerContactSkeleton({ colors }: SellerContactColors) {
  return (
    <ScrollView style={skeletonStyles.scroll} contentContainerStyle={skeletonStyles.content}>
      {/* Hero */}
      <View style={skeletonStyles.heroSection}>
        <Skeleton width={Sizes.avatarLg + Spacing['3xl']} height={Sizes.avatarLg + Spacing['3xl']} borderRadius={Radius.full} />
        <View style={skeletonStyles.heroInfo}>
          <Skeleton width="60%" height={Spacing['2xl']} />
          <Skeleton width="40%" height={Spacing.lg} />
          <Skeleton width="30%" height={Sizes.iconXs} />
        </View>
      </View>
      
      {/* CTA */}
      <Skeleton width="100%" height={Sizes.actionButtonLg + Spacing.xs} style={{ borderRadius: Radius.lg }} />
      
      {/* Contact Grid */}
      <View style={skeletonStyles.contactGrid}>
        <Skeleton width="48%" height={Spacing['5xl'] + Spacing['2xl']} style={{ borderRadius: Radius.md }} />
        <Skeleton width="48%" height={Spacing['5xl'] + Spacing['2xl']} style={{ borderRadius: Radius.md }} />
      </View>
      
      {/* Section */}
      <View style={skeletonStyles.section}>
        <Skeleton width="30%" height={Spacing.md} />
        <Skeleton width="100%" height={Spacing['5xl'] + Spacing.md} style={{ marginTop: Spacing.sm }} />
      </View>
    </ScrollView>
  );
});

const skeletonStyles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    padding: Spacing.lg,
    gap: Spacing.xl,
  },
  heroSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  heroInfo: {
    flex: 1,
    gap: Spacing.sm,
  },
  contactGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  section: {
    gap: Spacing.sm,
  },
});
