/**
 * Spinners & Loaders
 * All spinners use native ActivityIndicator (iOS/Android system spinner).
 * SkeletonLoader retained for content placeholder shimmer.
 */

import React, { useEffect } from 'react';
import { ActivityIndicator, View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  interpolate,
} from 'react-native-reanimated';

import { useTheme } from '@/context/theme-context';
import { Colors, Spacing, Radius, ZIndex} from '@/constants/theme';
import { Body } from '../text';
import { LoaderProps, LOADER_SIZES, LOADER_COLORS } from './types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export function PulseLoader({ size = 'md' }: LoaderProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  return <ActivityIndicator size={LOADER_SIZES[size] >= 36 ? 'large' : 'small'} color={colors.primary} />;
}

export function SpinLoader({ size = 'md' }: LoaderProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  return <ActivityIndicator size={LOADER_SIZES[size] >= 36 ? 'large' : 'small'} color={colors.primary} />;
}

export function BreatheLoader({ size = 'md' }: LoaderProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  return <ActivityIndicator size={LOADER_SIZES[size] >= 36 ? 'large' : 'small'} color={colors.primary} />;
}

export function GlowLoader({ size = 'md' }: LoaderProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  return <ActivityIndicator size={LOADER_SIZES[size] >= 36 ? 'large' : 'small'} color={colors.primary} />;
}

export function LogoLoader({ size = 'md' }: LoaderProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  return <ActivityIndicator size={LOADER_SIZES[size] >= 36 ? 'large' : 'small'} color={colors.primary} />;
}

/** Button spinner — variant maps to color (white, primary, muted, etc.) */
export function ButtonLoader({ size = 'sm', color, variant = 'primary' }: LoaderProps) {
  const { colorScheme } = useTheme();
  const spinnerColor = color ?? LOADER_COLORS[colorScheme][variant ?? 'primary'];
  return <ActivityIndicator size="small" color={spinnerColor} />;
}

export function InlineLoader({ size = 'xs' }: LoaderProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  return <ActivityIndicator size="small" color={colors.primary} />;
}

interface FullScreenLoaderProps {
  message?: string;
}

export function FullScreenLoader({ message }: FullScreenLoaderProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];

  return (
    <View style={[styles.fullScreen, { backgroundColor: colors.skeleton }]}>
      <ActivityIndicator size="large" color={colors.primary} />
      {message && (
        <Body size="bodySm" tone="muted" style={styles.message}>
          {message}
        </Body>
      )}
    </View>
  );
}

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

/**
 * Skeleton Loader - Shimmer effect for content placeholders
 */
export function SkeletonLoader({ 
  width = '100%', 
  height = Spacing.xl, 
  borderRadius = Radius.md,
  style,
}: SkeletonLoaderProps) {
  const { colorScheme } = useTheme();
  const isDark = colorScheme === 'dark';
  const colors = Colors[colorScheme];
  
  const shimmer = useSharedValue(-1);

  useEffect(() => {
    shimmer.value = withRepeat(
      withTiming(2, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
      -1,
      false
    );
  }, []);

  const shimmerStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      shimmer.value,
      [-1, 2],
      [-SCREEN_WIDTH, SCREEN_WIDTH]
    );
    return {
      transform: [{ translateX }],
    };
  });

  const baseColor = colors.surfaceSecondary;
  const highlightColor = colors.fill;

  return (
    <View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: baseColor,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      <Animated.View
        style={[
          {
            position: 'absolute',
            top: 0,
            bottom: 0,
            width: SCREEN_WIDTH,
            backgroundColor: highlightColor,
            opacity: 0.5,
          },
          shimmerStyle,
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullScreen: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: ZIndex.modal,
  },
  message: {
    marginTop: Spacing["2xl"],
  },
});
