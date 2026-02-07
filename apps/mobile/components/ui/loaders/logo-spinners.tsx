/**
 * Logo-Based Spinners
 * Premium motion graphics using the Revvup logo (SVG)
 */

import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
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
} from 'react-native-reanimated';
import { useTheme } from '@/context/theme-context';
import { RevvupLogo, RevvupLogoAnimated } from './revvup-logo';
import { LoaderProps, LOADER_SIZES, LOADER_COLORS } from './types';

interface LogoSpinnerProps {
  size?: number;
  duration?: number;
}

/**
 * Logo Spinner - Rotating logo with smooth easing (SVG)
 */
export function LogoSpinner({ size = 48, duration = 1000 }: LogoSpinnerProps) {
  const { colorScheme } = useTheme();
  const isDark = colorScheme === 'dark';

  const rotation = useSharedValue(0);
  const scale = useSharedValue(0.95);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration, easing: Easing.bezier(0.4, 0, 0.2, 1) }),
      -1,
      false
    );
    scale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: duration / 2, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.95, { duration: duration / 2, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  }, [duration]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${rotation.value}deg` },
      { scale: scale.value },
    ],
  }));

  return (
    <Animated.View style={[styles.centered, { width: size, height: size }, animatedStyle]}>
      <RevvupLogo size={size} />
    </Animated.View>
  );
}

/**
 * Logo Pulse - Clean pulsing logo (SVG) - no glow bubble
 */
export function LogoPulse({ size = 48, duration = 1400 }: LogoSpinnerProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  useEffect(() => {
    // Logo pulse
    scale.value = withRepeat(
      withSequence(
        withTiming(1.12, { duration: duration / 2, easing: Easing.out(Easing.ease) }),
        withTiming(1, { duration: duration / 2, easing: Easing.in(Easing.ease) })
      ),
      -1,
      false
    );
    // Subtle opacity
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.7, { duration: duration / 2, easing: Easing.out(Easing.ease) }),
        withTiming(1, { duration: duration / 2, easing: Easing.in(Easing.ease) })
      ),
      -1,
      false
    );
  }, [duration]);

  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.centered, { width: size, height: size }, logoStyle]}>
      <RevvupLogo size={size} />
    </Animated.View>
  );
}

/**
 * Logo Orbit - Logo with orbiting dots (SVG)
 */
export function LogoOrbit({ size = 64, duration = 2000 }: LogoSpinnerProps) {
  const { colorScheme } = useTheme();
  const isDark = colorScheme === 'dark';
  const dotColor = isDark ? '#3B82F6' : '#0066FF';

  const logoScale = useSharedValue(1);
  const orbit1 = useSharedValue(0);
  const orbit2 = useSharedValue(0);
  const orbit3 = useSharedValue(0);

  useEffect(() => {
    logoScale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 600, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.98, { duration: 600, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
    orbit1.value = withRepeat(
      withTiming(360, { duration, easing: Easing.linear }),
      -1,
      false
    );
    orbit2.value = withDelay(
      duration / 3,
      withRepeat(
        withTiming(360, { duration, easing: Easing.linear }),
        -1,
        false
      )
    );
    orbit3.value = withDelay(
      (duration / 3) * 2,
      withRepeat(
        withTiming(360, { duration, easing: Easing.linear }),
        -1,
        false
      )
    );
  }, [duration]);

  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
  }));

  const orbitRadius = size * 0.65;
  const dotSize = size * 0.1;

  const dot1Style = useAnimatedStyle(() => {
    const x = Math.cos((orbit1.value * Math.PI) / 180) * orbitRadius;
    const y = Math.sin((orbit1.value * Math.PI) / 180) * orbitRadius;
    return {
      transform: [{ translateX: x }, { translateY: y }],
    };
  });

  const dot2Style = useAnimatedStyle(() => {
    const x = Math.cos(((orbit2.value + 120) * Math.PI) / 180) * orbitRadius;
    const y = Math.sin(((orbit2.value + 120) * Math.PI) / 180) * orbitRadius;
    return {
      transform: [{ translateX: x }, { translateY: y }],
    };
  });

  const dot3Style = useAnimatedStyle(() => {
    const x = Math.cos(((orbit3.value + 240) * Math.PI) / 180) * orbitRadius;
    const y = Math.sin(((orbit3.value + 240) * Math.PI) / 180) * orbitRadius;
    return {
      transform: [{ translateX: x }, { translateY: y }],
    };
  });

  const dotStyle = {
    position: 'absolute' as const,
    width: dotSize,
    height: dotSize,
    borderRadius: dotSize / 2,
    backgroundColor: dotColor,
  };

  return (
    <View style={[styles.centered, { width: size * 1.8, height: size * 1.8 }]}>
      {/* Orbit track (subtle) */}
      <View
        style={{
          position: 'absolute',
          width: orbitRadius * 2,
          height: orbitRadius * 2,
          borderRadius: orbitRadius,
          borderWidth: 1,
          borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
        }}
      />
      {/* Orbiting dots */}
      <Animated.View style={[dotStyle, dot1Style]} />
      <Animated.View style={[dotStyle, { opacity: 0.7 }, dot2Style]} />
      <Animated.View style={[dotStyle, { opacity: 0.4 }, dot3Style]} />
      {/* Center logo - using SVG */}
      <Animated.View style={[styles.centered, { width: size * 0.6, height: size * 0.6 }, logoStyle]}>
        <RevvupLogo size={size * 0.6} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
