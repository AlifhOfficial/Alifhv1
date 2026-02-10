/**
 * Settings Section Component
 * Reusable section container with title - matches Profile Section styling
 */

import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Label } from '@/components/ui';
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
        <Label 
          size="medium" 
          tone={danger ? 'error' : 'secondary'} 
          style={styles.title}
        >
          {title}
        </Label>
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
    // textTransform and letterSpacing handled by <Label> component
  },
  content: {
    borderRadius: 14,
    overflow: 'hidden',
  },
});
