/**
 * Revvup Spinners & Loaders
 * Beautiful motion graphics using SVG logo animations
 */

import React, { useEffect } from 'react';
import { View, StyleSheet, Text, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  withDelay,
  Easing,
  interpolate,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import { useTheme } from '@/context/theme-context';
import { Typography } from '@/constants/theme';
import { LoaderProps, LOADER_SIZES, LOADER_COLORS } from './types';
import { RevvupLogo, RevvupLogoAnimated } from './revvup-logo';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/**
 * Pulse Loader - Logo with smooth pulse animation (SVG)
 */
export function PulseLoader({ size = 'md' }: LoaderProps) {
  const loaderSize = LOADER_SIZES[size];

  return (
    <View style={[styles.centered, { width: loaderSize, height: loaderSize }]}>
      <RevvupLogoAnimated size={loaderSize} animation="pulse" duration={1400} />
    </View>
  );
}

/**
 * Spin Loader - Logo with spin animation (SVG)
 */
export function SpinLoader({ size = 'md' }: LoaderProps) {
  const loaderSize = LOADER_SIZES[size];

  return (
    <View style={[styles.centered, { width: loaderSize, height: loaderSize }]}>
      <RevvupLogoAnimated size={loaderSize} animation="spin" duration={1000} />
    </View>
  );
}

/**
 * Breathe Loader - Logo with breathing animation (SVG)
 */
export function BreatheLoader({ size = 'md' }: LoaderProps) {
  const loaderSize = LOADER_SIZES[size];

  return (
    <View style={[styles.centered, { width: loaderSize, height: loaderSize }]}>
      <RevvupLogoAnimated size={loaderSize} animation="breathe" duration={1600} />
    </View>
  );
}

/**
 * Glow Loader - Logo with glow/fade animation (SVG)
 */
export function GlowLoader({ size = 'md' }: LoaderProps) {
  const loaderSize = LOADER_SIZES[size];

  return (
    <View style={[styles.centered, { width: loaderSize, height: loaderSize }]}>
      <RevvupLogoAnimated size={loaderSize} animation="glow" duration={1200} />
    </View>
  );
}

/**
 * Static Logo Loader - Clean static logo (SVG)
 */
export function LogoLoader({ size = 'md' }: LoaderProps) {
  const loaderSize = LOADER_SIZES[size];

  return (
    <View style={[styles.centered, { width: loaderSize, height: loaderSize }]}>
      <RevvupLogo size={loaderSize} />
    </View>
  );
}

/**
 * Button Loader - Compact logo spinner for buttons (SVG)
 */
export function ButtonLoader({ size = 'sm', color }: LoaderProps) {
  const loaderSize = LOADER_SIZES[size];

  return (
    <View style={[styles.centered, { width: loaderSize, height: loaderSize }]}>
      <RevvupLogoAnimated size={loaderSize} animation="spin" duration={800} color={color} />
    </View>
  );
}

/**
 * Inline Loader - For inline loading states (SVG logo)
 */
export function InlineLoader({ size = 'xs' }: LoaderProps) {
  const loaderSize = LOADER_SIZES[size];

  return (
    <View style={[styles.centered, { width: loaderSize, height: loaderSize }]}>
      <RevvupLogoAnimated size={loaderSize} animation="pulse" duration={1000} />
    </View>
  );
}

interface FullScreenLoaderProps {
  message?: string;
}

/**
 * Full Screen Loader - Branded loading overlay with SVG logo
 */
export function FullScreenLoader({ 
  message,
}: FullScreenLoaderProps) {
  const { colorScheme } = useTheme();
  const isDark = colorScheme === 'dark';

  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(200)}
      style={[
        styles.fullScreen,
        { backgroundColor: isDark ? '#0A0A0A' : '#E8E8E8' },
      ]}
    >
      <RevvupLogoAnimated size={80} animation="pulse" duration={1400} />
      {message && (
        <Text
          style={[
            styles.message,
            { color: isDark ? '#6B6B6B' : '#6B6B6B' },
          ]}
        >
          {message}
        </Text>
      )}
    </Animated.View>
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
  height = 20, 
  borderRadius = 8,
  style,
}: SkeletonLoaderProps) {
  const { colorScheme } = useTheme();
  const isDark = colorScheme === 'dark';
  
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

  const baseColor = isDark ? '#27272A' : '#E4E4E7';
  const highlightColor = isDark ? '#3F3F46' : '#F4F4F5';

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
    zIndex: 1000,
  },
  message: {
    ...Typography.supportingMedium,
    marginTop: 24,
  },
});
