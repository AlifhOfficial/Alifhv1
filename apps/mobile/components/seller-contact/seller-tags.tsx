/**
 * Seller Tags Section
 * 
 * Reusable tag display for interests, specialties, or badges.
 * Follows listings component patterns for consistency.
 */

import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';

import { Spacing, Radius } from '@/constants/theme';
import { Label, Data } from '@/components/ui';
import type { SellerTagsProps } from './types';

export const SellerTags = memo(function SellerTags({ tags, label, colors }: SellerTagsProps) {
  if (tags.length === 0) return null;

  return (
    <View style={localStyles.section}>
      <Label size="small" tone="muted">{label}</Label>
      <View style={localStyles.tagsRow}>
        {tags.map((tag, i) => (
          <View key={`tag-${i}`} style={[localStyles.tag, { backgroundColor: colors.surfaceSecondary }]}>
            <Data size="mini">{tag}</Data>
          </View>
        ))}
      </View>
    </View>
  );
});

const localStyles = StyleSheet.create({
  section: {
    gap: Spacing.md,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  tag: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
  },
});
