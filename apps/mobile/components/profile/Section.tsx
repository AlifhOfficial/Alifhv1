/**
 * Section Component
 * Reusable section container with title and optional right element
 */

import React from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Label } from '@/components/ui';
import { Spacing, Radius } from '@/constants/theme';
import type { ThemeColors } from './types';

interface SectionProps {
  title: string;
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
      <View style={styles.header}>
        <Label size="small" tone="muted" style={styles.title}>{title}</Label>
        {rightElement}
      </View>
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
    marginBottom: Spacing['2xl'],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  title: {
    // textTransform and letterSpacing handled by <Label> component
  },
  content: {
    borderRadius: Radius.xl,
    overflow: 'hidden',
  },
  noPadding: {
    padding: 0,
  },
});
