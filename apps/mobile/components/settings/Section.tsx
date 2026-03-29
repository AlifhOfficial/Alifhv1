/**
 * Settings Section Component
 * Reusable section container with title - matches Profile Section styling
 */

import { Text } from '@/components/ui';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Spacing, Radius } from '@/constants/theme';
import type { ThemeColors } from './types';

interface SectionProps {
  title: string;
  children: React.ReactNode;
  colors: ThemeColors;
  delay?: number;
  danger?: boolean;
  rightElement?: React.ReactNode;
  isFirst?: boolean;
}

export function Section({
  title,
  children,
  colors,
  delay = 0,
  danger = false,
  rightElement,
  isFirst = false,
}: SectionProps) {
  return (
    <Animated.View
      entering={FadeInDown.delay(delay).duration(350)}
      style={[styles.container, isFirst && styles.firstSection]}
    >
      <View style={styles.header}>
        <Text 
          variant="caption" 
          tone={danger ? 'error' : 'muted'} 
          style={styles.title}
         uppercase>
          {title}
        </Text>
        {rightElement}
      </View>
      <View
        style={[
          styles.content,
          {
            backgroundColor: danger ? colors.errorMuted : colors.surface,
          },
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
  firstSection: {
    marginTop: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  title: {
    // textTransform and letterSpacing handled by <Text variant="label" uppercase> component
  },
  content: {
    borderRadius: Radius.xl,
    overflow: 'hidden',
  },
});
