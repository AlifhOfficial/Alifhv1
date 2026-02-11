/**
 * Seller Contact Screen Skeleton
 */

import React, { memo } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';

import { Spacing, Radius } from '@/constants/theme';
import { Skeleton } from '@/components/ui';

import type { SellerContactColors } from './types';

export const SellerContactSkeleton = memo(function SellerContactSkeleton({ colors }: SellerContactColors) {
  return (
    <ScrollView style={skeletonStyles.scroll} contentContainerStyle={skeletonStyles.content}>
      {/* Hero */}
      <View style={skeletonStyles.heroSection}>
        <Skeleton width={80} height={80} borderRadius={40} />
        <View style={skeletonStyles.heroInfo}>
          <Skeleton width="60%" height={24} />
          <Skeleton width={100} height={16} />
          <Skeleton width={80} height={14} />
        </View>
      </View>
      
      {/* CTA */}
      <Skeleton width="100%" height={52} style={{ borderRadius: Radius.lg }} />
      
      {/* Contact Grid */}
      <View style={skeletonStyles.contactGrid}>
        <Skeleton width="48%" height={72} style={{ borderRadius: Radius.md }} />
        <Skeleton width="48%" height={72} style={{ borderRadius: Radius.md }} />
      </View>
      
      {/* Section */}
      <View style={skeletonStyles.section}>
        <Skeleton width={80} height={12} />
        <Skeleton width="100%" height={60} style={{ marginTop: Spacing.sm }} />
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
