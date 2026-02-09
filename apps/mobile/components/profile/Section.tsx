/**
 * Section Component
 * Reusable section container with title and optional right element
 */

import React from 'react';
import { StyleSheet, View, Text, Platform } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Typography } from '@/constants/theme';
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
        <Text style={[styles.title, { color: colors.textSecondary }]}>{title}</Text>
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
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginBottom: 10,
  },
  title: {
    fontSize: Typography.labelSmall.fontSize,
    lineHeight: Typography.labelSmall.lineHeight,
    fontFamily: 'Inter_600SemiBold',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  content: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  noPadding: {
    padding: 0,
  },
});
