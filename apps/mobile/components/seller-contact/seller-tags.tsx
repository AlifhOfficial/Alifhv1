/**
 * Seller Tags Section
 * 
 * Reusable tag display for interests, specialties, or badges.
 * Follows listings component patterns for consistency.
 */

import { Text } from '@/components/ui';
import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';

import { Spacing, Radius, Sizes } from '@/constants/theme';
import type { SellerTagsProps } from './types';

export const SellerTags = memo(function SellerTags({ tags, label, colors }: SellerTagsProps) {
  if (tags.length === 0) return null;

  return (
    <View style={localStyles.section}>
      <Text variant="footnoteEmphasized" tone="muted" uppercase>{label}</Text>
      <View style={localStyles.tagsRow}>
        {tags.map((tag, i) => (
          <View key={`tag-${i}`} style={[localStyles.tag, { backgroundColor: colors.backgroundSecondary }]}>
            <Text variant="subhead">{tag}</Text>
          </View>
        ))}
      </View>
    </View>
  );
});

const localStyles = StyleSheet.create({
  section: {
    gap: Spacing.sm,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  tag: {
    paddingHorizontal: Sizes.badgePaddingH,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
  },
});
