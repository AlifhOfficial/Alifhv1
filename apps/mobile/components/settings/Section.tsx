/**
 * Settings Section Component
 * Reusable section container with title - matches Profile Section styling
 */

import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Typography } from '@/constants/theme';
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
          style={[
            styles.title,
            { color: danger ? colors.error : colors.textSecondary },
          ]}
        >
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
    marginBottom: 24,
  },
  firstSection: {
    marginTop: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginBottom: 10,
  },
  title: {
    fontSize: Typography.small.fontSize,
    lineHeight: Typography.small.lineHeight,
    fontFamily: 'Inter_600SemiBold',
    fontWeight: Typography.small.fontWeight as any,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  content: {
    borderRadius: 14,
    overflow: 'hidden',
  },
});
