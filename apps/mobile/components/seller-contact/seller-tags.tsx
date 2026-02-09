/**
 * Seller Tags Section
 * 
 * Reusable tag display for interests, specialties, or badges.
 */

import React, { memo } from 'react';
import { View, Text } from 'react-native';

import type { SellerTagsProps } from './types';
import { styles } from './styles';

export const SellerTags = memo(function SellerTags({ tags, label, colors }: SellerTagsProps) {
  if (tags.length === 0) return null;

  return (
    <View style={styles.section}>
      <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>{label}</Text>
      <View style={styles.tagsRow}>
        {tags.map((tag, i) => (
          <View key={`tag-${i}`} style={[styles.tag, { backgroundColor: colors.surfaceSecondary }]}>
            <Text style={[styles.tagText, { color: colors.text }]}>{tag}</Text>
          </View>
        ))}
      </View>
    </View>
  );
});
