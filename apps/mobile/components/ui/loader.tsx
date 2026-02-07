/**
 * Revvup Loader Component
 * Clean, minimal loaders using SVG-based logo
 */

import React, { useEffect } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';

import { useTheme } from '@/context/theme-context';
import { LogoPulse, SpinLoader, RevvupLogo } from './loaders';

const Colors = {
  light: { primary: '#0066FF' },
  dark: { primary: '#0066FF' },
};

// Main Loader component - now uses the branded loader
export function Loader({ message, fullScreen = false }: { message?: string; fullScreen?: boolean }) {
  const { colorScheme } = useTheme();
  const isDark = colorScheme === 'dark';

  if (fullScreen) {
    return (
      <View style={[styles.container, { backgroundColor: isDark ? '#000000' : '#FFFFFF' }]}>
        <LogoPulse size={72} />
        {message && (
          <Text style={[styles.message, { color: isDark ? '#A1A1AA' : '#71717A' }]}>
            {message}
          </Text>
        )}
      </View>
    );
  }

  return (
    <View style={styles.inlineContainer}>
      <LogoPulse size={56} />
      {message && (
        <Text style={[styles.inlineMessage, { color: isDark ? '#A1A1AA' : '#71717A' }]}>
          {message}
        </Text>
      )}
    </View>
  );
}

/**
 * Simple spinner loader for inline use - now uses SpinLoader
 */
export function SpinnerLoader({ size = 40, color }: { size?: number; color?: string }) {
  const { colorScheme } = useTheme();
  const colors = colorScheme === 'dark' ? Colors.dark : Colors.light;
  const spinnerColor = color || colors.primary;

  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 800, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const borderWidth = Math.max(2, size / 10);

  return (
    <Animated.View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: borderWidth,
          borderColor: `${spinnerColor}30`,
          borderTopColor: spinnerColor,
          borderRightColor: spinnerColor,
        },
        animatedStyle,
      ]}
    />
  );
}

/**
 * Logo-only loader (smaller, for inline use) - SVG based
 */
export function LogoLoader({ size = 60 }: { size?: number }) {
  const pulseScale = useSharedValue(1);
  const opacity = useSharedValue(1);

  useEffect(() => {
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.6, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[{ alignItems: 'center', justifyContent: 'center' }, animatedStyle]}>
      <RevvupLogo size={size} />
    </Animated.View>
  );
}

/**
 * Refresh indicator with rotating logo (for pull-to-refresh) - SVG based
 */
export function RefreshLoader({ size = 36, isRefreshing = false }: { size?: number; isRefreshing?: boolean }) {
  const rotation = useSharedValue(0);
  const scale = useSharedValue(0.8);

  useEffect(() => {
    if (isRefreshing) {
      rotation.value = withRepeat(
        withTiming(360, { duration: 1000, easing: Easing.linear }),
        -1,
        false
      );
      scale.value = withTiming(1, { duration: 200 });
    } else {
      rotation.value = 0;
      scale.value = withTiming(0.8, { duration: 200 });
    }
  }, [isRefreshing]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${rotation.value}deg` },
      { scale: scale.value },
    ],
  }));

  return (
    <View style={styles.refreshContainer}>
      <Animated.View style={[{ alignItems: 'center', justifyContent: 'center' }, animatedStyle]}>
        <RevvupLogo size={size} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inlineContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  message: {
    marginTop: 20,
    fontSize: 15,
    fontWeight: '500',
  },
  inlineMessage: {
    marginTop: 16,
    fontSize: 14,
    fontWeight: '500',
  },
  refreshContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
});
