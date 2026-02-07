/**
 * Revvup Spinners & Loaders
 * Beautiful motion graphics for loading states
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
  withSpring,
  Easing,
  interpolate,
  interpolateColor,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import { useTheme } from '@/context/theme-context';
import { LoaderProps, LOADER_SIZES, LOADER_COLORS } from './types';
import { RevvupLogoAnimated } from './revvup-logo';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/**
 * Pulse Loader - Smooth expanding circle with brand colors
 */
export function PulseLoader({ size = 'md', color, variant = 'primary' }: LoaderProps) {
  const { colorScheme } = useTheme();
  const colors = colorScheme === 'dark' ? LOADER_COLORS.dark : LOADER_COLORS.light;
  const loaderColor = color || colors[variant];
  const loaderSize = LOADER_SIZES[size];

  const scale1 = useSharedValue(0.5);
  const scale2 = useSharedValue(0.5);
  const opacity1 = useSharedValue(1);
  const opacity2 = useSharedValue(1);

  useEffect(() => {
    const duration = 1500;
    scale1.value = withRepeat(
      withTiming(1.5, { duration, easing: Easing.out(Easing.ease) }),
      -1,
      false
    );
    opacity1.value = withRepeat(
      withTiming(0, { duration, easing: Easing.out(Easing.ease) }),
      -1,
      false
    );
    scale2.value = withDelay(
      duration / 2,
      withRepeat(
        withTiming(1.5, { duration, easing: Easing.out(Easing.ease) }),
        -1,
        false
      )
    );
    opacity2.value = withDelay(
      duration / 2,
      withRepeat(
        withTiming(0, { duration, easing: Easing.out(Easing.ease) }),
        -1,
        false
      )
    );
  }, []);

  const ring1Style = useAnimatedStyle(() => ({
    transform: [{ scale: scale1.value }],
    opacity: opacity1.value,
  }));

  const ring2Style = useAnimatedStyle(() => ({
    transform: [{ scale: scale2.value }],
    opacity: opacity2.value,
  }));

  return (
    <View style={[styles.centered, { width: loaderSize * 2, height: loaderSize * 2 }]}>
      <Animated.View
        style={[
          {
            position: 'absolute',
            width: loaderSize,
            height: loaderSize,
            borderRadius: loaderSize / 2,
            backgroundColor: loaderColor,
          },
          ring1Style,
        ]}
      />
      <Animated.View
        style={[
          {
            position: 'absolute',
            width: loaderSize,
            height: loaderSize,
            borderRadius: loaderSize / 2,
            backgroundColor: loaderColor,
          },
          ring2Style,
        ]}
      />
      <View
        style={{
          width: loaderSize * 0.4,
          height: loaderSize * 0.4,
          borderRadius: loaderSize * 0.2,
          backgroundColor: loaderColor,
        }}
      />
    </View>
  );
}

/**
 * Spin Loader - Modern spinning arc
 */
export function SpinLoader({ size = 'md', color, variant = 'primary' }: LoaderProps) {
  const { colorScheme } = useTheme();
  const colors = colorScheme === 'dark' ? LOADER_COLORS.dark : LOADER_COLORS.light;
  const loaderColor = color || colors[variant];
  const loaderSize = LOADER_SIZES[size];

  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 800, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  const spinStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const borderWidth = Math.max(2, loaderSize / 12);

  return (
    <Animated.View
      style={[
        {
          width: loaderSize,
          height: loaderSize,
          borderRadius: loaderSize / 2,
          borderWidth: borderWidth,
          borderColor: `${loaderColor}30`,
          borderTopColor: loaderColor,
          borderRightColor: loaderColor,
        },
        spinStyle,
      ]}
    />
  );
}

/**
 * Dots Loader - Three bouncing dots
 */
