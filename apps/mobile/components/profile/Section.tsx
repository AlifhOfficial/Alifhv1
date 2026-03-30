/**
 * Section Component
 * Reusable section container with title and optional right element
 */

import { Text } from '@/components/ui';
import React from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Spacing, Radius } from '@/constants/theme';
import type { ThemeColors } from './types';

interface SectionProps {
  title?: string;
  children: React.ReactNode;
  colors: ThemeColors;
  delay?: number;
  rightElement?: React.ReactNode;
  noPadding?: boolean;
}

export function Section({
  title,
  children,
  colors,
  delay = 0,
  rightElement,
  noPadding = false,
}: SectionProps) {
  return (
    <Animated.View
      entering={FadeInDown.delay(delay).duration(350)}
      style={styles.container}
    >
      {(title || rightElement) && (
        <View style={styles.header}>
          {title && <Text variant="caption1Emphasized" tone="muted" style={styles.title} uppercase>{title}</Text>}
          {rightElement}
        </View>
      )}
      <View
        style={[
          styles.content,
          { backgroundColor: colors.surface },
          noPadding && styles.noPadding,
        ]}
      >
        {children}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  title: {
    // textTransform and letterSpacing handled by <Text variant="footnoteEmphasized" uppercase> component
  },
  content: {
    borderRadius: Radius.xl,
    overflow: 'hidden',
  },
  noPadding: {
    padding: Spacing.none,
  },
});
