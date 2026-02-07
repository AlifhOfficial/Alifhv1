/**
 * Revvup Loader Component
 * Minimal, clean startup screen
 */

import React, { useEffect } from 'react';
import { StyleSheet, View, Text, Image } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';

import { useTheme } from '@/context/theme-context';

const Colors = {
  light: { primary: '#0066FF' },
  dark: { primary: '#0066FF' },
};

export function Loader() {
  const { colorScheme } = useTheme();
  const isDark = colorScheme === 'dark';

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#000000' : '#FFFFFF' }]}>
      <Text style={[styles.brandText, { color: isDark ? '#FFFFFF' : '#000000' }]}>
        Revvup
      </Text>
    </View>
  );
}

/**
 * Simple spinner loader for inline use
 */
export function SpinnerLoader({ size = 40, color }: { size?: number; color?: string }) {
  const { colorScheme } = useTheme();
  const colors = colorScheme === 'dark' ? Colors.dark : Colors.light;
  const spinnerColor = color || colors.primary;

  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 1000, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <Animated.View style={[styles.spinner, { width: size, height: size }, animatedStyle]}>
      <View style={[styles.spinnerArc, { 
        borderColor: spinnerColor,
        borderTopColor: 'transparent',
        borderLeftColor: 'transparent',
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: size / 10,
      }]} />
    </Animated.View>
  );
}

/**
 * Logo-only loader (smaller, for inline use)
 */
export function LogoLoader({ size = 60 }: { size?: number }) {
  const { colorScheme } = useTheme();
  const isDark = colorScheme === 'dark';

  const pulseScale = useSharedValue(1);

  useEffect(() => {
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Image
        source={isDark 
          ? require('@/assets/logo/favicon-light.png')
          : require('@/assets/logo/favicon-dark.png')
        }
        style={{ width: size, height: size }}
        resizeMode="contain"
      />
    </Animated.View>
  );
}

/**
 * Refresh indicator with rotating logo (for pull-to-refresh)
 */
export function RefreshLoader({ size = 36, isRefreshing = false }: { size?: number; isRefreshing?: boolean }) {
  const { colorScheme } = useTheme();
  const isDark = colorScheme === 'dark';

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
      <Animated.View style={animatedStyle}>
        <Image
          source={isDark 
            ? require('@/assets/logo/favicon-light.png')
            : require('@/assets/logo/favicon-dark.png')
          }
          style={{ width: size, height: size }}
          resizeMode="contain"
        />
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
  brandText: {
    fontSize: 52,
    fontWeight: '800',
    letterSpacing: -1.5,
  },
  spinner: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  spinnerArc: {
    borderStyle: 'solid',
  },
  refreshContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
});