export function DotsLoader({ size = 'md', color, variant = 'primary' }: LoaderProps) {
  const { colorScheme } = useTheme();
  const colors = colorScheme === 'dark' ? LOADER_COLORS.dark : LOADER_COLORS.light;
  const loaderColor = color || colors[variant];
  const loaderSize = LOADER_SIZES[size];
  const dotSize = loaderSize / 3;

  const y1 = useSharedValue(0);
  const y2 = useSharedValue(0);
  const y3 = useSharedValue(0);

  useEffect(() => {
    const duration = 400;
    const bounce = -dotSize * 0.8;

    y1.value = withRepeat(
      withSequence(
        withTiming(bounce, { duration, easing: Easing.out(Easing.quad) }),
        withTiming(0, { duration, easing: Easing.in(Easing.quad) })
      ),
      -1,
      false
    );
    y2.value = withDelay(
      duration / 3,
      withRepeat(
        withSequence(
          withTiming(bounce, { duration, easing: Easing.out(Easing.quad) }),
          withTiming(0, { duration, easing: Easing.in(Easing.quad) })
        ),
        -1,
        false
      )
    );
    y3.value = withDelay(
      (duration / 3) * 2,
      withRepeat(
        withSequence(
          withTiming(bounce, { duration, easing: Easing.out(Easing.quad) }),
          withTiming(0, { duration, easing: Easing.in(Easing.quad) })
        ),
        -1,
        false
      )
    );
  }, []);

  const dot1Style = useAnimatedStyle(() => ({
    transform: [{ translateY: y1.value }],
  }));
  const dot2Style = useAnimatedStyle(() => ({
    transform: [{ translateY: y2.value }],
  }));
  const dot3Style = useAnimatedStyle(() => ({
    transform: [{ translateY: y3.value }],
  }));

  const dotStyle = {
    width: dotSize,
    height: dotSize,
    borderRadius: dotSize / 2,
    backgroundColor: loaderColor,
    marginHorizontal: dotSize / 4,
  };

  return (
    <View style={[styles.row, { height: loaderSize }]}>
      <Animated.View style={[dotStyle, dot1Style]} />
      <Animated.View style={[dotStyle, dot2Style]} />
      <Animated.View style={[dotStyle, dot3Style]} />
    </View>
  );
}

/**
 * Wave Loader - Smooth wave bars
 */
export function WaveLoader({ size = 'md', color, variant = 'primary' }: LoaderProps) {
  const { colorScheme } = useTheme();
  const colors = colorScheme === 'dark' ? LOADER_COLORS.dark : LOADER_COLORS.light;
  const loaderColor = color || colors[variant];
  const loaderSize = LOADER_SIZES[size];
  const barWidth = loaderSize / 5;
  const barCount = 4;

  const scales = Array.from({ length: barCount }, () => useSharedValue(0.4));

  useEffect(() => {
    const duration = 600;
    scales.forEach((scale, i) => {
      scale.value = withDelay(
        i * (duration / barCount),
        withRepeat(
          withSequence(
            withTiming(1, { duration: duration / 2, easing: Easing.inOut(Easing.ease) }),
            withTiming(0.4, { duration: duration / 2, easing: Easing.inOut(Easing.ease) })
          ),
          -1,
          false
        )
      );
    });
  }, []);

  return (
    <View style={[styles.row, { height: loaderSize, gap: barWidth / 2 }]}>
      {scales.map((scale, i) => {
        const barStyle = useAnimatedStyle(() => ({
          transform: [{ scaleY: scale.value }],
        }));
        return (
          <Animated.View
            key={i}
            style={[
              {
                width: barWidth,
                height: loaderSize,
                borderRadius: barWidth / 2,
                backgroundColor: loaderColor,
              },
              barStyle,
            ]}
          />
        );
      })}
    </View>
  );
}

/**
 * Ring Loader - Dual rotating rings
 */
