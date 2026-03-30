/**
 * Seller Specialties Section
 * 
 * Displays seller specialties/badges as a list with check icons.
 * Follows profile TagsSection pattern for consistency.
 */

import { Text } from '@/components/ui';
import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Spacing, Radius } from '@/constants/theme';
import type { SellerContactColors } from './types';

interface SellerSpecialtiesProps extends SellerContactColors {
  specialties: string[];
}

export const SellerSpecialties = memo(function SellerSpecialties({
  specialties,
  colors,
}: SellerSpecialtiesProps) {
  if (specialties.length === 0) return null;

  return (
    <Animated.View
      entering={FadeInDown.delay(150).duration(350)}
      style={styles.container}
    >
      <View style={[styles.content, { backgroundColor: colors.surface }]}>
        <View style={styles.headerRow}>
          <Text variant="caption1Emphasized" tone="muted" uppercase>Specialties</Text>
        </View>
        {specialties.map((specialty, index) => (
          <React.Fragment key={specialty}>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.row}>
              <Text variant="subhead">
                {specialty}
              </Text>
            </View>
          </React.Fragment>
        ))}
      </View>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginTop: Spacing.xl,
  },
  content: {
    borderRadius: Radius.xl,
    overflow: 'hidden',
  },
  headerRow: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  row: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: Spacing.lg,
  },
});
