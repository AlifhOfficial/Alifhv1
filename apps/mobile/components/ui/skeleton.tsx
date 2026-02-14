/**
 * Skeleton - Animated loading placeholder
 * Uses smooth pulse animation for loading states
 */

import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, ViewStyle } from 'react-native';

import { Colors, Radius, Spacing, Sizes } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';

interface SkeletonProps {
  width?: number | `${number}%`;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
  circle?: boolean;
}

export function Skeleton({ 
  width = '100%', 
  height = Spacing.lg, 
  borderRadius = Radius.sm,
  style,
  circle = false,
}: SkeletonProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.4,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  const size = circle ? Math.max(typeof width === 'number' ? width : height, height) : undefined;

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          backgroundColor: colors.skeleton,
          opacity,
          width: circle ? size : width,
          height: circle ? size : height,
          borderRadius: circle ? (size || height) / 2 : borderRadius,
        },
        style,
      ]}
    />
  );
}

// Pre-configured skeleton variants for common use cases
export function SkeletonText({ 
  width = '100%', 
  lines = 1, 
  gap = Spacing.sm,
}: { 
  width?: number | `${number}%`; 
  lines?: number;
  gap?: number;
}) {
  return (
    <>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton 
          key={i} 
          width={i === lines - 1 && lines > 1 ? '60%' : width} 
          height={Spacing.md + 2} 
          style={i > 0 ? { marginTop: gap } : undefined}
        />
      ))}
    </>
  );
}

export function SkeletonCircle({ size = Sizes.avatarMd }: { size?: number }) {
  return <Skeleton width={size} height={size} circle />;
}

export function SkeletonImage({ 
  aspectRatio = 16 / 9 
}: { 
  aspectRatio?: number;
}) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.4,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        styles.image,
        {
          backgroundColor: colors.skeleton,
          opacity,
          aspectRatio,
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  skeleton: {
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    borderRadius: Radius.md,
  },
});