export function RingLoader({ size = 'md', color, variant = 'primary' }: LoaderProps) {
  const { colorScheme } = useTheme();
  const colors = colorScheme === 'dark' ? LOADER_COLORS.dark : LOADER_COLORS.light;
  const loaderColor = color || colors[variant];
  const loaderSize = LOADER_SIZES[size];

  const rotation1 = useSharedValue(0);
  const rotation2 = useSharedValue(0);

  useEffect(() => {
    rotation1.value = withRepeat(
      withTiming(360, { duration: 1200, easing: Easing.linear }),
      -1,
      false
    );
    rotation2.value = withRepeat(
      withTiming(-360, { duration: 1800, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  const ring1Style = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation1.value}deg` }],
  }));

  const ring2Style = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation2.value}deg` }],
  }));

  const borderWidth = Math.max(2, loaderSize / 12);

  return (
    <View style={[styles.centered, { width: loaderSize, height: loaderSize }]}>
      <Animated.View
        style={[
          {
            position: 'absolute',
            width: loaderSize,
            height: loaderSize,
            borderRadius: loaderSize / 2,
            borderWidth: borderWidth,
            borderColor: 'transparent',
            borderTopColor: loaderColor,
          },
          ring1Style,
        ]}
      />
      <Animated.View
        style={[
          {
            position: 'absolute',
            width: loaderSize * 0.7,
            height: loaderSize * 0.7,
            borderRadius: loaderSize * 0.35,
            borderWidth: borderWidth,
            borderColor: 'transparent',
            borderBottomColor: `${loaderColor}80`,
          },
          ring2Style,
        ]}
      />
    </View>
  );
}

/**
 * Glow Loader - Pulsing glow effect with logo
 */
export function GlowLoader({ size = 'md', color, variant = 'primary' }: LoaderProps) {
  const { colorScheme } = useTheme();
  const colors = colorScheme === 'dark' ? LOADER_COLORS.dark : LOADER_COLORS.light;
  const loaderColor = color || colors[variant];
  const loaderSize = LOADER_SIZES[size];

  const glowOpacity = useSharedValue(0.3);
  const glowScale = useSharedValue(1);

  useEffect(() => {
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.8, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.3, { duration: 800, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
    glowScale.value = withRepeat(
      withSequence(
        withTiming(1.3, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  }, []);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
    transform: [{ scale: glowScale.value }],
  }));

  return (
    <View style={[styles.centered, { width: loaderSize * 2, height: loaderSize * 2 }]}>
      <Animated.View
        style={[
          {
            position: 'absolute',
            width: loaderSize * 1.5,
            height: loaderSize * 1.5,
            borderRadius: loaderSize * 0.75,
            backgroundColor: loaderColor,
          },
          glowStyle,
        ]}
      />
      <RevvupLogoAnimated size={loaderSize} animation="breathe" />
    </View>
  );
}

/**
 * Button Loader - Compact spinner for buttons
 */
export function ButtonLoader({ size = 'sm', color, variant = 'white' }: LoaderProps) {
  const { colorScheme } = useTheme();
  const colors = colorScheme === 'dark' ? LOADER_COLORS.dark : LOADER_COLORS.light;
  const loaderColor = color || colors[variant];
  const loaderSize = LOADER_SIZES[size];

  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 700, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  const spinStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const borderWidth = Math.max(2, loaderSize / 10);

  return (
    <Animated.View
      style={[
        {
          width: loaderSize,
          height: loaderSize,
          borderRadius: loaderSize / 2,
          borderWidth: borderWidth,
          borderColor: `${loaderColor}40`,
          borderTopColor: loaderColor,
        },
        spinStyle,
      ]}
    />
  );
}

/**
 * Inline Loader - For inline loading states (text, lists)
 */
export function InlineLoader({ size = 'xs', color, variant = 'muted' }: LoaderProps) {
  return <DotsLoader size={size} color={color} variant={variant} />;
}

interface FullScreenLoaderProps extends LoaderProps {
  message?: string;
  showLogo?: boolean;
}

/**
 * Full Screen Loader - Branded loading overlay
 */
export function FullScreenLoader({ 
  message,
  showLogo = true,
  variant = 'primary',
}: FullScreenLoaderProps) {
  const { colorScheme } = useTheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? LOADER_COLORS.dark : LOADER_COLORS.light;

  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(200)}
      style={[
        styles.fullScreen,
        { backgroundColor: isDark ? '#000000' : '#FFFFFF' },
      ]}
    >
      {showLogo ? (
        <GlowLoader size="xl" variant={variant} />
      ) : (
        <SpinLoader size="lg" variant={variant} />
      )}
      {message && (
        <Text
          style={[
            styles.message,
            { color: isDark ? colors.muted : '#71717A' },
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
    marginTop: 24,
    fontSize: 15,
    fontWeight: '500',
  },
});
